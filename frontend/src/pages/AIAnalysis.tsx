import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  ChevronRight,
  Newspaper,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { analysisService } from "@/services/analysis.service";

export default function AIAnalysis() {
  const { id } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analysis.get", id],
    queryFn: () => (id ? analysisService.get(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
    retry: false,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Analysis"
        description={
          id
            ? `Deep-dive credit intelligence for analysis ${id}`
            : "Trigger a new analysis or open an existing one from the pipeline."
        }
        actions={
          <Button size="sm" className="gradient-brand text-white">
            <Sparkles className="mr-1.5 h-4 w-4" /> Run new analysis
          </Button>
        }
      />

      {!id ? (
        <EmptyState
          icon={Sparkles}
          title="No analysis selected"
          description="Choose an application from the pipeline to view its AI-generated insights."
        />
      ) : isLoading ? (
        <AnalysisSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={Sparkles} title="No data" />
      ) : (
        <AnalysisContent
          score={data.risk_score ?? 0}
          confidence={data.confidence ?? 0}
          summary={data.executive_summary ?? ""}
          ratios={data.ratios ?? []}
          swot={data.swot ?? []}
          news={data.news ?? []}
          recommendations={data.recommendations ?? []}
        />
      )}
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-64" />
      <Skeleton className="h-64 lg:col-span-2" />
      <Skeleton className="h-96 lg:col-span-3" />
    </div>
  );
}

function AnalysisContent({
  score,
  confidence,
  summary,
  ratios,
  swot,
  news,
  recommendations,
}: {
  score: number;
  confidence: number;
  summary: string;
  ratios: NonNullable<import("@/types").AnalysisResult["ratios"]>;
  swot: NonNullable<import("@/types").AnalysisResult["swot"]>;
  news: NonNullable<import("@/types").AnalysisResult["news"]>;
  recommendations: NonNullable<import("@/types").AnalysisResult["recommendations"]>;
}) {
  const band = useMemo(() => {
    if (score >= 75) return { label: "Low risk", tone: "text-success", bg: "bg-success/15" };
    if (score >= 50) return { label: "Moderate risk", tone: "text-warning", bg: "bg-warning/15" };
    return { label: "High risk", tone: "text-destructive", bg: "bg-destructive/15" };
  }, [score]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Risk gauge */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Risk Score
        </div>
        <RiskGauge value={score} />
        <div className="mt-4 flex items-center justify-between">
          <Badge className={`${band.bg} ${band.tone}`}>{band.label}</Badge>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Confidence
            </div>
            <div className="text-sm font-semibold tabular-nums">{confidence}%</div>
          </div>
        </div>
      </div>

      {/* Executive summary */}
      <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Executive Summary
          </div>
        </div>
        {summary ? (
          <p className="text-sm leading-relaxed text-foreground/85">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No summary available yet.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-border bg-card lg:col-span-3">
        <Tabs defaultValue="ratios" className="w-full">
          <div className="border-b border-border px-4">
            <TabsList className="h-11 bg-transparent p-0">
              <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
              <TabsTrigger value="swot">SWOT</TabsTrigger>
              <TabsTrigger value="news">Industry Intelligence</TabsTrigger>
              <TabsTrigger value="reco">Recommendations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ratios" className="p-6">
            {ratios.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No ratios computed" />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ratios.map((r) => (
                  <div
                    key={r.key}
                    className="rounded-lg border border-border bg-secondary/30 p-4"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {r.label}
                    </div>
                    <div className="mt-1 text-xl font-semibold tabular-nums">
                      {r.value}
                      {r.unit ?? ""}
                    </div>
                    {typeof r.benchmark === "number" && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        Benchmark: {r.benchmark}
                        {r.unit ?? ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="swot" className="p-6">
            {swot.length === 0 ? (
              <EmptyState icon={Sparkles} title="No SWOT generated" />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((cat) => (
                  <div
                    key={cat}
                    className="rounded-lg border border-border bg-secondary/30 p-4"
                  >
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat}
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      {swot.filter((s) => s.category === cat).map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{s.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="p-6">
            {news.length === 0 ? (
              <EmptyState icon={Newspaper} title="No news signals" />
            ) : (
              <ul className="space-y-2">
                {news.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <div className="min-w-0">
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 text-sm font-medium hover:underline"
                      >
                        {n.title}
                      </a>
                      <div className="text-[11px] text-muted-foreground">
                        {n.source} · {new Date(n.published_at).toLocaleDateString()}
                      </div>
                    </div>
                    {n.sentiment && (
                      <Badge
                        className={
                          n.sentiment === "positive"
                            ? "bg-success/15 text-success"
                            : n.sentiment === "negative"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-secondary text-muted-foreground"
                        }
                      >
                        {n.sentiment}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="reco" className="p-6">
            {recommendations.length === 0 ? (
              <EmptyState icon={BadgeCheck} title="No recommendations yet" />
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {recommendations.map((r) => (
                  <AccordionItem key={r.id} value={r.id}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            r.severity === "critical"
                              ? "bg-destructive/15 text-destructive"
                              : r.severity === "warning"
                                ? "bg-warning/15 text-warning"
                                : "bg-primary/15 text-primary"
                          }
                        >
                          {r.severity}
                        </Badge>
                        {r.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-foreground/80">
                      {r.detail}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RiskGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const dash = 2 * Math.PI * 52;
  const offset = dash - (dash * pct) / 100;
  return (
    <div className="relative mx-auto grid h-40 w-40 place-items-center">
      <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="52"
          stroke="var(--color-border)"
          strokeWidth="10"
          fill="none"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          stroke="url(#gauge-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: dash }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeDasharray={dash}
        />
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" />
            <stop offset="100%" stopColor="var(--color-chart-5)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold tabular-nums">{pct}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">score</div>
      </div>
    </div>
  );
}
