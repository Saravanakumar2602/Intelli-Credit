import { useState, type ReactNode } from "react";
import { Download, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  onExport?: () => void;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  onExport,
}: Props) {
  const [full, setFull] = useState(false);

  const body = (
    <div className={cn("h-64", bodyClassName, full && "h-[70vh]")}>{children}</div>
  );

  const inner = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-foreground/90">{subtitle}</div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          {onExport && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onExport}
              aria-label="Export chart"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setFull((v) => !v)}
            aria-label={full ? "Exit fullscreen" : "Fullscreen"}
          >
            {full ? <X className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      {body}
    </>
  );

  if (full) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-6xl rounded-xl border border-border bg-card p-6 shadow-xl">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {inner}
    </div>
  );
}
