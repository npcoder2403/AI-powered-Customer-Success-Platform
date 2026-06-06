import api from "./api";
import { User } from "@/src/types";

export const userService = {
  async list(): Promise<User[]> {
    const res = await api.get("/users");
    return res.data;
  },

  async updateRole(userId: number, role: string): Promise<User> {
    const res = await api.patch(`/users/${userId}/role?role=${role}`);
    return res.data;
  },
};
