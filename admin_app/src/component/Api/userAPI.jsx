import axiosClient from './axiosClient';

const userAPI = {
  getAPI: async (params = {}) => {
    try {
      const res = await axiosClient.get('/admin/user', { params });
      return res.data; // Bắt buộc lấy res.data, không phải res
    } catch (err) {
      console.error('[userAPI.getAPI] error', err);
      return { users: [], totalPage: 1, currentPage: 1 };
    }
  },

  delete: async (id) => {
    try {
      const res = await axiosClient.delete(`/admin/user?id=${id}`);
      return res.data;
    } catch (err) {
      console.error('[userAPI.delete] error', err);
      return { msg: 'Server không phản hồi' };
    }
  }
};

export default userAPI;
