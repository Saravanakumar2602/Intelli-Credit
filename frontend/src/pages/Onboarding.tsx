import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const schema = z.object({
  legal_name: z.string().min(2, "Required"),
  registration_number: z.string().optional(),
  incorporation_date: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  employees: z.coerce.number().int().nonnegative().optional(),
  annual_revenue: z.coerce.number().nonnegative().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  amount_requested: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  purpose: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { id: "identity", title: "Company Identity" },
  { id: "profile", title: "Business Profile" },
  { id: "request", title: "Credit Request" },
  { id: "review", title: "Review" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const progress = ((step + 1) / STEPS.length) * 100;

  const next = async () => {
    const fieldsByStep: Array<Array<keyof FormValues>> = [
      ["legal_name", "registration_number", "incorporation_date", "country"],
      ["industry", "employees", "annual_revenue", "website"],
      ["amount_requested", "currency", "purpose"],
      [],
    ];
    const ok = await trigger(fieldsByStep[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (_values: FormValues) => {
    setSubmitting(true);
    try {
      // await companyService.create(values); — wire when backend is up.
      toast.success("Application draft saved");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Underwriting"
        title="Company Onboarding"
        description="Capture the corporate identity, business profile and credit ask. Draft is autosaved."
      />

      {/* Stepper */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <Progress value={progress} className="h-1.5" />
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2.5 text-xs",
                i < step && "border-success/30 bg-success/5 text-success",
                i === step && "border-primary/40 bg-primary/5 text-foreground",
                i > step && "border-border text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                  i < step && "bg-success text-success-foreground",
                  i === step && "bg-primary text-primary-foreground",
                  i > step && "bg-secondary",
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="truncate font-medium">{s.title}</span>
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card">
        <div className="p-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Legal name *" error={errors.legal_name?.message}>
                  <Input placeholder="Acme Manufacturing Ltd." {...register("legal_name")} />
                </Field>
                <Field label="Registration number">
                  <Input placeholder="CIN / EIN" {...register("registration_number")} />
                </Field>
                <Field label="Incorporation date">
                  <Input type="date" {...register("incorporation_date")} />
                </Field>
                <Field label="Country">
                  <Input placeholder="United States" {...register("country")} />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Industry">
                  <Input placeholder="Manufacturing" {...register("industry")} />
                </Field>
                <Field label="Employees">
                  <Input type="number" min={0} placeholder="120" {...register("employees")} />
                </Field>
                <Field label="Annual revenue (USD)">
                  <Input type="number" min={0} placeholder="5000000" {...register("annual_revenue")} />
                </Field>
                <Field label="Website" error={errors.website?.message}>
                  <Input placeholder="https://acme.com" {...register("website")} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Amount requested">
                  <Input type="number" min={0} placeholder="1000000" {...register("amount_requested")} />
                </Field>
                <Field label="Currency">
                  <Input placeholder="USD" {...register("currency")} />
                </Field>
                <Field label="Purpose" className="sm:col-span-2">
                  <Textarea
                    rows={4}
                    placeholder="Working capital, capex, expansion…"
                    {...register("purpose")}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <ReviewGrid values={getValues()} />
            )}
          </motion.div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-secondary/20 p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting} className="gradient-brand text-white">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit application
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ReviewGrid({ values }: { values: FormValues }) {
  const entries = Object.entries(values).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing to review yet. Fill previous steps.</p>
    );
  }
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded-lg border border-border bg-secondary/30 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {k.replaceAll("_", " ")}
          </dt>
          <dd className="mt-0.5 truncate text-sm">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}
