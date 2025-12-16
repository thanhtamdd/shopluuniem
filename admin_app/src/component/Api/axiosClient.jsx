// src/api/axiosClient.jsx
import axios from "axios";
import queryString from "query-string";

// Base URL từ .env hoặc fallback
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Tạo instance axios
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

// Thêm token vào header nếu có
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response và lỗi
axiosClient.interceptors.response.use(
  (response) => response.data, // trả về data trực tiếp
  (error) => {
    // Log lỗi chi tiết
    if (error.response) {
      console.error(
        "Axios error:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Axios error:", error.message);
    }
    return Promise.reject(error); // ném lỗi để catch ở frontend
  }
);

export default axiosClient;
