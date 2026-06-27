const router = require('express').Router();
const {
  loginHandler,
  refreshHandler,
  logoutHandler,
  resetPasswordHandler,
  getSocketTokenHandler,
} = require('./auth.controller');
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
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a valid refresh-token cookie for a new access token
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Missing, invalid, or expired refresh token
 */
router.post('/refresh', refreshHandler);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Clear the access and refresh cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', logoutHandler);

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

/**
 * @swagger
 * /api/auth/socket-token:
 *   get:
 *     summary: Get a token for authenticating WebSockets
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved token
 *       401:
 *         description: Unauthorized
 */
router.get('/socket-token', authenticate, getSocketTokenHandler);

module.exports = router;