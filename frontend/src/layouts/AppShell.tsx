import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { PageTransition } from "@/components/app/PageTransition";
import { OfflineBanner } from "@/components/app/OfflineBanner";

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <OfflineBanner />
        <main
          id="main-content"
          className="min-w-0 flex-1 p-4 sm:p-6"
          tabIndex={-1}
        >
          <div className="mx-auto w-full max-w-[1400px]">
            <PageTransition />
          </div>
        </main>
      </div>
    </div>
  );
}
