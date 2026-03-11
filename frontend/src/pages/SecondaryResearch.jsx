import React from "react";
import "../styles/Results.css";

export default function SecondaryResearch({ data }) {
  if (!data || !data.secondary_research) {
    return <div className="page-container">No secondary research data available</div>;
  }

  const research = data.secondary_research;
  const overall = research.overall_sentiment || {};

  return (
    <div className="page-container">
      <h1>Secondary Research & Market Analysis</h1>

      {/* Overall Sentiment */}
      <div className="data-card">
        <h3>Market Sentiment Overview</h3>
        <div className="sentiment-container">
          <div className="sentiment-box">
            <h4>Overall Sentiment</h4>
            <div className={`sentiment-score ${overall.label || "neutral"}`}>
              {overall.label?.toUpperCase() || "NEUTRAL"}
            </div>
            <p className="sentiment-value">Score: {(overall.score || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* News by Category */}
      <div className="data-card">
        <h3>News Analysis by Category</h3>

        {/* Regulatory */}
        <div className="research-section">
          <h4>Regulatory & Compliance News</h4>
          <div className="sentiment-badge">
            Sentiment: {(research.components?.regulatory?.sentiment || 0).toFixed(2)}
          </div>
          <p className="section-count">
            {research.components?.regulatory?.articles?.length || 0} articles found
          </p>
          {research.components?.regulatory?.articles && (
            <div className="articles-list">
              {research.components.regulatory.articles.slice(0, 5).map((article, idx) => (
                <div key={idx} className="article-item">
                  <h5>{article.title}</h5>
                  <p className="article-source">{article.source}</p>
                  <div className="article-sentiment">
                    <span className={`badge ${article.sentiment?.label || "neutral"}`}>
                      {article.sentiment?.label?.toUpperCase()}
                    </span>
                    <span className="sentiment-score">{(article.sentiment?.score || 0).toFixed(2)}</span>
                  </div>
                  <p className="article-desc">{article.description}</p>
                  {article.url && (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                      Read More →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market */}
        <div className="research-section">
          <h4>Market & Financial News</h4>
          <div className="sentiment-badge">
            Sentiment: {(research.components?.market?.sentiment || 0).toFixed(2)}
          </div>
          <p className="section-count">
            {research.components?.market?.articles?.length || 0} articles found
          </p>
          {research.components?.market?.articles && (
            <div className="articles-list">
              {research.components.market.articles.slice(0, 5).map((article, idx) => (
                <div key={idx} className="article-item">
                  <h5>{article.title}</h5>
                  <p className="article-source">{article.source}</p>
                  <div className="article-sentiment">
                    <span className={`badge ${article.sentiment?.label || "neutral"}`}>
                      {article.sentiment?.label?.toUpperCase()}
                    </span>
                    <span className="sentiment-score">{(article.sentiment?.score || 0).toFixed(2)}</span>
                  </div>
                  <p className="article-desc">{article.description}</p>
                  {article.url && (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                      Read More →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Competitive */}
        <div className="research-section">
          <h4>Competitive Landscape</h4>
          <div className="sentiment-badge">
            Sentiment: {(research.components?.competitive?.sentiment || 0).toFixed(2)}
          </div>
          <p className="section-count">
            {research.components?.competitive?.articles?.length || 0} articles found
          </p>
          {research.components?.competitive?.articles && (
            <div className="articles-list">
              {research.components.competitive.articles.slice(0, 5).map((article, idx) => (
                <div key={idx} className="article-item">
                  <h5>{article.title}</h5>
                  <p className="article-source">{article.source}</p>
                  <div className="article-sentiment">
                    <span className={`badge ${article.sentiment?.label || "neutral"}`}>
                      {article.sentiment?.label?.toUpperCase()}
                    </span>
                    <span className="sentiment-score">{(article.sentiment?.score || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Coverage */}
      {research.components?.media_coverage && (
        <div className="data-card">
          <h3>Media Coverage</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td>Total Mentions</td>
                <td className="currency">{research.components.media_coverage.mentions_count}</td>
              </tr>
              <tr>
                <td>Coverage Level</td>
                <td>
                  <span className={`badge ${research.components.media_coverage.coverage_level}`}>
                    {research.components.media_coverage.coverage_level?.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Sentiment Score</td>
                <td className="currency">
                  {(research.components.media_coverage.sentiment_score || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Risk Flags */}
      {research.risk_flags && research.risk_flags.length > 0 && (
        <div className="data-card warning-box">
          <h3>⚠️ Risk Flags from Research</h3>
          <ul className="risk-list">
            {research.risk_flags.map((flag, idx) => (
              <li key={idx} className="risk-item">
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Industry Trends */}
      {research.components?.industry_trends && (
        <div className="data-card">
          <h3>Industry Trends</h3>
          <div className="trends-box">
            <p>
              <strong>Sector Sentiment:</strong>{" "}
              <span className={`badge ${research.components.industry_trends.trend_label}`}>
                {research.components.industry_trends.trend_label?.toUpperCase()}
              </span>
            </p>
            <p>
              <strong>Trend Score:</strong> {(research.components.industry_trends.trend_sentiment || 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
