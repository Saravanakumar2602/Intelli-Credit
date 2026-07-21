import { PageHeader } from "@/components/app/PageHeader";
import { SectionCard } from "@/components/app/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Bell,
  Cog,
  KeyRound,
  Palette,
  ShieldCheck,
  Sliders,
  Webhook,
} from "lucide-react";

export default function Settings() {
  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Workspace preferences, integrations and security."
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Cog className="mr-1.5 h-3.5 w-3.5" /> General</TabsTrigger>
          <TabsTrigger value="theme"><Palette className="mr-1.5 h-3.5 w-3.5" /> Theme</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1.5 h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="api"><Webhook className="mr-1.5 h-3.5 w-3.5" /> API</TabsTrigger>
          <TabsTrigger value="prefs"><Sliders className="mr-1.5 h-3.5 w-3.5" /> Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <SectionCard title="Workspace" icon={Cog}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Organization</Label><Input defaultValue="Intelli-Credit" /></div>
              <div className="space-y-1.5"><Label>Locale</Label><Input defaultValue="en-US" /></div>
              <div className="space-y-1.5"><Label>Default currency</Label><Input defaultValue="USD" /></div>
              <div className="space-y-1.5"><Label>Timezone</Label><Input defaultValue="UTC" /></div>
              <div className="flex justify-end sm:col-span-2"><Button>Save</Button></div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <SectionCard title="Appearance" icon={Palette}>
            <ToggleRow label="Dark mode" desc="Optimised for extended review sessions." defaultChecked />
            <ToggleRow label="High contrast" desc="Increase legibility of borders and text." />
            <ToggleRow label="Reduce motion" desc="Minimise transitions and animations." />
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <SectionCard title="Alert channels" icon={Bell}>
            <ToggleRow label="Email digests" desc="Daily summary of new activity." defaultChecked />
            <ToggleRow label="Analysis completions" desc="Ping me when AI runs finish." defaultChecked />
            <ToggleRow label="Risk threshold alerts" desc="Notify on high-risk detections." defaultChecked />
            <ToggleRow label="Weekly reports" desc="Portfolio digest every Monday." />
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SectionCard title="Security" icon={ShieldCheck}>
            <ToggleRow label="Two-factor authentication" desc="Extra sign-in verification." defaultChecked />
            <ToggleRow label="SSO enforcement" desc="Restrict to your identity provider." />
            <ToggleRow label="IP allowlist" desc="Only permit sign-in from listed ranges." />
          </SectionCard>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <SectionCard title="API keys" icon={KeyRound}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <Input placeholder="No keys generated" disabled />
              <Button>Generate key</Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Keys are managed centrally. Rotate keys after any personnel change.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="prefs" className="mt-4">
          <SectionCard title="Personal preferences" icon={Sliders}>
            <ToggleRow label="Compact tables" desc="Denser rows for large portfolios." />
            <ToggleRow label="Auto-open latest CAM" desc="Skip landing screen after analysis." defaultChecked />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <div>
        <Label className="text-sm">{label}</Label>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
