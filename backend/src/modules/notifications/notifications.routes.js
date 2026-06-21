const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationRead } = require('./notifications.controller');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ code: 401, message: 'No token provided' });
  try {
    const { verifyToken } = require('../../utils/token.util');
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
}

// GET /api/notifications?unread=true
router.get('/', authenticate, getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, markNotificationRead);

module.exports = router;