import { lazy, Suspense } from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { AppShell } from "@/layouts/AppShell";
import { SkeletonReport } from "@/components/app/Skeletons";

// Auth (small, keep eager)
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Lazy app pages — code-splits each route for a faster first paint
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Applications = lazy(() => import("@/pages/Applications"));
const ApplicationDetail = lazy(() => import("@/pages/ApplicationDetail"));
const CompanyProfile = lazy(() => import("@/pages/CompanyProfile"));
const Upload = lazy(() => import("@/pages/Upload"));
const DocumentPreview = lazy(() => import("@/pages/DocumentPreview"));
const AIAnalysis = lazy(() => import("@/pages/AIAnalysis"));
const RiskAssessment = lazy(() => import("@/pages/RiskAssessment"));
const CAMViewer = lazy(() => import("@/pages/CAMViewer"));
const Reports = lazy(() => import("@/pages/Reports"));
const History = lazy(() => import("@/pages/History"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const GlobalSearch = lazy(() => import("@/pages/GlobalSearch"));
const AuditLog = lazy(() => import("@/pages/AuditLog"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));

function RouteFallback() {
  return (
    <div className="p-2">
      <SkeletonReport />
    </div>
  );
}

export default function App() {
  const initialEntry = getInitialEntry();

  return (
    <TooltipProvider delayDuration={150}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to main content
          </a>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/companies/:id" element={<CompanyProfile />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/documents/:id" element={<DocumentPreview />} />
                <Route path="/analysis" element={<AIAnalysis />} />
                <Route path="/analysis/:id" element={<AIAnalysis />} />
                <Route path="/risk" element={<RiskAssessment />} />
                <Route path="/cam" element={<CAMViewer />} />
                <Route path="/cam/:id" element={<CAMViewer />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/history" element={<History />} />
                <Route path="/search" element={<GlobalSearch />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </MemoryRouter>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </TooltipProvider>
  );
}

function getInitialEntry() {
  if (typeof window === "undefined") return "/dashboard";

  const hashRoute = window.location.hash.replace(/^#/, "");
  if (hashRoute.startsWith("/")) return hashRoute;

  const pathRoute = window.location.pathname;
  if (pathRoute && pathRoute !== "/") return pathRoute;

  return "/dashboard";
}
