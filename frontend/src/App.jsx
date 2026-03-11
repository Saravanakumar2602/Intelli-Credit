import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
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

function ResultsNavigation({ onLogout }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const navItems = [
    { path: "/results", label: "Financial Data" },
    { path: "/ratios", label: "Financial Ratios" },
    { path: "/risk", label: "Risk Assessment" },
    { path: "/secondary", label: "Secondary Research" },
    { path: "/swot", label: "SWOT Analysis" },
    { path: "/recommendation", label: "Recommendation" },
    { path: "/news", label: "News & Sentiment" },
    { path: "/cam", label: "Credit Memo" },
  ];
  return (
    <nav className="results-nav pill-navbar">
      <div className="nav-pill-container">
        <div className="nav-logo" onClick={() => navigate("/upload")}>Intelli<span style={{color:'#003d82', fontWeight:700}}>Credit</span></div>
        <div className="nav-links-centered">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`nav-link${location === item.path ? " active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <Link to="/onboarding" className={`nav-link${location === "/onboarding" ? " active" : ""}`}>Onboarding</Link>
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
      <Route path="/onboarding" element={<EntityOnboarding onSubmit={(data) => {console.log('Onboarding data:', data);}} />} />
      <Route path="/login" element={<Login setAuth={setAuth} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/upload"
        element={
          <Protected auth={auth}>
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
            <ResultsNavigation onLogout={handleLogout} />
            <FinancialData data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/ratios"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <FinancialRatios data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/risk"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <RiskAssessment data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/news"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <NewsSentiment data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/cam"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <CreditAppraisalMemo data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/secondary"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <SecondaryResearch data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/swot"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
            <SWOTAnalysis data={analysisData} />
          </Protected>
        }
      />
      <Route
        path="/recommendation"
        element={
          <Protected auth={auth}>
            <ResultsNavigation onLogout={handleLogout} />
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
