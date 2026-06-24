const commentsService = require('./comments.service');

async function addCommentHandler(req, res, next) {
  try {
    const comment = await commentsService.addComment(
      req.params.taskId,
      req.user.id,
      req.body.content
    );
    res.status(201).json(comment);
  } catch (err) { next(err); }
}

async function listCommentsHandler(req, res, next) {
  try {
    const comments = await commentsService.listComments(req.params.taskId);
    res.json(comments);
  } catch (err) { next(err); }
}

module.exports = { addCommentHandler, listCommentsHandler };
