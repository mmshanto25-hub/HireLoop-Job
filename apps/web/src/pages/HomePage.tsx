import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, Layers, Palette, ShieldCheck } from "lucide-react";
import type { HealthStatus } from "@hireloop/shared";
import { apiRequest } from "@/lib/api";
import { Button, ErrorState, Skeleton } from "@/components/ui";

const healthKey = ["system", "health"] as const;

/**
 * Phase 1 landing page. It calls the real API health endpoint so the team
 * can confirm the full stack (web, proxy, API) is wired together.
 */
export function HomePage() {
  const health = useQuery({
    queryKey: healthKey,
    queryFn: ({ signal }) => apiRequest<HealthStatus>("/health", { signal }),
  });

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-text">
          Foundation build
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
          Hiring and job search, built on one reliable platform.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          HireLoop connects job seekers, recruiters and administrators. This build is the verified
          foundation: the design system, the API and the database connection. Feature pages arrive
          in later phases.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/design-system">
            <Button size="lg">
              <Palette className="h-5 w-5" aria-hidden="true" />
              View design system
            </Button>
          </Link>
          <Link to="/jobs">
            <Button size="lg" variant="outline">
              Browse jobs
            </Button>
          </Link>
        </div>
      </section>

      <section aria-labelledby="status-heading" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 id="status-heading" className="text-xl font-semibold text-foreground">
          Platform status
        </h2>
        <div className="mt-4 max-w-2xl rounded-lg border border-border bg-surface p-6 shadow-card">
          {health.isPending ? (
            <div className="space-y-3" role="status" aria-live="polite">
              <span className="sr-only">Checking API status</span>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : health.isError ? (
            <ErrorState
              title="API unreachable"
              message={health.error.message}
              onRetry={() => void health.refetch()}
            />
          ) : (
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">API is responding</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="text-foreground">{health.data.service}</dd>
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="text-foreground">{health.data.version}</dd>
                  <dt className="text-muted-foreground">Checked</dt>
                  <dd className="text-foreground">
                    <time dateTime={health.data.timestamp}>
                      {new Date(health.data.timestamp).toLocaleString()}
                    </time>
                  </dd>
                </dl>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        aria-label="Foundation highlights"
        className="border-t border-border bg-surface-muted"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6">
          <Highlight
            icon={Layers}
            title="Typed end to end"
            text="Shared domain constants and response types keep the API and web app in agreement."
          />
          <Highlight
            icon={ShieldCheck}
            title="Secure by default"
            text="Validated configuration, locked-down headers, origin allow-list and structured errors."
          />
          <Highlight
            icon={Palette}
            title="One design system"
            text="Tokens for light and dark mode, and reusable accessible components for every page."
          />
        </div>
      </section>
    </div>
  );
}

function Highlight({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Layers;
  title: string;
  text: string;
}) {
  return (
    <div>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-soft text-brand-text">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
