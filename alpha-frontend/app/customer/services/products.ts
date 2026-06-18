import api from "./api";
import { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const response = await api.get("/api/Products");
  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await api.get(`/api/Products/${id}`);
  return response.data;
}

export async function searchProducts(keyword: string) {
  const response = await api.get(
    `/api/Products/search?keyword=${keyword}`
  );

  return response.data;
}