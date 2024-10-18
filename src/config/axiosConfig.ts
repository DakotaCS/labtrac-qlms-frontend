// axiosConfig.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://backend.labtrac.quantuslms.ca/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Exclude the /login endpoint from adding the Authorization header
    const excludedEndpoints = ['/login'];

    if (token && !excludedEndpoints.includes(config.url || '')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
