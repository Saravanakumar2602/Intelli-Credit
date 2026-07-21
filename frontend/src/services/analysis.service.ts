import { api } from "./api";
import type { AnalysisResult, Paginated, FinancialRatio, SwotItem } from "@/types";

export interface HistoryQuery {
  q?: string;
  status?: string;
  officer?: string;
  from?: string;
  to?: string;
  sort?: "date_desc" | "date_asc" | "risk_desc" | "risk_asc";
  page?: number;
  page_size?: number;
}

export const analysisService = {
  async list(page = 1, pageSize = 20): Promise<Paginated<AnalysisResult>> {
    const { data } = await api.get(`/search/?page=${page}&limit=${pageSize}`);
    const results = data.results || [];
    
    const items = results.map((item: any) => ({
      id: String(item.id),
      application_id: String(item.id),
      company_name: item.company_name,
      created_at: item.created_at || new Date().toISOString(),
      status: item.status === "APPROVED" || item.status === "REJECTED" ? "completed" : "running",
      risk_score: 42.0,
    }));

    return {
      items,
      total: data.total || items.length,
      page,
      page_size: pageSize,
    };
  },

  async history(query: HistoryQuery = {}): Promise<Paginated<AnalysisResult>> {
    return this.list(query.page, query.page_size);
  },

  async get(id: string): Promise<AnalysisResult> {
    const { data } = await api.get(`/analyze/results/${id}`);
    
    // Dynamically map backend ratios dict into frontend array
    const ratios: FinancialRatio[] = [];
    if (data.ratios) {
      Object.entries(data.ratios).forEach(([key, val]) => {
        ratios.push({
          key,
          label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value: Number(val),
          unit: key.includes("ratio") || key.includes("coverage") || key.includes("dscr") ? "x" : "",
        });
      });
    }

    // Dynamically map backend SWOT structure (strengths, weaknesses, etc.) into SwotItem[]
    const swot: SwotItem[] = [];
    if (data.swot) {
      Object.entries(data.swot).forEach(([category, list]) => {
        if (Array.isArray(list)) {
          list.forEach((item: any) => {
            swot.push({
              category: category.toLowerCase().slice(0, -1) as any, // strip plural 's'
              text: item.point || item.detail || item.text || String(item),
            });
          });
        }
      });
    }

    // Map recommendation conditions to recommendations list
    const recommendations = (data.recommendation?.conditions || []).map((cond: string, idx: number) => ({
      id: `rec-${idx}`,
      title: "Appraisal Condition",
      detail: cond,
      severity: "warning" as const,
    }));

    // Map news headlines
    const news = (data.news?.findings || []).map((finding: string, idx: number) => ({
      id: `news-${idx}`,
      title: finding,
      source: "Market Intelligence Cache",
      url: "#",
      published_at: new Date().toISOString(),
      sentiment: (data.news?.sentiment || 0.0) >= 0 ? ("positive" as const) : ("negative" as const),
    }));

    return {
      id,
      application_id: id,
      company_name: data.swot?.company || "Onboarded Borrower",
      created_at: new Date().toISOString(),
      status: "completed",
      risk_score: data.risk?.score || 42,
      confidence: data.recommendation?.confidence || 85,
      executive_summary: data.recommendation?.recommendation_summary || data.risk_summary,
      ratios,
      swot,
      news,
      recommendations,
    };
  },

  async start(applicationId: string): Promise<AnalysisResult> {
    const { data } = await api.post(`/analyze/?loan_application_id=${applicationId}`);
    return {
      id: data.job_id || "job-1",
      application_id: applicationId,
      company_name: "Borrower",
      created_at: new Date().toISOString(),
      status: "pending",
    };
  },
};
