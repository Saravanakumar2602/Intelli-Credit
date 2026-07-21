import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Upload as UploadIcon,
  Sparkles,
  ShieldCheck,
  ScrollText,
  BarChart3,
  History as HistoryIcon,
  Bell,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut,
  ChevronsLeft,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

import { LifeBuoy, Search as SearchIcon, ShieldAlert } from "lucide-react";

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { to: "/search", label: "Global Search", icon: SearchIcon, section: "Overview" },

  { to: "/onboarding", label: "Company Onboarding", icon: Building2, section: "Underwriting" },
  { to: "/applications", label: "Applications", icon: FileText, section: "Underwriting" },
  { to: "/upload", label: "Documents", icon: UploadIcon, section: "Underwriting" },

  { to: "/analysis", label: "AI Analysis", icon: Sparkles, section: "Intelligence" },
  { to: "/risk", label: "Risk Assessment", icon: ShieldCheck, section: "Intelligence" },
  { to: "/cam", label: "Credit Appraisal", icon: ScrollText, section: "Intelligence" },

  { to: "/reports", label: "Reports", icon: BarChart3, section: "Insights" },
  { to: "/history", label: "History", icon: HistoryIcon, section: "Insights" },
  { to: "/audit", label: "Audit Log", icon: ShieldAlert, section: "Insights" },

  { to: "/notifications", label: "Notifications", icon: Bell, section: "Account" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, section: "Account" },
  { to: "/profile", label: "Profile", icon: UserIcon, section: "Account" },
  { to: "/help", label: "Help & Support", icon: LifeBuoy, section: "Account" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  useLocation(); // subscribe for active state refresh

  const sections = Array.from(new Set(NAV.map((n) => n.section ?? "")));

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-brand text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">Intelli-Credit</div>
            <div className="truncate text-[11px] text-muted-foreground">Underwriting Suite</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
          className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section} className="mb-3">
            {!collapsed && (
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {section}
              </div>
            )}
            <ul className="space-y-0.5">
              {NAV.filter((n) => (n.section ?? "") === section).map((item) => (
                <li key={item.to}>
                  <SideLink item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md p-2",
            collapsed && "justify-center",
          )}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {(user?.full_name ?? "U").slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{user?.full_name ?? "User"}</div>
              <div className="truncate text-[10px] text-muted-foreground">{user?.email}</div>
            </div>
          )}
          {!collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Sign out"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}

function SideLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const content = (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
          "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive &&
            "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}
