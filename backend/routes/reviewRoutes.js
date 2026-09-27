const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createOrUpdateReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews and rating endpoints
 */

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, highest, lowest]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated reviews list
 *   post:
 *     summary: Create or update review for a product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent quality product!
 *     responses:
 *       201:
 *         description: Review saved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(getProductReviews)
  .post(protect, createOrUpdateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
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
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.delete('/:id', protect, deleteReview);

module.exports = router;
