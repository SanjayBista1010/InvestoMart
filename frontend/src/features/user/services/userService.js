import apiClient from '../../../services/apiClient';

export const userService = {
  getProfileSummary: async () => {
    const response = await apiClient.get('/profile/summary/');
    return response.data;
  }
};
