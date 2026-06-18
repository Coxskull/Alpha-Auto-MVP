import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://alpha-backend-production-673a.up.railway.app/api",
});

export default api;