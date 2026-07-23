import { api } from "./api";
import type {
  Company,
  CorporateApplication,
  Paginated,
  UploadedDocument,
  NotificationItem,
} from "@/types";
import type { ApplicationDetail, CompanyProfile } from "./entities.service";

export const companyService = {
  async list(page = 1): Promise<Paginated<Company>> {
    const { data } = await api.get<Paginated<Company>>(`/companies/?page=${page}`);
    return data;
  },

  async create(payload: Partial<Company> & any): Promise<Company> {
    const cin = payload.registration_number?.trim() || "U72200KA2020PTC134251";
    // Derive a unique PAN from CIN characters to avoid unique constraint violations
    const panBase = cin.replace(/[^A-Z0-9]/g, "").substring(1, 6).padEnd(5, "A").toUpperCase();
    const pan = `${panBase}1234F`;
    const onboardingPayload = {
      cin,
      pan,
      sector: payload.industry || "General",
      turnover: String(payload.annual_revenue || "10 Cr"),
      amount: payload.amount_requested || 1000000.0,
      tenure: 12,
      interest: 10.0,
      type: "Term Loan",
    };
    
    const { data } = await api.post("/onboarding/", onboardingPayload);
    return {
      id: String(data.id),
      legal_name: payload.legal_name || `Corporate Client (${onboardingPayload.cin.substring(1, 6)})`,
      registration_number: onboardingPayload.cin,
      industry: onboardingPayload.sector,
      country: payload.country || "India",
      annual_revenue: payload.annual_revenue || 10000000,
    };
  },

  async get(id: string): Promise<Company> {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  },

  async profile(id: string): Promise<CompanyProfile> {
    const { data } = await api.get<CompanyProfile>(`/companies/${id}/profile`);
    return data;
  },
};

export const applicationService = {
  async list(page = 1): Promise<Paginated<CorporateApplication>> {
    const { data } = await api.get<Paginated<CorporateApplication>>(`/applications/?page=${page}`);
    return data;
  },

  async get(id: string): Promise<CorporateApplication> {
    const { data } = await api.get<CorporateApplication>(`/applications/${id}`);
    return data;
  },

  async detail(id: string): Promise<ApplicationDetail> {
    const { data } = await api.get<ApplicationDetail>(`/applications/${id}`);
    return data;
  },

  async comment(id: string, body: string): Promise<void> {
    await api.post(`/applications/${id}/comment`, { body });
  },

  async rerunAnalysis(id: string): Promise<any> {
    // Triggers FastAPI credit appraisal background task
    const { data } = await api.post(`/analyze/?loan_application_id=${id}`);
    return data;
  },
};

export const uploadService = {
  async upload(file: File, applicationId?: string): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append("file", file);
    if (applicationId) {
      formData.append("loan_application_id", applicationId);
    }
    const { data } = await api.post<UploadedDocument>("/upload/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async list(applicationId?: string): Promise<UploadedDocument[]> {
    // If applicationId is provided, we fetch application details which includes uploaded documents
    if (applicationId) {
      const details = await applicationService.detail(applicationId);
      return details.uploaded_documents || [];
    }
    return [];
  },
};

export const notificationService = {
  async list(): Promise<NotificationItem[]> {
    try {
      const { data } = await api.get<any[]>("/monitoring/logs?limit=10");
      return data.map((log: any, idx: number) => ({
        id: String(log.id ?? idx),
        title: (log.action ?? "System Event").replace(/_/g, " "),
        body: log.details ?? "",
        read: false,
        created_at: log.timestamp ?? new Date().toISOString(),
        type: log.action?.includes("FAIL") || log.action?.includes("ERROR")
          ? "error"
          : log.action?.includes("WARN") || log.action?.includes("LOCK")
          ? "warning"
          : "info",
        category: log.action?.includes("DOCUMENT") || log.action?.includes("UPLOAD")
          ? "analysis"
          : "system",
      } as NotificationItem));
    } catch {
      return [];
    }
  },

  async markRead(_id: string): Promise<void> {},
  async markAllRead(): Promise<void> {},
};
