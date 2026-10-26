import { Badge } from "@/components/ui";

export function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge tone="brand" className="mb-3">Legal</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: October 26, 2026
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert mt-12 max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
              HireLoop ("we," "our," or "us") is dedicated to protecting your privacy and ensuring transparency in how your personal data is collected, processed, and safeguarded. This Privacy Policy applies to our website, APIs, applications, and all associated services (collectively, the "Platform").
            </p>
            <p>
              By accessing or using HireLoop, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
            <p>We collect several types of information from and about users of our Platform, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Personal Identification Information:</strong> Full name, email address, password hashes, telephone number, location (city, state, country), and profile photographs.
              </li>
              <li>
                <strong className="text-foreground">Job Seeker Data:</strong> Resumes, employment history, education, skills, desired compensation, portfolio links, and application status records.
              </li>
              <li>
                <strong className="text-foreground">Recruiter and Company Data:</strong> Company name, logo, industry, employee headcounts, business registration details, and posted job descriptions.
              </li>
              <li>
                <strong className="text-foreground">Technical & Usage Data:</strong> IP addresses, browser types, operating systems, referring URLs, and access timestamps collected through secure logs.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
            <p>We use information held about you in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, maintain, and personalize the HireLoop platform.</li>
              <li>To match qualified candidates with relevant job opportunities and facilitate direct recruiter evaluations.</li>
              <li>To process subscription payments and enforce plan limits via Stripe.</li>
              <li>To deliver service announcements, security alerts, and administrative communications.</li>
              <li>To prevent fraud, protect intellectual property, and enforce our Terms of Service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Resume and Document Privacy</h2>
            <p>
              Resumes uploaded to HireLoop are stored in private, access-restricted storage. They are never indexed publicly by web search engines. Your resume is only shared with verified recruiters and employers when you apply for a job posting or when you explicitly opt-in to recruiter talent discovery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Data Retention & Deletion</h2>
            <p>
              We retain your personal data only as long as necessary to fulfill the purposes for which it was collected or to comply with legal obligations. You may request account deletion at any time via your dashboard settings or by contacting privacy@hireloop.io.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Security Measures</h2>
            <p>
              We implement industry-standard technical and organizational security controls, including bcrypt password hashing, encrypted TLS in transit, secure HTTP-only cookies, and role-based server-side authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, please contact our Data Protection Officer at <span className="text-brand font-medium">privacy@hireloop.io</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

