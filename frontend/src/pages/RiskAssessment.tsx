import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { ShieldCheck } from "lucide-react";

export default function RiskAssessment() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Intelligence"
        title="Risk Assessment"
        description="Model-driven risk grading with human-in-the-loop overrides."
      />
      <EmptyState
        icon={ShieldCheck}
        title="No risk models running"
        description="Once analyses are completed, computed risk grades will surface here for review."
      />
    </div>
  );
}
