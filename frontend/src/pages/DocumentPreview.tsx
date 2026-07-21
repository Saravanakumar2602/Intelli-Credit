import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Download,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { documentsService } from "@/services/documents.service";
import { cn } from "@/lib/utils";

export default function DocumentPreview() {
  const { id } = useParams();
  const [zoom, setZoom] = useState(100);
  const [rotate, setRotate] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["document.get", id],
    queryFn: () => (id ? documentsService.get(id) : Promise.reject(new Error("no id"))),
    enabled: Boolean(id),
    retry: false,
  });

  const kind = data?.mime_type?.includes("pdf")
    ? "pdf"
    : data?.mime_type?.includes("sheet") || data?.file_name.endsWith(".xlsx") || data?.file_name.endsWith(".csv")
      ? "sheet"
      : data?.mime_type?.includes("word") || data?.file_name.endsWith(".docx")
        ? "doc"
        : "file";

  return (
    <div className={cn("animate-fade-in space-y-4", fullscreen && "fixed inset-0 z-50 overflow-auto bg-background p-6")}>
      <PageHeader
        eyebrow="Document"
        title={data?.file_name ?? "Preview"}
        description={id ? `Document · ${id}` : "Select a document."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(200, z + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRotate((r) => (r + 90) % 360)}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFullscreen((f) => !f)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button size="sm" disabled={!data?.download_url}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
          </>
        }
      />

      {!id ? (
        <EmptyState icon={FileIcon} title="No document selected" />
      ) : isLoading ? (
        <Skeleton className="h-[70vh] w-full" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={FileIcon} title="Document unavailable" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_260px]">
          {/* Thumbnails */}
          <SectionCard title="Pages" icon={FileText} bodyClassName="max-h-[70vh] overflow-y-auto">
            {data.page_count ? (
              <ul className="space-y-2">
                {Array.from({ length: data.page_count }).map((_, i) => (
                  <li
                    key={i}
                    className="flex aspect-[3/4] items-center justify-center rounded-md border border-border bg-secondary/40 text-xs text-muted-foreground"
                  >
                    Page {i + 1}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">No thumbnails.</div>
            )}
          </SectionCard>

          {/* Viewer */}
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <div
              className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center rounded-lg border border-border bg-card shadow-sm transition-transform"
              style={{ transform: `scale(${zoom / 100}) rotate(${rotate}deg)`, transformOrigin: "center" }}
            >
              {kind === "pdf" && data.preview_url ? (
                <iframe
                  src={data.preview_url}
                  title={data.file_name}
                  className="h-[70vh] w-full rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary/10 text-primary">
                    {kind === "sheet" ? (
                      <FileSpreadsheet className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>
                  <div className="text-sm font-semibold">
                    {kind === "pdf" && "PDF preview not available"}
                    {kind === "doc" && "DOCX preview"}
                    {kind === "sheet" && "Spreadsheet preview"}
                    {kind === "file" && "Preview not supported"}
                  </div>
                  <div className="max-w-sm text-xs text-muted-foreground">
                    Inline rendering for this format will be enabled once the document service is
                    connected. Download the file to view its contents.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <SectionCard title="Metadata" icon={FileIcon}>
            <dl className="space-y-2 text-sm">
              <Row label="File" value={data.file_name} />
              <Row label="Type" value={data.mime_type} />
              <Row label="Size" value={`${(data.file_size / 1024).toFixed(1)} KB`} />
              <Row label="Pages" value={data.page_count} />
              <Row label="Uploaded" value={new Date(data.uploaded_at).toLocaleString()} />
              <Row label="By" value={data.uploaded_by} />
            </dl>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-xs font-medium">
        {value ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}
