/**
 * Placeholder domain types.
 * These mirror the *shape* the UI expects. Replace or narrow them
 * from the OpenAPI schema when backend integration begins.
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "credit_officer" | "risk_analyst" | "loan_manager" | "relationship_manager" | "admin";
  avatar_url?: string | null;
}

export interface AuthTokens {
  access_token: string;
  token_type?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Company {
  id: string;
  legal_name: string;
  registration_number?: string;
  industry?: string;
  country?: string;
  incorporation_date?: string;
  employees?: number;
  annual_revenue?: number;
  website?: string;
}

export interface CorporateApplication {
  id: string;
  company_id: string;
  company_name: string;
  amount_requested: number;
  currency: string;
  purpose?: string;
  status: "draft" | "in_review" | "analyzing" | "approved" | "declined";
  submitted_at?: string;
  officer?: string;
  risk_score?: number;
}

export interface UploadedDocument {
  id: string;
  application_id?: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  status: "queued" | "processing" | "ready" | "failed";
}

export interface FinancialRatio {
  key: string;
  label: string;
  value: number;
  unit?: "%" | "x" | "days" | "";
  benchmark?: number;
  trend?: "up" | "down" | "flat";
}

export interface SwotItem {
  category: "strengths" | "weaknesses" | "opportunities" | "threats";
  text: string;
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export interface AnalysisResult {
  id: string;
  application_id: string;
  company_name: string;
  created_at: string;
  status: "pending" | "running" | "completed" | "failed";
  progress?: number;
  risk_score?: number;
  confidence?: number;
  executive_summary?: string;
  ratios?: FinancialRatio[];
  swot?: SwotItem[];
  news?: NewsItem[];
  recommendations?: Recommendation[];
}

export interface DashboardKPIs {
  total_applications: number;
  in_review: number;
  approved: number;
  declined: number;
  avg_risk_score: number;
  approval_rate: number;
  portfolio_exposure: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  pipeline: Array<{ stage: string; count: number }>;
  risk_distribution: Array<{ band: string; count: number }>;
  industries: Array<{ industry: string; count: number }>;
  recent_analyses: AnalysisResult[];
  activity: Array<{ id: string; actor: string; action: string; at: string }>;
}

export interface DashboardExtras {
  heatmap: Array<{ industry: string; band: string; count: number; exposure: number }>;
  funnel: Array<{ stage: string; count: number }>;
  officers: Array<{
    id: string;
    name: string;
    role: string;
    avatar_url: string | null;
    applications: number;
    approval_rate: number;
    avg_risk: number;
  }>;
  monthly: Array<{ month: string; applications: number; approved: number; declined: number; avg_risk: number }>;
  insights: Array<{ id: string; title: string; detail: string; severity: string; suggested_action?: string }>;
  recent_cams: CAMDocument[];
  recent_analyses: AnalysisResult[];
}

export interface CAMDocument {
  id: string;
  application_id: string;
  company_name: string;
  generated_at: string;
  version: number;
  sections: Array<{ key: string; title: string; content: string }>;
  decision?: {
    outcome: "approve" | "conditional" | "decline";
    limit?: number;
    conditions?: string[];
    decided_by?: string;
    decided_at?: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
  type: "info" | "success" | "warning" | "error";
  category?: "analysis" | "reports" | "system" | "mention";
}

export interface DashboardExtras {
  heatmap: Array<{ industry: string; band: string; count: number; exposure?: number }>;
  funnel: Array<{ stage: string; count: number }>;
  officers: Array<{ id: string; name: string; role?: string; avatar_url?: string | null; applications: number; approval_rate: number; avg_risk: number }>;
  monthly: Array<{ month: string; applications: number; approved: number; declined: number; avg_risk: number }>;
  insights: Array<{ id: string; title: string; detail: string; severity: "info" | "warning" | "critical" | "success"; suggested_action?: string }>;
  recent_cams: CAMDocument[];
  recent_analyses: AnalysisResult[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
