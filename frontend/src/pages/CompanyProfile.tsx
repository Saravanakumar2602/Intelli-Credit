import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Sparkles,
  ShieldCheck,
  ScrollText,
  FileText,
  Users,
  MapPin,
  Landmark,
  Activity,
  HeartPulse,
  ExternalLink,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { SectionCard } from "@/components/app/SectionCard";
import { Timeline } from "@/components/app/Timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { companyService, type CompanyProfile as CompanyProfileT } from "@/services/entities.service";
import { cn } from "@/lib/utils";

export default function CompanyProfile() {
  const { id } = useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["company.profile", id],
    queryFn: () => (id ? companyService.profile(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
    retry: false,
  });

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Entity"
        title={data?.legal_name ?? "Company Profile"}
        description={id ? `Company · ${id}` : "Select a company to view its profile."}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/applications">
                <FileText className="mr-1.5 h-4 w-4" /> Applications
              </Link>
            </Button>
            <Button size="sm" className="gradient-brand text-white" asChild>
              <Link to="/analysis">
                <Sparkles className="mr-1.5 h-4 w-4" /> Run analysis
              </Link>
            </Button>
          </>
        }
      />

      {!id ? (
        <EmptyState icon={Building2} title="No company selected" />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={Building2} title="Profile unavailable" />
      ) : (
        <ProfileBody data={data} />
      )}
    </div>
  );
}

function ProfileBody({ data }: { data: CompanyProfileT }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Overview */}
      <SectionCard title="Company overview" icon={Building2} className="lg:col-span-2">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/20 to-secondary text-primary">
            {data.logo_url ? (
              <img src={data.logo_url} alt={data.legal_name} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold tracking-tight">{data.legal_name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {[data.industry, data.sector, data.country].filter(Boolean).join(" · ") || "—"}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Meta label="CIN" value={data.cin} />
              <Meta label="PAN" value={data.pan} />
              <Meta label="Reg No." value={data.registration_number} />
              <Meta label="Industry" value={data.industry} />
              <Meta label="Sector" value={data.sector} />
              <Meta label="Incorporated" value={data.incorporation_date} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Health */}
      <SectionCard title="Company health" icon={HeartPulse}>
        {typeof data.health_score === "number" ? (
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-semibold tabular-nums">{data.health_score}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full gradient-brand"
                style={{ width: `${Math.min(100, Math.max(0, data.health_score))}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {(data.health_signals ?? []).map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      s.status === "good" && "bg-success",
                      s.status === "warning" && "bg-warning",
                      s.status === "risk" && "bg-destructive",
                    )}
                  />
                  <span className="font-medium">{s.label}</span>
                  {s.detail && <span className="text-muted-foreground">— {s.detail}</span>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState icon={HeartPulse} title="Health data pending" />
        )}
      </SectionCard>

      {/* Registered address */}
      <SectionCard title="Registered address" icon={MapPin}>
        <p className="text-sm text-foreground/85">
          {data.registered_address ?? <span className="text-muted-foreground">Not provided.</span>}
        </p>
      </SectionCard>

      {/* Directors */}
      <SectionCard title="Directors" icon={Users} className="lg:col-span-2">
        {(data.directors ?? []).length === 0 ? (
          <EmptyState icon={Users} title="No directors on file" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.directors!.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {d.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {d.designation}
                    {d.din ? ` · DIN ${d.din}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Financial summary */}
      <SectionCard title="Financial summary" icon={Landmark} className="lg:col-span-2">
        {(data.financial_summary ?? []).length === 0 ? (
          <EmptyState icon={Landmark} title="No financials yet" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.financial_summary!.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
                <div className="mt-1 text-lg font-semibold tabular-nums">
                  {m.value.toLocaleString()}
                  {m.unit && <span className="ml-1 text-xs text-muted-foreground">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Loan info */}
      <SectionCard title="Loan information" icon={FileText}>
        {(data.loan_information ?? []).length === 0 ? (
          <EmptyState icon={FileText} title="No active facilities" />
        ) : (
          <dl className="space-y-2">
            {data.loan_information!.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">{r.label}</dt>
                <dd className="font-medium tabular-nums">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Uploaded documents" icon={FileText} className="lg:col-span-2">
        {(data.documents ?? []).length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded" />
        ) : (
          <ul className="divide-y divide-border">
            {data.documents!.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{d.file_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(d.uploaded_at).toLocaleDateString()} · {(d.file_size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/documents/${d.id}`}>Preview</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Analysis timeline */}
      <SectionCard title="Analysis timeline" icon={Activity} className="lg:col-span-2">
        {(data.analysis_timeline ?? []).length === 0 ? (
          <EmptyState icon={Activity} title="No analyses yet" />
        ) : (
          <Timeline
            items={data.analysis_timeline!.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.detail,
              timestamp: new Date(t.at).toLocaleString(),
              icon: Sparkles,
              tone: "primary",
            }))}
          />
        )}
      </SectionCard>

      {/* Risk scores */}
      <SectionCard title="Previous risk scores" icon={ShieldCheck}>
        {(data.previous_risk_scores ?? []).length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No prior scores" />
        ) : (
          <ul className="space-y-2">
            {data.previous_risk_scores!.map((r, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{new Date(r.at).toLocaleDateString()}</span>
                <span className="font-semibold tabular-nums">{r.score}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Previous CAMs */}
      <SectionCard title="Previous CAM reports" icon={ScrollText} className="lg:col-span-2">
        {(data.previous_cam_reports ?? []).length === 0 ? (
          <EmptyState icon={ScrollText} title="No CAMs generated" />
        ) : (
          <ul className="divide-y divide-border">
            {data.previous_cam_reports!.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">CAM v{c.version}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(c.generated_at).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/cam/${c.id}`}>
                    Open <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* AI insights */}
      <SectionCard title="AI insights" icon={Sparkles}>
        {(data.ai_insights ?? []).length === 0 ? (
          <EmptyState icon={Sparkles} title="No insights yet" />
        ) : (
          <ul className="space-y-2">
            {data.ai_insights!.map((s, i) => (
              <li key={i} className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs">
                {s}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function Meta({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium">
        {value ?? <span className="text-muted-foreground">—</span>}
      </div>
    </div>
  );
}

