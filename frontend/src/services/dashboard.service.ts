import { api } from "./api";
import type { DashboardData, DashboardExtras } from "@/types";

export const dashboardService = {
  async getOverview(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>("/dashboard/overview");
    return data;
  },
  async getExtras(): Promise<DashboardExtras> {
    const { data } = await api.get<DashboardExtras>("/dashboard/extras");
    return data;
  },
};
