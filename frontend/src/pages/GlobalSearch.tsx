import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  BookmarkPlus,
  Building2,
  Clock,
  FileText,
  ScrollText,
  Search as SearchIcon,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  pushRecentSearch,
  readRecentSearches,
  searchService,
  type SearchEntity,
} from "@/services/search.service";

const ENTITY_META: Record<
  SearchEntity,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  company: { label: "Companies", icon: Building2, tone: "text-primary" },
  application: { label: "Applications", icon: FileText, tone: "text-chart-2" },
  report: { label: "Reports", icon: Sparkles, tone: "text-chart-3" },
  cam: { label: "CAM", icon: ScrollText, tone: "text-chart-4" },
  risk: { label: "Risk", icon: ShieldCheck, tone: "text-warning" },
};

const ALL_ENTITIES = Object.keys(ENTITY_META) as SearchEntity[];

export default function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [entities, setEntities] = useState<SearchEntity[]>(ALL_ENTITIES);
  const [submitted, setSubmitted] = useState("");
  const navigate = useNavigate();
  const recent = useMemo(readRecentSearches, [submitted]);

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["search", submitted, entities],
    queryFn: () => searchService.search({ q: submitted, entities }),
    enabled: submitted.length > 0,
    retry: false,
  });

  const submit = (q: string) => {
    const v = q.trim();
    if (!v) return;
    pushRecentSearch(v);
    setSubmitted(v);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Search"
        title="Global search"
        description="Find companies, applications, memos, reports and risk assessments."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(term);
        }}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by name, ID, CIN, officer, sector…"
            className="pl-9"
          />
        </div>
        <Button type="submit" className="gradient-brand text-white">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {ALL_ENTITIES.map((e) => {
          const m = ENTITY_META[e];
          const Icon = m.icon;
          const active = entities.includes(e);
          return (
            <button
              key={e}
              type="button"
              onClick={() =>
                setEntities((cur) =>
                  cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e],
                )
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                active
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" disabled={!submitted}>
            <BookmarkPlus className="h-3.5 w-3.5" /> Save search
          </Button>
        </div>
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Recent
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your recent searches will appear here.</p>
            ) : (
              <ul className="space-y-1">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => {
                        setTerm(r);
                        submit(r);
                      }}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 hover:bg-secondary/60"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Bookmark className="h-3.5 w-3.5" /> Saved
            </div>
            <p className="text-sm text-muted-foreground">
              Saved searches let you jump back to a filtered view instantly. Backend integration
              will populate this list.
            </p>
          </div>
        </div>
      ) : isFetching ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No results"
          description={`Nothing matched “${submitted}”. Try different keywords or entity filters.`}
        />
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {data.map((hit) => {
            const m = ENTITY_META[hit.entity];
            const Icon = m.icon;
            return (
              <li key={`${hit.entity}-${hit.id}`}>
                <button
                  onClick={() => navigate(hit.href)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
                >
                  <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary/70", m.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-medium">{hit.title}</div>
                      <Badge variant="outline" className="text-[10px]">{m.label}</Badge>
                    </div>
                    {hit.subtitle && (
                      <div className="truncate text-xs text-muted-foreground">{hit.subtitle}</div>
                    )}
                  </div>
                  {hit.updated_at && (
                    <div className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {new Date(hit.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
