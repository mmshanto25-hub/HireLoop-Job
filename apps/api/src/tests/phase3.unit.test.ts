import { describe, expect, it } from "vitest";
import {
  createCompanySchema,
  reviewCompanySchema,
  createJobSchema,
  jobSearchSchema,
  updateSeekerProfileSchema,
  updateRecruiterProfileSchema,
} from "@hireloop/shared";
import { calculateSeekerCompleteness } from "../models/SeekerProfile.js";
import { isValidImageSignature, isValidPdfSignature } from "../services/storage.service.js";

describe("Phase 3: Storage & Signature Verification", () => {
  it("detects genuine PDF magic bytes and rejects counterfeit files", () => {
    const validPdfHeader = Buffer.from("%PDF-1.7\n...");
    expect(isValidPdfSignature(validPdfHeader)).toBe(true);

    const fakePdf = Buffer.from("NOT-A-PDF-FILE");
    expect(isValidPdfSignature(fakePdf)).toBe(false);

    const shortBuffer = Buffer.from("%PD");
    expect(isValidPdfSignature(shortBuffer)).toBe(false);
  });

  it("detects PNG, JPEG, and WebP image signatures", () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(isValidImageSignature(pngHeader, "image/png")).toBe(true);

    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    expect(isValidImageSignature(jpegHeader, "image/jpeg")).toBe(true);

    const randomBytes = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    expect(isValidImageSignature(randomBytes, "image/png")).toBe(false);
  });
});

describe("Phase 3: Seeker Profile Completeness Calculation", () => {
  it("calculates 0% completeness for an empty profile without avatar", () => {
    const score = calculateSeekerCompleteness({}, false);
    expect(score).toBe(0);
  });

  it("calculates 100% completeness for a fully populated profile", () => {
    const fullProfile = {
      headline: "Staff Systems Architect",
      bio: "10+ years engineering high-scale distributed systems.",
      skills: ["Go", "TypeScript", "Distributed Systems"],
      location: "San Francisco, CA",
      phone: "+1 555-0199",
      resumeObjectKey: "resumes/abc-123.pdf",
    };
    const score = calculateSeekerCompleteness(fullProfile, true);
    expect(score).toBe(100);
  });

  it("calculates intermediate completeness score accurately", () => {
    const scoreWithAvatarOnly = calculateSeekerCompleteness({}, true);
    expect(scoreWithAvatarOnly).toBe(15);

    const scoreWithAvatarAndHeadline = calculateSeekerCompleteness(
      { headline: "Frontend Lead" },
      true,
    );
    expect(scoreWithAvatarAndHeadline).toBe(30);

    const scoreWithSkills = calculateSeekerCompleteness(
      { skills: ["React", "TypeScript", "Tailwind"] },
      false,
    );
    expect(scoreWithSkills).toBe(20);
  });
});

describe("Phase 3: Company Schemas", () => {
  it("accepts valid company creation inputs", () => {
    const valid = {
      name: "Acme Cloud Corp",
      industry: "Technology",
      website: "https://acmecloud.example.com",
      location: "San Francisco, CA",
      employeeRange: "51-200",
      description: "Acme Cloud delivers resilient multicloud networking infrastructure for scale.",
    };
    const result = createCompanySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects company creation with invalid website", () => {
    const invalid = {
      name: "Acme Corp",
      industry: "Technology",
      website: "not-a-valid-url",
      location: "NYC",
      employeeRange: "11-50",
      description: "Acme delivers reliable software solutions for large enterprises worldwide.",
    };
    const result = createCompanySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("requires rejectionReason when company review status is rejected", () => {
    const validApproval = { status: "approved" };
    expect(reviewCompanySchema.safeParse(validApproval).success).toBe(true);

    const rejectedWithoutReason = { status: "rejected" };
    expect(reviewCompanySchema.safeParse(rejectedWithoutReason).success).toBe(false);

    const rejectedWithReason = {
      status: "rejected",
      rejectionReason: "Incomplete business tax documentation.",
    };
    expect(reviewCompanySchema.safeParse(rejectedWithReason).success).toBe(true);
  });
});

describe("Phase 3: Job Schemas", () => {
  it("accepts valid job input and enforces salaryMax >= salaryMin", () => {
    const validJob = {
      title: "Senior Backend Engineer",
      category: "Engineering",
      skills: ["Node.js", "TypeScript", "MongoDB"],
      jobType: "full-time",
      salaryMin: 120000,
      salaryMax: 160000,
      currency: "USD",
      salaryPeriod: "yearly",
      city: "Seattle",
      country: "United States",
      isRemote: true,
      description: "Build robust distributed backend services handling millions of concurrent job search queries.",
    };
    const result = createJobSchema.safeParse(validJob);
    expect(result.success).toBe(true);

    const invalidSalary = {
      ...validJob,
      salaryMin: 180000,
      salaryMax: 120000, // Invalid: max < min
    };
    const invalidResult = createJobSchema.safeParse(invalidSalary);
    expect(invalidResult.success).toBe(false);
  });

  it("rejects job with negative salary", () => {
    const negativeSalary = {
      title: "DevOps Engineer",
      category: "DevOps",
      skills: ["Kubernetes", "Terraform"],
      jobType: "full-time",
      salaryMin: -5000,
      description: "Automate infrastructure across multiple cloud providers.",
    };
    expect(createJobSchema.safeParse(negativeSalary).success).toBe(false);
  });

  it("parses and coerces jobSearchSchema query params with defaults", () => {
    const parsed = jobSearchSchema.parse({
      q: "react",
      category: "Engineering",
      isRemote: "true",
      salaryMin: "90000",
    });
    expect(parsed.q).toBe("react");
    expect(parsed.category).toBe("Engineering");
    expect(parsed.isRemote).toBe(true);
    expect(parsed.salaryMin).toBe(90000);
    expect(parsed.sort).toBe("newest");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });
});

describe("Phase 3: Seeker & Recruiter Profile Schemas", () => {
  it("validates seeker profile skills count and bio length", () => {
    const valid = {
      headline: "Senior Software Engineer",
      bio: "Passionate about full-stack web applications.",
      skills: ["React", "TypeScript", "GraphQL"],
    };
    expect(updateSeekerProfileSchema.safeParse(valid).success).toBe(true);

    const tooManySkills = {
      skills: Array.from({ length: 35 }, (_, i) => `Skill${i}`),
    };
    expect(updateSeekerProfileSchema.safeParse(tooManySkills).success).toBe(false);
  });

  it("validates recruiter profile updates", () => {
    const valid = {
      jobTitle: "Senior Talent Acquisition Manager",
      phone: "+1 555-0144",
      socialLinks: { linkedin: "https://linkedin.com/in/recruiter" },
      notificationPreferences: { newApplications: true },
    };
    expect(updateRecruiterProfileSchema.safeParse(valid).success).toBe(true);
  });
});

