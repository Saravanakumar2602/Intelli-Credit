import { api } from "./api";
import type { CAMDocument } from "@/types";

export const camService = {
  async get(id: string): Promise<CAMDocument> {
    const { data } = await api.get<CAMDocument>(`/cam/${id}`);
    return data;
  },

  async download(id: string): Promise<Blob> {
    const { data } = await api.get<Blob>(`/cam/${id}/download`, {
      responseType: "blob",
    });
    return data;
  },
};
