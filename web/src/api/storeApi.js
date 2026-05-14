import axiosInstance from './AxiosInstance';

export const storeApi = {

  getTeam: async () => {
    const response = await axiosInstance.get('/store/team');
    return response.data;
  },

  getActivity: async () => {
    const response = await axiosInstance.get('/store/activity');
    return response.data;
  },

  setupStore: async (storeName) => {
    const response = await axiosInstance.post('/store/setup', { storeName });
    return response.data;
  },

  joinStore: async (storeCode) => {
    const response = await axiosInstance.post('/store/join', { storeCode });
    return response.data;
  },

  removeMember: async (memberId) => {
    await axiosInstance.delete(`/store/members/${memberId}`);
  },

};
