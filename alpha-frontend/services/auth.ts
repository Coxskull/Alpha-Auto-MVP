import api from "./api";

export async function login(email: string, password: string) {
  const res = await api.post("/Auth/login", {
    email,
    password,
  });

  return res.data;
}