import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  ScrollText,
  Sparkles,
  Download,
  RefreshCw,
  MessageSquare,
  ClipboardList,
  Workflow,
  Users,
  Activity,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { SectionCard } from "@/components/app/SectionCard";
import { Timeline } from "@/components/app/Timeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { applicationService } from "@/services/entities.service";
import { cn } from "@/lib/utils";
import { toErrorMessage } from "@/services/api";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-secondary text-muted-foreground",
  submitted: "bg-secondary text-muted-foreground",
  in_review: "bg-primary/15 text-primary",
  under_review: "bg-primary/15 text-primary",
  analyzing: "bg-warning/15 text-warning",
  conditional: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  declined: "bg-destructive/15 text-destructive",
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["application.detail", id],
    queryFn: () => (id ? applicationService.detail(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
    retry: false,
  });

  const rerun = useMutation({
    mutationFn: () => applicationService.rerunAnalysis(id!),
    onSuccess: () => {
      toast.success("Analysis queued");
      qc.invalidateQueries({ queryKey: ["application.detail", id] });
    },
    onError: (e) => toast.error(toErrorMessage(e)),
  });

  const postComment = useMutation({
    mutationFn: () => applicationService.comment(id!, comment),
    onSuccess: () => {
      toast.success("Comment posted");
      setComment("");
      qc.invalidateQueries({ queryKey: ["application.detail", id] });
    },
    onError: (e) => toast.error(toErrorMessage(e)),
  });

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Underwriting"
        title={data?.company_name ?? "Application"}
        description={id ? `Application · ${id}` : "Select an application."}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rerun.mutate()}
              disabled={!id || rerun.isPending}
            >
              <RefreshCw className={cn("mr-1.5 h-4 w-4", rerun.isPending && "animate-spin")} />
              Re-run analysis
            </Button>
            <Button size="sm" asChild disabled={!data?.latest_cam_id}>
              <Link to={data?.latest_cam_id ? `/cam/${data.latest_cam_id}` : "#"}>
                <Download className="mr-1.5 h-4 w-4" /> Download CAM
              </Link>
            </Button>
          </>
        }
      />

      {!id ? (
        <EmptyState icon={FileText} title="No application selected" />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={FileText} title="Application not found" />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Overview */}
          <SectionCard title="Application overview" icon={FileText} className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Amount">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: data.currency ?? "USD",
                  notation: "compact",
                }).format(data.amount_requested)}
              </Stat>
              <Stat label="Purpose">{data.purpose ?? "—"}</Stat>
              <Stat label="Risk score">{data.risk_score ?? "—"}</Stat>
              <Stat label="Status">
                <Badge className={STATUS_TONE[data.status] ?? ""}>
                  {data.status.replaceAll("_", " ")}
                </Badge>
              </Stat>
            </div>
          </SectionCard>

          {/* Officer */}
          <SectionCard title="Credit officer" icon={Users}>
            {data.assigned_officer ? (
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {data.assigned_officer.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{data.assigned_officer.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {data.assigned_officer.email}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState icon={Users} title="Unassigned" />
            )}
            {data.review_stage && (
              <div className="mt-4 rounded-md border border-border bg-secondary/30 p-2.5 text-xs">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Current stage
                </div>
                <div className="mt-0.5 text-sm font-medium">{data.review_stage}</div>
              </div>
            )}
          </SectionCard>

          {/* Loan details */}
          <SectionCard title="Loan details" icon={FileText}>
            {data.loan_details ? (
              <dl className="space-y-2 text-sm">
                <Row label="Facility type" value={data.loan_details.facility_type} />
                <Row label="Tenure" value={data.loan_details.tenure_months ? `${data.loan_details.tenure_months} months` : undefined} />
                <Row label="Interest rate" value={data.loan_details.interest_rate ? `${data.loan_details.interest_rate}%` : undefined} />
                <Row label="Collateral" value={data.loan_details.collateral} />
              </dl>
            ) : (
              <EmptyState icon={FileText} title="No loan details" />
            )}
          </SectionCard>

          {/* Status timeline */}
          <SectionCard title="Status timeline" icon={Activity} className="lg:col-span-2">
            {(data.status_timeline ?? []).length === 0 ? (
              <EmptyState icon={Activity} title="No status changes" />
            ) : (
              <Timeline
                items={data.status_timeline!.map((s) => ({
                  id: s.id,
                  title: s.status.replaceAll("_", " "),
                  description: s.note,
                  timestamp: new Date(s.at).toLocaleString(),
                  tone: "primary",
                }))}
              />
            )}
          </SectionCard>

          {/* Required docs */}
          <SectionCard title="Required documents" icon={ClipboardList}>
            {(data.required_documents ?? []).length === 0 ? (
              <EmptyState icon={ClipboardList} title="Checklist pending" />
            ) : (
              <ul className="space-y-2">
                {data.required_documents!.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {d.provided ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(d.provided ? "text-foreground" : "text-muted-foreground")}>
                      {d.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Uploaded docs */}
          <SectionCard
            title="Uploaded documents"
            icon={FileText}
            actions={
              <Button variant="outline" size="sm" asChild>
                <Link to="/upload">Upload</Link>
              </Button>
            }
          >
            {(data.uploaded_documents ?? []).length === 0 ? (
              <EmptyState icon={FileText} title="Nothing uploaded" />
            ) : (
              <ul className="divide-y divide-border">
                {data.uploaded_documents!.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.file_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {(d.file_size / 1024).toFixed(0)} KB
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

          {/* Workflow */}
          <SectionCard title="Approval workflow" icon={Workflow} className="lg:col-span-2">
            {(data.workflow ?? []).length === 0 ? (
              <EmptyState icon={Workflow} title="No workflow configured" />
            ) : (
              <ol className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {data.workflow!.map((w) => (
                  <li
                    key={w.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3",
                      w.state === "done" && "border-success/30 bg-success/5",
                      w.state === "current" && "border-primary/40 bg-primary/5",
                      w.state === "pending" && "border-border bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full",
                        w.state === "done" && "bg-success/15 text-success",
                        w.state === "current" && "bg-primary/15 text-primary",
                        w.state === "pending" && "bg-secondary text-muted-foreground",
                      )}
                    >
                      {w.state === "done" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : w.state === "current" ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{w.stage}</div>
                      {w.owner && (
                        <div className="truncate text-[11px] text-muted-foreground">{w.owner}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>

          {/* Latest analysis */}
          <SectionCard title="Latest analysis" icon={Sparkles}>
            {data.latest_analysis ? (
              <div>
                <div className="text-2xl font-semibold tabular-nums">
                  {data.latest_analysis.risk_score ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">Risk score</div>
                <Button variant="link" className="mt-2 h-auto p-0" asChild>
                  <Link to={`/analysis/${data.latest_analysis.id}`}>Open analysis →</Link>
                </Button>
              </div>
            ) : (
              <EmptyState icon={Sparkles} title="No analysis yet" />
            )}
          </SectionCard>

          {/* Comments */}
          <SectionCard title="Comments" icon={MessageSquare} className="lg:col-span-2">
            <div className="space-y-3">
              {(data.comments ?? []).length === 0 ? (
                <EmptyState icon={MessageSquare} title="No comments yet" />
              ) : (
                <ul className="space-y-3">
                  {data.comments!.map((c) => (
                    <li key={c.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{c.author}</span>
                        <span className="text-muted-foreground">
                          {new Date(c.at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-lg border border-border bg-card p-3">
                <Textarea
                  placeholder="Add a comment for the review team…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[72px] resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => postComment.mutate()}
                    disabled={!comment.trim() || postComment.isPending}
                  >
                    Post comment
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Activity */}
          <SectionCard title="Activity" icon={Activity}>
            {(data.activity ?? []).length === 0 ? (
              <EmptyState icon={Activity} title="No activity yet" />
            ) : (
              <Timeline
                items={data.activity!.map((a) => ({
                  id: a.id,
                  title: a.action,
                  description: a.actor,
                  timestamp: new Date(a.at).toLocaleString(),
                }))}
              />
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">
        {value ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}
