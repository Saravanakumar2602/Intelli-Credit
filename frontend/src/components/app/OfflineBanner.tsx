import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs font-medium text-warning"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="h-3.5 w-3.5" />
          You're offline. Some features may be unavailable.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
