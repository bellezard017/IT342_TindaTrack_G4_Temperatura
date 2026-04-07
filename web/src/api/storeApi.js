import axiosInstance from './axiosInstance';

export const storeApi = {
  getTeam: async () => {
    const response = await axiosInstance.get('/store/team');
    return response.data;
  },
};
