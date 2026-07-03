import api from "./api";
import { Product } from "@/types";

export const wishlistService = {
  async getAll() { const res = await api.get("/wishlist"); return res.data.data as Product[]; },
  async add(productId: string) { await api.post("/wishlist", { productId }); },
  async remove(productId: string) { await api.delete(`/wishlist/${productId}`); },
  async check(productId: string) { const res = await api.get(`/wishlist/check/${productId}`); return res.data.data as boolean; },
};
