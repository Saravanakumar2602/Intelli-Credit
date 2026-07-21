import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  score: number; // 0-100
  size?: number;
  label?: string;
  className?: string;
}

export function RiskGauge({ score, size = 180, label = "Risk Score", className }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return setDisplay(clamped);
    const start = performance.now();
    const from = display;
    const dur = 1100;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (clamped - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped]);

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c * 0.75; // 270° arc
  const rotation = -225; // start at bottom-left

  const tone =
    clamped >= 75
      ? "text-success"
      : clamped >= 50
        ? "text-primary"
        : clamped >= 25
          ? "text-warning"
          : "text-destructive";

  const band =
    clamped >= 75 ? "Low risk" : clamped >= 50 ? "Moderate" : clamped >= 25 ? "Elevated" : "High";

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ transform: `rotate(${rotation}deg)` }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-border/60"
          strokeWidth={10}
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className={cn("transition-colors", tone)}
          strokeWidth={10}
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeDashoffset={offset - c * 0.25}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("text-4xl font-semibold tabular-nums tracking-tight", tone)}>
            {Math.round(display)}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{band}</div>
        </div>
      </div>
    </div>
  );
}
