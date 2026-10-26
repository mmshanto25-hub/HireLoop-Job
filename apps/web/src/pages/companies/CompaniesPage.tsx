import { useState } from "react";
import { Search } from "lucide-react";
import { INDUSTRIES } from "@hireloop/shared";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CompanyCard } from "@/components/companies/CompanyCard";
import { useApprovedCompanies } from "@/features/companies/hooks";

export function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState("");

  const { data: companies, isPending, isError, error, refetch } = useApprovedCompanies({
    q: searchTerm || undefined,
    industry: industry || undefined,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b border-border bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Verified Companies
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Discover top employers vetted by our moderation team. Explore their culture and open positions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-border bg-surface p-6 space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Could not load companies"
            message={error.message}
            onRetry={() => void refetch()}
          />
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No companies found"
            description="Try adjusting your search criteria or clearing industry filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setIndustry("");
                }}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Clear filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}

