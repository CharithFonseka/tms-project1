const { listNotifications, markAsRead } = require('./notifications.service');

async function getNotifications(req, res, next) {
  try {
    const unreadOnly = req.query.unread === 'true';
    const data = await listNotifications(req.user.id, { unreadOnly });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const data = await markAsRead(req.params.id, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markNotificationRead };