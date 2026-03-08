import React, { useState } from "react";
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!file || !company) {
      setError("Please select a PDF and enter a company name.");
      return;
    }
    setLoading(true);
    try {
      // 1. Upload the PDF
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/upload/", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("File upload failed");
      const { file_path } = await uploadRes.json();
      // 2. Call /analyze
      const analyzeRes = await fetch(
        `/analyze/?file_path=${encodeURIComponent(file_path)}&company=${encodeURIComponent(company)}`,
        { method: "POST" }
      );
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const data = await analyzeRes.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Intelli-Credit Analyzer</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>PDF File: </label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Company Name: </label>
          <input type="text" value={company} onChange={handleCompanyChange} />
        </div>
        <button type="submit" style={{ marginTop: 20 }} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Results</h3>
          <pre style={{ background: "#f4f4f4", padding: 10 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
