import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Building2, Globe, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard } from "@/components/jobs/JobCard";
import { useCompany } from "@/features/companies/hooks";
import { useSearchJobs } from "@/features/jobs/hooks";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function CompanyProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: company, isPending, isError, error, refetch } = useCompany(slug);

  useDocumentTitle(
    company ? `${company.name} Careers & Overview` : "Company Profile",
    company ? `${company.name} profile, open positions, industry details, and headquarters.` : undefined,
  );

  // Search jobs for this company
  const { data: companyJobs, isPending: jobsPending } = useSearchJobs(
    company ? { q: company.name } : {},
  );

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="h-60 rounded-xl border border-border bg-surface p-8 space-y-4">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState
          title="Company not found"
          message={error?.message || "This company does not exist or has not been approved."}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Schema.org Organization Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: company.website || `https://hireloop.dev/companies/${company.slug}`,
            logo: company.logoUrl,
            description: company.description,
            address: {
              "@type": "PostalAddress",
              addressLocality: company.location,
            },
          }),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="border-b border-border bg-surface py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to verified companies
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Banner / Header Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar
              src={company.logoUrl}
              name={company.name}
              size="xl"
              className="rounded-2xl border border-border bg-surface-muted h-24 w-24 text-2xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {company.name}
                </h1>
                <Badge tone="brand" size="md">
                  {company.industry}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {company.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {company.employeeRange} employees
                </span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-brand hover:underline"
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">About {company.name}</h2>
            <p className="mt-3 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>

        {/* Current Open Positions */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-brand" aria-hidden="true" />
              Open Positions at {company.name}
            </h2>
            <span className="text-sm text-muted-foreground">
              {company.openJobCount} active {company.openJobCount === 1 ? "listing" : "listings"}
            </span>
          </div>

          {jobsPending ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : companyJobs && companyJobs.length > 0 ? (
            <div className="space-y-4">
              {companyJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted-foreground text-sm">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              No active job postings from this company at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
