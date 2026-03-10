import React from "react";
import "../styles/Results.css";

export default function FinancialRatios({ data }) {
  if (!data || !data.ratios) {
    return <div className="page-container">No ratio data available</div>;
  }

  const mainRatios = ['profit_margin', 'debt_ratio', 'leverage'];
  const ratioDescriptions = {
    profit_margin: "Percentage of revenue that becomes profit",
    debt_ratio: "Proportion of assets financed by debt",
    leverage: "Financial leverage ratio measuring debt-to-equity"
  };

  const getInterpretation = (key, value) => {
    if (key === "profit_margin") {
      if (value > 0.1) return "Strong profitability - Company generates healthy profits";
      if (value > 0.05) return "Moderate profitability - Room for improvement";
      return "Weak profitability - Focus on cost management";
    }
    if (key === "debt_ratio") {
      if (value < 0.6) return "Healthy debt levels - Low financial risk";
      if (value < 0.8) return "Moderate debt - Acceptable risk level";
      return "High debt - Elevated financial risk";
    }
    if (key === "leverage") {
      if (value < 2) return "Conservative leverage - Stable financial structure";
      if (value < 3) return "Moderate leverage - Balanced approach";
      return "Aggressive leverage - Higher financial risk";
    }
    return "";
  };

  return (
    <div className="page-container">
      <h1>Financial Ratios Analysis</h1>
      
      <div className="ratios-summary">
        <p className="section-intro">
          Financial ratios measure the company's financial health and performance
        </p>
      </div>

      <div className="ratios-grid">
        {mainRatios.map((key) => {
          const value = data.ratios[key];
          return (
            <div key={key} className="ratio-card-large">
              <div className="ratio-header">
                <h3>{key.replace(/_/g, " ").toUpperCase()}</h3>
              </div>
              
              <div className="ratio-content">
                <div className="ratio-value-large">{Number(value).toFixed(4)}</div>
                <p className="ratio-description">{ratioDescriptions[key]}</p>
                
                <div className="ratio-bar-container">
                  <div className="ratio-bar">
                    <div
                      className="ratio-fill"
                      style={{ width: `${Math.min(Number(value) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="ratio-interpretation">
                  <span className="text">{getInterpretation(key, value)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="analysis-box">
        <h3>Overall Financial Health Assessment</h3>
        <div className="assessment-items">
          <div className="assessment-item">
            <h4>Profitability</h4>
            <p>
              Profit Margin: {(data.ratios.profit_margin * 100).toFixed(2)}% - 
              {data.ratios.profit_margin > 0.1 
                ? "Company demonstrates strong profitability and operational efficiency"
                : data.ratios.profit_margin > 0.05 
                ? "Company has moderate profitability with potential for improvement"
                : "Company faces profitability challenges requiring attention"}
            </p>
          </div>
          
          <div className="assessment-item">
            <h4>Debt Management</h4>
            <p>
              Debt Ratio: {(data.ratios.debt_ratio * 100).toFixed(2)}% - 
              {data.ratios.debt_ratio < 0.6 
                ? "Healthy debt levels indicate low financial risk and strong balance sheet"
                : data.ratios.debt_ratio < 0.8 
                ? "Moderate debt levels are within acceptable ranges"
                : "High debt levels indicate elevated financial risk"}
            </p>
          </div>
          
          <div className="assessment-item">
            <h4>Leverage Position</h4>
            <p>
              Leverage Ratio: {data.ratios.leverage.toFixed(4)}x - 
              {data.ratios.leverage < 2 
                ? "Company maintains conservative leverage with stable operations"
                : data.ratios.leverage < 3 
                ? "Company uses moderate leverage in its capital structure"
                : "Company employs aggressive leverage increasing financial risk"}
            </p>
          </div>
        </div>
      </div>

      <div className="recommendations-box">
        <h3>Key Recommendations</h3>
        <ul>
          <li>Monitor Trends: Track these ratios over time to identify improving or deteriorating trends</li>
          <li>Industry Comparison: Compare with industry benchmarks to assess relative performance</li>
          <li>Holistic View: Consider these ratios alongside other metrics for comprehensive analysis</li>
          <li>Action Items: Based on findings, prioritize improvements in weaker areas</li>
        </ul>
      </div>
    </div>
  );
}
