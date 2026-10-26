import { Link } from "react-router-dom";
import { Building2, Users, Target, ShieldCheck, Award, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui";

const STATS = [
  { value: "50,000+", label: "Active Job Seekers" },
  { value: "2,500+", label: "Verified Employers" },
  { value: "15,000+", label: "Successful Matches" },
  { value: "98%", label: "Satisfaction Rate" },
];

const VALUES = [
  {
    icon: Target,
    title: "Precision Matching",
    description: "We believe job search shouldn't be a numbers game. We build technology that connects the right skills with the right opportunities.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description: "Every company is vetted by administrators. Salaries, perks, and expectations are presented upfront with zero dark patterns.",
  },
  {
    icon: Users,
    title: "Candidate-First Experience",
    description: "Job seekers deserve dignity, fast responses, and clear visibility into where their applications stand at every stage.",
  },
  {
    icon: HeartHandshake,
    title: "Empowering Recruiters",
    description: "Recruiters deserve intuitive, powerful hiring pipelines without clutter, bloat, or excessive enterprise overhead.",
  },
];

export function AboutPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge tone="brand" className="mb-3">
            Our Mission
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Building the most authentic hiring loop in the world
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            HireLoop was founded with a singular conviction: the recruitment process is broken when it treats candidates as numbers and recruiters as spam machines. We are building a modern, human-centric ecosystem where great talent and top organizations thrive together.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-surface p-8 shadow-sm lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold tracking-tight text-brand sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="mt-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge tone="brand">The HireLoop Story</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Why we started HireLoop
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                In an era dominated by automated resume filters that reject 75% of qualified applicants and cookie-cutter job boards cluttered with stale postings, genuine talent often goes unnoticed.
              </p>
              <p>
                HireLoop was built from the ground up to solve this friction. With verified company profiles, real-time application tracking, direct recruiter-applicant transparency, and high-performance modern tooling, we close the loop between discovery and hiring.
              </p>
              <p>
                Today, thousands of candidates use HireLoop to discover meaningful work in tech, product, design, and business leadership.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-muted p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground font-bold text-xl">
                  HL
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Continuous Quality</h3>
                  <p className="text-sm text-muted-foreground">Rigorous employer moderation standards</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <blockquote className="italic text-foreground">
                  "Our goal is not to have the most job postings on the internet. Our goal is to have the most relevant, reliable, and active opportunities available anywhere."
                </blockquote>
                <p className="mt-3 text-sm font-semibold text-brand">— The HireLoop Engineering & Product Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-24">
          <div className="text-center">
            <Badge tone="brand" className="mb-2">Our Values</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Principles that guide our product
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div key={val.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-text mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">{val.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-2xl bg-brand p-8 text-center text-brand-foreground shadow-lg sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Ready to find your next opportunity or hire exceptional talent?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-foreground/90">
            Join thousands of professionals already accelerating their careers on HireLoop.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-lg bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-surface-muted transition-colors"
            >
              Get Started for Free
            </Link>
            <Link
              to="/jobs"
              className="rounded-lg border border-brand-foreground/30 bg-transparent px-6 py-3 text-sm font-semibold text-brand-foreground hover:bg-brand-foreground/10 transition-colors"
            >
              Browse Open Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

