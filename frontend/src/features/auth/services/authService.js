import apiClient from '../../../services/apiClient';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout/');
    return response.data;
  },
  loginWithGoogle: async (token) => {
    const response = await apiClient.post('/auth/google/', { token });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  }
};
