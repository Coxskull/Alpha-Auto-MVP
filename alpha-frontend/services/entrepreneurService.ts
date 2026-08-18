import api from "./api";

import type {
  EntrepreneurDashboard,
  EntrepreneurReferral,
  EntrepreneurEarning,
  EntrepreneurProgram,
} from "../types/entrepreneur";

export async function getEntrepreneurDashboard(): Promise<EntrepreneurDashboard> {
  const response = await api.get<EntrepreneurDashboard>(
    "/api/entrepreneur/dashboard"
  );

  return response.data;
}

export async function getEntrepreneurReferrals(): Promise<
  EntrepreneurReferral[]
> {
  const response = await api.get<EntrepreneurReferral[]>(
    "/api/entrepreneur/referrals"
  );

  return response.data;
}

export async function getEntrepreneurEarnings(): Promise<
  EntrepreneurEarning[]
> {
  const response = await api.get<EntrepreneurEarning[]>(
    "/api/entrepreneur/earnings"
  );

  return response.data;
}

export async function getEntrepreneurProgram(): Promise<EntrepreneurProgram> {
  const response = await api.get<EntrepreneurProgram>(
    "/api/entrepreneur/program"
  );

  return response.data;
}