import axios from 'axios';

const request = axios.create({
  baseURL: 'http://1os5080hd573.vicp.fun',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 根据接口文档，通用返回体包含 success, errCode, errMessage, data
    if (res.success === false) {
      // 统一错误处理
      if (res.errCode === '401' || res.errCode === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(res.errMessage || '接口请求失败'));
    }
    return res.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default request;
