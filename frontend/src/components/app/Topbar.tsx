import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Command as CommandIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./CommandPalette";

export function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-9 min-w-0 flex-1 max-w-md items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-secondary/70"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search companies, applications, memos…</span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px]">
              0
            </Badge>
          </Button>
        </div>
      </header>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
