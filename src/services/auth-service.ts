import api from "@/services/api";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "@/types";

export const authService = {
  async getProfile(): Promise<User> {
    const res = await api.get("/auth/me");
    return res.data.data as User;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post("/auth/login", data);
    return res.data.data as AuthResponse;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post("/auth/register", data);
    return res.data.data as AuthResponse;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(
      "/auth/forgot-password",
      data
    );
    return res.data;
  },

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
    return res.data;
  },
};
