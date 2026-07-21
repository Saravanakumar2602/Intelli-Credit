import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { AlertOctagon, Lock, RefreshCw, ShieldOff, WifiOff, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorKind = "500" | "401" | "403" | "offline" | "api";

const registry: Record<
  ErrorKind,
  { icon: LucideIcon; code: string; title: string; description: string }
> = {
  "500": {
    icon: ServerCrash,
    code: "500",
    title: "Something broke on our end",
    description:
      "The server hit an unexpected condition. Our team has been notified — try refreshing or come back in a moment.",
  },
  "401": {
    icon: Lock,
    code: "401",
    title: "You need to sign in",
    description: "Your session expired. Sign back in to continue where you left off.",
  },
  "403": {
    icon: ShieldOff,
    code: "403",
    title: "You don't have access",
    description:
      "This area is restricted. Ask your workspace administrator to grant you the required role.",
  },
  offline: {
    icon: WifiOff,
    code: "OFFLINE",
    title: "You're offline",
    description:
      "Intelli-Credit needs an internet connection for most workflows. We'll reconnect automatically.",
  },
  api: {
    icon: AlertOctagon,
    code: "API",
    title: "Service temporarily unavailable",
    description:
      "The underwriting API is not responding. This is usually resolved within a few minutes.",
  },
};

interface Props {
  kind?: ErrorKind;
  onRetry?: () => void;
  homeHref?: string;
}

export function ErrorPage({ kind = "500", onRetry, homeHref = "/dashboard" }: Props) {
  const meta = registry[kind];
  const Icon = meta.icon;
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-xl">
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
          Error · {meta.code}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {meta.description}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}
          <Button asChild>
            <Link to={homeHref}>Back to dashboard</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default ErrorPage;
