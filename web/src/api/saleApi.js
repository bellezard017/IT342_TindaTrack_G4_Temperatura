import axiosInstance from './axiosInstance';

export const saleApi = {
  // Get all sales
  getSales: async () => {
    const { data } = await axiosInstance.get('/sales');
    return data;
  },

  // Get a single sale by ID
  getSaleById: async (id) => {
    const { data } = await axiosInstance.get(`/sales/${id}`);
    return data;
  },

  // Add a new sale
  addSale: async (payload) => {
    const { data } = await axiosInstance.post('/sales', payload);
    return data;
  },

  // Dashboard data
  getDashboard: async () => {
    const { data } = await axiosInstance.get('/dashboard');
    return data;
  },

  // Update an existing sale
  updateSale: async (id, payload) => {
    const { data } = await axiosInstance.put(`/sales/${id}`, payload);
    return data;
  },

  // Delete a sale
  deleteSale: async (id) => {
    await axiosInstance.delete(`/sales/${id}`);
  },
};