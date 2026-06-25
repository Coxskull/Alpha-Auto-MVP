import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("alpha_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("alpha_token");
        localStorage.removeItem("alpha_user");
        window.location.href = "/";
      }

      if (error.response?.status === 403) {
        window.location.href = "/unauthorized";
      }
    }

    return Promise.reject(error);
  }
);

export default api;