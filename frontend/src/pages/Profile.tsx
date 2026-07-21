import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { SectionCard } from "@/components/app/SectionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Bell,
  KeyRound,
  Monitor,
  Palette,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage how you appear and behave across the workspace."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-2xl font-semibold text-primary">
              {(user?.full_name ?? "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold">{user?.full_name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
              <div className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                {user?.role?.replaceAll("_", " ")}
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Change avatar
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal"><UserIcon className="mr-1.5 h-3.5 w-3.5" /> Personal</TabsTrigger>
            <TabsTrigger value="security"><ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Security</TabsTrigger>
            <TabsTrigger value="sessions"><Monitor className="mr-1.5 h-3.5 w-3.5" /> Sessions</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="mr-1.5 h-3.5 w-3.5" /> Activity</TabsTrigger>
            <TabsTrigger value="prefs"><Palette className="mr-1.5 h-3.5 w-3.5" /> Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <SectionCard title="Personal information" icon={UserIcon}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input defaultValue={user?.full_name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email} type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input defaultValue={user?.role} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+1 555 000 0000" />
                </div>
                <div className="flex justify-end sm:col-span-2">
                  <Button>Save changes</Button>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <SectionCard title="Password" icon={KeyRound}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Current</Label><Input type="password" /></div>
                <div className="space-y-1.5"><Label>New</Label><Input type="password" /></div>
                <div className="flex justify-end sm:col-span-2">
                  <Button>Update password</Button>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Two-factor" icon={ShieldCheck}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Authenticator app</div>
                  <div className="text-xs text-muted-foreground">Time-based one-time passcodes.</div>
                </div>
                <Switch defaultChecked />
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="sessions" className="mt-4">
            <SectionCard title="Active sessions" icon={Monitor}>
              <EmptyState icon={Monitor} title="No other sessions" description="You're only signed in on this device." />
            </SectionCard>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <SectionCard title="Recent activity" icon={Activity}>
              <EmptyState icon={Activity} title="No activity yet" />
            </SectionCard>
          </TabsContent>

          <TabsContent value="prefs" className="mt-4 space-y-4">
            <SectionCard title="Appearance" icon={Palette}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Dark mode</div>
                  <div className="text-xs text-muted-foreground">Optimised for extended review sessions.</div>
                </div>
                <Switch defaultChecked />
              </div>
            </SectionCard>
            <SectionCard title="Notifications" icon={Bell}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Email digests</div>
                  <div className="text-xs text-muted-foreground">Weekly summary of activity.</div>
                </div>
                <Switch defaultChecked />
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
