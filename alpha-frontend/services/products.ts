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
  const response = await api.get(`/api/Products/search?keyword=${keyword}`);
  return response.data;
}

export async function getSupplierProducts(supplierId: string): Promise<Product[]> {
  const response = await api.get(`/api/Products/supplier/${supplierId}`);
  return response.data;
}

export async function createSupplierProduct(formData: FormData) {
  const response = await api.post("/api/Products/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function updateSupplierProduct(productId: string, formData: FormData) {
  const response = await api.put(`/api/Products/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function deleteSupplierProduct(productId: string, supplierId: string) {
  const response = await api.delete(
    `/api/Products/${productId}/supplier/${supplierId}`
  );

  return response.data;
}