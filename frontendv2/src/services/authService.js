import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post('/login', {
      username: credentials.username,
      password: credentials.password,
      portalType: credentials.portalType
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error('Invalid login response');
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const registerInstitute = async (instituteData) => {
  try {
    const response = await api.post('/api/auth/signup/institute', instituteData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
}; 