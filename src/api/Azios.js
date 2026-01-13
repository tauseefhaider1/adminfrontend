import axios from "axios";

const adminApi = axios.create({
  baseURL: "https://backend-final-project1-production.up.railway.app/",
  withCredentials: true, // 🔥 REQUIRED
});

adminApi.interceptors.request.use((config) => {
  const key = localStorage.getItem("admin_key");

  if (key) {
    config.headers["x-admin-key"] = key;
  }

  return config;
});

export default adminApi;
