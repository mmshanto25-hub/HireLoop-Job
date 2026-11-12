import { motion } from "framer-motion";

/** HireLoop logo mark and wordmark. Supports dynamic custom logo and site name. */
export function BrandMark({
  showWordmark = true,
  siteName = "HireLoop",
  logoUrl = null,
}: {
  showWordmark?: boolean;
  siteName?: string;
  logoUrl?: string | null;
}) {
  return (
    <motion.span
      className="inline-flex items-center gap-2 group cursor-pointer"
      whileHover="hover"
      initial="initial"
    >
      <motion.span
        variants={{
          initial: { scale: 1, rotate: 0 },
          hover: { scale: 1.06, rotate: -2, transition: { type: "spring", stiffness: 400, damping: 20 } },
        }}
        className="inline-flex items-center"
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            className="h-7 w-auto max-w-[140px] object-contain rounded"
          />
        ) : (
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="8" className="fill-brand shadow-sm" />
            <path d="M9 22V10h3v4.5h8V10h3v12h-3v-4.5h-8V22z" className="fill-accent-soft" />
          </svg>
        )}
      </motion.span>
      {showWordmark ? (
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand">
          {siteName}
        </span>
      ) : null}
    </motion.span>
  );
}
