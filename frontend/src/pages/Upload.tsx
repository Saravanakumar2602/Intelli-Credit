import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  History as HistoryIcon,
  RefreshCw,
  Repeat,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { documentsService } from "@/services/documents.service";
import { cn } from "@/lib/utils";

interface QueuedFile {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "ready" | "failed";
  error?: string;
}

const ACCEPT = [".pdf", ".docx", ".xlsx", ".csv"];
const MAX_MB = 50;

export default function Upload() {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<QueuedFile[]>([]);

  const history = useQuery({
    queryKey: ["documents.history"],
    queryFn: () => documentsService.history(1),
    retry: false,
  });

  const validate = (f: File): string | null => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPT.includes(ext)) return `Unsupported type ${ext}`;
    if (f.size > MAX_MB * 1024 * 1024) return `Exceeds ${MAX_MB}MB`;
    return null;
  };

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).map<QueuedFile>((f) => {
      const err = validate(f);
      return {
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        progress: err ? 0 : 0,
        status: err ? "failed" : "queued",
        error: err ?? undefined,
      };
    });
    setFiles((prev) => [...prev, ...arr]);

    arr.filter((q) => q.status === "queued").forEach((qf) => runUpload(qf.id));
  }, []);

  const runUpload = (id: string) => {
    setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, status: "uploading", progress: 0, error: undefined } : p)));
    const iv = setInterval(() => {
      setFiles((prev) => {
        const target = prev.find((p) => p.id === id);
        if (!target) {
          clearInterval(iv);
          return prev;
        }
        const next = Math.min(100, target.progress + 12);
        if (next >= 100) {
          clearInterval(iv);
          return prev.map((p) => (p.id === id ? { ...p, progress: 100, status: "ready" } : p));
        }
        return prev.map((p) => (p.id === id ? { ...p, progress: next } : p));
      });
    }, 180);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const remove = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));
  const replaceFile = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPT.join(",");
    input.onchange = () => {
      if (input.files?.[0]) {
        const f = input.files[0];
        setFiles((prev) => prev.map((p) => (p.id === id ? { ...p, file: f, progress: 0, status: "queued", error: undefined } : p)));
        runUpload(id);
      }
    };
    input.click();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Underwriting"
        title="Document Center"
        description="Drop financials, KYC and disclosures. PDF, DOCX, XLSX and CSV up to 50MB per file."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          drag ? "border-primary/60 bg-primary/5" : "border-border bg-card",
        )}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0.7 }}
          animate={{ scale: drag ? 1.02 : 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <UploadCloud className="h-6 w-6" />
        </motion.div>
        <h3 className="mt-4 text-base font-semibold">Drop files here</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          or select from your computer. Max {MAX_MB}MB per file.
        </p>
        <div className="mt-5">
          <label>
            <input
              type="file"
              multiple
              accept={ACCEPT.join(",")}
              className="sr-only"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <span className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              Select files
            </span>
          </label>
        </div>
        <div className="mt-4 flex justify-center gap-3 text-[11px] text-muted-foreground">
          {ACCEPT.map((e) => (
            <span key={e} className="rounded border border-border bg-secondary/40 px-1.5 py-0.5">
              {e}
            </span>
          ))}
        </div>
      </div>

      <SectionCard title="Upload queue" icon={UploadCloud}>
        {files.length === 0 ? (
          <EmptyState
            icon={FileIcon}
            title="Queue is empty"
            description="Drag files above or click select. They'll appear here as they upload."
          />
        ) : (
          <ul className="space-y-2">
            {files.map((qf) => (
              <li
                key={qf.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                  qf.status === "failed" ? "border-destructive/40 bg-destructive/5" : "border-border bg-secondary/20",
                )}
              >
                <FileIconFor name={qf.file.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0 truncate text-sm font-medium">{qf.file.name}</div>
                    <div className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {(qf.file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {qf.status === "failed" ? (
                    <div className="mt-0.5 text-[11px] text-destructive">{qf.error}</div>
                  ) : (
                    <Progress value={qf.progress} className="mt-1.5 h-1" />
                  )}
                </div>
                <StatusBadge status={qf.status} />
                <div className="flex items-center gap-1">
                  {qf.status === "failed" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => runUpload(qf.id)} aria-label="Retry">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  {qf.status === "ready" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => replaceFile(qf.id)} aria-label="Replace">
                      <Repeat className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(qf.id)} aria-label="Remove">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Upload history" icon={HistoryIcon}>
        {history.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : history.isError ? (
          <ErrorState error={history.error} onRetry={() => history.refetch()} />
        ) : (history.data ?? []).length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No prior uploads"
            description="Uploaded documents will be listed here for review, preview and replacement."
          />
        ) : (
          <ul className="divide-y divide-border">
            {history.data!.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <FileIconFor name={d.file_name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{d.file_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(d.uploaded_at).toLocaleString()} · {(d.file_size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <StatusBadge status={d.status} />
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/documents/${d.id}`}>
                    <Eye className="mr-1 h-4 w-4" /> Preview
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: "bg-secondary text-muted-foreground",
    uploading: "bg-primary/15 text-primary",
    processing: "bg-warning/15 text-warning",
    ready: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive",
  };
  return <Badge className={cn("text-[10px]", map[status] ?? "")}>{status}</Badge>;
}

function FileIconFor({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase();
  const Icon = ext === "xlsx" || ext === "csv" ? FileSpreadsheet : FileText;
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
  );
}
