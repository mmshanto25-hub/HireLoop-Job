import { Badge } from "@/components/ui";

export function TermsOfServicePage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge tone="brand" className="mb-3">Legal</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: October 26, 2026
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert mt-12 max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using HireLoop ("Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. User Accounts and Eligibility</h2>
            <p>
              To use certain features of the Service, you must create an account. You represent and warrant that you are at least 18 years of age and that all information provided during registration is accurate and truthful. You are responsible for safeguarding your credentials and for all activities occurring under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Job Seeker Obligations</h2>
            <p>Job seekers agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit genuine, verifiable resumes, employment histories, and credentials.</li>
              <li>Only apply to positions for which they have bona fide interest and relevant qualifications.</li>
              <li>Not impersonate any individual or misrepresent affiliation with any entity.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Recruiter and Employer Obligations</h2>
            <p>Recruiters and employers agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only post legitimate, current employment openings for verified legal business entities.</li>
              <li>Submit to administrator review and company verification prior to publishing listings.</li>
              <li>Comply with all applicable labor, employment discrimination, and fair hiring laws.</li>
              <li>Never charge candidates fees for application submissions or interviews.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Subscriptions and Payments</h2>
            <p>
              Paid subscription tiers are billed in advance on a recurring monthly or annual basis via Stripe. Subscriptions renew automatically unless cancelled prior to the end of the current billing cycle. Refunds are evaluated in accordance with our standard refund policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Prohibited Conduct</h2>
            <p>
              Users may not scrape data, probe security boundaries, upload malicious files, spam candidates, or reverse engineer any portion of the HireLoop infrastructure. Violation of these prohibitions results in immediate account suspension and potential legal action.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
              HireLoop is a venue connecting job seekers and employers. We do not guarantee employment, candidate qualification, interview outcomes, or continuous error-free platform uptime. To the maximum extent permitted by law, HireLoop is provided "as is" without warranty.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate any user account or access to the Service at our sole discretion, without prior notice, for conduct that violates these Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

