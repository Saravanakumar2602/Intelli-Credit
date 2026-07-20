import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, CheckCircle, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

interface LoanApp {
  id: number;
  company_name: string;
  cin: string;
  status: string;
}

export default function UploadDocuments({ onUploadComplete }: { onUploadComplete?: (files: any, company: string, filePaths: any) => void }) {
  const [loans, setLoans] = useState<LoanApp[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [files, setFiles] = useState<Record<string, File | null>>({
    alm: null,
    shareholding: null,
    borrowing: null,
    annual: null,
    portfolio: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load existing loan applications
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/search/?limit=50`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to format list
          const formatted = data.results.map((l: any) => ({
            id: l.id,
            company_name: l.company_name,
            cin: l.cin,
            status: l.status
          }));
          setLoans(formatted);
          if (formatted.length > 0) setSelectedLoanId(String(formatted[0].id));
        }
      } catch (err) {
        console.error("Failed to query applications list:", err);
      }
    };
    fetchLoans();
  }, []);

  const handleFileChange = (category: string, file: File | null) => {
    if (!file) return;
    
    // File validation limits (25MB) and type checks
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".xlsx"].includes(ext)) {
      toast(`Unsupported file format ${ext}. Only PDF, DOCX, and XLSX sheets are allowed.`, "warning");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast("File size exceeds the bank limit of 25MB.", "warning");
      return;
    }

    setFiles((prev) => ({ ...prev, [category]: file }));
    toast(`${file.name} loaded successfully.`, "success");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (category: string, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(category, e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all 5 files are loaded
    const missing = Object.entries(files).filter(([_, f]) => !f);
    if (missing.length > 0) {
      toast(`Please supply all 5 required financial folders. Missing: ${missing.map(m => m[0].toUpperCase()).join(", ")}`, "warning");
      return;
    }

    if (!selectedLoanId) {
      toast("Please select a target onboarded corporate application.", "warning");
      return;
    }

    setIsLoading(true);
    setUploadProgress(10);
    
    try {
      const formData = new FormData();
      formData.append("loan_application_id", selectedLoanId);
      
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const token = localStorage.getItem("token");
      setUploadProgress(40);
      
      const res = await fetch(`${API_BASE_URL}/upload/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(80);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload execution failed.");
      
      setUploadProgress(100);
      toast("All files uploaded and secure storage mappings created successfully!", "success");
      
      const targetLoan = loans.find(l => String(l.id) === selectedLoanId);
      const companyName = targetLoan ? targetLoan.company_name : "Corporate Client";
      
      if (onUploadComplete) {
        onUploadComplete(Object.values(files), companyName, data.file_paths);
      } else {
        // Fallback default routing to workspace
        navigate("/workspace", { state: { loan_application_id: Number(selectedLoanId), file_paths: data.file_paths } });
      }
    } catch (err: any) {
      toast(err.message, "error");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card className="glass-panel border-slate-200/50 shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            <FileUp className="w-5 h-5 animate-pulse-glow" />
            <CardTitle>Credit Document Ingestion Zone</CardTitle>
          </div>
          <CardDescription>
            Securely upload ALM portfolios, Shareholding tables, Borrowing sheets, Annual financials, and general credit summaries.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Target Application Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Corporate Application
            </label>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
              required
            >
              <option value="">Choose loan application...</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.company_name} (CIN: {loan.cin})
                </option>
              ))}
            </select>
          </div>

          {/* Files Grid Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "annual", label: "Annual Audited Report (P&L, Balance)" },
              { key: "alm", label: "Asset Liability Management (ALM)" },
              { key: "shareholding", label: "Shareholding Pattern Chart" },
              { key: "borrowing", label: "Borrowing Directory & List" },
              { key: "portfolio", label: "Business Operations Portfolio" }
            ].map((slot) => {
              const file = files[slot.key];
              
              return (
                <div
                  key={slot.key}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(slot.key, e)}
                  className={`p-4 border border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    file 
                      ? "border-emerald-500 bg-emerald-50/10" 
                      : "border-slate-300 hover:border-accent hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30"
                  }`}
                  onClick={() => document.getElementById(`input-${slot.key}`)?.click()}
                >
                  <input
                    id={`input-${slot.key}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(slot.key, e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center gap-1.5 text-emerald-600"
                    >
                      <CheckCircle className="w-8 h-8" />
                      <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
                      <span className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <FileText className="w-8 h-8" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{slot.label}</span>
                      <span className="text-[10px] text-slate-400">Drag & Drop or Click to Select</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload Progress Bar */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Ingesting audit data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFiles({ alm: null, shareholding: null, borrowing: null, annual: null, portfolio: null })}>
            Clear Files
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="accent" 
            className="font-bold flex items-center gap-2"
            isLoading={isLoading}
          >
            Ingest & Securize Files
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
