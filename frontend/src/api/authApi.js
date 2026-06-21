
import axiosClient from './axiosClient';

export const loginRequest = (email, password) =>
    axiosClient.post('/auth/login', { email, password }).then((res) => res.data);

export const resetPasswordRequest = (oldPassword, newPassword) =>
    axiosClient.put('/auth/reset-password', { oldPassword, newPassword }).then((res) => res.data);