import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Download,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  className?: string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** Pin to the left or right edge; the row stays horizontally scrollable in between. */
  pinned?: "left" | "right";
  /** Hidden by default; users can re-enable via the column visibility menu. */
  defaultHidden?: boolean;
}

export interface BulkAction<T> {
  label: string;
  onSelect: (rows: T[]) => void;
  icon?: ReactNode;
  variant?: "default" | "destructive";
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
  exportName?: string;
  stickyHeader?: boolean;
  /** Enables the checkbox column + bulk-action toolbar. */
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  /** Show the column visibility toggle in the toolbar. */
  showColumnToggle?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  empty,
  className,
  exportName,
  stickyHeader = true,
  selectable = false,
  bulkActions,
  showColumnToggle = true,
}: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key)),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden.has(c.key)),
    [columns, hidden],
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const av = a[col.key as keyof T];
      const bv = b[col.key as keyof T];
      if (av === bv) return 0;
      const dir = sort.dir === "asc" ? 1 : -1;
      return (av! > bv! ? 1 : -1) * dir;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((s) =>
      !s || s.key !== key
        ? { key, dir: "asc" }
        : s.dir === "asc"
          ? { key, dir: "desc" }
          : null,
    );
  };

  const allSelected =
    selectable && sorted.length > 0 && sorted.every((r) => selected.has(getRowId(r)));
  const someSelected = selectable && !allSelected && sorted.some((r) => selected.has(getRowId(r)));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map(getRowId)));
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRows = useMemo(
    () => sorted.filter((r) => selected.has(getRowId(r))),
    [sorted, selected, getRowId],
  );

  const exportCsv = () => {
    const cols = visibleColumns;
    const head = cols.map((c) => `"${c.header}"`).join(",");
    const body = sorted
      .map((r) =>
        cols
          .map((c) => {
            const v = (r as Record<string, unknown>)[c.key];
            return `"${String(v ?? "").replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName ?? "export"}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showToolbar = exportName || showColumnToggle || (selectable && selectedRows.length > 0);

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {showToolbar && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {selectable && selectedRows.length > 0 ? (
              <>
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  {selectedRows.length} selected
                </span>
                {bulkActions?.map((a) => (
                  <Button
                    key={a.label}
                    variant={a.variant === "destructive" ? "destructive" : "outline"}
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => a.onSelect(selectedRows)}
                  >
                    {a.icon}
                    {a.label}
                  </Button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="ml-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </>
            ) : (
              <span>
                {sorted.length} {sorted.length === 1 ? "row" : "rows"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showColumnToggle && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                    <Settings2 className="h-3.5 w-3.5" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-[11px]">Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={!hidden.has(c.key)}
                      onCheckedChange={(v) =>
                        setHidden((prev) => {
                          const next = new Set(prev);
                          if (v) next.delete(c.key);
                          else next.add(c.key);
                          return next;
                        })
                      }
                    >
                      {c.header}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {exportName && (
              <Button variant="ghost" size="sm" onClick={exportCsv} className="h-7 gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={cn(
              "bg-secondary/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
              stickyHeader && "sticky top-0 z-10",
            )}
          >
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visibleColumns.map((c) => {
                const isSorted = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    className={cn(
                      "px-3 py-2.5",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.pinned === "left" && "sticky left-0 z-10 bg-secondary/95 backdrop-blur",
                      c.pinned === "right" && "sticky right-0 z-10 bg-secondary/95 backdrop-blur",
                      c.className,
                    )}
                  >
                    {c.sortable !== false ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {c.header}
                        {isSorted ? (
                          sort!.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-3 py-10 text-center text-muted-foreground"
                >
                  {empty ?? "No results"}
                </td>
              </tr>
            ) : (
              sorted.map((row) => {
                const id = getRowId(row);
                const isSelected = selected.has(id);
                return (
                  <tr
                    key={id}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected ? "bg-primary/5" : "hover:bg-secondary/40",
                    )}
                    onClick={(e) => {
                      // Don't trigger row navigation when clicking the checkbox cell
                      const target = e.target as HTMLElement;
                      if (target.closest("[data-row-noclick]")) return;
                      onRowClick?.(row);
                    }}
                  >
                    {selectable && (
                      <td className="w-10 px-3 py-2.5" data-row-noclick>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {visibleColumns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "px-3 py-2.5",
                          c.align === "right" && "text-right tabular-nums",
                          c.align === "center" && "text-center",
                          c.pinned === "left" && "sticky left-0 z-10 bg-card",
                          c.pinned === "right" && "sticky right-0 z-10 bg-card",
                          c.className,
                        )}
                      >
                        {c.cell ? c.cell(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
