import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { transitions } from "@/lib/motion";

/** Centered card used by every auth page, so sign-in and recovery look consistent. */
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transitions.springSmooth}
        className="rounded-2xl border border-border bg-surface/95 backdrop-blur-sm p-6 shadow-card sm:p-8 hover:shadow-raised transition-shadow"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={transitions.springSmooth}
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
