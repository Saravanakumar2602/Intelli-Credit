import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Activity, 
  History, 
  Settings, 
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
  User,
  PlusCircle,
  ClipboardList
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useToast } from "../components/ui/Toast";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"User","role":"relationship_manager","email":"user@bank.com"}');

  const navItems = [
    { section: "Core", items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { id: "companies", label: "Companies", icon: Building2, path: "/companies" },
      { id: "onboarding", label: "Onboarding Wizard", icon: PlusCircle, path: "/companies/onboarding" },
      { id: "applications", label: "Applications Directory", icon: ClipboardList, path: "/applications" }
    ]},
    { section: "Appraisal Workspace", items: [
      { id: "workspace", label: "Active Workspace", icon: FileText, path: "/workspace" }
    ]},
    { section: "Administration & Audit", items: [
      { id: "monitoring", label: "Telemetry & Logs", icon: Activity, path: "/monitoring" }
    ]}
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast("Logged out successfully.", "info");
    navigate("/login");
  };

  const getBreadcrumbs = () => {
    const paths = currentPath.split("/").filter(p => p);
    if (paths.length === 0) return [{ label: "Intelli-Credit", path: "/dashboard" }];
    
    return [
      { label: "Home", path: "/dashboard" },
      ...paths.map((p, idx) => ({
        label: p.charAt(0).toUpperCase() + p.slice(1),
        path: "/" + paths.slice(0, idx + 1).join("/")
      }))
    ];
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#02040a] text-slate-800 dark:text-slate-200">
      
      {/* 1. Sidebar Navigation */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 260 }}
        className="fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#020617] text-slate-300 border-r border-slate-900 overflow-hidden shadow-xl"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-900 overflow-hidden">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => navigate("/dashboard")}
              >
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-lg shadow-glow">
                  I
                </div>
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Intelli<span className="text-accent">Credit</span>
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-extrabold text-lg mx-auto"
                onClick={() => navigate("/dashboard")}
              >
                I
              </motion.div>
            )}
          </AnimatePresence>
          
          {!sidebarCollapsed && (
            <button onClick={toggleSidebar} className="text-slate-400 hover:text-white transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {!sidebarCollapsed && (
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  {section.section}
                </span>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative ${
                      isActive 
                        ? "bg-accent/15 text-accent font-bold" 
                        : "hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-accent" : "text-slate-400 group-hover:text-slate-200"}`} />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[99]">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-900">
          {sidebarCollapsed ? (
            <button 
              onClick={toggleSidebar} 
              className="w-10 h-10 mx-auto rounded-lg hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center justify-between px-2 py-1 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white uppercase">
                  {user.name.slice(0,2)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">{user.role.replace("_", " ")}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-900 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* 2. Main Page Wrap */}
      <div 
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? 76 : 260 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white/70 dark:bg-[#02040a]/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            {getBreadcrumbs().map((b, idx, arr) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {idx === arr.length - 1 ? (
                  <span className="text-[#002B49] dark:text-slate-100 font-bold">{b.label}</span>
                ) : (
                  <Link to={b.path} className="hover:text-slate-800 dark:hover:text-slate-300 transition">
                    {b.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-4">
            
            {/* Search command bar trigger shortcut */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-lg text-slate-400 dark:text-slate-500 cursor-pointer select-none text-xs w-48 transition-all">
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left font-medium">Fuzzy Search...</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] rounded font-bold">⌘K</kbd>
            </div>

            {/* Dark mode switcher toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Alerts Notifications bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              </button>
              
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-premium p-4 text-xs z-[999]"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Appraisal Tasks Status</span>
                      <button className="text-[10px] text-accent hover:underline font-semibold" onClick={() => setNotificationsOpen(false)}>Close</button>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-md">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Celery appraisals task complete</p>
                        <span className="text-[9px] text-slate-400">10 minutes ago</span>
                      </div>
                      <div className="p-2 border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-md">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Audit logs tracking active</p>
                        <span className="text-[9px] text-slate-400">1 hour ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Trigger dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs uppercase cursor-pointer"
              >
                {user.name.slice(0,2)}
              </button>
              
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-premium p-2 text-xs z-[999]"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { setProfileDropdownOpen(false); navigate("/monitoring"); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Diagnostics logs</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-500 flex items-center gap-2 transition mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content body viewport */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
};
