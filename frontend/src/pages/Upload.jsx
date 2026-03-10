import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import "../styles/Upload.css";

export default function Upload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!file || !company) {
      setError("Please select a PDF and enter a company name.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");
      const { file_path } = await uploadRes.json();

      const analyzeRes = await fetch(
        `${API_BASE_URL}/analyze/?file_path=${encodeURIComponent(file_path)}&company=${encodeURIComponent(company)}`,
        { method: "POST" }
      );
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const data = await analyzeRes.json();

      onAnalysisComplete(data);
      navigate("/results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>Intelli-Credit Analyzer</h1>
        <p className="subtitle">AI-Powered Corporate Credit Analysis</p>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="pdf-file">Upload PDF Document</label>
            <input
              id="pdf-file"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="company-name">Company Name</label>
            <input
              id="company-name"
              type="text"
              value={company}
              onChange={handleCompanyChange}
              placeholder="Enter company name"
              className="text-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? "loading" : ""}`}
          >
            {loading ? "Analyzing Document..." : "Analyze Document"}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="info-box">
          <h3>Analysis Features</h3>
          <ul>
            <li>Extract financial data from PDF documents</li>
            <li>Calculate financial ratios and metrics</li>
            <li>Perform comprehensive risk assessment</li>
            <li>Gather company news and sentiment analysis</li>
            <li>Generate Credit Appraisal Memo (CAM)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
