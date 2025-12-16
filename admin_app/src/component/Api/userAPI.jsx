import axiosClient from './axiosClient';

const userAPI = {
  login: async (data) => {
    try {
      const res = await axiosClient.post('/admin/user/login', data);

      console.log('[userAPI.login] raw response:', res);

      return {
        success: res.success,
        user: res.user || null,
        token: res.token || null,  // <-- sửa từ res.jwt thành res.token
        msg: res.msg || null,
      };
    } catch (err) {
      console.error('[userAPI.login] error', err);
      return {
        success: false,
        msg: 'Server không phản hồi',
      };
    }
  },
};


export default userAPI;
