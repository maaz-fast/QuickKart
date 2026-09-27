const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon & Discount management endpoints
 */

/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Validate coupon code for checkout
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderAmount
 *             properties:
 *               code:
 *                 type: string
 *                 example: SAVE10
 *               orderAmount:
 *                 type: number
 *                 example: 100.00
 *     responses:
 *       200:
 *         description: Coupon valid and discount computed
 *       400:
 *         description: Invalid or expired coupon
 */
router.post('/validate', validateCoupon);

/**
 * @swagger
 * /api/admin/coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *   post:
 *     summary: Create a new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountValue
 *               - expiresAt
 *             properties:
 *               code:
 *                 type: string
 *                 example: PROMO20
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *                 example: 20
 *               minOrderValue:
 *                 type: number
 *                 example: 50
 *               maxUses:
 *                 type: integer
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Coupon created
 */
router.route('/admin')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

/**
 * @swagger
 * /api/admin/coupons/{id}:
 *   put:
 *     summary: Update coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon updated
 *   delete:
 *     summary: Delete coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted
 */
router.route('/admin/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;
