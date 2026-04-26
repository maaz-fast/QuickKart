const express = require('express');
const router = express.Router();
const { getProducts, getProductById } = require('../controllers/productController');
const { getCategories } = require('../controllers/categoryController');
const { optionalProtect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product listing endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                       category:
 *                         type: string
 *                       stock:
 *                         type: integer
 */
router.get('/', getProducts);
/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all unique product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get single product details by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detailed product object
 *       404:
 *         description: Product not found
 */
router.get('/:id', optionalProtect, getProductById);

module.exports = router;
