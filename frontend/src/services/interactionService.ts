import api from "./api";
import { Interaction, InteractionListResponse } from "@/src/types";

export const interactionService = {
  async list(params?: Record<string, string | number>): Promise<InteractionListResponse> {
    const res = await api.get("/interactions", { params });
    return res.data;
  },

  async get(id: number): Promise<Interaction> {
    const res = await api.get(`/interactions/${id}`);
    return res.data;
  },

  async create(data: Partial<Interaction>): Promise<Interaction> {
    const res = await api.post("/interactions", data);
    return res.data;
  },

  async update(id: number, data: Partial<Interaction>): Promise<Interaction> {
    const res = await api.put(`/interactions/${id}`, data);
    return res.data;
  },
};
