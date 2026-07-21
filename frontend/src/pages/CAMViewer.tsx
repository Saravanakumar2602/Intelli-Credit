import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Download,
  Expand,
  Maximize2,
  Minimize2,
  Printer,
  Search as SearchIcon,
  ScrollText,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { camService } from "@/services/cam.service";

const SECTIONS = [
  "executive_summary",
  "company_overview",
  "financials",
  "ratios",
  "swot",
  "news",
  "risk",
  "recommendations",
  "decision",
];

const SECTION_TITLES: Record<string, string> = {
  executive_summary: "Executive Summary",
  company_overview: "Company Overview",
  financials: "Financial Statements",
  ratios: "Ratio Analysis",
  swot: "SWOT",
  news: "News Intelligence",
  risk: "Risk Analysis",
  recommendations: "Recommendations",
  decision: "Approval Decision",
};

function highlight(text: string, term: string) {
  if (!term.trim()) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((p, i) =>
    p.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="rounded bg-warning/30 px-0.5 text-warning-foreground">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default function CAMViewer() {
  const { id } = useParams();
  const [term, setTerm] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0]);
  const [progress, setProgress] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cam.get", id],
    queryFn: () => (id ? camService.get(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(100, (doc.scrollTop / total) * 100) : 0);

      // find active section
      let current = SECTIONS[0];
      for (const key of SECTIONS) {
        const el = document.getElementById(`cam-${key}`);
        if (el && el.getBoundingClientRect().top < 140) current = key;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data]);

  const toggleAll = (state: boolean) => {
    const next: Record<string, boolean> = {};
    SECTIONS.forEach((s) => (next[s] = state));
    setCollapsed(next);
  };

  const scrollTo = (key: string) => {
    document.getElementById(`cam-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={cn("animate-fade-in", fullscreen && "fixed inset-0 z-40 overflow-auto bg-background p-6")}>
      {/* Reading progress */}
      <div className="fixed left-0 right-0 top-0 z-30 h-0.5 bg-transparent print:hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-chart-3 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <PageHeader
        eyebrow="Intelligence"
        title="Credit Appraisal Memo"
        description={id ? `CAM · ${id}` : "Select an application to view its generated CAM."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
              <Minimize2 className="mr-1.5 h-4 w-4" /> Collapse
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
              <Expand className="mr-1.5 h-4 w-4" /> Expand
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFullscreen((v) => !v)}>
              <Maximize2 className="mr-1.5 h-4 w-4" /> {fullscreen ? "Exit" : "Fullscreen"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
            <Button size="sm" disabled={!id}>
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </Button>
          </>
        }
      />

      {!id ? (
        <EmptyState
          icon={ScrollText}
          title="No CAM selected"
          description="Open a completed analysis to review its Credit Appraisal Memo."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-[220px_1fr] gap-6">
          <Skeleton className="h-96" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={ScrollText} title="No memo available" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sticky TOC */}
          <nav className="sticky top-20 hidden h-max rounded-xl border border-border bg-card p-3 text-sm lg:block print:hidden">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contents
            </div>
            <div className="relative mb-3 px-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Find in memo…"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <ul className="space-y-0.5">
              {SECTIONS.map((s) => {
                const active = activeSection === s;
                return (
                  <li key={s}>
                    <button
                      onClick={() => scrollTo(s)}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 shrink-0 transition-transform",
                          active && "translate-x-0.5 text-primary",
                        )}
                      />
                      <span className="truncate">{SECTION_TITLES[s] ?? s}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Paper */}
          <article className="rounded-xl border border-border bg-card p-8 shadow-sm print:border-0 print:shadow-none">
            <header className="mb-8 border-b border-border pb-6">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Credit Appraisal Memo · v{data.version}
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{data.company_name}</h1>
              <div className="mt-1 text-sm text-muted-foreground">
                Generated {new Date(data.generated_at).toLocaleString()}
              </div>
            </header>

            <div className="space-y-10">
              {SECTIONS.map((key) => {
                const section = data.sections.find((s) => s.key === key);
                const isCollapsed = collapsed[key];
                return (
                  <section key={key} id={`cam-${key}`} className="scroll-mt-24">
                    <button
                      onClick={() =>
                        setCollapsed((c) => ({ ...c, [key]: !c[key] }))
                      }
                      className="group flex w-full items-center justify-between border-b border-border/60 pb-2 text-left"
                    >
                      <h2 className="text-lg font-semibold tracking-tight">
                        {SECTION_TITLES[key] ?? key}
                      </h2>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          !isCollapsed && "rotate-90",
                        )}
                      />
                    </button>
                    {!isCollapsed && (
                      <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                        {section?.content
                          ? highlight(section.content, term)
                          : <span className="text-muted-foreground">Not available.</span>}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
