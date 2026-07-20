import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ShieldAlert, Key, Mail } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { useToast } from "../../components/ui/Toast";
import API_BASE_URL from "../../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutMsg, setLockoutMsg] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLockoutMsg("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detail && data.detail.includes("locked")) {
          setLockoutMsg(data.detail);
        }
        throw new Error(data.detail || "Authentication failed.");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast(`Welcome back, ${data.user.username}!`, "success");
      navigate("/dashboard");
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
              <Building2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Intelli<span className="text-accent">Credit</span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Corporate Credit Underwriting System
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {lockoutMsg && (
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 text-rose-400 rounded-lg text-xs flex gap-2 items-center animate-pulse">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{lockoutMsg}</span>
                </div>
              )}

              <div className="space-y-1 relative">
                <Input
                  label="Business Email"
                  type="email"
                  placeholder="name@bank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full font-bold"
                isLoading={isLoading}
              >
                Log In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 pb-8 border-none bg-transparent">
            <p className="text-xs text-slate-500 text-center">
              Don't have an appraisal account?{" "}
              <Link to="/signup" className="text-accent hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
