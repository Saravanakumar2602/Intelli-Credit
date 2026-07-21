import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BarChart3,
  Building2,
  Clock,
  Command as CommandIcon,
  FileText,
  History as HistoryIcon,
  Keyboard,
  LayoutDashboard,
  LifeBuoy,
  Moon,
  Plus,
  ScrollText,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload as UploadIcon,
  User as UserIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Action {
  id: string;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  shortcut?: string;
  perform: (nav: (to: string) => void) => void;
}

const RECENT_KEY = "intelli-credit.recent-command";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function pushRecent(id: string) {
  try {
    const next = [id, ...loadRecent().filter((r) => r !== id)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { theme, setTheme, toggle } = useTheme();
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(loadRecent());
  }, [open]);

  const actions: Action[] = useMemo(
    () => [
      // Navigate
      { id: "nav.dashboard", label: "Go to Dashboard", group: "Navigate", icon: LayoutDashboard, shortcut: "G D", perform: (n) => n("/dashboard") },
      { id: "nav.applications", label: "Go to Applications", group: "Navigate", icon: FileText, shortcut: "G A", perform: (n) => n("/applications") },
      { id: "nav.upload", label: "Go to Documents", group: "Navigate", icon: UploadIcon, perform: (n) => n("/upload") },
      { id: "nav.analysis", label: "Go to AI Analysis", group: "Navigate", icon: Sparkles, perform: (n) => n("/analysis") },
      { id: "nav.risk", label: "Go to Risk Assessment", group: "Navigate", icon: ShieldCheck, perform: (n) => n("/risk") },
      { id: "nav.cam", label: "Go to Credit Appraisal Memo", group: "Navigate", icon: ScrollText, perform: (n) => n("/cam") },
      { id: "nav.reports", label: "Go to Reports", group: "Navigate", icon: BarChart3, shortcut: "G R", perform: (n) => n("/reports") },
      { id: "nav.history", label: "Go to History", group: "Navigate", icon: HistoryIcon, perform: (n) => n("/history") },
      { id: "nav.audit", label: "Go to Audit Log", group: "Navigate", icon: ShieldCheck, perform: (n) => n("/audit") },
      { id: "nav.search", label: "Go to Global Search", group: "Navigate", icon: SearchIcon, shortcut: "/", perform: (n) => n("/search") },
      { id: "nav.help", label: "Go to Help Center", group: "Navigate", icon: LifeBuoy, shortcut: "?", perform: (n) => n("/help") },

      // Quick create
      { id: "new.application", label: "New application", group: "Create", icon: Plus, keywords: "add create onboarding", shortcut: "N", perform: (n) => n("/onboarding") },
      { id: "new.company", label: "Onboard company", group: "Create", icon: Building2, perform: (n) => n("/onboarding") },
      { id: "new.upload", label: "Upload documents", group: "Create", icon: UploadIcon, perform: (n) => n("/upload") },
      { id: "new.analysis", label: "Run new analysis", group: "Create", icon: Sparkles, perform: (n) => n("/analysis") },

      // Search shortcuts
      { id: "search.companies", label: "Search companies", group: "Search", icon: Building2, perform: (n) => n("/search?entity=company") },
      { id: "search.applications", label: "Search applications", group: "Search", icon: FileText, perform: (n) => n("/search?entity=application") },
      { id: "search.reports", label: "Search reports", group: "Search", icon: BarChart3, perform: (n) => n("/search?entity=report") },
      { id: "search.cam", label: "Search CAM memos", group: "Search", icon: ScrollText, perform: (n) => n("/search?entity=cam") },

      // Preferences
      {
        id: "pref.theme.toggle",
        label: "Toggle theme",
        group: "Preferences",
        icon: theme === "dark" ? Sun : Moon,
        keywords: "dark light appearance",
        perform: () => toggle(),
      },
      { id: "pref.theme.dark", label: "Use dark theme", group: "Preferences", icon: Moon, perform: () => setTheme("dark") },
      { id: "pref.theme.light", label: "Use light theme", group: "Preferences", icon: Sun, perform: () => setTheme("light") },
      { id: "pref.theme.system", label: "Match system theme", group: "Preferences", icon: SettingsIcon, perform: () => setTheme("system") },

      // Account
      { id: "acc.notifications", label: "Notifications", group: "Account", icon: Bell, perform: (n) => n("/notifications") },
      { id: "acc.settings", label: "Settings", group: "Account", icon: SettingsIcon, perform: (n) => n("/settings") },
      { id: "acc.profile", label: "Profile", group: "Account", icon: UserIcon, perform: (n) => n("/profile") },
      { id: "acc.shortcuts", label: "Keyboard shortcuts", group: "Account", icon: Keyboard, perform: (n) => n("/help") },
    ],
    [theme, setTheme, toggle],
  );

  const groups = Array.from(new Set(actions.map((a) => a.group)));

  const run = (a: Action) => {
    pushRecent(a.id);
    onOpenChange(false);
    // Defer navigation so dialog can unmount cleanly first.
    queueMicrotask(() => a.perform(navigate));
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command, page, or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        {recent.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recent.map((id) => {
                const a = actions.find((x) => x.id === id);
                if (!a) return null;
                const Icon = a.icon;
                return (
                  <CommandItem key={id} value={`recent-${a.label}`} onSelect={() => run(a)} className="gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{a.label}</span>
                    <Icon className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {groups.map((group, i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {actions
                .filter((a) => a.group === group)
                .map((a) => {
                  const Icon = a.icon;
                  return (
                    <CommandItem
                      key={a.id}
                      value={`${a.label} ${a.keywords ?? ""}`}
                      onSelect={() => run(a)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{a.label}</span>
                      {a.shortcut && <CommandShortcut>{a.shortcut}</CommandShortcut>}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </div>
        ))}

        <CommandSeparator />
        <div className="flex items-center justify-between px-3 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CommandIcon className="h-3 w-3" /> Press ⌘K to toggle
          </span>
          <span>↑ ↓ to navigate · ↵ to run · Esc to close</span>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
