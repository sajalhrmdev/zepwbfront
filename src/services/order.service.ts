import api from "./api";
import { Order, PaginatedResponse } from "@/types";

export const orderService = {
  async findAll(params?: Record<string, string>) {
    const res = await api.get("/orders", { params });
    return res.data as PaginatedResponse<Order>;
  },
  async adminFindAll(params?: Record<string, string>) {
    const res = await api.get("/orders/admin", { params });
    return res.data as PaginatedResponse<Order>;
  },
  async findById(id: string) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data as Order;
  },
  async create(data: { addressId: string; paymentMethod: string; couponCode?: string; deliverySlot?: string; notes?: string }) {
    const res = await api.post("/orders", data);
    return res.data.data as Order;
  },
  async cancelOrder(id: string, reason: string) {
    await api.post(`/orders/${id}/cancel`, { reason });
  },
  async adminUpdateStatus(id: string, status: string, notes?: string) {
    const res = await api.put(`/orders/${id}/status`, { status, notes });
    return res.data.data as Order;
  },
  async adminCancelOrder(id: string, reason: string) {
    const res = await api.post(`/orders/${id}/admin-cancel`, { reason });
    return res.data.data as Order;
  },
  async downloadInvoice(id: string) {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
