import axiosInstance from './axiosInstance';

export const registerApi = {
  /**
   * POST /auth/register  – Owner
   * @param {{ name, email, password, confirmPassword, storeName }} payload
   */
  registerOwner: async (payload) => {
    const response = await axiosInstance.post('/auth/register', {
      ...payload,
      role: 'OWNER',
    });
    return response.data;
  },

  /**
   * POST /auth/register  – Staff
   * @param {{ name, email, password, confirmPassword, storeCode }} payload
   */
  registerStaff: async (payload) => {
    const response = await axiosInstance.post('/auth/register', {
      ...payload,
      role: 'STAFF',
    });
    return response.data;
  },
};