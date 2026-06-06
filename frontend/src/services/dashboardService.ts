import api from "./api";
import { DashboardMetrics } from "@/src/types";

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await api.get("/dashboard/metrics");
    return res.data;
  },
};
