import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Download,
  Factory,
  Printer,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Activity,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { reportsService } from "@/services/reports.service";

const CHART_COLORS = ["#7C5CFF", "#22D3EE", "#F59E0B", "#F43F5E", "#10B981", "#6366F1"];

export default function Reports() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reports.snapshot"],
    queryFn: () => reportsService.snapshot(),
    retry: false,
  });

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Reports & Analytics"
        description="Portfolio-level analytics, trends and approval performance."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
            <Button size="sm">
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={BarChart3} title="No data yet" />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SectionCard title="Approval trends" icon={TrendingUp} description="Approved vs declined by month">
            {data.monthly.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No monthly data" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly}>
                    <defs>
                      <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="approved" stroke="#7C5CFF" fill="url(#ga)" />
                    <Area type="monotone" dataKey="declined" stroke="#F43F5E" fill="#F43F5E22" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Risk distribution" icon={ShieldCheck}>
            {data.risk_distribution.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No risk data" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.risk_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="band" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="#7C5CFF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Industry analysis" icon={Factory}>
            {data.industry.length === 0 ? (
              <EmptyState icon={Factory} title="No industry data" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={data.industry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis type="category" dataKey="industry" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="applications" fill="#22D3EE" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Portfolio exposure" icon={Wallet}>
            {data.portfolio_exposure.length === 0 ? (
              <EmptyState icon={Wallet} title="No exposure data" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.portfolio_exposure}
                      dataKey="value"
                      nameKey="segment"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {data.portfolio_exposure.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Financial ratios" icon={Activity} className="lg:col-span-2">
            {data.ratios.length === 0 ? (
              <EmptyState icon={Activity} title="No ratios computed" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.ratios.map((r) => (
                  <div key={r.key} className="rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {r.label}
                    </div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{r.value}</div>
                    {r.benchmark != null && (
                      <div className="text-[11px] text-muted-foreground">Benchmark: {r.benchmark}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
