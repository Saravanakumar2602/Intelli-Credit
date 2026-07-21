import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid work email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@bank.com", password: "demo123", remember: true },
  });

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login({ email: values.email, password: values.password });
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch {
      toast.error("Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      {/* Left: hero */}
      <div className="relative hidden overflow-hidden border-r border-border bg-sidebar lg:block">
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-chart-5/20 blur-3xl" aria-hidden />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">Intelli-Credit</div>
              <div className="text-[11px] text-muted-foreground">Underwriting Suite</div>
            </div>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md text-3xl font-semibold leading-tight tracking-tight"
            >
              AI-powered corporate credit,{" "}
              <span className="text-gradient-brand">from intake to CAM</span>.
            </motion.h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Onboard companies, ingest documents, generate risk-graded credit
              appraisal memos — all in one auditable workflow.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-xs">
              {[
                { k: "Faster", v: "Decisions in hours" },
                { k: "Deeper", v: "Full financial signals" },
                { k: "Safer", v: "Auditable evidence" },
              ].map((f) => (
                <div
                  key={f.k}
                  className="rounded-lg border border-border bg-card/60 p-3"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {f.k}
                  </div>
                  <div className="mt-1 text-foreground/80">{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            SOC 2 · GDPR · Bank-grade encryption
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">Intelli-Credit</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your work email to access the underwriting workspace.
          </p>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Demo Credentials (Pre-filled):</span>
            <div className="mt-1 flex flex-col gap-0.5">
              <div>Email: <code className="text-primary font-mono select-all">demo@bank.com</code></div>
              <div>Password: <code className="text-primary font-mono select-all">demo123</code></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@bank.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox id="remember" defaultChecked {...(register("remember") as unknown as object)} />
              <span>Keep me signed in for 30 days</span>
            </label>

            <Button
              type="submit"
              size="lg"
              className="w-full gradient-brand text-white hover:opacity-95"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected by SSO · Reach IT for account provisioning.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
