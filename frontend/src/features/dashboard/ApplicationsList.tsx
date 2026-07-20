import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

export default function ApplicationsList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const limit = 10;

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/search/?page=${page}&limit=${limit}`;
      if (query) url += `&q=${encodeURIComponent(query)}`;
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Fetch applications failed.");
      
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
    fetchApplications();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl p-5 shadow-premium">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Appraisals Pipeline</h1>
          <p className="text-xs text-[var(--text-muted)] font-semibold font-serif">Credit applications tracking limits, rates, tenures and underwriting cycles</p>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate("/upload")} className="font-bold">
          Ingest New Case files
        </Button>
      </div>

      {/* Filter and Search controls */}
      <Card className="glass-panel">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Search Company Name or CIN"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="accent" className="font-bold py-2 shadow-sm w-full md:w-auto">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Applications Directory Table */}
      <Card className="glass-panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower Entity</TableHead>
                <TableHead>Requested Limit</TableHead>
                <TableHead>Tenure (Months)</TableHead>
                <TableHead>Target Rate</TableHead>
                <TableHead className="text-center">Pipeline Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length > 0 ? (
                results.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer" onClick={() => navigate("/workspace", { state: { loan_application_id: app.id } })}>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{app.company_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      ₹ {Number(app.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 font-semibold">{app.tenure || "36"} Mo</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 font-semibold">{app.interest_rate || "9.5"}%</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={app.status === "APPROVED" ? "success" : app.status === "SUBMITTED" ? "info" : "warning"}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate("/workspace", { state: { loan_application_id: app.id } })}
                        className="text-accent hover:underline flex items-center gap-1 font-bold mx-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Cockpit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-semibold">
                    No active loan applications located.
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
