import api from "@/services/api";

export async function getMissionControlOverview() {
  const response = await api.get("/api/Dashboard/overview");
  return response.data;
}

export async function getMechanicDashboard() {
  const response = await api.get("/api/Dashboard/mechanic");
  return response.data;
}

export async function getDriverDashboard() {
  const response = await api.get("/api/Dashboard/driver");
  return response.data;
}