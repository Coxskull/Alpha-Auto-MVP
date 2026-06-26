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
    const url = error.config?.url || "";

    const isAuthCheck = url.includes("/api/Auth/me");

    if (typeof window !== "undefined" && isAuthCheck) {
      if (error.response?.status === 401) {
        localStorage.removeItem("alpha_token");
        localStorage.removeItem("alpha_user");
      }
    }

    return Promise.reject(error);
  }
);

export default api;