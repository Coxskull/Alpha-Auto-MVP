import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://alpha-backend-production-673a.up.railway.app";

const api = axios.create({
  baseURL,
});

export default api;