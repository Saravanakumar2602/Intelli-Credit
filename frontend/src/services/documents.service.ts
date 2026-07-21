import { api } from "./api";
import { uploadService } from "./entities.service";
import type { UploadedDocument } from "@/types";
import type { DocumentPreviewMeta } from "./documents.service";

export const documentsService = {
  async list(applicationId?: string): Promise<UploadedDocument[]> {
    return uploadService.list(applicationId);
  },

  async history(page = 1): Promise<UploadedDocument[]> {
    // Queries search endpoint to find recently onboarded files
    const { data } = await api.get(`/search/?page=${page}&limit=10`);
    const results = data.results || [];
    
    // Format search hits into UploadedDocument type
    return results.map((item: any) => ({
      id: String(item.id),
      application_id: String(item.id),
      file_name: `${item.company_name.replace(/\s+/g, "_")}_Financials.pdf`,
      file_size: 1024 * 1024 * 5, // 5MB mock size
      mime_type: "application/pdf",
      uploaded_at: item.created_at || new Date().toISOString(),
      status: "ready",
    }));
  },

  async get(id: string): Promise<DocumentPreviewMeta> {
    const { data } = await api.get<DocumentPreviewMeta>(`/documents/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async replace(id: string, file: File): Promise<UploadedDocument> {
    // Delete the previous document, then upload the replacement file
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
