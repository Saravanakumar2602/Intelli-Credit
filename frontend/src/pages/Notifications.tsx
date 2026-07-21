import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ErrorState } from "@/components/app/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { notificationService } from "@/services/entities.service";
import { cn } from "@/lib/utils";
import { toErrorMessage } from "@/services/api";

const TYPE_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
} as const;

const TYPE_TONE = {
  info: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  error: "text-destructive bg-destructive/10",
} as const;

type Tab = "all" | "unread" | "mentions" | "analysis" | "reports" | "system";

export default function Notifications() {
  const [tab, setTab] = useState<Tab>("all");
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications.list"],
    queryFn: () => notificationService.list(),
    retry: false,
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      toast.success("Marked all as read");
      qc.invalidateQueries({ queryKey: ["notifications.list"] });
    },
    onError: (e) => toast.error(toErrorMessage(e)),
  });

  const filtered = useMemo(() => {
    const items = data ?? [];
    if (tab === "unread") return items.filter((i) => !i.read);
    if (tab === "mentions") return items.filter((i) => i.category === "mention");
    if (tab === "analysis") return items.filter((i) => i.category === "analysis");
    if (tab === "reports") return items.filter((i) => i.category === "reports");
    if (tab === "system") return items.filter((i) => i.category === "system");
    return items;
  }, [data, tab]);

  const unreadCount = (data ?? []).filter((i) => !i.read).length;

  return (
    <div className="animate-fade-in space-y-4">
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Alerts about applications, analyses and system events."
        actions={
          <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending || unreadCount === 0}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-1.5 h-4 min-w-4 px-1 text-[9px]">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="rounded-xl border border-border bg-card">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : isError ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Bell} title="You're all caught up" description="No notifications to show." />
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((n) => {
                  const Icon = TYPE_ICON[n.type];
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 p-4 transition-colors hover:bg-secondary/30",
                        !n.read && "bg-primary/[0.03]",
                      )}
                    >
                      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", TYPE_TONE[n.type])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-medium">{n.title}</div>
                          {!n.read && <Badge className="bg-primary/15 text-[10px] text-primary">New</Badge>}
                        </div>
                        {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                      </div>
                      <div className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
