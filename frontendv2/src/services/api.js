import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000, // 10 second timeout
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    try {
      console.log('Request config before processing:', config);

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log('Current user in storage:', user);
      console.log('Request URL:', config.url);
      console.log('Request method:', config.method);
      
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Token added to request');
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored credentials
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Error handling unauthorized request:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default api; 