import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, FileText, ArrowUpDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

export default function CompaniesList() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const limit = 10;

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/search/?page=${page}&limit=${limit}`;
      if (query) url += `&q=${encodeURIComponent(query)}`;
      if (sector) url += `&sector=${encodeURIComponent(sector)}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Search query failed.");
      
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, sector, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 shadow-premium">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Corporate Directory</h1>
          <p className="text-xs text-[var(--text-muted)] font-semibold">Active borrowers database matching CIN, PAN, and sector codes</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate("/companies/onboarding")} className="font-bold">
          Onboard New Corporate
        </Button>
      </div>

      {/* Filter and Search controls */}
      <Card className="glass-panel">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-end">
            
            <div className="flex-1 w-full">
              <Input
                label="Search Company Name or CIN"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-row gap-3 w-full md:w-auto">
              <div className="flex flex-col gap-1.5 min-w-[140px]">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Industry</label>
                <select
                  value={sector}
                  onChange={(e) => { setSector(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none"
                >
                  <option value="">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[140px]">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="accent" className="font-bold py-2 shadow-sm w-full md:w-auto">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="glass-panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>CIN</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Exposure Limit</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length > 0 ? (
                results.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-slate-800 dark:text-slate-200">{c.company_name}</TableCell>
                    <TableCell className="font-semibold text-slate-500 font-mono">{c.cin}</TableCell>
                    <TableCell className="font-semibold text-xs text-slate-600 dark:text-slate-400">{c.sector}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      ₹ {Number(c.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={c.status === "APPROVED" ? "success" : c.status === "SUBMITTED" ? "info" : "warning"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate("/workspace", { state: { loan_application_id: c.id } })}
                        className="text-accent hover:underline flex items-center gap-1 font-bold mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Workspace
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                    No active corporate registry matches.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border-light)] bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-slate-500">
              <span>Showing Page {page} of {totalPages} ({total} Total Records)</span>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}
