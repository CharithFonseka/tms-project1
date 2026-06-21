
import axiosClient from './axiosClient';

export const listUsersRequest = (params) =>
    axiosClient.get('/users', { params }).then((res) => res.data);

export const createUserRequest = (payload) =>
    axiosClient.post('/users', payload).then((res) => res.data);

export const updateUserRequest = (id, payload) =>
    axiosClient.patch(`/users/${id}`, payload).then((res) => res.data);

export const deactivateUserRequest = (id) =>
    axiosClient.patch(`/users/${id}/deactivate`).then((res) => res.data);