import React from "react";
import "../styles/Results.css";

export default function Recommendation({ data }) {
  if (!data || !data.recommendation) {
    return <div className="page-container">No recommendation available</div>;
  }

  const rec = data.recommendation;
  const decision = rec.decision || "UNKNOWN";

  const getDecisionColor = (decision) => {
    switch (decision) {
      case "APPROVE":
        return "#10b981";
      case "CONDITIONAL_APPROVE":
        return "#f59e0b";
      case "REJECT":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getDecisionLabel = (decision) => {
    switch (decision) {
      case "APPROVE":
        return "✓ APPROVE";
      case "CONDITIONAL_APPROVE":
        return "⚠ CONDITIONAL APPROVAL";
      case "REJECT":
        return "✗ REJECT";
      default:
        return "PENDING";
    }
  };

  return (
    <div className="page-container">
      <h1>Loan Approval Recommendation</h1>

      {/* Main Decision */}
      <div className="data-card decision-card" style={{ borderTopColor: getDecisionColor(decision) }}>
        <div className="decision-header">
          <h2 style={{ color: getDecisionColor(decision) }}>{getDecisionLabel(decision)}</h2>
          <div className="confidence-meter">
            <div className="confidence-bar" style={{ width: `${rec.confidence || 0}%` }}></div>
          </div>
          <p className="confidence-text">Confidence Score: {(rec.confidence || 0).toFixed(0)}/100</p>
        </div>

        <div className="decision-summary">
          <p>{rec.recommendation_summary}</p>
        </div>

        {/* Approval Probability */}
        <div className="probability-box">
          <span>Approval Probability:</span>
          <span className="probability-value">
            {((rec.approval_probability || 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Financial Analysis */}
      {rec.reasoning?.financial && (
        <div className="data-card reasoning-section">
          <h3>Financial Health Analysis</h3>
          <div className="score-display">
            <div className="score-circle">
              <span className="score-value">{rec.reasoning.financial.score}</span>
              <span className="score-max">/{rec.reasoning.financial.max_score}</span>
            </div>
          </div>
          <div className="analysis-list">
            {rec.reasoning.financial.analysis.map((point, idx) => (
              <div key={idx} className="analysis-point">
                <span className="point-icon">{point.startsWith("✓") ? "✓" : point.startsWith("✗") ? "✗" : "⚠"}</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {rec.reasoning?.risk && (
        <div className="data-card reasoning-section">
          <h3>Risk Assessment</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td>Risk Score</td>
                <td className="currency">{rec.reasoning.risk.score.toFixed(0)}/100</td>
              </tr>
              <tr>
                <td>Risk Level</td>
                <td>
                  <span className={`badge ${rec.reasoning.risk.label?.toLowerCase()}`}>
                    {rec.reasoning.risk.label}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Secondary Research Analysis */}
      {rec.reasoning?.secondary_research && (
        <div className="data-card reasoning-section">
          <h3>Secondary Research Insights</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td>Market Sentiment</td>
                <td>
                  <span className={`badge ${rec.reasoning.secondary_research.sentiment_label?.toLowerCase()}`}>
                    {rec.reasoning.secondary_research.sentiment_label?.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Sentiment Score</td>
                <td>{rec.reasoning.secondary_research.sentiment_score.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Data Quality */}
      {rec.reasoning?.data_quality && (
        <div className="data-card reasoning-section">
          <h3>Data Validation & Quality</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td>Validation Status</td>
                <td>
                  <span className={`badge ${rec.reasoning.data_quality.status?.toLowerCase()}`}>
                    {rec.reasoning.data_quality.status?.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Confidence Score</td>
                <td className="currency">{rec.reasoning.data_quality.confidence.toFixed(0)}/100</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Positive Factors */}
      {rec.positive_factors && rec.positive_factors.length > 0 && (
        <div className="data-card positive-box">
          <h3>✓ Positive Factors</h3>
          <ul className="factor-list">
            {rec.positive_factors.map((factor, idx) => (
              <li key={idx} className="positive-factor">
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {rec.risk_factors && rec.risk_factors.length > 0 && (
        <div className="data-card negative-box">
          <h3>⚠️ Risk Factors</h3>
          <ul className="factor-list">
            {rec.risk_factors.map((factor, idx) => (
              <li key={idx} className="risk-factor">
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conditions (if any) */}
      {rec.conditions && rec.conditions.length > 0 && (
        <div className="data-card conditions-box">
          <h3>📋 Approval Conditions</h3>
          <ol className="conditions-list">
            {rec.conditions.map((condition, idx) => (
              <li key={idx}>{condition}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Next Steps */}
      {rec.next_steps && rec.next_steps.length > 0 && (
        <div className="data-card next-steps-box">
          <h3>→ Next Steps</h3>
          <ol className="next-steps-list">
            {rec.next_steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
