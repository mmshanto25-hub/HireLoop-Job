import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe2,
  LineChart,
  MapPin,
  Search,
  Sparkles,
  Users2,
} from "lucide-react";
import { JOB_CATEGORIES } from "@hireloop/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { JobCard } from "@/components/jobs/JobCard";
import { useFeaturedJobs, usePublicStats } from "@/features/jobs/hooks";
import { useCurrentUser } from "@/features/auth/hooks";

export function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: stats, isPending: statsLoading } = usePublicStats();
  const { data: featuredJobs, isPending: jobsLoading } = useFeaturedJobs();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (location.trim()) params.set("city", location.trim());
    navigate(`/jobs?${params.toString()}`);
  }

  function handleCategoryClick(cat: string) {
    navigate(`/jobs?category=${encodeURIComponent(cat)}`);
  }

  const isRecruiter = user?.roles.includes("recruiter");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface-muted/50 to-background border-b border-border/60 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3.5 py-1 text-xs font-semibold text-brand-text">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Modern hiring & job search platform
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Find your next career move with <span className="text-brand">HireLoop</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Connect directly with verified companies hiring top engineering, design, and product talent.
              Real jobs, transparent salaries, and automated matching.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-10 mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-2.5 shadow-raised sm:flex sm:items-center sm:gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Job title, keywords, or skills..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-11 h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-foreground"
              />
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" aria-hidden="true" />
            <div className="relative flex-1 mt-2 sm:mt-0">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input
                type="text"
                placeholder="City, country, or Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-11 h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-foreground"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto mt-2 sm:mt-0 px-6 h-12 font-semibold">
              Find Jobs
            </Button>
          </form>

          {/* Action CTAs */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <Link to="/jobs" className="text-muted-foreground hover:text-foreground font-medium underline underline-offset-4">
              Browse all open positions
            </Link>
            <span className="text-border">•</span>
            <Link
              to={isRecruiter ? "/dashboard/recruiter/jobs/new" : "/signup"}
              className="text-brand font-semibold hover:text-brand-hover inline-flex items-center gap-1"
            >
              Post a job opening
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section aria-labelledby="live-stats-heading" className="border-b border-border bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="live-stats-heading" className="sr-only">Platform Statistics</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/50 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                <Briefcase className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Active Jobs</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {stats?.activeJobs ?? 0}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/50 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Approved Companies</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {stats?.approvedCompanies ?? 0}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/50 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-info-soft text-info">
                <Users2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Job Seekers</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {stats?.registeredSeekers ?? 0}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Explore by category
            </h2>
            <p className="mt-1.5 text-muted-foreground">
              Discover opportunities across popular industry domains.
            </p>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1">
            Browse all categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {JOB_CATEGORIES.slice(0, 12).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-brand hover:bg-brand-soft hover:text-brand-text active:scale-95"
            >
              <span>{category}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="border-t border-border bg-surface-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand">Handpicked Opportunities</span>
              <h2 className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Featured job openings
              </h2>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1">
              View all jobs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl border border-border bg-surface p-5 space-y-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center max-w-md mx-auto">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-foreground">No active jobs yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recruiters are onboarding. Be the first to publish a job!
              </p>
              <div className="mt-5">
                <Link to="/jobs">
                  <Button variant="outline">Browse Jobs</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-wider font-semibold text-brand">Why Choose HireLoop</span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">
            Built for modern recruitment excellence
          </h2>
          <p className="mt-3 text-muted-foreground">
            A comprehensive ecosystem designed from the ground up to eliminate friction in hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-soft text-brand-text mb-5">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">Smart Search</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Filter with pinpoint accuracy by location, remote policy, technology stack, and salary requirements.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent mb-5">
              <LineChart className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">Salary Insights</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Transparent compensation bands on listings empower fair negotiations and confident career choices.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-soft text-info mb-5">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">Verified Companies</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every employer profile undergoes administrative verification before listings can be published.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-soft text-success mb-5">
              <FileCheck2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-lg font-semibold text-foreground">Secure Profiles</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Private resume storage with restricted authorized access ensures complete data confidentiality.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-t border-border bg-surface-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              How HireLoop works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Simple, transparent steps for both talent and hiring managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Seekers */}
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">For Job Seekers</span>
              <h3 className="mt-2 font-heading text-xl font-bold text-foreground">Land your dream role</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Build your profile:</strong> Add your skills, work experience, and upload a verified PDF resume.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Filter & Save:</strong> Discover opportunities matching your salary and remote preferences.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Apply with confidence:</strong> Direct delivery to verified hiring teams with instant status updates.</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/signup">
                  <Button className="w-full">Create Free Seeker Account</Button>
                </Link>
              </div>
            </div>

            {/* For Recruiters */}
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">For Recruiters</span>
              <h3 className="mt-2 font-heading text-xl font-bold text-foreground">Hire qualified talent</h3>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Register Company:</strong> Submit your organization details for fast moderation approval.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Publish Openings:</strong> Post structured job descriptions with required skills and salary terms.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  <span><strong>Review & Track:</strong> Evaluate applicant resumes and manage hiring pipelines seamlessly.</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Register as Recruiter</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-brand text-brand-foreground py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl text-balance">
            Ready to accelerate your hiring or job search?
          </h2>
          <p className="mt-4 text-brand-foreground/80 max-w-xl mx-auto text-base">
            Join thousands of professionals already discovering new career horizons on HireLoop today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-surface text-foreground hover:bg-surface-muted font-bold">
                Get Started Free
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="border-brand-foreground/30 text-brand-foreground hover:bg-brand-hover">
                Explore Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
