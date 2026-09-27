const { Safepay } = require('@sfpy/node-sdk');

const env = process.env.SAFEPAY_ENV || 'sandbox';

if (env !== 'sandbox') {
  console.warn('[SAFEPAY SAFETY GUARD] Forcing environment to sandbox. Live transactions are disabled.');
}

const safepay = new Safepay({
  environment: 'sandbox',
  apiKey: process.env.SAFEPAY_API_KEY,
  v1Secret: process.env.SAFEPAY_V1_SECRET || process.env.SAFEPAY_API_KEY,
  webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
});

module.exports = { safepay, isSandbox: true };
