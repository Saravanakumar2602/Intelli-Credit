import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppProvider } from "../contexts/AppContext";
import { ToastProvider, useToast } from "../components/ui/Toast";
import { DashboardLayout } from "../layouts/DashboardLayout";
import CommandPalette from "../components/ui/CommandPalette";

// Pages
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";
import DashboardOverview from "../features/dashboard/DashboardOverview";
import CompaniesList from "../features/dashboard/CompaniesList";
import ApplicationsList from "../features/dashboard/ApplicationsList";
import EntityOnboarding from "../features/onboarding/EntityOnboarding";
import UploadDocuments from "../features/appraisal/UploadDocuments";
import FileClassification from "../features/appraisal/FileClassification";
import DashboardWorkspace from "../features/appraisal/DashboardWorkspace";
import SystemMonitoring from "../features/monitoring/SystemMonitoring";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function RoutesWrapper() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadState, setUploadState] = useState<any>({ company: "", filePaths: null });

  const handleUploadComplete = (files: any[], company: string, filePaths: any) => {
    setUploadedFiles(files);
    setUploadState({ company, filePaths });
    navigate("/classify");
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Private routes wrapped in Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardOverview />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CompaniesList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies/onboarding"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EntityOnboarding />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ApplicationsList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UploadDocuments onUploadComplete={handleUploadComplete} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classify"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FileClassification
                files={uploadedFiles}
                company={uploadState.company}
                filePaths={uploadState.filePaths}
                onApprove={() => {
                  navigate("/workspace", { state: { loan_application_id: Number(Object.keys(uploadState.filePaths || {})[0]?.split("_")[1] || 1) } });
                }}
              />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardWorkspace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SystemMonitoring />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <RoutesWrapper />
          <CommandPalette />
        </Router>
      </ToastProvider>
    </AppProvider>
  );
}
