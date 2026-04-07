import axiosInstance from './axiosInstance';

export const authApi = {
  login: async ({ email, password }) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    return data;
  },

  logout: async () => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/oauth/google/login`;
  },

  // Upload profile picture — sends multipart/form-data, returns { avatarUrl }
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axiosInstance.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  removeAvatar: async () => {
    const { data } = await axiosInstance.delete('/user/avatar');
    return data;
  },

  // Update phone and/or address
  updateProfile: async (payload) => {
    const { data } = await axiosInstance.put('/user/profile', payload);
    return data;
  },
};