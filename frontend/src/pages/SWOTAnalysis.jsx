import React from "react";
import "../styles/Results.css";

export default function SWOTAnalysis({ data }) {
  if (!data || !data.swot) {
    return <div className="page-container">No SWOT analysis available</div>;
  }

  const swot = data.swot;

  return (
    <div className="page-container">
      <h1>SWOT Analysis</h1>

      {/* Overall Assessment */}
      {swot.overall_assessment && (
        <div className="data-card summary-box">
          <h3>Strategic Assessment</h3>
          <p>{swot.overall_assessment}</p>
        </div>
      )}

      {/* SWOT Grid */}
      <div className="swot-grid">
        {/* Strengths */}
        <div className="swot-card strengths">
          <h3>Strengths</h3>
          <div className="swot-items">
            {swot.strengths && swot.strengths.length > 0 ? (
              swot.strengths.map((item, idx) => (
                <div key={idx} className="swot-item">
                  <div className="item-header">
                    <h4>{item.point}</h4>
                    <span className={`impact-badge ${item.impact || "medium"}`}>
                      {item.impact?.toUpperCase()}
                    </span>
                  </div>
                  <p className="item-evidence">{item.evidence}</p>
                </div>
              ))
            ) : (
              <p className="no-data">No strengths identified</p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="swot-card weaknesses">
          <h3>Weaknesses</h3>
          <div className="swot-items">
            {swot.weaknesses && swot.weaknesses.length > 0 ? (
              swot.weaknesses.map((item, idx) => (
                <div key={idx} className="swot-item">
                  <div className="item-header">
                    <h4>{item.point}</h4>
                    <span className={`impact-badge ${item.impact || "medium"}`}>
                      {item.impact?.toUpperCase()}
                    </span>
                  </div>
                  <p className="item-evidence">{item.evidence}</p>
                </div>
              ))
            ) : (
              <p className="no-data">No weaknesses identified</p>
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div className="swot-card opportunities">
          <h3>Opportunities</h3>
          <div className="swot-items">
            {swot.opportunities && swot.opportunities.length > 0 ? (
              swot.opportunities.map((item, idx) => (
                <div key={idx} className="swot-item">
                  <div className="item-header">
                    <h4>{item.point}</h4>
                    <span className={`potential-badge ${item.potential || "medium"}`}>
                      {item.potential?.toUpperCase()}
                    </span>
                  </div>
                  <p className="item-evidence">{item.evidence}</p>
                </div>
              ))
            ) : (
              <p className="no-data">No opportunities identified</p>
            )}
          </div>
        </div>

        {/* Threats */}
        <div className="swot-card threats">
          <h3>Threats</h3>
          <div className="swot-items">
            {swot.threats && swot.threats.length > 0 ? (
              swot.threats.map((item, idx) => (
                <div key={idx} className="swot-item">
                  <div className="item-header">
                    <h4>{item.point}</h4>
                    <span className={`severity-badge ${item.severity || "medium"}`}>
                      {item.severity?.toUpperCase()}
                    </span>
                  </div>
                  <p className="item-evidence">{item.evidence}</p>
                </div>
              ))
            ) : (
              <p className="no-data">No threats identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Focus Areas */}
      {swot.key_focus_areas && swot.key_focus_areas.length > 0 && (
        <div className="data-card">
          <h3>Key Focus Areas</h3>
          <div className="focus-areas">
            {swot.key_focus_areas.map((area, idx) => (
              <div key={idx} className="focus-item">
                <span className="focus-badge">{idx + 1}</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
