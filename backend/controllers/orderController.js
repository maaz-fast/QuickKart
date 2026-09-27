const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { createNotification, notifyAdmins } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');
const {
  sendOrderConfirmationEmail,
  sendAdminNewOrderAlert,
  sendAdminLowStockAlert,
} = require('../utils/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalAmount,
      taxAmount,
      shippingPrice,
      couponCode 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Check stock availability for all items
    let subtotal = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stock}`);
      }
      subtotal += product.price * item.quantity;
    }

    // Server-side Coupon validation & calculation
    let calculatedDiscount = 0;
    let validatedCouponCode = '';

    if (couponCode && couponCode.trim() !== '') {
      const uppercaseCode = couponCode.trim().toUpperCase();
      const couponDoc = await Coupon.findOne({ code: uppercaseCode });

      if (couponDoc && couponDoc.isActive && new Date() <= new Date(couponDoc.expiresAt) && couponDoc.usedCount < couponDoc.maxUses && subtotal >= couponDoc.minOrderValue) {
        validatedCouponCode = couponDoc.code;
        if (couponDoc.discountType === 'percentage') {
          calculatedDiscount = (subtotal * couponDoc.discountValue) / 100;
        } else {
          calculatedDiscount = Math.min(couponDoc.discountValue, subtotal);
        }
        // Increment usedCount atomically
        await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
      }
    }

    const calculatedTax = Number(((Math.max(0, subtotal - calculatedDiscount)) * 0.08).toFixed(2));
    const finalCalculatedTotal = Number((Math.max(0, subtotal - calculatedDiscount) + calculatedTax + (Number(shippingPrice) || 0)).toFixed(2));

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount: finalCalculatedTotal || totalAmount,
      taxAmount: calculatedTax || taxAmount,
      shippingPrice: shippingPrice || 0,
      discountAmount: Number(calculatedDiscount.toFixed(2)),
      couponCode: validatedCouponCode,
    });

    const createdOrder = await order.save();

    // Decrement stock & check low stock threshold (< 5)
    for (const item of orderItems) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (updatedProduct && updatedProduct.stock < 5) {
        sendAdminLowStockAlert(updatedProduct).catch(err => console.error('Low stock email failed:', err));
      }
    }

    // Clear user's cart in DB after successful order
    await Cart.deleteMany({ userId: req.user._id });

    const formattedOrderId = `ORD-${createdOrder._id.toString().slice(-8).toUpperCase()}`;

    const isCod = paymentMethod && (paymentMethod.toLowerCase().includes('cash') || paymentMethod.toLowerCase().includes('cod'));

    // Only notify & email for COD immediately; for Online payment, wait until payment is completed
    if (isCod) {
      // Notify User and Admins via Socket.io/DB
      await createNotification(req.user._id, `Your order ${formattedOrderId} has been placed successfully`, 'order');
      await notifyAdmins(`New COD order ${formattedOrderId} received from ${req.user.name || req.user.email}`, 'order');

      // Send Emails (Asynchronous / Non-blocking)
      if (req.user.email) {
        sendOrderConfirmationEmail(req.user.email, createdOrder).catch(err => console.error('Order confirmation email failed:', err));
      }
      sendAdminNewOrderAlert(createdOrder).catch(err => console.error('Admin order alert email failed:', err));
    }

    res.status(201).json({
      success: true,
      order: createdOrder
    });

    // Log Activity
    await logActivity(req.user, 'PLACE_ORDER', `Order placed: ${formattedOrderId}`, { orderId: createdOrder._id, amount: createdOrder.totalAmount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages,
      currentPage: page,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Authorization check: ensure user owns the order OR is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400);
      return next(new Error('Invalid order ID format'));
    }
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
