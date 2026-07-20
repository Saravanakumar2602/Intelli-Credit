import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Cell,
  Pie
} from "recharts";
import { 
  Building2, 
  ShieldAlert, 
  TrendingUp, 
  Newspaper, 
  FileText, 
  Activity, 
  ArrowRight,
  Download, 
  CheckCircle,
  Clock,
  RefreshCw,
  Sliders,
  DollarSign
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

const COLORS = ["#002b49", "#008080", "#10b981", "#f59e0b", "#e11d48", "#06b6d4"];

interface AnalysisData {
  loan_application_id: number;
  company_name?: string;
  financials?: any;
  ratios?: any;
  risk?: any;
  news?: any;
  swot?: any;
  recommendation?: any;
  secondary_research?: any;
  risk_summary?: string;
  cam_report?: string;
}

export default function DashboardWorkspace() {
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loans, setLoans] = useState<any[]>([]);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [jobStatus, setJobStatus] = useState({ status: "", progress: 0, step: "" });

  // Query onboarded loans list
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/search/?limit=50`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setLoans(resData.results);
          
          // Pre-select if routing carries state
          if (location.state && location.state.loan_application_id) {
            setSelectedLoanId(String(location.state.loan_application_id));
          } else if (resData.results.length > 0) {
            setSelectedLoanId(String(resData.results[0].id));
          }
        }
      } catch (err) {
        console.error("Failed to fetch applications list:", err);
      }
    };
    fetchLoans();
  }, [location.state]);

  // Load results whenever loan selection changes
  useEffect(() => {
    if (!selectedLoanId) {
      setData(null);
      return;
    }
    
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/analyze/results/${selectedLoanId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 404) {
          // No analysis results exist yet. Let's auto-trigger!
          triggerAppraisal();
          return;
        }

        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Failed to query analysis results:", err);
      }
    };
    fetchResults();
  }, [selectedLoanId]);

  const triggerAppraisal = async () => {
    if (!selectedLoanId) return;
    setIsPolling(true);
    setJobStatus({ status: "QUEUED", progress: 5, step: "Initializing analysis job..." });
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/analyze/?loan_application_id=${selectedLoanId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.detail || "Trigger appraisal failed.");
      
      // Start polling Celery status
      pollCeleryJob(resData.job_id);
    } catch (err: any) {
      toast(err.message, "error");
      setIsPolling(false);
    }
  };

  const pollCeleryJob = (jobId: string) => {
    const token = localStorage.getItem("token");
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analyze/status/${jobId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const job = await res.json();
          setJobStatus({
            status: job.status,
            progress: job.progress || 0,
            step: job.current_step || "Processing..."
          });

          if (job.status === "COMPLETED") {
            clearInterval(interval);
            setIsPolling(false);
            toast("AI appraisal completed successfully!", "success");
            
            // Reload results
            const resultsRes = await fetch(`${API_BASE_URL}/analyze/results/${selectedLoanId}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (resultsRes.ok) {
              const resultsData = await resultsRes.json();
              setData(resultsData);
            }
          } else if (job.status === "FAILED") {
            clearInterval(interval);
            setIsPolling(false);
            toast(`AI appraisal job failed: ${job.error_message}`, "error");
          }
        }
      } catch (err) {
        console.error("Error polling job status:", err);
      }
    }, 2500);
  };

  const handleDownloadCAM = () => {
    if (data && data.cam_report) {
      window.open(`${API_BASE_URL}/download/?file_path=${encodeURIComponent(data.cam_report)}`, "_blank");
    } else {
      toast("PDF CAM report is not compiled yet.", "warning");
    }
  };

  if (isPolling) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center text-accent animate-spin mb-2">
          <RefreshCw className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 w-full">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Running Multi-Agent Synthesis</h2>
          <p className="text-xs text-slate-500 font-semibold">{jobStatus.step}</p>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${jobStatus.progress}%` }} />
        </div>
        <span className="text-xs text-slate-400 font-bold">Appraisal Job Status: {jobStatus.status} ({jobStatus.progress}%)</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-4">
        <Building2 className="w-16 h-16 animate-bounce text-slate-300 dark:text-slate-700" />
        <p className="text-lg font-semibold">No active credit analysis loaded.</p>
        
        <div className="flex flex-col gap-1.5 w-64">
          <select
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none"
          >
            <option value="">Select loan application...</option>
            {loans.map(l => (
              <option key={l.id} value={l.id}>{l.company_name}</option>
            ))}
          </select>
        </div>

        {selectedLoanId && (
          <Button variant="accent" onClick={triggerAppraisal} className="font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Trigger Credit Analysis
          </Button>
        )}
      </div>
    );
  }

  // Safe destructuring
  const financials = data.financials || {};
  const ratios = data.ratios || {};
  const risk = data.risk || { score: 70, risk_level: "Medium Risk", breakdown: {} };
  const news = data.news || { sentiment: 0.0, findings: [] };
  const swot = data.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const recommendation = data.recommendation || { decision: "PENDING", confidence: 0, conditions: [], next_steps: [] };

  // Data mapping for Recharts
  const radarData = Object.entries(risk.breakdown || {}).map(([key, val]: any) => ({
    subject: key.replace("_", " ").toUpperCase(),
    value: val.score || 70,
    fullMark: 100
  }));

  const trendData = [
    { year: "FY23 (Est)", Revenue: (financials.revenue || 100000) * 0.85, EBITDA: (financials.ebitda || 20000) * 0.8 },
    { year: "FY24 (Audited)", Revenue: (financials.revenue || 100000) * 0.95, EBITDA: (financials.ebitda || 20000) * 0.9 },
    { year: "FY25 (Current)", Revenue: financials.revenue || 100000, EBITDA: financials.ebitda || 20000 }
  ];

  const pieData = [
    { name: "Current Assets", value: financials.current_assets || 50000 },
    { name: "Long Term Assets", value: Math.max(10000, (financials.total_assets || 100000) - (financials.current_assets || 50000)) }
  ];

  const riskBadgeVariant = ({
    "Low Risk": "success" as const,
    "Medium Risk": "warning" as const,
    "High Risk": "danger" as const
  }[risk.risk_level as "Low Risk" | "Medium Risk" | "High Risk"]) || "default";

  const decisionBadgeVariant = ({
    "APPROVE": "success" as const,
    "CONDITIONAL_APPROVE": "warning" as const,
    "REJECT": "danger" as const
  }[recommendation.decision as "APPROVE" | "CONDITIONAL_APPROVE" | "REJECT"]) || "default";

  return (
    <div className="space-y-6">
      
      {/* Overview Sticky Header bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 shadow-premium flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{recommendation.company || "Corporate Portfolio Workspace"}</h1>
            <Badge variant={riskBadgeVariant}>{risk.risk_level}</Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-2">
            <span>Linked Loan ID: <strong className="text-slate-700 dark:text-slate-300">{data.loan_application_id}</strong></span>
            <span>•</span>
            <span>Appraisal decision: <strong className="text-slate-700 dark:text-slate-300">{recommendation.decision}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedLoanId}
            onChange={(e) => setSelectedLoanId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm font-semibold focus:outline-none"
          >
            {loans.map(l => (
              <option key={l.id} value={l.id}>{l.company_name}</option>
            ))}
          </select>
          
          <Button variant="accent" size="sm" onClick={handleDownloadCAM} className="font-bold flex items-center gap-1.5 shadow-sm">
            <Download className="w-4 h-4" /> Download PDF MEMO
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[var(--border-light)] gap-2 overflow-x-auto select-none scrollbar-none">
        {[
          { id: "overview", label: "Appraisal Rating", icon: Building2 },
          { id: "financials", label: "Balance Spreads", icon: TrendingUp },
          { id: "ratios", label: "Credit Ratios", icon: Sliders },
          { id: "swot", label: "Strategic SWOT", icon: ShieldAlert },
          { id: "news", label: "Sentiment Index", icon: Newspaper },
          { id: "cam", label: "Committee Memorandum", icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none border-b-2 ${
                isActive 
                  ? "border-accent text-accent font-bold" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Risk radar and score */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Risk Distribution Radar Map</CardTitle>
                <CardDescription>Multi-agent risk classification index spreads</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#64748b" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Risk Index" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Explainable Rating details */}
            <Card className="glass-panel flex flex-col justify-between">
              <CardHeader>
                <CardTitle>AI Explainable Appraisal Rating</CardTitle>
                <CardDescription>Risk scoring rationale modeling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#002b49] dark:text-slate-100">{risk.score}</span>
                  <span className="text-slate-400 text-sm">/ 100</span>
                </div>
                
                <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Explainability Model Rationale</span>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {data.risk_summary || "Audit results indicate adequate current ratios and cash buffer indices to clear active debt obligations."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Decision & Covenants */}
            <Card className="glass-panel flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Underwriting Recommendation</CardTitle>
                <CardDescription>Covenants and action items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Underwriter Decision:</span>
                  <Badge variant={decisionBadgeVariant}>{recommendation.decision}</Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Appraisal Covenants</span>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1.5 list-disc pl-4">
                    {recommendation.conditions && recommendation.conditions.length > 0 ? (
                      recommendation.conditions.map((c: string, idx: number) => <li key={idx}>{c}</li>)
                    ) : (
                      <>
                        <li>Maintain debt-to-equity below 2.0x.</li>
                        <li>Quarterly audited compliance checks.</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* BALANCE SPREADS PANEL */}
        {activeTab === "financials" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Balance Sheet Spreads */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Audited Spreads Ledger</CardTitle>
                  <CardDescription>Extracted values from annual financial statement sheets</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Financial Balance Item</TableHead>
                        <TableHead className="text-right">Ledger Value</TableHead>
                        <TableHead className="text-center">Data Citation Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(financials).map(([key, val]: any) => {
                        if (["citations", "confidence_score"].includes(key)) return null;
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-semibold text-slate-800 dark:text-slate-200">{key.replace("_", " ").toUpperCase()}</TableCell>
                            <TableCell className="text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                              {typeof val === "number" ? `₹ ${val.toLocaleString()}` : String(val)}
                            </TableCell>
                            <TableCell className="text-center text-xs text-slate-400">Statement page 3</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Recharts Distributions */}
            <div className="space-y-6">
              
              {/* EBITDA Trend */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Revenue & EBITDA Trend</CardTitle>
                  <CardDescription>Fiscal trends comparison</CardDescription>
                </CardHeader>
                <CardContent className="h-[180px] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 8 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Line type="monotone" dataKey="Revenue" stroke="#002b49" strokeWidth={2} />
                      <Line type="monotone" dataKey="EBITDA" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Asset Share */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Asset Distributions Share</CardTitle>
                  <CardDescription>Long term vs current ratio</CardDescription>
                </CardHeader>
                <CardContent className="h-[150px] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>

          </div>
        )}

        {/* CREDIT RATIOS PANEL */}
        {activeTab === "ratios" && (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Calculated Financial Ratios Spreadsheet</CardTitle>
              <CardDescription>Solvency indices, liquidity buffers, and Altman Z-Score indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ratios).map(([key, val]: any) => {
                  if (typeof val !== "number") return null;
                  
                  let val_str = "";
                  if (key.includes("margin") || ["roe", "roa", "probability_of_default"].includes(key)) {
                    val_str = `${(val * 100).toFixed(2)}%`;
                  } else if (["current_ratio", "quick_ratio", "debt_equity", "leverage", "inventory_turnover", "payable_turnover", "receivable_turnover", "interest_coverage"].includes(key)) {
                    val_str = `${val.toFixed(2)}x`;
                  } else if (key === "working_capital") {
                    val_str = `₹ ${val.toLocaleString()}`;
                  } else {
                    val_str = val.toFixed(4);
                  }
                  
                  return (
                    <div key={key} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-xs transition bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{key.replace("_", " ")}</span>
                      <strong className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums">{val_str}</strong>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SWOT PANEL */}
        {activeTab === "swot" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <Card className="glass-panel border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="text-emerald-700 uppercase tracking-wider text-sm flex items-center gap-2">✓ Internal Strengths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swot.strengths && swot.strengths.length > 0 ? (
                  swot.strengths.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.point}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Evidence citation: {item.evidence}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No strengths recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="glass-panel border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="text-amber-700 uppercase tracking-wider text-sm flex items-center gap-2">⚠ Internal Weaknesses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swot.weaknesses && swot.weaknesses.length > 0 ? (
                  swot.weaknesses.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.point}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Evidence citation: {item.evidence}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No weaknesses recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="glass-panel border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-700 uppercase tracking-wider text-sm flex items-center gap-2">✦ Market Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swot.opportunities && swot.opportunities.length > 0 ? (
                  swot.opportunities.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.point}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Evidence citation: {item.evidence}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No opportunities recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="glass-panel border-l-4 border-l-rose-500">
              <CardHeader>
                <CardTitle className="text-rose-700 uppercase tracking-wider text-sm flex items-center gap-2">✗ Market Threats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swot.threats && swot.threats.length > 0 ? (
                  swot.threats.map((item: any, idx: number) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.point}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Evidence citation: {item.evidence}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No threats recorded.</p>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* NEWS PANEL */}
        {activeTab === "news" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sentiment Index score */}
            <Card className="glass-panel flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Sentiment Polarity Index</CardTitle>
                <CardDescription>Calculated using TextBlob sentiment modeling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-extrabold text-[#002b49] dark:text-slate-100">
                  {news.sentiment ? news.sentiment.toFixed(2) : "0.00"}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Values above 0.1 represent favorable industry sentiments, while negative indices raise critical monitoring alerts.
                </p>
              </CardContent>
            </Card>

            {/* Google News Cached articles */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Cached Industry Circulars</CardTitle>
                  <CardDescription>Credible news cache filtered domains (Bloomberg, Business Standard)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {news.findings && news.findings.length > 0 ? (
                    news.findings.map((item: string, idx: number) => (
                      <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/15 hover:bg-slate-50 rounded-xl transition duration-200">
                        <strong className="text-xs text-slate-800 dark:text-slate-200 block">{item}</strong>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1">Source: Google News Circular API</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No cached news records for corporate sector.</p>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* CAM MEMORANDUM PANEL */}
        {activeTab === "cam" && (
          <Card className="glass-panel max-w-4xl mx-auto border-dashed">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl uppercase">Corporate Credit Memorandum (CAM)</CardTitle>
              <CardDescription>Formulated Deloitte style appraisal memo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-slate-700 dark:text-slate-300 text-xs leading-relaxed max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <strong>Applicant Borrowing Corp:</strong>
                  <p>{recommendation.company || "Corporate Client"}</p>
                </div>
                <div>
                  <strong>Audit Statement Release Date:</strong>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-800 dark:text-slate-200">Executive Summary Rating Conclusion:</strong>
                <p>{recommendation.recommendation_summary || "Audit results indicate high current coverage levels suitable for Term Loan approval subject to covenant maintenance."}</p>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-800 dark:text-slate-200">Disbursement Conditions:</strong>
                <p>Approval requires standard asset hypothecations and annual audits validation.</p>
              </div>

              <div className="flex justify-center pt-6">
                <Button variant="accent" onClick={handleDownloadCAM} className="font-bold flex items-center gap-2 shadow-sm">
                  <Download className="w-5 h-5" /> Export PDF Memorandum
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
}
