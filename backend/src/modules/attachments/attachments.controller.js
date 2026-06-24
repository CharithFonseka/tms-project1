const attachmentsService = require('./attachments.service');

async function addAttachmentHandler(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: 'No file uploaded' });
    }
    const attachment = await attachmentsService.addAttachment(
      req.params.taskId,
      req.user.id,
      req.file
    );
    res.status(201).json(attachment);
  } catch (err) { next(err); }
}

async function listAttachmentsHandler(req, res, next) {
  try {
    const attachments = await attachmentsService.listAttachments(req.params.taskId);
    res.json(attachments);
  } catch (err) { next(err); }
}

async function removeAttachmentHandler(req, res, next) {
  try {
    await attachmentsService.removeAttachment(req.params.id);
    res.json({ message: 'Attachment removed successfully' });
  } catch (err) { next(err); }
}

module.exports = { addAttachmentHandler, listAttachmentsHandler, removeAttachmentHandler };
