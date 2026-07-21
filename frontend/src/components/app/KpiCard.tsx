import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  label: string;
  value?: ReactNode;
  delta?: number | null;
  icon?: LucideIcon;
  loading?: boolean;
  hint?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}

const accentMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  loading,
  hint,
  accent = "primary",
}: KpiCardProps) {
  const showDelta = typeof delta === "number";
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {Icon && (
          <div className={cn("grid h-8 w-8 place-items-center rounded-md", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 min-h-9">
        {loading || value === undefined || value === null ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        {showDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
              positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta ?? 0).toFixed(1)}%
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
