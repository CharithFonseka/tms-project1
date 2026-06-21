import axiosClient from './axiosClient';

export const listNotificationsRequest = (unreadOnly) =>
  axiosClient.get('/notifications', { params: { unread: unreadOnly } }).then((r) => r.data);
export const markNotificationReadRequest = (id) =>
  axiosClient.patch(`/notifications/${id}/read`).then((r) => r.data);
export const getSocketTokenRequest = () =>
  axiosClient.get('/auth/socket-token').then((r) => r.data.token); // depends on the auth module
