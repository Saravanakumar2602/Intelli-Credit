import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toErrorMessage } from "@/services/api";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = "Couldn't load data" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{toErrorMessage(error)}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
