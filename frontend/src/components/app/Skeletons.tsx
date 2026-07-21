import { cn } from "@/lib/utils";

/**
 * Shimmer surface used by the skeleton primitives below. The shimmer relies on
 * a keyframed background gradient so it works even when framer-motion is
 * suspended by reduced-motion preferences.
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-secondary/60",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className,
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-3",
        className,
      )}
    >
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-8 w-32" />
      <Shimmer className="h-3 w-40" />
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-3">
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 p-3">
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer key={c} className={cn("h-3", c === 0 ? "w-40" : "flex-1")} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 space-y-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
      <div className="flex h-56 items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-1"
            // deterministic pseudo-random heights, no runtime randomness
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className="space-y-4">
      <SkeletonKpiGrid />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}
