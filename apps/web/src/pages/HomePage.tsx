import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  FileCheck2,
  HelpCircle,
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
import { useSiteContent } from "@/features/cms/hooks";
import { transitions, fadeInUp, scaleIn, createStaggerContainer } from "@/lib/motion";

export function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { content } = useSiteContent();
  const { data: stats, isPending: statsLoading } = usePublicStats();
  const { data: featuredJobs, isPending: jobsLoading } = useFeaturedJobs();

  const hp = content.homePage;

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
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface-muted/50 to-background border-b border-border/60 py-16 sm:py-24">
        {/* Subtle decorative glow orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-brand/10 blur-[100px]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            variants={createStaggerContainer(0.1, 0.05)}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {hp.hero.badgeText && (
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1 text-xs font-semibold text-brand-text shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                  {hp.hero.badgeText}
                </span>
              </motion.div>
            )}

            <motion.h1
              variants={fadeInUp}
              className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance"
            >
              {hp.hero.headline} <span className="text-brand">{hp.hero.highlightedWord}</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance"
            >
              {hp.hero.subheadline}
            </motion.p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.springSmooth, delay: 0.25 }}
            onSubmit={handleSearch}
            className="mt-10 mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-2.5 shadow-raised sm:flex sm:items-center sm:gap-2 transition-shadow focus-within:shadow-xl focus-within:border-brand/40"
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
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button type="submit" size="lg" className="w-full sm:w-auto mt-2 sm:mt-0 px-6 h-12 font-semibold">
                Find Jobs
              </Button>
            </motion.div>
          </motion.form>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-6 flex items-center justify-center gap-4 text-sm"
          >
            <Link
              to={hp.hero.primaryCtaUrl || "/jobs"}
              className="text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 transition-colors"
            >
              {hp.hero.primaryCtaText || "Browse all open positions"}
            </Link>
            <span className="text-border">•</span>
            <Link
              to={isRecruiter ? "/dashboard/recruiter/jobs/new" : (hp.hero.secondaryCtaUrl || "/signup")}
              className="text-brand font-semibold hover:text-brand-hover inline-flex items-center gap-1 group"
            >
              {hp.hero.secondaryCtaText || "Post a job opening"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Statistics Section */}
      {hp.hero.showLiveCounter && (
        <section aria-labelledby="live-stats-heading" className="border-b border-border bg-surface py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 id="live-stats-heading" className="sr-only">Platform Statistics</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <motion.div
                whileHover={{ y: -3, transition: transitions.springSmooth }}
                className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/40 p-6 transition-colors hover:border-brand/40"
              >
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
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: transitions.springSmooth }}
                className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/40 p-6 transition-colors hover:border-accent/40"
              >
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
              </motion.div>

              <motion.div
                whileHover={{ y: -3, transition: transitions.springSmooth }}
                className="flex items-center gap-4 rounded-xl border border-border/80 bg-surface-muted/40 p-6 transition-colors hover:border-info/40"
              >
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
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Browse by Category Section */}
      {hp.featuredCategoriesSection.visible && (
        <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                {hp.featuredCategoriesSection.heading}
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                {hp.featuredCategoriesSection.subheading}
              </p>
            </div>
            <Link to="/jobs" className="text-sm font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1 group">
              Browse all categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {JOB_CATEGORIES.slice(0, 12).map((category) => (
              <motion.button
                key={category}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={transitions.springSmooth}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-text cursor-pointer"
              >
                <span>{category}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

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
            <Link to="/jobs" className="text-sm font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1 group">
              View all jobs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
            <motion.div
              variants={createStaggerContainer(0.06, 0.02)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </motion.div>
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
      {hp.featuresSection.visible && (
        <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-semibold text-brand">Why Choose {content.general.siteName}</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">
              {hp.featuresSection.heading}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {hp.featuresSection.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              whileHover={{ y: -4, transition: transitions.springSmooth }}
              className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-brand/40 transition-colors"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-soft text-brand-text mb-5">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">Smart Search</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Filter with pinpoint accuracy by location, remote policy, technology stack, and salary requirements.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, transition: transitions.springSmooth }}
              className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-accent/40 transition-colors"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-soft text-accent mb-5">
                <LineChart className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">Salary Insights</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Transparent compensation bands on listings empower fair negotiations and confident career choices.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, transition: transitions.springSmooth }}
              className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-info/40 transition-colors"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-info-soft text-info mb-5">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">Verified Companies</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every employer profile undergoes administrative verification before listings can be published.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, transition: transitions.springSmooth }}
              className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-success/40 transition-colors"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-soft text-success mb-5">
                <FileCheck2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">Secure Profiles</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Private resume storage with restricted authorized access ensures complete data confidentiality.
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* How it Works Section */}
      {hp.howItWorksSection.visible && (
        <section className="border-t border-border bg-surface-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                {hp.howItWorksSection.heading}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {hp.howItWorksSection.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* For Seekers */}
              <motion.div
                whileHover={{ y: -3, transition: transitions.springSmooth }}
                className="rounded-2xl border border-border bg-surface p-8 shadow-card"
              >
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
              </motion.div>

              {/* For Recruiters */}
              <motion.div
                whileHover={{ y: -3, transition: transitions.springSmooth }}
                className="rounded-2xl border border-border bg-surface p-8 shadow-card"
              >
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
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic FAQ Section with Smooth AnimatePresence Accordion */}
      {hp.faq.visible && hp.faq.items && hp.faq.items.length > 0 && (
        <section className="py-20 border-t border-border bg-surface">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-text mb-3">
                <HelpCircle className="h-3.5 w-3.5" /> FAQ
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground">
                {hp.faq.title}
              </h2>
              {hp.faq.subtitle && (
                <p className="mt-2 text-muted-foreground text-sm sm:text-base">
                  {hp.faq.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-3.5">
              {hp.faq.items
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-surface-muted/40 transition-colors overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                        className="w-full py-4 px-5 text-left font-semibold text-foreground flex items-center justify-between gap-4 hover:bg-surface-muted/80 transition-colors cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm sm:text-base">{item.question}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={transitions.springSmooth}
                          className="shrink-0"
                        >
                          <ChevronDown
                            className={`h-4 w-4 ${isOpen ? "text-brand" : "text-muted-foreground"}`}
                          />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="faq-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={transitions.springSmooth}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Banner */}
      {hp.ctaBanner.visible && (
        <section className="relative overflow-hidden bg-brand text-brand-foreground py-16">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl text-balance">
              {hp.ctaBanner.title}
            </h2>
            <p className="mt-4 text-brand-foreground/80 max-w-xl mx-auto text-base">
              {hp.ctaBanner.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to={hp.ctaBanner.buttonUrl || "/signup"}>
                  <Button size="lg" className="bg-surface text-foreground hover:bg-surface-muted font-bold shadow-md">
                    {hp.ctaBanner.buttonText || "Get Started Free"}
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/jobs">
                  <Button size="lg" variant="outline" className="border-brand-foreground/30 text-brand-foreground hover:bg-brand-hover">
                    Explore Jobs
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
