import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SuccessState({ title, description, action, className }: SuccessStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-success/30 bg-success/5 px-6 py-14 text-center",
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"
      >
        <CheckCircle2 className="h-7 w-7" />
      </motion.div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
