import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldAlert, Search as SearchIcon, XCircle } from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/app/DataTable";
import { auditService, type AuditEntry } from "@/services/audit.service";

const STATUS_META = {
  success: { icon: CheckCircle2, tone: "text-success bg-success/10", label: "Success" },
  failed: { icon: XCircle, tone: "text-destructive bg-destructive/10", label: "Failed" },
  warning: { icon: ShieldAlert, tone: "text-warning bg-warning/10", label: "Warning" },
} as const;

export default function AuditLog() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["audit.list", q, status],
    queryFn: () => auditService.list({ q, status }),
    retry: false,
  });

  const columns: Column<AuditEntry>[] = [
    {
      key: "at",
      header: "Timestamp",
      cell: (r) => new Date(r.at).toLocaleString(),
    },
    { key: "actor", header: "User" },
    { key: "action", header: "Action" },
    {
      key: "resource",
      header: "Resource",
      cell: (r) => (
        <span>
          <span className="text-muted-foreground">{r.resource_type}</span>{" "}
          <span className="font-medium">{r.resource}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const m = STATUS_META[r.status];
        const Icon = m.icon;
        return (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${m.tone}`}>
            <Icon className="h-3 w-3" /> {m.label}
          </span>
        );
      },
    },
    { key: "ip", header: "IP" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Every mutation across the platform, with actor, target and outcome."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users, resources, actions…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["", "success", "failed", "warning"] as const).map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatus(s)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                status === s
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>
        <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">
          {data ? `${data.total} entries` : "—"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No audit entries"
          description="Once the backend is connected, all user actions will stream into this log."
        />
      ) : (
        <DataTable<AuditEntry>
          columns={columns}
          rows={data.items}
          getRowId={(r) => r.id}
          exportName="audit-log"
        />
      )}
    </div>
  );
}
