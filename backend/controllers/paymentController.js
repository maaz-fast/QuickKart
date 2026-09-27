const Order = require('../models/Order');
const User = require('../models/User');
const { safepay, isSandbox } = require('../config/safepay');
const { createNotification, notifyAdmins } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');
const { sendPaymentSuccessEmail, sendAdminPaymentReceivedAlert } = require('../utils/emailService');

// Helper to trigger dual payment notifications to customer and admin
const notifyPaymentSuccess = async (order) => {
  try {
    const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
    const amountStr = `Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}`;

    // 1. Socket.io & DB notifications
    await createNotification(
      order.user,
      `Payment received! ${formattedOrderId} has been successfully paid (${amountStr}).`,
      'order'
    );
    await notifyAdmins(
      `Payment received for ${formattedOrderId} (${amountStr}) via ${order.paymentMethod || 'Safepay'}.`,
      'order'
    );

    // 2. Email dispatches
    const userObj = await User.findById(order.user).select('email');
    if (userObj && userObj.email) {
      sendPaymentSuccessEmail(userObj.email, order).catch(err => console.error('User payment email failed:', err));
    }
    sendAdminPaymentReceivedAlert(order).catch(err => console.error('Admin payment email failed:', err));
  } catch (err) {
    console.error('Error triggering payment notifications:', err.message);
  }
};

// @desc    Create Safepay checkout session (Sandbox mode)
// @route   POST /api/payments/create-session
// @access  Private
const createPaymentSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error('Order ID is required');
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = `${clientUrl}/checkout/success`;
    const cancelUrl = `${clientUrl}/checkout/cancel`;

    let token = `tracker_sb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    let checkoutUrl = '';

    try {
      if (safepay && safepay.payments && typeof safepay.payments.create === 'function') {
        const paymentRes = await safepay.payments.create({
          amount: Number(order.totalAmount.toFixed(2)),
          currency: 'PKR',
        });
        if (paymentRes) {
          token = paymentRes.token || paymentRes.data?.token || token;
        }

        if (safepay.checkout && typeof safepay.checkout.create === 'function') {
          const checkoutRes = safepay.checkout.create({
            token,
            orderId: order._id.toString(),
            cancelUrl,
            redirectUrl,
            source: 'custom',
            webhooks: true,
          });
          if (typeof checkoutRes === 'string') {
            checkoutUrl = checkoutRes;
          } else if (checkoutRes && checkoutRes.url) {
            checkoutUrl = checkoutRes.url;
          }
        }
      }
    } catch (sdkError) {
      console.warn('[SAFEPAY SDK] Falling back to constructed sandbox checkout URL:', sdkError.message);
    }

    if (!checkoutUrl) {
      checkoutUrl = `https://sandbox.api.getsafepay.com/checkout/pay?beacon=${token}&env=sandbox&source=custom&order_id=${order._id}&amount=${order.totalAmount}&redirect_url=${encodeURIComponent(redirectUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    } else if (!checkoutUrl.includes('env=')) {
      const sep = checkoutUrl.includes('?') ? '&' : '?';
      checkoutUrl += `${sep}env=sandbox`;
    }

    // Save safepayToken to order
    order.safepayToken = token;
    order.paymentMethod = 'Safepay (Sandbox)';
    order.paymentStatus = 'pending';
    await order.save();

    const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

    await logActivity(req.user, 'CREATE_PAYMENT_SESSION', `Created Safepay checkout session for order ${formattedOrderId}`, {
      orderId: order._id,
      amount: order.totalAmount,
      testMode: true,
    });

    res.json({
      success: true,
      testMode: true,
      sandbox: true,
      checkoutUrl,
      token,
      orderId: order._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Safepay Webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Safepay callback)
const handleSafepayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-sfpy-signature'] || req.headers['x-safepay-signature'];
    const payload = req.body || {};

    console.log('[SAFEPAY WEBHOOK RECEIVED]', { signature, payload });

    // Extract tracker / order token
    const token = payload.token || payload.tracker || payload.data?.token || payload.data?.tracker;
    const orderId = payload.order_id || payload.orderId || payload.data?.order_id;
    const status = payload.status || payload.event || payload.data?.status || 'paid';

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    } else if (token) {
      order = await Order.findOne({ safepayToken: token });
    }

    if (order) {
      const wasPaidBefore = order.isPaid;
      const isSuccessful = ['paid', 'payment:created', 'payment.completed', 'success', 'COMPLETED'].includes(status) || String(status).toLowerCase().includes('paid');

      if (isSuccessful) {
        order.paymentStatus = 'paid';
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'Processing';
      } else {
        order.paymentStatus = 'failed';
      }

      await order.save();

      const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;

      if (isSuccessful && !wasPaidBefore) {
        await notifyPaymentSuccess(order);
      }

      await logActivity(order.user ? { _id: order.user, role: 'user' } : null, 'PAYMENT_WEBHOOK', `Webhook processed for order ${formattedOrderId}: ${order.paymentStatus}`, {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Safepay Webhook error:', error.message);
    res.status(200).json({ success: true, message: 'Webhook processed with warnings' });
  }
};

// @desc    Verify payment status for return URL
// @route   POST /api/payments/verify
// @access  Private
const verifyPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const wasPaidBefore = order.isPaid;

    // In sandbox, if client reached success URL and payment is still pending, confirm as paid
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'Processing';
      await order.save();

      if (!wasPaidBefore) {
        await notifyPaymentSuccess(order);
      }
    }

    res.json({
      success: true,
      order,
      paymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createPaymentSession,
  handleSafepayWebhook,
  verifyPaymentStatus,
};
