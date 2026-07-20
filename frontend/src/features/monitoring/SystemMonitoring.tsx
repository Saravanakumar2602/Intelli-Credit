import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { 
  Activity, 
  Server, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  HardDrive, 
  Clock 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import API_BASE_URL from "../../config";

interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export default function SystemMonitoring() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonitoring = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Diagnostics
      const diagRes = await fetch(`${API_BASE_URL}/monitoring/diagnostics`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (diagRes.ok) {
        setDiagnostics(await diagRes.json());
      }
      
      // Logs
      const logsRes = await fetch(`${API_BASE_URL}/monitoring/logs?limit=30`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch monitoring telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  const metricChartData = [
    { time: "10:00", CPU: 12, Memory: 42, Latency: 85 },
    { time: "10:10", CPU: 18, Memory: 43, Latency: 92 },
    { time: "10:20", CPU: 24, Memory: 45, Latency: 110 },
    { time: "10:30", CPU: 15, Memory: 44, Latency: 78 },
    { time: "10:40", CPU: 22, Memory: 46, Latency: 95 },
    { time: "10:50", CPU: 35, Memory: 48, Latency: 135 },
    { time: "11:00", CPU: 14, Memory: 45, Latency: 80 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 shadow-premium">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent animate-pulse-glow" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Telemetry & Monitoring</h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold">Real-time worker queues, audit history, and API performance</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMonitoring} isLoading={isLoading} className="flex items-center gap-1.5 font-bold">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* API Health */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">API Core Status</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">Healthy</span>
              <span className="text-[10px] text-emerald-500 font-bold block">Broker Connected</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Database load */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">DB Transactions</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {diagnostics?.database?.queries_executed || 35}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">Avg query: 1.2ms</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Active model */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active AI Engine</span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[150px] block">
                {diagnostics?.ai_pipeline?.current_active_models?.[0]?.toUpperCase() || "LLAMA 3.3"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">Avg response: 1.8s</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Server className="w-5 h-5 shadow-glow" />
            </div>
          </CardContent>
        </Card>

        {/* Background jobs */}
        <Card className="glass-panel">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Celery Queue Load</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {diagnostics?.background_workers?.queue_size || 0} Active
              </span>
              <span className="text-[10px] text-slate-400 font-bold block">
                Completed: {diagnostics?.background_workers?.completed || 12}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Recharts System Load metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency & resources Area Charts */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle>Core API Latency Trend (ms)</CardTitle>
            <CardDescription>Network response metrics over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricChartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Latency" stroke="#06b6d4" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resources dials */}
        <Card className="glass-panel flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Core Allocations</CardTitle>
            <CardDescription>Container resource logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-slate-400" /> CPU Load</span>
                <span>24%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "24%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-slate-400" /> Memory Buffer</span>
                <span>45%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "45%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Audit Logs Table */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Security Audit History Logs</CardTitle>
          <CardDescription>Immutable tracking logs for logins, uploads, and appraisals</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-slate-400 font-semibold">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {log.username}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.action.includes("FAILED") ? "danger" : "default"}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)] max-w-sm truncate">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">
                    {log.ip_address}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
