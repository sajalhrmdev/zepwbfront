import api from "./api";
import { Product, PaginatedResponse } from "@/types";

export const productService = {
  async findAll(params?: Record<string, string>) {
    const res = await api.get("/products", { params });
    return res.data as PaginatedResponse<Product>;
  },
  async findBySlug(slug: string) {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data.data as Product;
  },
  async findById(id: string) {
    const res = await api.get(`/products/${id}`);
    return res.data.data as Product;
  },
  async getRecommended() {
    const res = await api.get("/products/recommended");
    return res.data.data as Product[];
  },
  async getFlashSale() {
    const res = await api.get("/products/flash-sale");
    return res.data.data as Product[];
  },
  async getRelated(id: string) {
    const res = await api.get(`/products/${id}/related`);
    return res.data.data as Product[];
  },
  async getFrequentlyBought(id: string) {
    const res = await api.get(`/products/${id}/frequently-bought`);
    return res.data.data as Product[];
  },
};
