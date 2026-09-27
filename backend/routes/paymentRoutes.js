const express = require('express');
const router = express.Router();
const {
  createPaymentSession,
  handleSafepayWebhook,
  verifyPaymentStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Safepay Sandbox Payment Gateway integration endpoints
 */

/**
 * @swagger
 * /api/payments/create-session:
 *   post:
 *     summary: Create Safepay checkout session (Sandbox mode)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 6580a1234567890abcdef123
 *     responses:
 *       200:
 *         description: Safepay checkout URL generated successfully
 *       400:
 *         description: Invalid order ID
 */
router.post('/create-session', protect, createPaymentSession);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Safepay Webhook listener
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook acknowledged
 */
router.post('/webhook', handleSafepayWebhook);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify payment status after redirect
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order payment status verified
 */
router.post('/verify', protect, verifyPaymentStatus);

module.exports = router;
