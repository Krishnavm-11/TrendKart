import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // Address requests must use the customer login token.
    const isAddressRequest = config.url?.includes("/orders/addresses");

    const token = isAddressRequest
      ? userToken
      : adminToken || userToken;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;