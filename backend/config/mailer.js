const nodemailer = require('nodemailer');

/**
 * Dynamically creates a transporter ensuring process.env credentials are fresh
 */
const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    // Gmail-specific optimized transport
    if (user.endsWith('@gmail.com') || process.env.SMTP_HOST === 'smtp.gmail.com') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }

    // Generic SMTP transport
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Fallback: Console / JSON transport for local development if credentials are missing
  console.log('ℹ️ SMTP credentials missing — using console preview fallback for email dispatch');
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

/**
 * Safe mail delivery wrapper that handles failures gracefully without crashing main flow.
 */
const sendMail = async (options) => {
  try {
    const fromName = process.env.EMAIL_FROM_NAME || 'QuickKart';
    const fromAddress = process.env.SMTP_USER || 'noreply@quickkart.com';

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      ...options,
    };

    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    
    if (info.message) {
      console.log('📧 [Mail Fallback Preview]:', JSON.parse(info.message));
    } else {
      console.log('📧 [Mail Sent Successfully]:', info.messageId || info.response);
    }
    return { success: true, info };
  } catch (error) {
    console.error('⚠️ [Email Delivery Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendMail
};
