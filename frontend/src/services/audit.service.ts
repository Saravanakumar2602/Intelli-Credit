import { api } from "./api";
import type { AuditEntry, AuditQuery } from "./audit.service";

export const auditService = {
  async list(q: AuditQuery = {}): Promise<{ items: AuditEntry[]; total: number }> {
    const limit = q.page_size || 50;
    const { data } = await api.get<any[]>(`/monitoring/logs?limit=${limit}`);
    
    const items: AuditEntry[] = data.map((log: any) => ({
      id: String(log.id),
      actor: log.username || "System",
      action: log.action.replace(/_/g, " ").title || log.action,
      resource: log.details || "System Operation",
      resource_type: log.action.includes("DOCUMENT") ? "document" : "application",
      status: "success" as const,
      ip: log.ip_address || "127.0.0.1",
      at: log.timestamp || new Date().toISOString(),
    }));

    return {
      items,
      total: items.length,
    };
  },
};
