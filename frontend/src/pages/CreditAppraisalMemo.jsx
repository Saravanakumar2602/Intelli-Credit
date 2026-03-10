import React, { useState } from "react";
import API_BASE_URL from "../config";
import "../styles/Results.css";

export default function CreditAppraisalMemo({ data }) {
  const [downloading, setDownloading] = useState(false);

  if (!data || !data.cam_report) {
    return <div className="page-container">No CAM data available</div>;
  }

  const handleDownloadCAM = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/download/?file_path=${encodeURIComponent(data.cam_report)}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.cam_report.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Credit Appraisal Memo (CAM)</h1>

      <div className="cam-container">
        <div className="cam-info">
          <div className="info-box">
            <h3>Document Information</h3>
            <ul>
              <li>
                <strong>Status:</strong> <span className="status-badge">Generated</span>
              </li>
              <li>
                <strong>Format:</strong> PDF (Portable Document Format)
              </li>
              <li>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </li>
              <li>
                <strong>File:</strong> {data.cam_report.split("/").pop()}
              </li>
            </ul>
          </div>

          <div className="download-box">
            <h3>Download Report</h3>
            <p>
              The Credit Appraisal Memo includes comprehensive financial analysis, risk
              assessment, and recommendations for credit decision.
            </p>
            <button
              onClick={handleDownloadCAM}
              disabled={downloading}
              className="download-btn"
            >
              {downloading ? "Downloading..." : "Download CAM Report (PDF)"}
            </button>
          </div>
        </div>

        <div className="cam-contents">
          <h3>Report Contents</h3>
          <ul className="contents-list">
            <li>Company Information & Date</li>
            <li>Financial Summary (Revenue, Profit, Assets, Debt, Liabilities)</li>
            <li>Financial Ratios (Profit Margin, Debt Ratio, Leverage)</li>
            <li>Risk Assessment & Scoring</li>
            <li>Credit Recommendation</li>
            <li>Disclaimer & Review Notes</li>
          </ul>
        </div>

        <div className="cam-usage">
          <h3>How to Use This Report</h3>
          <ol>
            <li>Download the PDF document using the button above</li>
            <li>Review the financial summary and ratios</li>
            <li>Check the risk assessment and recommendation</li>
            <li>Present to credit committee for approval decision</li>
            <li>Maintain the document in credit file for audit trail</li>
          </ol>
        </div>

        <div className="disclaimer-box">
          <p>
            <strong>Disclaimer:</strong> This AI-generated Credit Appraisal Memo is
            intended as a preliminary analysis tool. All final credit decisions must be
            reviewed and approved by qualified credit officers in accordance with bank
            policies and regulatory requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
