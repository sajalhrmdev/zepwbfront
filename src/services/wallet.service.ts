import api from "./api";
import { Wallet, WalletTransaction, PaginatedResponse } from "@/types";

export const walletService = {
  async getWallet() {
    const res = await api.get("/wallet");
    return res.data.data as Wallet;
  },
  async getTransactions(params?: Record<string, string>) {
    const res = await api.get("/wallet/transactions", { params });
    return res.data as PaginatedResponse<WalletTransaction>;
  },
  async addFunds(amount: number) {
    const res = await api.post("/wallet/add-funds", { amount });
    return res.data.data as WalletTransaction;
  },
};
