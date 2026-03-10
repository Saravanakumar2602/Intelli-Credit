import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Upload from "./pages/Upload";
import FinancialData from "./pages/FinancialData";
import FinancialRatios from "./pages/FinancialRatios";
import RiskAssessment from "./pages/RiskAssessment";
import NewsSentiment from "./pages/NewsSentiment";
import CreditAppraisalMemo from "./pages/CreditAppraisalMemo";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

function ResultsNavigation({ onLogout }) {
  const navigate = useNavigate();
  const navItems = [
    { path: "/results", label: "Financial Data" },
    { path: "/ratios", label: "Financial Ratios" },
    { path: "/risk", label: "Risk Assessment" },
    { path: "/news", label: "News & Sentiment" },
    { path: "/cam", label: "Credit Memo" },
  ];
  return (
    <nav className="results-nav">
      <div className="nav-container">
        <button className="nav-home" onClick={() => navigate("/upload")}>
          Back to Upload
        </button>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
        <button className="nav-logout" onClick={onLogout} style={{marginLeft: 24}}>
          Logout
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuth(!!token);
    setLoading(false);
  }, []);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth(false);
  };

  // Protect routes: if not authenticated, redirect to login
  const Protected = ({ children }) => (auth ? children : <Navigate to="/login" replace />);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/upload"
          element={
            <Protected>
              <Upload onAnalysisComplete={handleAnalysisComplete} />
            </Protected>
          }
        />
        <Route
          path="/results"
          element={
            <Protected>
              <ResultsNavigation onLogout={handleLogout} />
              <FinancialData data={analysisData} />
            </Protected>
          }
        />
        <Route
          path="/ratios"
          element={
            <Protected>
              <ResultsNavigation onLogout={handleLogout} />
              <FinancialRatios data={analysisData} />
            </Protected>
          }
        />
        <Route
          path="/risk"
          element={
            <Protected>
              <ResultsNavigation onLogout={handleLogout} />
              <RiskAssessment data={analysisData} />
            </Protected>
          }
        />
        <Route
          path="/news"
          element={
            <Protected>
              <ResultsNavigation onLogout={handleLogout} />
              <NewsSentiment data={analysisData} />
            </Protected>
          }
        />
        <Route
          path="/cam"
          element={
            <Protected>
              <ResultsNavigation onLogout={handleLogout} />
              <CreditAppraisalMemo data={analysisData} />
            </Protected>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
