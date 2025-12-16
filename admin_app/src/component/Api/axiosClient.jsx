// src/api/axiosClient.jsx
import axios from "axios";
import queryString from "query-string";

// Base URL
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Tạo instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: (params) => queryString.stringify(params),
});

// Thêm token nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => response, // **trả cả response, không trả data trực tiếp**
  (error) => Promise.reject(error)
);

export default axiosClient;
