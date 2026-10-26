import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  type JobCategory,
  type JobType,
} from "@hireloop/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard } from "@/components/jobs/JobCard";
import { useSearchJobs } from "@/features/jobs/hooks";

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query state
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const jobTypeParam = searchParams.get("jobType") || "";
  const isRemoteParam = searchParams.get("isRemote") === "true";
  const cityParam = searchParams.get("city") || "";
  const salaryMinParam = searchParams.get("salaryMin") || "";
  const datePostedParam = searchParams.get("datePosted") || "all";
  const sortParam = (searchParams.get("sort") as "newest" | "salary_desc") || "newest";
  const pageParam = Number(searchParams.get("page")) || 1;

  // Local filter states
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedJobType, setSelectedJobType] = useState(jobTypeParam);
  const [isRemote, setIsRemote] = useState(isRemoteParam);
  const [city, setCity] = useState(cityParam);
  const [salaryMin, setSalaryMin] = useState(salaryMinParam);
  const [datePosted, setDatePosted] = useState(datePostedParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchTerm(qParam);
    setSelectedCategory(categoryParam);
    setSelectedJobType(jobTypeParam);
    setIsRemote(isRemoteParam);
    setCity(cityParam);
    setSalaryMin(salaryMinParam);
    setDatePosted(datePostedParam);
    setSortBy(sortParam);
  }, [qParam, categoryParam, jobTypeParam, isRemoteParam, cityParam, salaryMinParam, datePostedParam, sortParam]);

  // Execute query with current URL params
  const { data: jobs, isPending, isError, error, refetch } = useSearchJobs({
    q: qParam || undefined,
    category: (categoryParam as JobCategory) || undefined,
    jobType: (jobTypeParam as JobType) || undefined,
    isRemote: isRemoteParam ? true : undefined,
    city: cityParam || undefined,
    salaryMin: salaryMinParam ? Number(salaryMinParam) : undefined,
    datePosted: (datePostedParam as "24h" | "7d" | "30d" | "all") || undefined,
    sort: sortParam,
    page: pageParam,
    limit: 20,
  });

  function applyFilters(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm.trim()) newParams.set("q", searchTerm.trim());
    if (selectedCategory) newParams.set("category", selectedCategory);
    if (selectedJobType) newParams.set("jobType", selectedJobType);
    if (isRemote) newParams.set("isRemote", "true");
    if (city.trim()) newParams.set("city", city.trim());
    if (salaryMin.trim()) newParams.set("salaryMin", salaryMin.trim());
    if (datePosted && datePosted !== "all") newParams.set("datePosted", datePosted);
    if (sortBy && sortBy !== "newest") newParams.set("sort", sortBy);
    newParams.set("page", "1");
    setSearchParams(newParams);
    setMobileFilterOpen(false);
  }

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedJobType("");
    setIsRemote(false);
    setCity("");
    setSalaryMin("");
    setDatePosted("all");
    setSortBy("newest");
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  }

  const FilterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand" aria-hidden="true" />
          Filter Jobs
        </h3>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset all
        </button>
      </div>

      {/* Category filter */}
      <div className="space-y-2">
        <label htmlFor="filter-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Category
        </label>
        <Select
          id="filter-category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>

      {/* Job Type filter */}
      <div className="space-y-2">
        <label htmlFor="filter-job-type" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Job Type
        </label>
        <Select
          id="filter-job-type"
          value={selectedJobType}
          onChange={(e) => setSelectedJobType(e.target.value)}
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </Select>
      </div>

      {/* Remote checkbox */}
      <div className="pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
          <Checkbox
            checked={isRemote}
            onCheckedChange={(checked) => setIsRemote(Boolean(checked))}
          />
          <span>Remote positions only</span>
        </label>
      </div>

      {/* City/Location */}
      <div className="space-y-2">
        <label htmlFor="filter-city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Location / City
        </label>
        <Input
          id="filter-city"
          type="text"
          placeholder="e.g. New York, London"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Minimum Salary */}
      <div className="space-y-2">
        <label htmlFor="filter-salary" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Min Annual Salary ($)
        </label>
        <Input
          id="filter-salary"
          type="number"
          placeholder="e.g. 80000"
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value)}
        />
      </div>

      {/* Date Posted */}
      <div className="space-y-2">
        <label htmlFor="filter-date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Date Posted
        </label>
        <Select
          id="filter-date"
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
        >
          <option value="all">Any time</option>
          <option value="24h">Past 24 hours</option>
          <option value="7d">Past week</option>
          <option value="30d">Past month</option>
        </Select>
      </div>

      <Button type="button" onClick={() => applyFilters()} className="w-full">
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <div className="border-b border-border bg-surface py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Find Your Next Opportunity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore verified job postings from top hiring teams across the world.
          </p>

          {/* Top Search bar */}
          <form onSubmit={applyFilters} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search job title, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">Search</Button>
              <Button
                type="button"
                variant="outline"
                className="lg:hidden"
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
                Filters
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border bg-surface p-6 shadow-card">
              {FilterPanel}
            </div>
          </aside>

          {/* Job listings column */}
          <main className="lg:col-span-3">
            {/* Sort and Count Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {jobs ? (
                  <span>
                    Showing <strong className="text-foreground">{jobs.length}</strong> available jobs
                  </span>
                ) : (
                  "Searching jobs..."
                )}
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-muted-foreground font-medium">
                  Sort:
                </label>
                <Select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    const val = e.target.value as "newest" | "salary_desc";
                    setSortBy(val);
                    const newP = new URLSearchParams(searchParams);
                    newP.set("sort", val);
                    setSearchParams(newP);
                  }}
                  className="w-36 text-xs h-8"
                >
                  <option value="newest">Newest first</option>
                  <option value="salary_desc">Highest salary</option>
                </Select>
              </div>
            </div>

            {/* List state */}
            {isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-36 rounded-xl border border-border bg-surface p-5 space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <ErrorState
                title="Could not load jobs"
                message={error.message}
                onRetry={() => void refetch()}
              />
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matching jobs found"
                description="Try broadening your keywords, removing location filters, or resetting all criteria."
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    Clear all filters
                  </Button>
                }
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        title="Filter Jobs"
      >
        <div className="py-2">{FilterPanel}</div>
      </Drawer>
    </div>
  );
}

