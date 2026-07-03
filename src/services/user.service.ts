import api from "./api";
import { User } from "@/types";

export const userService = {
  async getProfile() { const res = await api.get("/auth/me"); return res.data.data as User; },
  async updateProfile(data: Partial<User>) { const res = await api.put("/users/me", data); return res.data.data as User; },
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    await api.put("/users/change-password", data);
  },
};
