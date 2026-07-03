import api from "./api";
import { Cart } from "@/types";

export const cartService = {
  async getCart() {
    const res = await api.get("/cart");
    return res.data.data as Cart;
  },
  async addItem(productId: string, quantity: number, variantId?: string) {
    const res = await api.post("/cart/items", { productId, quantity, variantId });
    return res.data.data as Cart;
  },
  async updateItem(itemId: string, quantity: number) {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data.data as Cart;
  },
  async removeItem(itemId: string) {
    await api.delete(`/cart/items/${itemId}`);
  },
  async clearCart() {
    await api.delete("/cart");
  },
  async applyCoupon(code: string) {
    const res = await api.post("/cart/coupon", { code });
    return res.data.data as Cart;
  },
  async removeCoupon() {
    await api.delete("/cart/coupon");
  },
};
