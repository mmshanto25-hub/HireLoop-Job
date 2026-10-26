import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { JobListItem, CompanyListItem } from "@hireloop/shared";
import { JobCard } from "@/components/jobs/JobCard";
import { CompanyCard } from "@/components/companies/CompanyCard";

describe("JobCard Component", () => {
  const mockJob: JobListItem = {
    id: "job-1",
    title: "Senior Full-Stack Engineer",
    slug: "senior-full-stack-engineer-at-hireloop",
    companyId: "comp-1",
    companyName: "HireLoop Tech",
    companySlug: "hireloop-tech",
    companyLogoUrl: null,
    category: "Engineering",
    jobType: "full-time",
    salaryMin: 120000,
    salaryMax: 150000,
    currency: "USD",
    salaryPeriod: "yearly",
    city: "San Francisco",
    country: "USA",
    isRemote: true,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  it("renders job title, company name, salary range, and featured badge", () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Senior Full-Stack Engineer")).toBeInTheDocument();
    expect(screen.getByText("HireLoop Tech")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Remote friendly")).toBeInTheDocument();
    expect(screen.getByText(/\$120,000 - \$150,000 \/yr/)).toBeInTheDocument();
    expect(screen.getByText("View job")).toBeInTheDocument();
  });
});

describe("CompanyCard Component", () => {
  const mockCompany: CompanyListItem = {
    id: "comp-1",
    name: "Stripe",
    slug: "stripe",
    industry: "Fintech",
    location: "San Francisco, CA",
    employeeRange: "1001-5000",
    logoUrl: null,
    description: "Financial infrastructure for the internet.",
    openJobCount: 14,
  };

  it("renders company name, industry, employee count, and open job count", () => {
    render(
      <MemoryRouter>
        <CompanyCard company={mockCompany} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getByText("Fintech")).toBeInTheDocument();
    expect(screen.getByText(/1001-5000 employees/)).toBeInTheDocument();
    expect(screen.getByText("14 open jobs")).toBeInTheDocument();
    expect(screen.getByText("View company")).toBeInTheDocument();
  });
});

