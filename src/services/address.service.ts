import api from "./api";
import { Address } from "@/types";

export const addressService = {
  async findAll() { const res = await api.get("/addresses"); return res.data.data as Address[]; },
  async findById(id: string) { const res = await api.get(`/addresses/${id}`); return res.data.data as Address; },
  async create(data: Partial<Address>) { const res = await api.post("/addresses", data); return res.data.data as Address; },
  async update(id: string, data: Partial<Address>) { const res = await api.put(`/addresses/${id}`, data); return res.data.data as Address; },
  async delete(id: string) { await api.delete(`/addresses/${id}`); },
  async setDefault(id: string) { await api.put(`/addresses/${id}/default`); },
};
