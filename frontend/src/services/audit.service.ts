import { api } from "./api";

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  resource_type: string;
  status: "success" | "failed" | "warning";
  ip: string;
  at: string;
}

export interface AuditQuery {
  q?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export const auditService = {
  async list(q: AuditQuery = {}): Promise<{ items: AuditEntry[]; total: number }> {
    const limit = q.page_size || 50;
    const { data } = await api.get<any[]>(`/monitoring/logs?limit=${limit}`);

    const items: AuditEntry[] = data.map((log: any) => ({
      id: String(log.id),
      actor: log.username || "System",
      action: (log.action ?? "").replace(/_/g, " "),
      resource: log.details || "System Operation",
      resource_type: (log.action ?? "").includes("DOCUMENT") ? "document" : "application",
      status: (log.action ?? "").includes("FAIL") || (log.action ?? "").includes("ERROR")
        ? "failed"
        : (log.action ?? "").includes("LOCK")
        ? "warning"
        : "success",
      ip: log.ip_address || "—",
      at: log.timestamp || new Date().toISOString(),
    }));

    return { items, total: items.length };
  },
};
