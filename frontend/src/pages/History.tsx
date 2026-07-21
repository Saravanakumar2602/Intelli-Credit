import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  History as HistoryIcon,
  Search,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analysisService, type HistoryQuery } from "@/services/analysis.service";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-secondary text-muted-foreground",
  running: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
};

export default function History() {
  const [query, setQuery] = useState<HistoryQuery>({
    q: "",
    status: "all",
    sort: "date_desc",
    page: 1,
    page_size: 20,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analysis.history", query],
    queryFn: () => analysisService.history(query),
    retry: false,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (query.page_size ?? 20)));

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        eyebrow="Insights"
        title="Analysis History"
        description="Every AI run, searchable and filterable."
        actions={
          <Button size="sm" variant="outline">
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query.q ?? ""}
            onChange={(e) => setQuery((q) => ({ ...q, q: e.target.value, page: 1 }))}
            placeholder="Search company, officer or ID"
            className="pl-8"
          />
        </div>
        <Select value={query.status} onValueChange={(v) => setQuery((q) => ({ ...q, status: v, page: 1 }))}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={query.sort} onValueChange={(v) => setQuery((q) => ({ ...q, sort: v as HistoryQuery["sort"] }))}>
          <SelectTrigger>
            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest first</SelectItem>
            <SelectItem value="date_asc">Oldest first</SelectItem>
            <SelectItem value="risk_desc">Risk (high → low)</SelectItem>
            <SelectItem value="risk_asc">Risk (low → high)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="mr-1.5 h-4 w-4" /> More
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No analyses yet"
            description="Runs will appear here once AI analysis is triggered from an application."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.company_name}</TableCell>
                    <TableCell className="tabular-nums">{a.risk_score ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">
                      {a.confidence != null ? `${a.confidence}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_TONE[a.status] ?? ""}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/analysis/${a.id}`}>
                            <Sparkles className="mr-1 h-4 w-4" /> View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/cam/${a.id}`}>
                            <Download className="mr-1 h-4 w-4" /> CAM
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                Page {query.page} of {pages} · {total} results
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={(query.page ?? 1) <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={(query.page ?? 1) >= pages}
                  onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
