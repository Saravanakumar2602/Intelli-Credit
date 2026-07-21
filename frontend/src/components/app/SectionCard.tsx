import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card transition-colors hover:border-primary/20",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border/70 px-5 py-3.5">
        {Icon && (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="truncate text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
      </header>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
