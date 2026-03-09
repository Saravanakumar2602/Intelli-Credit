import React from "react";
import "../styles/Results.css";

export default function NewsSentiment({ data }) {
  if (!data || !data.news) {
    return <div className="page-container">No news data available</div>;
  }

  const { sentiment, articles } = data.news;

  const getSentimentColor = (sent) => {
    if (sent > 0.5) return "#27ae60";
    if (sent > 0.2) return "#f39c12";
    return "#e74c3c";
  };

  const getSentimentLabel = (sent) => {
    if (sent > 0.5) return "Positive";
    if (sent > 0.2) return "Neutral";
    return "Negative";
  };

  return (
    <div className="page-container">
      <h1>News & Sentiment Analysis</h1>

      <div className="sentiment-summary">
        <div className="sentiment-card" style={{ borderLeftColor: getSentimentColor(sentiment) }}>
          <h2 style={{ color: getSentimentColor(sentiment) }}>
            {getSentimentLabel(sentiment)}
          </h2>
          <p className="sentiment-score">Score: {(sentiment * 100).toFixed(1)}%</p>
          <p className="sentiment-desc">
            {sentiment > 0.5
              ? "Overall positive market sentiment"
              : sentiment > 0.2
              ? "Mixed market sentiment"
              : "Overall negative market sentiment"}
          </p>
        </div>
      </div>

      <div className="articles-section">
        <h2>Recent Articles ({articles?.length || 0})</h2>
        {articles && articles.length > 0 ? (
          <div className="articles-list">
            {articles.slice(0, 5).map((article, idx) => (
              <div key={idx} className="article-card">
                <h4>{article.title}</h4>
                <p>{article.description}</p>
                <div className="article-meta">
                  <span className="source">{article.source?.name || "Unknown"}</span>
                  <span className="date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                  Read More →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-articles">No recent articles found for this company.</p>
        )}
      </div>

      <div className="sentiment-insights">
        <h3>Market Insights</h3>
        <ul>
          <li>
            <strong>Media Coverage:</strong> {articles?.length || 0} articles found
          </li>
          <li>
            <strong>Sentiment Trend:</strong> {getSentimentLabel(sentiment)}
          </li>
          <li>
            <strong>Market Perception:</strong>
            {sentiment > 0.5
              ? " Company is well-regarded in the market"
              : sentiment > 0.2
              ? " Company has mixed market perception"
              : " Company faces negative market perception"}
          </li>
        </ul>
      </div>
    </div>
  );
}
