import axios from "axios";
import { toast } from "sonner";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_LMS_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.message || err.messsage || "Something went wrong";
    toast.error(msg);
    return Promise.reject(new Error(msg));
  },
);
