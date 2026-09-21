import axios from "axios";
import store from "../redux-config/store";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token = store.getState().user?.currentUser?.token;
    if (!token) {
      try {
        const saved = localStorage.getItem("currentUser");
        if (saved) {
          token = JSON.parse(saved)?.token;
        }
      } catch {
        token = localStorage.getItem("token");
      }
    }
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;