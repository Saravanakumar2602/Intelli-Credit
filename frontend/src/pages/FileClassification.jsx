import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config";
import "../styles/FileClassification.css";

const defaultSchema = [
  { name: "revenue", type: "number" },
  { name: "net_profit", type: "number" },
  { name: "total_assets", type: "number" },
  { name: "total_liabilities", type: "number" },
];

export default function FileClassification({ files, company, filePaths, onSchemaChange, onApprove }) {
  const [classified, setClassified] = useState([]);
  const [schema, setSchema] = useState(defaultSchema);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (files && files.length > 0) {
      setClassified(
        files.map((file) => ({
          name: typeof file === 'string' ? file : file.name,
          type: "Auto-Detected",
          approved: true,
        }))
      );
    } else {
      setClassified([
        { name: "sample_Annual_Reports.pdf", type: "Annual Report", approved: true },
        { name: "sample_ALM.pdf", type: "ALM", approved: true },
        { name: "sample_Borrowing_Profile.pdf", type: "Borrowing Profile", approved: true },
        { name: "sample_Portfolio_Performance.pdf", type: "Portfolio", approved: true },
        { name: "sample_Shareholding_Pattern.pdf", type: "Shareholding", approved: true },
      ]);
    }
  }, [files]);

  const handleApproveLocal = async () => {
    if (!company || !filePaths) {
      setError("Company name or file paths missing. Please go back and upload again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const analyzeRes = await fetch(
        `${API_BASE_URL}/analyze/?file_path=${encodeURIComponent(JSON.stringify(filePaths))}&company=${encodeURIComponent(company)}`,
        { method: "POST" }
      );
      if (!analyzeRes.ok) {
        throw new Error(`Analysis failed with status ${analyzeRes.status}`);
      }
      const analysisResults = await analyzeRes.json();
      
      if (onApprove) {
        onApprove(classified, schema, analysisResults);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApprove = (idx, approved) => {
    setClassified((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, approved } : f))
    );
  };

  const handleEditType = (idx, type) => {
    setClassified((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, type } : f))
    );
  };

  const handleSchemaChange = (idx, key, value) => {
    setSchema((prev) =>
      prev.map((field, i) => (i === idx ? { ...field, [key]: value } : field))
    );
    if (onSchemaChange) onSchemaChange(schema);
  };

  const approvedCount = classified.filter(f => f.approved).length;

  return (
    <div className="classification-container">
      <div className="classification-main">
        <div className="classification-header">
          <h1>File Classification</h1>
          <p>Review and classify your uploaded documents</p>
        </div>

        <div className="company-info">
          <div className="company-details">
            <h3>Company</h3>
            <p>{company || "N/A"}</p>
          </div>
          <div className="progress-info">
            <div className="progress-item">
              <div className="number">{approvedCount}</div>
              <div className="label">Approved</div>
            </div>
            <div className="progress-item">
              <div className="number">{classified.length}</div>
              <div className="label">Total Files</div>
            </div>
            <div className="progress-item">
              <div className="number">{schema.length}</div>
              <div className="label">Schema Fields</div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="classification-section">
          <div className="section-header">
            <h2>Document Classification</h2>
            <span className="section-label">{classified.length} Files</span>
          </div>
          <div className="file-list">
            {classified.map((file, idx) => (
              <div key={file.name} className="file-item">
                <span className="file-name">{file.name}</span>
                <select
                  value={file.type}
                  onChange={(e) => handleEditType(idx, e.target.value)}
                >
                  <option value="Auto-Detected">Auto-Detected</option>
                  <option value="ALM">ALM</option>
                  <option value="Annual Report">Annual Report</option>
                  <option value="Borrowing Profile">Borrowing Profile</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Shareholding">Shareholding</option>
                </select>
                <button
                  className={file.approved ? "approve-btn" : "deny-btn"}
                  onClick={() => handleApprove(idx, !file.approved)}
                >
                  {file.approved ? "Approved" : "Denied"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="classification-section">
          <div className="section-header">
            <h2>Output Schema Configuration</h2>
            <span className="section-label">{schema.length} Fields</span>
          </div>
          <div className="schema-list">
            {schema.map((field, idx) => (
              <div key={field.name} className="schema-item">
                <input
                  value={field.name}
                  onChange={(e) => handleSchemaChange(idx, "name", e.target.value)}
                  placeholder="Field Name"
                />
                <select
                  value={field.type}
                  onChange={(e) => handleSchemaChange(idx, "type", e.target.value)}
                >
                  <option value="number">Number</option>
                  <option value="string">String</option>
                  <option value="date">Date</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button className="submit-btn" onClick={handleApproveLocal} disabled={loading}>
            {loading ? "Analyzing..." : "Ingest & Extract"}
          </button>
        </div>
      </div>
    </div>
  );
}
