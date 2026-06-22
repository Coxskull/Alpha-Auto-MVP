export interface Product {
  id: string;
  supplierId: string;
  partNumber: string;
  brand: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  quantityAvailable: number;
  isActive: boolean;
  createdAt: string;
}