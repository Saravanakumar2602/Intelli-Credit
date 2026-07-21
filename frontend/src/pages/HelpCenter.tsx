import {
  BookOpen,
  HelpCircle,
  Keyboard,
  LifeBuoy,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["/"], label: "Focus global search" },
  { keys: ["G", "D"], label: "Go to dashboard" },
  { keys: ["G", "A"], label: "Go to applications" },
  { keys: ["G", "R"], label: "Go to reports" },
  { keys: ["N"], label: "New application" },
  { keys: ["?"], label: "Show shortcuts" },
  { keys: ["Esc"], label: "Close overlays" },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How does the AI analysis work?",
    a: "Intelli-Credit orchestrates ingestion, extraction, ratio computation, benchmark comparison and narrative generation across your uploaded documents. Each stage exposes explainability so underwriters can trace every recommendation back to source evidence.",
  },
  {
    q: "Which document formats are supported?",
    a: "PDF, DOCX, XLSX and images. Files are chunked, OCR-processed when needed and indexed for semantic retrieval by the CAM engine.",
  },
  {
    q: "Can I customize the CAM template?",
    a: "Yes. Templates are versioned and can be scoped by product, segment or region. Contact your workspace admin to adjust section order, mandatory disclosures and approval workflows.",
  },
  {
    q: "How is my data secured?",
    a: "Data is encrypted in transit and at rest, isolated per tenant, and access is governed by role-based policies with a full audit trail available in the Audit Log.",
  },
];

export default function HelpCenter() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        eyebrow="Support"
        title="Help center"
        description="Documentation, shortcuts, FAQs and a direct line to the Intelli-Credit team."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: BookOpen, title: "Documentation", desc: "Guides, workflows and API references." },
          { icon: Keyboard, title: "Shortcuts", desc: "Move faster with keyboard commands." },
          { icon: LifeBuoy, title: "Contact support", desc: "Chat, email or open a ticket." },
        ].map((c) => (
          <div
            key={c.title}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
              <c.icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-semibold">{c.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Keyboard shortcuts" icon={Keyboard}>
          <ul className="divide-y divide-border">
            {SHORTCUTS.map((s) => (
              <li key={s.label} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground/90">{s.label}</span>
                <span className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Frequently asked questions" icon={HelpCircle}>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>
      </div>

      <SectionCard title="Contact" icon={MessageSquare}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button variant="outline" className="justify-start gap-2">
            <Mail className="h-4 w-4" /> support@intelli-credit.io
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <MessageSquare className="h-4 w-4" /> Open live chat
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Sparkles className="h-4 w-4" /> Request a feature
          </Button>
        </div>
      </SectionCard>

      <div className="rounded-xl border border-border bg-card p-5 text-xs text-muted-foreground">
        Intelli-Credit · Underwriting Suite · v0.3.0 — Enterprise preview build.
      </div>
    </div>
  );
}
