import React, { useState } from "react";
import API_BASE_URL from "../config";
import "../styles/Upload.css";

export default function Upload({ onUploadComplete }) {
  const [company, setCompany] = useState("");
  const [files, setFiles] = useState({
    alm: null,
    shareholding: null,
    borrowing: null,
    annual: null,
    portfolio: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const documentTypes = [
    { key: "alm", label: "ALM" },
    { key: "shareholding", label: "Shareholding Pattern" },
    { key: "borrowing", label: "Borrowing Profile" },
    { key: "annual", label: "Annual Reports" },
    { key: "portfolio", label: "Portfolio Data" },
  ];

  const handleFileChange = (key, e) => {
    setFiles({ ...files, [key]: e.target.files[0] });
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!company) {
      setError("Company name is required");
      return;
    }

    // All 5 files must be present
    for (const key of Object.keys(files)) {
      if (!files[key]) {
        setError("Please upload all 5 required documents.");
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("alm", files.alm);
      formData.append("shareholding", files.shareholding);
      formData.append("borrowing", files.borrowing);
      formData.append("annual", files.annual);
      formData.append("portfolio", files.portfolio);

      const uploadRes = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");
      const { file_paths } = await uploadRes.json();

      // Pass uploaded files, company name, and file paths to classification page
      const uploadedFileObjects = [
        { name: files.alm.name, key: "alm" },
        { name: files.shareholding.name, key: "shareholding" },
        { name: files.borrowing.name, key: "borrowing" },
        { name: files.annual.name, key: "annual" },
        { name: files.portfolio.name, key: "portfolio" },
      ];
      if (onUploadComplete) onUploadComplete(uploadedFileObjects, company, file_paths);
      // Note: navigation happens in onUploadComplete handler
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = Object.values(files).filter(f => f !== null).length;

  return (
    <div className="upload-page">
      <div className="upload-main">
        <div className="upload-header">
          <h1>Document Upload</h1>
          <p>Submit financial documents for credit analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <label>Company Name</label>
            <input
              type="text"
              value={company}
              onChange={handleCompanyChange}
              placeholder="Enter company name"
              className="form-input"
            />
          </div>

          <div className="form-section">
            <div className="section-title">
              <label>Upload Documents</label>
              <span className="upload-count">{uploadedCount} / 5</span>
            </div>

            <div className="documents-grid">
              {documentTypes.map((doc) => (
                <div key={doc.key} className="document-slot">
                  <input
                    id={`file-${doc.key}`}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => handleFileChange(doc.key, e)}
                    className="file-input"
                  />
                  <label htmlFor={`file-${doc.key}`} className="document-label">
                    <div className="label-content">
                      <span className="doc-name">{doc.label}</span>
                      {files[doc.key] ? (
                        <span className="file-status">✓ {files[doc.key].name}</span>
                      ) : (
                        <span className="file-placeholder">Select file</span>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Processing..." : "Analyze"}
          </button>
        </form>
      </div>
    </div>
  );
}
