const supabase = require('../../config/db');
const ApiError = require('../../utils/ApiError');

let ioInstance = null;
function attachIO(io) { ioInstance = io; }

async function createNotification({ userId, message, type }) {
  const { data, error } = await supabase
    .from('Notifications')
    .insert({ user_id: userId, message })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:new', { ...data, type });
  }
  return data;
}

async function listNotifications(userId, { unreadOnly = false } = {}) {
  let query = supabase
    .from('Notifications')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });
  if (unreadOnly) query = query.eq('is_read', false);
  const { data, error } = await query;
  if (error) throw new ApiError(400, error.message);
  return data;
}

async function markAsRead(notificationId, userId) {
  const { data, error } = await supabase
    .from('Notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Notification not found');
  return data;
}

module.exports = { attachIO, createNotification, listNotifications, markAsRead };