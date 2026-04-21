const express = require('express');
const router = express.Router();
const { submitQuery } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Customer support and contact endpoints
 */

/**
 * @swagger
 * /api/support:
 *   post:
 *     summary: Submit a support/contact query
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Query submitted successfully
 *       400:
 *         description: Validation error
 */
// Use protect optionally to link to user if logged in, but allow guests
router.post('/', (req, res, next) => {
    // Check if token exists but don't fail if it doesn't
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        return protect(req, res, () => submitQuery(req, res, next));
    }
    submitQuery(req, res, next);
});

module.exports = router;
