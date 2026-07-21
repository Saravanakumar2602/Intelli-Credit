import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

const schema = z.object({ email: z.string().trim().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(values.email);
      setSent(true);
    } catch {
      // UI-only mode — pretend it worked so users can explore.
      setSent(true);
      toast.success("If an account exists, we'll send instructions");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        {sent ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <MailCheck className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold">Check your inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for that email, we've sent reset instructions.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your work email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@bank.com" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
