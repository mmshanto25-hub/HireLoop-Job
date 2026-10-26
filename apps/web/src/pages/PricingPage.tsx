import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, HelpCircle, Sparkles, Zap, Building2, User } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

interface PlanTier {
  name: string;
  badge?: string;
  popular?: boolean;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  ctaVariant: "brand" | "outline";
}

const SEEKER_PLANS: PlanTier[] = [
  {
    name: "Basic",
    description: "Essential tools to kickstart your job search journey.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Search and filter all jobs",
      "Apply up to 10 jobs per month",
      "Standard candidate profile",
      "Save up to 15 favorite jobs",
      "Basic email alerts",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline",
  },
  {
    name: "Pro Seeker",
    badge: "Most Popular",
    popular: true,
    description: "Accelerate your career with premium visibility and insights.",
    monthlyPrice: 15,
    annualPrice: 12,
    features: [
      "Unlimited job applications",
      "Featured applicant badge on recruiter dashboards",
      "Full application status tracking & response analytics",
      "Priority resume indexing for recruiter searches",
      "Instant new job alerts via email",
      "Salary benchmark insights for your role",
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "brand",
  },
  {
    name: "Career VIP",
    description: "Comprehensive guidance and direct access to top opportunities.",
    monthlyPrice: 35,
    annualPrice: 28,
    features: [
      "Everything in Pro Seeker",
      "Direct message access to verified hiring managers",
      "1-on-1 resume & LinkedIn profile review quarterly",
      "Interview prep mock question bank with AI suggestions",
      "Priority 24/7 customer support",
    ],
    cta: "Upgrade to VIP",
    ctaVariant: "outline",
  },
];

const RECRUITER_PLANS: PlanTier[] = [
  {
    name: "Starter",
    description: "For small teams and startups hiring for occasional roles.",
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      "2 active job listings at any time",
      "30-day listing lifespan",
      "Standard company profile page",
      "Review and manage candidate applications",
      "Basic applicant filtering by skills",
    ],
    cta: "Start Starter Plan",
    ctaVariant: "outline",
  },
  {
    name: "Growth",
    badge: "Recommended",
    popular: true,
    description: "For expanding companies actively scaling engineering and operations.",
    monthlyPrice: 149,
    annualPrice: 119,
    features: [
      "10 active job listings",
      "Featured job placement on search results & homepage",
      "Direct candidate talent pool search (50 views/month)",
      "Team collaboration (up to 3 recruiter seats)",
      "Application export & CSV downloads",
      "Standard email & chat support",
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "brand",
  },
  {
    name: "Enterprise",
    description: "Custom hiring infrastructure for large organizations and agencies.",
    monthlyPrice: 349,
    annualPrice: 279,
    features: [
      "Unlimited active job listings",
      "Dedicated verified company showcase badge",
      "Unlimited candidate search & direct outreach",
      "Unlimited team seats & role permissions",
      "ATS integration & custom webhook support",
      "Dedicated account manager & SLA support",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline",
  },
];

const FAQS = [
  {
    question: "Can I change or cancel my plan at any time?",
    answer:
      "Yes, absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly from your billing settings. If you cancel, your subscription will remain active until the end of the current billing cycle.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "You get full access to all features in your chosen plan for 14 days without charge. You can cancel anytime before the trial ends and you will not be billed.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) powered securely by Stripe. Enterprise customers can also request invoicing via wire transfer.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer:
      "Yes! When you choose annual billing, you save 20% compared to monthly billing on both Seeker and Recruiter plans.",
  },
  {
    question: "What happens to my job listings if I downgrade my recruiter plan?",
    answer:
      "Active listings exceeding your new plan limit will gracefully transition to closed status. You can always choose which listings to keep active.",
  },
];

export function PricingPage() {
  const [audience, setAudience] = useState<"seeker" | "recruiter">("seeker");
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = audience === "seeker" ? SEEKER_PLANS : RECRUITER_PLANS;

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge tone="brand" className="mb-3">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Choose the right plan for your ambitions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Whether you are advancing your individual career or scaling a high-impact team, HireLoop has the right tools for you.
          </p>

          {/* Audience Switcher */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => setAudience("seeker")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all",
                  audience === "seeker"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="h-4 w-4" />
                For Job Seekers
              </button>
              <button
                type="button"
                onClick={() => setAudience("recruiter")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all",
                  audience === "recruiter"
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Building2 className="h-4 w-4" />
                For Recruiters & Companies
              </button>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                !annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Monthly billing
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
                annual ? "bg-brand" : "bg-neutral-300 dark:bg-neutral-700",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  annual ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                annual ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Annual billing
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-surface p-8 shadow-sm transition-all hover:shadow-md",
                  plan.popular
                    ? "border-brand ring-2 ring-brand/30 dark:border-brand-soft"
                    : "border-border",
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    ${price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / month{annual && price > 0 ? " (billed yearly)" : ""}
                  </span>
                </div>

                <Link
                  to="/signup"
                  className={cn(
                    "mb-8 inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
                    plan.ctaVariant === "brand"
                      ? "bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm"
                      : "border border-border bg-surface text-foreground hover:bg-surface-muted",
                  )}
                >
                  {plan.cta}
                </Link>

                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Notice */}
        <div className="mt-16 rounded-xl border border-border bg-surface-muted p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-text mb-3">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Need a custom plan or higher hiring volume?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            We partner with enterprises, staffing firms, and high-growth organizations with tailored volume requirements and direct API integrations.
          </p>
          <div className="mt-4">
            <Link to="/contact">
              <Button variant="outline">Talk to Our Team</Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Have questions about how billing and subscriptions work? We have answers.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className="p-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-start justify-between text-left font-semibold text-foreground focus:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-brand shrink-0" />
                      {faq.question}
                    </span>
                    <span className="ml-4 text-lg font-bold text-muted-foreground">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground pl-6">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

