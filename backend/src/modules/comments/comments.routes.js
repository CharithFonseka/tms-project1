const router = require('express').Router({ mergeParams: true });
const { addCommentHandler, listCommentsHandler } = require('./comments.controller');
const authenticate = require('../../middlewares/jwt.middleware');
const validate = require('../../middlewares/validate.middleware');
const Joi = require('joi');

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

router.use(authenticate);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: List comments for a task
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/', listCommentsHandler);

/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task (all authenticated users)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post('/', validate(commentSchema), addCommentHandler);

module.exports = router;
