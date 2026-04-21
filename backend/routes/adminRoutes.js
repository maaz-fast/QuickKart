const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalytics,
  getAdminCounts,
} = require('../controllers/adminController');
const {
  getQueries,
  updateQueryStatus
} = require('../controllers/supportController');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management endpoints (Admin role & JWT required)
 */

// All routes are protected and admin-only
router.use(protect);
router.use(admin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistical overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics and performance data
 */
router.get('/dashboard', getDashboardStats);
router.get('/counts', getAdminCounts);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get advanced analytics (top products & orders per day)
 *     description: Returns the top 5 most ordered products by quantity and a daily order count for the last 30 days. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 topProducts:
 *                   type: array
 *                   description: Top 5 most ordered products
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Product ID
 *                       name:
 *                         type: string
 *                         example: Wireless Headphones
 *                       image:
 *                         type: string
 *                         example: https://example.com/image.jpg
 *                       totalOrdered:
 *                         type: integer
 *                         example: 42
 *                       totalRevenue:
 *                         type: number
 *                         example: 2099.58
 *                 ordersPerDay:
 *                   type: array
 *                   description: Order counts grouped by day (last 30 days)
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Date in YYYY-MM-DD format
 *                         example: "2026-04-15"
 *                       count:
 *                         type: integer
 *                         example: 7
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as admin
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, description, category, stock]
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/products', createProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put('/products/:id', updateProduct);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/products/:id', deleteProduct);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/categories', createCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update a category name
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put('/categories/:id', updateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete('/categories/:id', deleteCategory);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all global customer orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders ever placed
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.put('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all registered users directory
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/support:
 *   get:
 *     summary: Get all customer support queries
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Resolved] }
 *     responses:
 *       200:
 *         description: List of queries
 */
router.get('/support', getQueries);

/**
 * @swagger
 * /api/admin/support/{id}:
 *   put:
 *     summary: Update a support query status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Pending, Resolved] }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put('/support/:id', updateQueryStatus);

module.exports = router;
