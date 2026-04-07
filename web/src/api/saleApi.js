import axiosInstance from './axiosInstance';

export const saleApi = {
  createSale: async (payload) => {
    const response = await axiosInstance.post('/sales', payload);
    return response.data;
  },

  getSales: async () => {
    const response = await axiosInstance.get('/sales');
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  },

  deleteSale: async (id) => {
    const response = await axiosInstance.delete(`/sales/${id}`);
    return response.data;
  },
};
