const express = require('express');
const router = express.Router();
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Addresses
 *   description: Address book management endpoints (JWT required)
 */

/**
 * @swagger
 * /api/users/me/addresses:
 *   get:
 *     summary: Get all saved addresses for current user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - addressLine1
 *               - city
 *               - postalCode
 *               - country
 *             properties:
 *               label:
 *                 type: string
 *                 example: Home
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
 *               addressLine1:
 *                 type: string
 *                 example: 123 Main St
 *               addressLine2:
 *                 type: string
 *                 example: Apt 4B
 *               city:
 *                 type: string
 *                 example: Lahore
 *               state:
 *                 type: string
 *                 example: Punjab
 *               postalCode:
 *                 type: string
 *                 example: "54000"
 *               country:
 *                 type: string
 *                 example: Pakistan
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(protect, getAddresses)
  .post(protect, createAddress);

/**
 * @swagger
 * /api/users/me/addresses/{id}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
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
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.route('/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

/**
 * @swagger
 * /api/users/me/addresses/{id}/default:
 *   patch:
 *     summary: Set address as default
 *     tags: [Addresses]
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
 *         description: Set default address successfully
 *       404:
 *         description: Address not found
 */
router.patch('/:id/default', protect, setDefaultAddress);

module.exports = router;
