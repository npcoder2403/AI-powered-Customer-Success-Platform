import api from "./api";
import { User } from "@/src/types";

export interface AuthResult {
  user: User;
}

export const authService = {
  async register(data: { email: string; full_name: string; password: string }): Promise<AuthResult> {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResult> {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getProfile(): Promise<User> {
    const res = await api.get("/auth/profile");
    return res.data;
  },
};
