const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories } = require('../controllers/productController');

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
router.get('/categories', getCategories);
router.get('/:id', getProductById);

module.exports = router;
