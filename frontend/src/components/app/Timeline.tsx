import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: ReactNode;
  timestamp?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
  meta?: ReactNode;
}

const toneMap: Record<NonNullable<TimelineItem["tone"]>, string> = {
  default: "bg-secondary text-muted-foreground ring-border",
  primary: "bg-primary/15 text-primary ring-primary/30",
  success: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
};

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-5 pl-6", className)}>
      <span className="absolute left-[11px] top-1 bottom-1 w-px bg-border" aria-hidden />
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <li key={it.id} className="relative">
            <span
              className={cn(
                "absolute -left-6 top-0.5 grid h-6 w-6 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-background",
                toneMap[it.tone ?? "default"],
              )}
            >
              {Icon ? <Icon className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-medium text-foreground">{it.title}</div>
              {it.timestamp && (
                <div className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  {it.timestamp}
                </div>
              )}
            </div>
            {it.description && (
              <div className="mt-0.5 text-xs text-muted-foreground">{it.description}</div>
            )}
            {it.meta && <div className="mt-2">{it.meta}</div>}
          </li>
        );
      })}
    </ol>
  );
}
