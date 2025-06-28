import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // All routes now start from here
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;