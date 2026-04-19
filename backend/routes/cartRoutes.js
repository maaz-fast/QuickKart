const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management endpoints (JWT required)
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 64a7f2c3b5e4d12345678901
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       200:
 *         description: Quantity updated for existing cart item
 *       401:
 *         description: Unauthorized - JWT token required
 *       404:
 *         description: Product not found
 */
router.post('/', protect, addToCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get all cart items for the logged-in user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items with total price
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: number
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - JWT token required
 */
router.get('/', protect, getCart);

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item MongoDB ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         description: Unauthorized - JWT token required
 *       403:
 *         description: Forbidden - not your cart item
 *       404:
 *         description: Cart item not found
 */
router.delete('/:id', protect, removeFromCart);

module.exports = router;
