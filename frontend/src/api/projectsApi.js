import axiosClient from './axiosClient';

export const createProjectRequest = (data) => axiosClient.post('/projects', data).then((r) => r.data);
export const listProjectsRequest = () => axiosClient.get('/projects').then((r) => r.data);
export const getProjectRequest = (id) => axiosClient.get(`/projects/${id}`).then((r) => r.data);
export const updateProjectRequest = (id, data) => axiosClient.patch(`/projects/${id}`, data).then((r) => r.data);
export const deleteProjectRequest = (id) => axiosClient.delete(`/projects/${id}`).then((r) => r.data);
