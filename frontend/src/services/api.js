import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Resort API
export const resortAPI = {
  getAll: () => api.get('/resorts'),
  getNearby: (limit = 5) => api.get(`/resorts/nearby?limit=${limit}`),
  getById: (id) => api.get(`/resorts/${id}`),
  getByCountry: (countryCode) => api.get(`/resorts/country/${countryCode}`)
};

// Weather API
export const weatherAPI = {
  getByResort: (resortId) => api.get(`/weather/${resortId}`),
  getBatch: (resortIds) => api.post('/weather/batch', { resortIds })
};

export default api;
