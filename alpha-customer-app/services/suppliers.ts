import api from "./api";
import { Supplier } from "@/types/supplier";

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await api.get("/api/Suppliers");
  return response.data;
}