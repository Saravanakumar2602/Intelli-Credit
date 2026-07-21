import { api } from "./api";
import type { ReportsSnapshot } from "./reports.service";

export const reportsService = {
  async snapshot(): Promise<ReportsSnapshot> {
    const { data } = await api.get<ReportsSnapshot>("/reports/snapshot");
    return data;
  },

  async export(format: "csv" | "xlsx" | "pdf"): Promise<Blob> {
    const { data } = await api.get<Blob>(`/reports/export?format=${format}`, {
      responseType: "blob",
    });
    return data;
  },
};
