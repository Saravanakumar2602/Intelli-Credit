import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  FileSearch,
  FileText,
  Inbox,
  Sparkles,
  Upload as UploadIcon,
  WifiOff,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type EmptyVariant =
  | "generic"
  | "reports"
  | "companies"
  | "uploads"
  | "analysis"
  | "notifications"
  | "search"
  | "offline";

const variantMap: Record<
  EmptyVariant,
  { icon: LucideIcon; tone: string }
> = {
  generic: { icon: Inbox, tone: "text-muted-foreground bg-secondary" },
  reports: { icon: BarChart3, tone: "text-primary bg-primary/10" },
  companies: { icon: Building2, tone: "text-primary bg-primary/10" },
  uploads: { icon: UploadIcon, tone: "text-primary bg-primary/10" },
  analysis: { icon: Sparkles, tone: "text-primary bg-primary/10" },
  notifications: { icon: Bell, tone: "text-warning bg-warning/10" },
  search: { icon: FileSearch, tone: "text-muted-foreground bg-secondary" },
  offline: { icon: WifiOff, tone: "text-warning bg-warning/10" },
};

interface EmptyStateProps {
  icon?: LucideIcon;
  variant?: EmptyVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Enterprise empty state. Pass a `variant` to use one of the predefined
 * icon + tone presets, or a `icon` override for one-offs. Both fall back
 * gracefully.
 */
export function EmptyState({
  icon,
  variant = "generic",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const preset = variantMap[variant] ?? variantMap.generic;
  const Icon = icon ?? preset.icon ?? FileText;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div
        className={cn(
          "relative mb-4 grid h-14 w-14 place-items-center rounded-2xl shadow-sm ring-1 ring-inset ring-border",
          preset.tone,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="relative text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="relative mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}
