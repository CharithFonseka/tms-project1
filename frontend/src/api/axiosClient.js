
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // sends the httpOnly auth cookie Person 1's backend sets
});

axiosClient.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err.response?.data || { message: 'Network error' })
);

export default axiosClient;