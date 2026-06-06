import api from "./api";
import { Customer, CustomerListResponse } from "@/src/types";

export const customerService = {
  async list(params?: Record<string, string | number>): Promise<CustomerListResponse> {
    const res = await api.get("/customers", { params });
    return res.data;
  },

  async get(id: number): Promise<Customer> {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const res = await api.post("/customers", data);
    return res.data;
  },

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
