import React from "react";
import "../styles/Results.css";

export default function FinancialData({ data }) {
  if (!data || !data.financials) {
    return <div className="page-container">No financial data available</div>;
  }

  return (
    <div className="page-container">
      <h1>Financial Summary</h1>
      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.financials).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replace(/_/g, " ").toUpperCase()}</td>
                <td className="currency">
                  {typeof value === "number" ? value.toLocaleString("en-IN") : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-box">
        <h3>Key Insights</h3>
        {data.ratios && (
          <ul>
            <li>
              <strong>Profit Margin:</strong> {(data.ratios.profit_margin * 100).toFixed(2)}%
            </li>
            <li>
              <strong>Debt Ratio:</strong> {(data.ratios.debt_ratio * 100).toFixed(2)}%
            </li>
            <li>
              <strong>Leverage:</strong> {data.ratios.leverage.toFixed(4)}x
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
