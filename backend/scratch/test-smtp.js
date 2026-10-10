/**
 * SMTP diagnostic — run from the backend folder:
 *   node scratch/test-smtp.js          # verify connection only
 *   node scratch/test-smtp.js --send   # verify + send a live test email
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || SMTP_USER;

  console.log('--- SMTP configuration ---');
  console.log('host     :', SMTP_HOST);
  console.log('port     :', SMTP_PORT, '(secure:', SMTP_SECURE + ')');
  console.log('user     :', SMTP_USER);
  console.log('pass set :', Boolean(SMTP_PASS), '(length ' + (SMTP_PASS ? SMTP_PASS.length : 0) + ')');
  console.log('from     :', fromAddress);
  console.log('--------------------------');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection + authentication verified');
  } catch (err) {
    console.error('❌ SMTP verify FAILED:', err.message);
    console.error('Code:', err.code, '| Response:', err.response);
    process.exit(1);
  }

  if (process.argv.includes('--send')) {
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'QuickKart'}" <${fromAddress}>`,
        to: process.env.ADMIN_NOTIFICATION_EMAIL || fromAddress,
        subject: 'QuickKart SMTP Test',
        text: 'If you received this, email delivery is working.',
      });
      console.log('✅ Test email sent:', info.messageId, '|', info.response);
    } catch (err) {
      console.error('❌ Send FAILED:', err.message, '| Code:', err.code);
    }
  }
})();
