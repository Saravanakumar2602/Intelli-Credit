import { api } from "./api";
import { uploadService } from "./entities.service";
import type { UploadedDocument } from "@/types";

export interface DocumentPreviewMeta {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  page_count?: number;
  uploaded_at: string;
  uploaded_by?: string;
  preview_url?: string;
  download_url?: string;
}

export const documentsService = {
  async list(applicationId?: string): Promise<UploadedDocument[]> {
    return uploadService.list(applicationId);
  },

  async history(page = 1): Promise<UploadedDocument[]> {
    const { data } = await api.get(`/documents/?page=${page}&limit=20`);
    return (data.items || []) as UploadedDocument[];
  },

  async get(id: string): Promise<DocumentPreviewMeta> {
    const { data } = await api.get<DocumentPreviewMeta>(`/documents/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async replace(id: string, file: File): Promise<UploadedDocument> {
    try {
      await api.delete(`/documents/${id}`);
    } catch {
      // Ignore delete failure for replacement safety
    }
    return uploadService.upload(file);
  },

  async retry(id: string): Promise<UploadedDocument> {
    const { data } = await api.post<UploadedDocument>(`/documents/${id}/retry`);
    return data;
  },
};
