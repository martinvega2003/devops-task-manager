import axios from 'axios';
import { toast } from 'react-toastify';

//Import server url from .env file
const url = import.meta.env.VITE_API_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: url, // Server base URL
});

// Request interceptor to attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Alternatively, use a context hook if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && ([400, 401, 403, 404].includes(error.response.status))) {
      toast.error(error.response?.data?.msg || "An error Occurred", {
        toastId: 'server-connection-error'
      });
    }
    return Promise.reject(error);
  }
);

export default api;
