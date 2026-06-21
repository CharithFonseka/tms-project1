import axiosClient from './axiosClient';

export const listTasksRequest = (params) => axiosClient.get('/tasks', { params }).then((r) => r.data);
export const createTaskRequest = (payload) => axiosClient.post('/tasks', payload).then((r) => r.data);
export const updateTaskStatusRequest = (id, status) => axiosClient.patch(`/tasks/${id}/status`, { status }).then((r) => r.data);
export const deleteTaskRequest = (id) => axiosClient.delete(`/tasks/${id}`).then((r) => r.data);
export const listCommentsRequest = (taskId) => axiosClient.get(`/tasks/${taskId}/comments`).then((r) => r.data);
export const addCommentRequest = (taskId, content) => axiosClient.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data);

export const uploadAttachmentRequest = (taskId, file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return axiosClient.post(`/tasks/${taskId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  }).then((r) => r.data);
};
