import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
