// admin/src/api/Azios.js
import axios from "axios";

// setting up axios for admin api calls
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4534",
  withCredentials: true, // need this for cookies to work properly
  headers: {
    "Content-Type": "application/json",
  },
});

// add admin key to all requests
adminApi.interceptors.request.use(
  (config) => {
    // get the key from localStorage
    const adminKey = localStorage.getItem("admin_key");

    if (adminKey) {
      // attach it to header
      config.headers["x-admin-key"] = adminKey;
      // debug log - can remove later
      console.log(`added admin key to: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      // no key found, just warn
      console.log(`no admin key for: ${config.url}`);
    }

    return config;
  },
  (error) => {
    // just pass the error along
    return Promise.reject(error);
  }
);

// handle responses globally
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // if we get 401, key is probably bad
    if (error.response?.status === 401) {
      console.log("admin key not valid anymore");
      
      // clear everything
      localStorage.removeItem("admin_key");
      localStorage.removeItem("admin_authenticated");
      
      // send to login page if not already there
      // TODO: maybe use react router instead of window.location?
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    // let the calling code handle the error too
    return Promise.reject(error);
  }
);

export default adminApi;