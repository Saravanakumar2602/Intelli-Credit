import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  PlusCircle, 
  FileUp, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  Layers,
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

const COLORS = ["#002b49", "#008080", "#10b981", "#f59e0b", "#e11d48", "#06b6d4"];

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalValue: "₹ 248.5 Cr",
    activeApps: 12,
    approvalRate: "86.4%",
    avgRisk: 42
  });
  
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/search/?limit=5`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentApps(data.results);
        }
      } catch (err) {
        console.error("Failed to fetch recent loan applications:", err);
      }
    };
    fetchRecent();
  }, []);

  const barData = [
    { name: "Infrastructure", Target: 85, Disbursed: 70 },
    { name: "Technology", Target: 65, Disbursed: 55 },
    { name: "Healthcare", Target: 50, Disbursed: 45 },
    { name: "Manufacturing", Target: 90, Disbursed: 78 },
    { name: "Retail", Target: 40, Disbursed: 32 }
  ];

  const pieData = [
    { name: "Low Risk (<35)", value: 4 },
    { name: "Medium Risk (35-65)", value: 6 },
    { name: "High Risk (>65)", value: 2 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Greeting panel */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 shadow-premium">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Executive Portfolio Dashboard</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-semibold">Underwriting analytics overview for Intelli-Credit portfolio</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Value */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Portfolio Exposure</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalValue}</span>
              <span className="text-[10px] text-emerald-500 font-bold block">+12% vs last quarter</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950/20 text-[#002b49] dark:text-slate-200 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active applications */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Loan Files</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.activeApps}</span>
              <span className="text-[10px] text-accent font-bold block">4 awaiting committee</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5 shadow-glow" />
            </div>
          </CardContent>
        </Card>

        {/* Approval rate */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Underwriter Approval Rate</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.approvalRate}</span>
              <span className="text-[10px] text-emerald-500 font-bold block">Consistent index limits</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Average Risk */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Risk Rating</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.avgRisk} / 100</span>
              <span className="text-[10px] text-amber-500 font-bold block">Moderate Risk bounds</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Onboard Company */}
        <Card className="glass-panel hover:border-accent hover:shadow-premium transition cursor-pointer" onClick={() => navigate("/companies/onboarding")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Onboard Corporate Client</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Submit corporate PAN/CIN credentials and register loan details.</p>
            </div>
          </CardContent>
        </Card>

        {/* Ingest Documents */}
        <Card className="glass-panel hover:border-accent hover:shadow-premium transition cursor-pointer" onClick={() => navigate("/upload")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Ingest Financial Sheets</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Upload annual reports, ALM data, and borrowing ledgers.</p>
            </div>
          </CardContent>
        </Card>

        {/* Appraisal Workspace */}
        <Card className="glass-panel hover:border-accent hover:shadow-premium transition cursor-pointer" onClick={() => navigate("/workspace")}>
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Appraisal Workspace</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">Inspect calculated ratios, risk radar map, and SWOT trends.</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Exposure chart */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle>Industry Sector Exposure</CardTitle>
            <CardDescription>Target vs actual disbursed credit limits (in ₹ Cr)</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="Target" fill="#002b49" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Disbursed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk distribution */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Portfolio Risk Share</CardTitle>
            <CardDescription>Loan count split by risk score bounds</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
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

      {/* Recent Applications table */}
      <Card className="glass-panel">
        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle>Recent Underwriting Pipeline</CardTitle>
            <CardDescription>Onboarded borrowers and active files status</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/applications")} className="flex items-center gap-1 font-bold text-accent">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase">
                <tr>
                  <th className="px-5 py-3">Company Name</th>
                  <th className="px-5 py-3">CIN</th>
                  <th className="px-5 py-3">Industry Sector</th>
                  <th className="px-5 py-3 text-right">Loan Size Request</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                {recentApps.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer" onClick={() => navigate("/workspace", { state: { loan_application_id: item.id } })}>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{item.company_name}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-500 font-mono">{item.cin}</td>
                    <td className="px-5 py-3.5 font-semibold">{item.sector}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                      ₹ {Number(item.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={item.status === "APPROVED" ? "success" : item.status === "SUBMITTED" ? "info" : "warning"}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
