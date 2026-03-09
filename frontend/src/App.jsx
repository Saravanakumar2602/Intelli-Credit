import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Upload from "./pages/Upload";
import FinancialData from "./pages/FinancialData";
import FinancialRatios from "./pages/FinancialRatios";
import RiskAssessment from "./pages/RiskAssessment";
import NewsSentiment from "./pages/NewsSentiment";
import CreditAppraisalMemo from "./pages/CreditAppraisalMemo";
import "./App.css";

function ResultsNavigation() {
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
        <button className="nav-home" onClick={() => navigate("/")}>
          ← Back to Upload
        </button>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload onAnalysisComplete={handleAnalysisComplete} />} />
        <Route
          path="/results"
          element={
            <>
              <ResultsNavigation />
              <FinancialData data={analysisData} />
            </>
          }
        />
        <Route
          path="/ratios"
          element={
            <>
              <ResultsNavigation />
              <FinancialRatios data={analysisData} />
            </>
          }
        />
        <Route
          path="/risk"
          element={
            <>
              <ResultsNavigation />
              <RiskAssessment data={analysisData} />
            </>
          }
        />
        <Route
          path="/news"
          element={
            <>
              <ResultsNavigation />
              <NewsSentiment data={analysisData} />
            </>
          }
        />
        <Route
          path="/cam"
          element={
            <>
              <ResultsNavigation />
              <CreditAppraisalMemo data={analysisData} />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
