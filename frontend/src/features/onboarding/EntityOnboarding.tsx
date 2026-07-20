import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Landmark, ChevronRight, ChevronLeft, Check, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

export default function EntityOnboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    cin: "",
    pan: "",
    sector: "",
    turnover: "",
    type: "",
    amount: "",
    tenure: "",
    interest: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    const { cin, pan, sector, turnover } = form;
    if (!cin || !pan || !sector || !turnover) {
      toast("Please complete all corporate credentials.", "warning");
      return false;
    }
    if (cin.length !== 21) {
      toast("Corporate Identification Number (CIN) must be exactly 21 characters.", "warning");
      return false;
    }
    if (pan.length !== 10) {
      toast("Permanent Account Number (PAN) must be exactly 10 characters.", "warning");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { type, amount, tenure, interest } = form;
    if (!type || !amount || !tenure || !interest) {
      toast("Please complete all loan request figures.", "warning");
      return false;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast("Please enter a valid loan amount.", "warning");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/onboarding/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cin: form.cin.toUpperCase(),
          pan: form.pan.toUpperCase(),
          sector: form.sector,
          turnover: form.turnover,
          type: form.type,
          amount: Number(form.amount),
          tenure: Number(form.tenure),
          interest: Number(form.interest)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Onboarding failed.");

      toast("Corporate profile onboarded successfully!", "success");
      // Reset form
      setForm({
        cin: "",
        pan: "",
        sector: "",
        turnover: "",
        type: "",
        amount: "",
        tenure: "",
        interest: ""
      });
      setStep(1);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? "bg-accent text-white" : "bg-emerald-100 text-emerald-800"}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <span className={`text-xs font-semibold ${step === 1 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
            Corporate Credentials
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-4" />
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? "bg-accent text-white" : "bg-slate-200 text-slate-500"}`}>
            2
          </div>
          <span className={`text-xs font-semibold ${step === 2 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
            Loan Appraisal Metrics
          </span>
        </div>
      </div>

      <Card className="glass-panel shadow-premium">
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            {step === 1 ? <Building2 className="w-5 h-5 animate-pulse-glow" /> : <Landmark className="w-5 h-5 animate-pulse-glow" />}
            <CardTitle>{step === 1 ? "Corporate Registry Profile" : "Loan App Parameters"}</CardTitle>
          </div>
          <CardDescription>
            {step === 1 ? "Onboard business entity registry details" : "Specify credit size, tenure and rate targets"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Input
                  label="CIN (Corporate Identification Number)"
                  name="cin"
                  placeholder="e.g. U72200KA2020PTC134251"
                  value={form.cin}
                  onChange={handleChange}
                  maxLength={21}
                  required
                />
                
                <Input
                  label="PAN (Permanent Account Number)"
                  name="pan"
                  placeholder="e.g. AAACX1234A"
                  value={form.pan}
                  onChange={handleChange}
                  maxLength={10}
                  required
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Industry Sector
                  </label>
                  <select
                    name="sector"
                    value={form.sector}
                    onChange={handleChange}
                    className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Select industry sector...</option>
                    <option value="Technology">Technology & SaaS</option>
                    <option value="Healthcare">Healthcare & Pharmaceuticals</option>
                    <option value="Manufacturing">Manufacturing & Heavy Industry</option>
                    <option value="Infrastructure">Real Estate & Infrastructure</option>
                    <option value="Retail">Retail & Consumer Goods</option>
                  </select>
                </div>

                <Input
                  label="Annual Turnover (in ₹)"
                  name="turnover"
                  placeholder="e.g. 50000000"
                  value={form.turnover}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Loan Scheme Option
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Select loan scheme type...</option>
                    <option value="Term Loan">Term Loan (Asset Creation)</option>
                    <option value="Working Capital">Working Capital Finance</option>
                    <option value="Equipment Finance">Equipment & Machinery Loan</option>
                  </select>
                </div>

                <Input
                  label="Loan Size Request (in ₹)"
                  name="amount"
                  placeholder="e.g. 10000000"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Loan Tenure (in months)"
                  name="tenure"
                  placeholder="e.g. 60"
                  value={form.tenure}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Proposed Annual Interest Rate (in %)"
                  name="interest"
                  placeholder="e.g. 9.5"
                  value={form.interest}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          
          {step === 1 ? (
            <Button onClick={handleNext} className="ml-auto flex items-center gap-1 bg-[#002B49] text-white">
              Next Step <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} variant="accent" className="font-bold ml-auto" isLoading={isLoading}>
              Complete Onboarding
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
