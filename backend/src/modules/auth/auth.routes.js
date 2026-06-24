const router = require('express').Router();
const { loginHandler, resetPasswordHandler } = require('./auth.controller');
const authenticate = require('../../middlewares/jwt.middleware');
const validate = require('../../middlewares/validate.middleware');
const { loginSchema, resetPasswordSchema } = require('./auth.validation');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a session token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), loginHandler);

/**
 * @swagger
 * /api/auth/reset-password:
 *   put:
 *     summary: Reset password (must be logged in)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password incorrect
 *       400:
 *         description: New password too short
 */
router.put('/reset-password', authenticate, validate(resetPasswordSchema), resetPasswordHandler);

module.exports = router;