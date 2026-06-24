const router = require('express').Router({ mergeParams: true });
const multer = require('multer');
const { addAttachmentHandler, listAttachmentsHandler, removeAttachmentHandler } = require('./attachments.controller');
const authenticate = require('../../middlewares/jwt.middleware');

// Store file in memory so attachments.storage.js can upload the buffer to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — matches frontend + storage layer
});

router.use(authenticate);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   get:
 *     summary: List attachments for a task
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of attachments
 */
router.get('/', listAttachmentsHandler);

/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   post:
 *     summary: Upload a file attachment to a task
 *     tags: [Attachments]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Attachment uploaded
 *       400:
 *         description: No file / file too large / type not allowed
 */
router.post('/', upload.single('file'), addAttachmentHandler);

/**
 * @swagger
 * /api/attachments/{id}:
 *   delete:
 *     summary: Remove an attachment by ID
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attachment removed
 */
router.delete('/:id', removeAttachmentHandler);

module.exports = router;
