import api from "./api";
import { Product } from "@/types";

export interface CreateProductData {
  name: string;
  description?: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  mrp: number;
  sellingPrice: number;
  tax?: number;
  unit?: string;
  stock?: number;
  minStock?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  tags?: string[];
  highlights?: string[];
  images?: { url: string; isPrimary?: boolean; alt?: string }[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export const adminProductService = {
  async findAll(params?: Record<string, string>) {
    const res = await api.get("/products", { params });
    return res.data as { data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } };
  },
  async findById(id: string) {
    const res = await api.get(`/products/${id}`);
    return res.data.data as Product;
  },
  async create(data: CreateProductData) {
    const res = await api.post("/products", data);
    return res.data.data as Product;
  },
  async update(id: string, data: UpdateProductData) {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data as Product;
  },
  async remove(id: string) {
    await api.delete(`/products/${id}`);
  },
};
