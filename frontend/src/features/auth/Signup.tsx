import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, Lock, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("relationship_manager");
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Very Weak");
  const [strengthColor, setStrengthColor] = useState("bg-rose-500");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dynamic Password Complexity Calculator
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      setStrengthLabel("Very Weak");
      setStrengthColor("bg-rose-500");
      return;
    }

    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    setStrength(score);
    
    if (score <= 2) {
      setStrengthLabel("Weak");
      setStrengthColor("bg-rose-500");
    } else if (score <= 4) {
      setStrengthLabel("Moderate");
      setStrengthColor("bg-amber-500");
    } else {
      setStrengthLabel("Strong (Enterprise)");
      setStrengthColor("bg-emerald-500");
    }
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 4) {
      toast("Password is not strong enough for enterprise standards.", "warning");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed.");

      toast(data.message || "Account created successfully! Please login.", "success");
      navigate("/login");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 dark:bg-[#02040a] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="glass-panel border-slate-800/40 shadow-premium">
          <CardHeader className="text-center pt-8 border-none pb-0">
            <div className="mx-auto w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white mb-3 shadow-glow">
              <UserPlus className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Register underwriting agent profile
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Corporate Email"
                type="email"
                placeholder="name@bank.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Underwriting Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-[var(--border-light)] dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="relationship_manager">Relationship Manager (RM)</option>
                  <option value="credit_officer">Credit Officer (CO)</option>
                  <option value="admin">System Auditor / Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {password && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Strength:</span>
                      <span className="text-slate-300">{strengthLabel}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`} 
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full font-bold"
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 pb-8 border-none bg-transparent">
            <p className="text-xs text-slate-500 text-center">
              Already registered?{" "}
              <Link to="/login" className="text-accent hover:underline font-semibold">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
