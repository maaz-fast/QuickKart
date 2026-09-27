const { sendMail } = require('../config/mailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Clean, Professional Light-Theme Wrapper for QuickKart Emails
 */
const wrapEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Band -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 36px 20px; text-align: center; border-bottom: 2px solid #f59e0b;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                ⚡ Quick<span style="color: #d97706;">Kart</span>
              </h1>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Shop Smarter, Faster</p>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px; font-size: 15px; line-height: 1.6; color: #334155;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0 0 6px 0;">This email was sent by <strong>QuickKart Inc.</strong></p>
              <p style="margin: 0; color: #cbd5e1;">&copy; ${new Date().getFullYear()} QuickKart. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Send 6-digit OTP code for Signup or Password Reset
 */
const sendOtpEmail = async (to, otp, purpose = 'signup') => {
  const isSignup = purpose === 'signup';
  const subject = isSignup ? 'Verify Your QuickKart Account (OTP)' : 'Reset Your QuickKart Password (OTP)';
  const heading = isSignup ? 'Verify your email address' : 'Reset your password';
  const subtext = isSignup
    ? 'Thank you for signing up for QuickKart! Enter the verification code below to activate your account and log in:'
    : 'We received a request to reset your password. Use the verification code below to proceed:';

  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">${heading}</h2>
    <p style="margin: 0 0 24px 0; color: #475569;">${subtext}</p>
    
    <!-- OTP Code Block -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px 32px; display: inline-block;">
            <span style="font-size: 36px; font-weight: 800; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; letter-spacing: 8px; color: #1e293b;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b; margin: 12px 0 0 0;">Valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px 0;" />
    <p style="font-size: 13px; color: #94a3b8; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
  `;

  return sendMail({
    to,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send order confirmation to customer
 */
const sendOrderConfirmationEmail = async (to, order) => {
  const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
  const subject = `Order Confirmation ${formattedOrderId} - QuickKart`;

  const itemsHtml = (order.orderItems || []).map(item => `
    <tr>
      <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 500;">${item.name}</td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b;">${item.qty}</td>
      <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-weight: 600;">Rs. ${(item.price * item.qty).toFixed(2)}</td>
    </tr>
  `).join('');

  const orderPageUrl = `${CLIENT_URL}/orders/${order._id}`;

  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Your order is confirmed! 🎉</h2>
    <p style="margin: 0 0 24px 0; color: #475569;">Thank you for shopping with us. We're getting your order ready for delivery.</p>
    
    <!-- Order Summary Metadata Box -->
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
        <tr>
          <td style="padding-bottom: 6px; color: #64748b;">Order Reference:</td>
          <td style="padding-bottom: 6px; text-align: right; font-weight: 700; color: #d97706;">${formattedOrderId}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; color: #64748b;">Date:</td>
          <td style="padding-bottom: 6px; text-align: right; color: #334155;">${new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Payment Method:</td>
          <td style="text-align: right; color: #334155; font-weight: 500;">${order.paymentMethod || 'Online'}</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background-color: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          <th style="padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0;">Item</th>
          <th style="padding: 10px 14px; text-align: center; border-bottom: 1px solid #e2e8f0;">Qty</th>
          <th style="padding: 10px 14px; text-align: right; border-bottom: 1px solid #e2e8f0;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Total -->
    <div style="text-align: right; margin-bottom: 28px; font-size: 16px; color: #0f172a;">
      Total Amount: <strong style="font-size: 20px; color: #059669; margin-left: 8px;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</strong>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${orderPageUrl}" style="background-color: #f59e0b; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block;">
        View Order Details &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send order status update to customer
 */
const sendOrderStatusUpdateEmail = async (to, order, newStatus) => {
  const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
  const subject = `Order Status Update: ${formattedOrderId} is now ${newStatus}`;
  const orderPageUrl = `${CLIENT_URL}/orders/${order._id}`;

  const getStatusColor = (st) => {
    switch (st) {
      case 'Delivered': return { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' };
      case 'Processing': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      case 'Shipped': return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
      default: return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    }
  };

  const statusStyle = getStatusColor(newStatus);

  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Order Status Update</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">Your order <strong style="color: #d97706;">${formattedOrderId}</strong> status has been updated:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <span style="display: inline-block; background-color: ${statusStyle.bg}; color: ${statusStyle.text}; border: 1px solid ${statusStyle.border}; font-weight: 800; font-size: 16px; padding: 10px 24px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
        ${newStatus}
      </span>
    </div>

    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">You can track your package and view updated details in your QuickKart account.</p>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${orderPageUrl}" style="background-color: #f59e0b; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        Track Order &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send notification to User when password is successfully changed
 */
const sendPasswordChangedEmail = async (to) => {
  const subject = 'Your QuickKart Password Was Changed';
  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Password Changed 🔒</h2>
    <p style="margin: 0 0 16px 0; color: #475569;">This is a confirmation that your QuickKart account password was successfully updated on <strong>${new Date().toLocaleString()}</strong>.</p>
    
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
      <p style="margin: 0; color: #b91c1c; font-size: 13px;">If you did not make this change, please reset your password immediately or contact QuickKart support.</p>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send alert to Admin on new order placement
 */
const sendAdminNewOrderAlert = async (order) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@quickkart.com';
  const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
  const subject = `🚨 Admin Alert: New Order ${formattedOrderId} (Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0'})`;
  const adminOrderUrl = `${CLIENT_URL}/admin/orders`;

  const content = `
    <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">New Order Notification</h2>
    <p style="margin: 0 0 16px 0; color: #475569;">A new order <strong style="color: #d97706;">${formattedOrderId}</strong> has been received on QuickKart.</p>
    
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Total Amount:</td><td style="padding: 4px 0; text-align: right; font-weight: 700; color: #059669;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0'}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Payment Method:</td><td style="padding: 4px 0; text-align: right; color: #334155;">${order.paymentMethod || 'Online'}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Item Count:</td><td style="padding: 4px 0; text-align: right; color: #334155;">${order.orderItems ? order.orderItems.length : 0}</td></tr>
    </table>

    <div style="text-align: center;">
      <a href="${adminOrderUrl}" style="background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block;">
        Open Admin Orders &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send alert to Admin on low inventory stock
 */
const sendAdminLowStockAlert = async (product) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@quickkart.com';
  const subject = `⚠️ Low Stock Warning: ${product.name} (${product.stock} units remaining)`;
  const adminProductUrl = `${CLIENT_URL}/admin/products`;

  const content = `
    <h2 style="color: #b91c1c; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Low Inventory Alert</h2>
    <p style="margin: 0 0 16px 0; color: #475569;">The product <strong>${product.name}</strong> is running low on stock.</p>
    
    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #9f1239;">Remaining Stock: <strong style="font-size: 20px; color: #e11d48; margin-left: 6px;">${product.stock} units</strong></p>
    </div>

    <div style="text-align: center;">
      <a href="${adminProductUrl}" style="background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block;">
        Restock Inventory &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send payment receipt email to customer
 */
const sendPaymentSuccessEmail = async (to, order) => {
  const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
  const subject = `Payment Received: ${formattedOrderId} - QuickKart`;
  const orderPageUrl = `${CLIENT_URL}/orders/${order._id}`;

  const content = `
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Payment Received! 💳</h2>
    <p style="margin: 0 0 20px 0; color: #475569;">We successfully processed your payment for order <strong style="color: #d97706;">${formattedOrderId}</strong>.</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px;">
        <tr>
          <td style="padding-bottom: 6px; color: #166534;">Amount Paid:</td>
          <td style="padding-bottom: 6px; text-align: right; font-weight: 800; font-size: 18px; color: #15803d;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 6px; color: #166534;">Payment Method:</td>
          <td style="padding-bottom: 6px; text-align: right; color: #166534; font-weight: 600;">${order.paymentMethod || 'Online Payment'}</td>
        </tr>
        <tr>
          <td style="color: #166534;">Payment Date:</td>
          <td style="text-align: right; color: #166534;">${new Date(order.paidAt || Date.now()).toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 24px 0 10px 0;">
      <a href="${orderPageUrl}" style="background-color: #f59e0b; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        View Order & Receipt &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

/**
 * Send alert to Admin on successful customer payment
 */
const sendAdminPaymentReceivedAlert = async (order) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@quickkart.com';
  const formattedOrderId = `ORD-${order._id.toString().slice(-8).toUpperCase()}`;
  const subject = `💰 Admin Alert: Payment Received for ${formattedOrderId} (Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0'})`;
  const adminPaymentsUrl = `${CLIENT_URL}/admin/payments`;

  const content = `
    <h2 style="color: #15803d; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Customer Payment Confirmed</h2>
    <p style="margin: 0 0 16px 0; color: #475569;">Payment has been received for order <strong style="color: #d97706;">${formattedOrderId}</strong>.</p>
    
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Amount Received:</td><td style="padding: 4px 0; text-align: right; font-weight: 700; color: #15803d;">Rs. ${order.totalAmount ? order.totalAmount.toFixed(2) : '0'}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Method:</td><td style="padding: 4px 0; text-align: right; color: #334155;">${order.paymentMethod || 'Online Payment'}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Paid At:</td><td style="padding: 4px 0; text-align: right; color: #334155;">${new Date(order.paidAt || Date.now()).toLocaleString()}</td></tr>
    </table>

    <div style="text-align: center;">
      <a href="${adminPaymentsUrl}" style="background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block;">
        View Admin Payments &rarr;
      </a>
    </div>
  `;

  return sendMail({
    to: adminEmail,
    subject,
    html: wrapEmailTemplate(subject, content),
  });
};

module.exports = {
  sendOtpEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordChangedEmail,
  sendAdminNewOrderAlert,
  sendAdminLowStockAlert,
  sendPaymentSuccessEmail,
  sendAdminPaymentReceivedAlert,
};
