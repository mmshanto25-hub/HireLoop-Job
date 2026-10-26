import { Link, Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { BrandMark } from "./BrandMark";

/** Shared shell for public pages. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <BrandMark />
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                HireLoop connects ambitious job seekers with world-class employers through verified profiles, transparent job listings, and real-time hiring pipelines.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                For Job Seekers
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/jobs" className="text-muted-foreground hover:text-foreground">
                    Browse All Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/companies" className="text-muted-foreground hover:text-foreground">
                    Company Directory
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                    Seeker Plans
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-muted-foreground hover:text-foreground">
                    Create Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                For Employers
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                    Recruiter Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/recruiter/jobs/new" className="text-muted-foreground hover:text-foreground">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/recruiter/company" className="text-muted-foreground hover:text-foreground">
                    Employer Branding
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                    Enterprise Sales
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Company & Legal
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} HireLoop Technologies Inc. All rights reserved.</p>
            <p>Empowering global career growth with precision and transparency.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
