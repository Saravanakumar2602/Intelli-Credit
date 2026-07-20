import React, { useState } from "react";
import { Check, AlertTriangle, FileText, Cpu, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";

interface FileClassificationProps {
  files: any[];
  company: string;
  filePaths: Record<string, string> | null;
  onApprove: (classified: any, schema: any, analysisResults?: any) => void;
}

export default function FileClassification({
  files,
  company,
  filePaths,
  onApprove
}: FileClassificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Mocking classification schemas approval
      toast("Classification schema approved! Proceeding to appraisal cockpit...", "success");
      onApprove(files, filePaths);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card className="glass-panel border-slate-200/50 shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            <Cpu className="w-5 h-5 animate-pulse-glow" />
            <CardTitle>AI Document Classification Review</CardTitle>
          </div>
          <CardDescription>
            Verify document classification mapping for <strong className="text-slate-800 dark:text-slate-100">{company || "Corporate Client"}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-200/40 rounded-xl text-xs text-teal-800 dark:text-teal-400 leading-relaxed flex gap-2">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>AI has mapped magic signatures successfully. Please review and confirm the classifications below to build appraisal models.</span>
          </div>

          <div className="space-y-2">
            {filePaths ? (
              Object.entries(filePaths).map(([key, path]) => (
                <div key={key} className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/35 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{key} Document</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-sm">{path}</span>
                    </div>
                  </div>
                  <Badge variant="success">CONFIRMED</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No files ingested for classification review.</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to Uploader
          </Button>
          <Button 
            onClick={handleApprove} 
            variant="accent" 
            className="font-bold flex items-center gap-1.5"
            isLoading={isLoading}
          >
            Confirm & Run AI Appraisal <ChevronRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
