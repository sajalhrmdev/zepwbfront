import api from "./api";
import { Category } from "@/types";

export const categoryService = {
  async findAll(params?: Record<string, string>) {
    const res = await api.get("/categories", { params });
    return res.data.data as Category[];
  },
  async findBySlug(slug: string) {
    const res = await api.get(`/categories/slug/${slug}`);
    return res.data.data as Category;
  },
};
