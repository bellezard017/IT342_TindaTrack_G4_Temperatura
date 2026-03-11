import axiosInstance from './axiosInstance';

export const authApi = {
  /**
   * POST /auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ user: object, token: string }}
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * POST /auth/logout
   */
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  /**
   * GET /auth/me  – returns current authenticated user
   */
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  /**
   * POST /auth/oauth/google
   * @param {{ token: string }} payload  – Google OAuth token from frontend
   */
  googleLogin: async (payload) => {
    const response = await axiosInstance.post('/auth/oauth/google', payload);
    return response.data;
  },
};