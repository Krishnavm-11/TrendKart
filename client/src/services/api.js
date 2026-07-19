import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const normalToken =
      localStorage.getItem("token");

    const adminToken =
      localStorage.getItem("adminToken");

    const token = adminToken || normalToken;

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;