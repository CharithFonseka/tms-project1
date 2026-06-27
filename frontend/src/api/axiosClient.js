
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    withCredentials: true, // sends the httpOnly auth cookie the backend sets
});

// Don't attempt a token refresh for these endpoints (avoids infinite loops).
const NO_REFRESH = ['/auth/login', '/auth/refresh', '/auth/logout'];

axiosClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        const status = err.response?.status;
        const isAuthEndpoint = NO_REFRESH.some((p) => original?.url?.includes(p));

        // On a 401, try exactly once to mint a fresh access token, then retry.
        if (status === 401 && original && !original._retry && !isAuthEndpoint) {
            original._retry = true;
            try {
                await axiosClient.post('/auth/refresh');
                return axiosClient(original);
            } catch {
                // Refresh failed — the session is gone. Clear local state so the
                // app's ProtectedRoute redirects to /login on the next render.
                sessionStorage.removeItem('user');
                return Promise.reject({ code: 401, message: 'Session expired' });
            }
        }

        return Promise.reject(err.response?.data || { message: 'Network error' });
    }
);

export default axiosClient;
