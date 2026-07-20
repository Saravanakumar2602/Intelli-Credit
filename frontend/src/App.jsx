import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import Upload from "./pages/Upload";
import FileClassification from "./pages/FileClassification";
import EntityOnboarding from "./pages/EntityOnboarding";
import FinancialData from "./pages/FinancialData";
import FinancialRatios from "./pages/FinancialRatios";
import RiskAssessment from "./pages/RiskAssessment";
import NewsSentiment from "./pages/NewsSentiment";
import CreditAppraisalMemo from "./pages/CreditAppraisalMemo";
import SecondaryResearch from "./pages/SecondaryResearch";
import SWOTAnalysis from "./pages/SWOTAnalysis";
import Recommendation from "./pages/Recommendation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

// Unified navigation bar for the application
function ResultsNavigation({ onLogout, hasResults }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const resultsItems = [
    { path: "/results", label: "Financial Data" },
    { path: "/ratios", label: "Ratios" },
    { path: "/risk", label: "Risk" },
    { path: "/secondary", label: "Secondary Research" },
    { path: "/swot", label: "SWOT Analysis" },
    { path: "/recommendation", label: "Recommendation" },
    { path: "/news", label: "News & Sentiment" },
    { path: "/cam", label: "Credit Memo" },
  ];

  return (
    <nav className="results-nav pill-navbar">
      <div className="nav-pill-container">
        <div className="nav-logo" onClick={() => navigate("/upload")}>
          Intelli<span style={{ color: '#003d82', fontWeight: 700 }}>Credit</span>
        </div>
        <div className="nav-links-centered">
          <Link to="/upload" className={`nav-link${currentPath === "/upload" ? " active" : ""}`}>
            Dashboard
          </Link>
          <Link to="/onboarding" className={`nav-link${currentPath === "/onboarding" ? " active" : ""}`}>
            Onboarding
          </Link>
          {hasResults && (
            <>
              <div className="nav-divider" style={{ width: '1px', height: '24px', background: '#e1e4e8', margin: '0 8px' }}></div>
              {resultsItems.map((item) => (
                <Link key={item.path} to={item.path} className={`nav-link${currentPath === item.path ? " active" : ""}`}>
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </div>
        <div className="nav-actions">
          <button className="nav-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

const Protected = ({ children, auth }) => (auth ? children : <Navigate to="/login" replace />);

function RoutesWrapper({
  analysisData,
  setAnalysisData,
  uploadedFiles,
  setUploadedFiles,
  auth,
  setAuth,
  handleLogout,
}) {
  const navigate = useNavigate();
  const [uploadState, setUploadState] = React.useState({ files: [], company: "", filePaths: null });

  const handleUploadComplete = (files, company, filePaths) => {
    setUploadState({ files, company, filePaths });
    setUploadedFiles(files);
    navigate("/classify");
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setAuth={setAuth} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route
        path="/onboarding"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <EntityOnboarding onSubmit={(data) => { console.log('Onboarding data:', data); }} />
          </Protected>
        }
      />
      
      <Route
        path="/upload"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <Upload
              onUploadComplete={handleUploadComplete}
            />
          </Protected>
        }
      />
      <Route
        path="/classify"
        element={
          <Protected auth={auth}>
            <FileClassification
              files={uploadedFiles}
              company={uploadState.company}
              filePaths={uploadState.filePaths}
              onApprove={(classified, schema, analysisResults) => {
                setAnalysisData(analysisResults || { classified, schema });
                navigate("/results");
              }}
            />
          </Protected>
        }
      />
      <Route
        path="/results"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <FinancialData data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/ratios"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <FinancialRatios data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/risk"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <RiskAssessment data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/news"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <NewsSentiment data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/cam"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <CreditAppraisalMemo data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/secondary"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <SecondaryResearch data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/swot"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <SWOTAnalysis data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/recommendation"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} hasResults={!!analysisData} />
            <Recommendation data={analysisData} />
          </Protected>
        }
      />
    </Routes>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuth(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
  };

  return (
    <Router>
      <RoutesWrapper
        analysisData={analysisData}
        setAnalysisData={setAnalysisData}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        auth={auth}
        setAuth={setAuth}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;

