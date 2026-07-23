import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { applicationService } from "@/services/entities.service";

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

export default function Applications() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["applications.list"],
    queryFn: () => applicationService.list(1),
    retry: false,
  });

  const items = data?.items ?? [];
  const filtered = items.filter(
    (a) =>
      !q ||
      a.company_name.toLowerCase().includes(q.toLowerCase()) ||
      a.id.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Underwriting"
        title="Corporate Applications"
        description="Every application currently in-flight across your book."
        actions={
          <Button size="sm" asChild className="gradient-brand text-white">
            <Link to="/onboarding">
              <Plus className="mr-1.5 h-4 w-4" /> New application
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by company or ID"
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-1.5 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No applications yet"
            description="Start an onboarding flow to add your first corporate application."
            action={
              <Button size="sm" asChild>
                <Link to="/onboarding">Start onboarding</Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer transition-colors hover:bg-secondary/40"
                  onClick={() => navigate(`/applications/${a.id}`)}
                >
                  <TableCell className="font-medium">{a.company_name}</TableCell>
                  <TableCell className="tabular-nums">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: a.currency ?? "USD",
                      notation: "compact",
                    }).format(a.amount_requested)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_TONE[a.status] ?? ""}>
                      {a.status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{a.risk_score ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.officer ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
