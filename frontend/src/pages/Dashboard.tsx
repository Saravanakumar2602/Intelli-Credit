import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  Building2,
  FileText,
  Lightbulb,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  FunnelChart,
  Funnel,
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { EmptyState } from "@/components/app/EmptyState";
import { ChartCard } from "@/components/app/ChartCard";
import { SectionCard } from "@/components/app/SectionCard";
import { AnimatedCounter } from "@/components/app/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/services/dashboard.service";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const RISK_BANDS = ["0-25", "25-50", "50-75", "75-100"];

const INSIGHT_TONE = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
  success: "bg-success/10 text-success",
} as const;

const TOOLTIP_STYLE = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

export default function Dashboard() {
  const overview = useQuery({
    queryKey: ["dashboard.overview"],
    queryFn: () => dashboardService.getOverview(),
    retry: false,
  });
  const extras = useQuery({
    queryKey: ["dashboard.extras"],
    queryFn: () => dashboardService.getExtras(),
    retry: false,
  });

  const kpis = overview.data?.kpis;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Executive Overview"
        title="Underwriting Dashboard"
        description="Portfolio health, pipeline velocity and AI-generated insights — in real time."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/reports">
                <TrendingUp className="mr-1.5 h-4 w-4" /> Reports
              </Link>
            </Button>
            <Button size="sm" asChild className="gradient-brand text-white">
              <Link to="/onboarding">
                <Plus className="mr-1.5 h-4 w-4" /> New application
              </Link>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Applications"
          value={
            kpis ? (
              <AnimatedCounter value={kpis.total_applications} />
            ) : null
          }
          icon={FileText}
          loading={overview.isLoading}
          hint="all-time"
          accent="primary"
        />
        <KpiCard
          label="Approval Rate"
          value={
            kpis ? (
              <AnimatedCounter value={kpis.approval_rate} format={(n) => `${n.toFixed(1)}%`} />
            ) : null
          }
          icon={ShieldCheck}
          loading={overview.isLoading}
          accent="success"
        />
        <KpiCard
          label="Avg Risk Score"
          value={kpis ? <AnimatedCounter value={kpis.avg_risk_score} /> : null}
          icon={Sparkles}
          loading={overview.isLoading}
          accent="warning"
        />
        <KpiCard
          label="Portfolio Exposure"
          value={
            kpis ? (
              <AnimatedCounter
                value={kpis.portfolio_exposure}
                format={(n) =>
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(n)
                }
              />
            ) : null
          }
          icon={Wallet}
          loading={overview.isLoading}
          accent="primary"
        />
      </div>

      {/* Row 1: Pipeline + Risk distribution */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Loan Pipeline"
          subtitle="Active applications by stage"
        >
          {overview.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : overview.isError || !overview.data ? (
            <EmptyState icon={FileText} title="No pipeline data" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.data.pipeline}>
                <defs>
                  <linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="stage" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" width={30} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#pipe)"
                  isAnimationActive
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Risk Distribution" subtitle="Across active portfolio">
          {overview.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : overview.isError || !overview.data ? (
            <EmptyState icon={ShieldCheck} title="No risk data" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.data.risk_distribution}
                  dataKey="count"
                  nameKey="band"
                  innerRadius={50}
                  outerRadius={80}
                  strokeWidth={0}
                  isAnimationActive
                  animationDuration={800}
                >
                  {overview.data.risk_distribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }}
                />
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Industries + Recent analyses */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Exposure by Industry"
          subtitle="Applications by sector"
        >
          {overview.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : overview.isError || !overview.data ? (
            <EmptyState icon={Building2} title="No industry data" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.data.industries}>
                <XAxis dataKey="industry" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" width={30} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--color-secondary)", opacity: 0.4 }} />
                <Bar
                  dataKey="count"
                  fill="var(--color-chart-2)"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <SectionCard title="Recent analyses" icon={Sparkles} description="Latest AI runs" bodyClassName="p-0">
          {overview.isLoading ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : overview.isError || !overview.data || overview.data.recent_analyses.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Sparkles}
                title="No analyses yet"
                description="Trigger your first AI run to see it here."
                action={
                  <Button size="sm" asChild>
                    <Link to="/analysis">Run analysis</Link>
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {overview.data.recent_analyses.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/analysis/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{a.company_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-primary">
                      {a.risk_score ?? "—"}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Row 3: Executive Insights + Approval Funnel */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="AI Executive Insights"
          icon={Lightbulb}
          description="Generated summaries of what's changing in your book"
          className="lg:col-span-2"
        >
          {extras.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : extras.isError || !extras.data || extras.data.insights.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="No insights yet"
              description="Once your book has activity, AI-generated highlights appear here."
            />
          ) : (
            <ul className="space-y-2">
              {extras.data.insights.map((i) => (
                <li
                  key={i.id}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/30"
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-md",
                      INSIGHT_TONE[i.severity],
                    )}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{i.title}</div>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {i.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{i.detail}</p>
                    {i.suggested_action && (
                      <div className="mt-1 text-[11px] font-medium text-primary">
                        → {i.suggested_action}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <ChartCard title="Approval Funnel" subtitle="Draft → Decision">
          {extras.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : extras.isError || !extras.data || extras.data.funnel.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No funnel data" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Funnel
                  dataKey="count"
                  data={extras.data.funnel}
                  isAnimationActive
                  animationDuration={800}
                >
                  {extras.data.funnel.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                  <LabelList dataKey="stage" position="right" className="text-xs fill-foreground" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 4: Portfolio Heatmap + Monthly Trend */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Portfolio Risk Heatmap"
          icon={ShieldCheck}
          description="Industry × risk band"
          className="lg:col-span-2"
        >
          {extras.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : extras.isError || !extras.data || extras.data.heatmap.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No heatmap data" />
          ) : (
            <Heatmap cells={extras.data.heatmap} />
          )}
        </SectionCard>

        <ChartCard title="Monthly Trend" subtitle="Volume vs. approval velocity">
          {extras.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : extras.isError || !extras.data || extras.data.monthly.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No trend data" className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={extras.data.monthly}>
                <defs>
                  <linearGradient id="apps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="apprv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" width={30} />
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="applications" stroke="var(--color-chart-2)" fill="url(#apps)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" stroke="var(--color-chart-3)" fill="url(#apprv)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Row 5: Officers + Recent CAMs */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Top Performing Officers"
          icon={Award}
          description="Ranked by approval rate & throughput"
        >
          {extras.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : extras.isError || !extras.data || extras.data.officers.length === 0 ? (
            <EmptyState icon={Users} title="No officer data" />
          ) : (
            <ul className="space-y-2">
              {extras.data.officers.slice(0, 5).map((o, i) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{o.name}</div>
                    <div className="text-[11px] text-muted-foreground">{o.role ?? "Officer"}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold tabular-nums text-primary">
                      {o.approval_rate.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {o.applications} apps · risk {o.avg_risk.toFixed(0)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent CAM reports"
          icon={ScrollText}
          description="Latest credit appraisal memos"
          actions={
            <Link
              to="/cam"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          {extras.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : extras.isError || !extras.data || extras.data.recent_cams.length === 0 ? (
            <EmptyState icon={ScrollText} title="No CAMs yet" />
          ) : (
            <ul className="divide-y divide-border">
              {extras.data.recent_cams.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/cam/${c.id}`}
                    className="flex items-center justify-between py-2 pr-1 transition-colors hover:bg-secondary/40"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{c.company_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        v{c.version} · {new Date(c.generated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function Heatmap({ cells }: { cells: Array<{ industry: string; band: string; count: number }> }) {
  const industries = Array.from(new Set(cells.map((c) => c.industry)));
  const max = Math.max(1, ...cells.map((c) => c.count));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-32 text-left font-medium text-muted-foreground">Industry</th>
            {RISK_BANDS.map((b) => (
              <th key={b} className="text-center font-medium text-muted-foreground">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {industries.map((ind) => (
            <tr key={ind}>
              <td className="truncate pr-2 text-left text-foreground/90">{ind}</td>
              {RISK_BANDS.map((band) => {
                const cell = cells.find((c) => c.industry === ind && c.band === band);
                const v = cell?.count ?? 0;
                const intensity = v / max;
                return (
                  <td key={band} className="p-0">
                    <div
                      className="grid h-8 place-items-center rounded-md text-[11px] font-medium tabular-nums transition-transform hover:scale-[1.03]"
                      style={{
                        background: `color-mix(in oklab, var(--color-primary) ${Math.round(
                          intensity * 65 + 5,
                        )}%, var(--color-card))`,
                        color:
                          intensity > 0.55
                            ? "var(--color-primary-foreground)"
                            : "var(--color-foreground)",
                      }}
                      title={`${ind} · ${band} · ${v}`}
                    >
                      {v || ""}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
