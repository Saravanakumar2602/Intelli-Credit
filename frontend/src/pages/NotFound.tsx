import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 grid-bg">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card/60 p-10 text-center backdrop-blur"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-lg">
            <Compass className="h-6 w-6" />
          </div>
          <div className="text-[64px] font-black leading-none tracking-tighter text-gradient-brand">
            404
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist, was moved, or is temporarily unavailable.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go back
            </Button>
            <Button asChild className="gap-1.5">
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
