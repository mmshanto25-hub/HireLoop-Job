import { describe, expect, it } from "vitest";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema,
  APPLICATION_STATUSES,
  NOTIFICATION_TYPES,
  FREE_SEEKER_MONTHLY_APPLICATION_LIMIT,
  FREE_SEEKER_SAVED_JOB_LIMIT,
} from "@hireloop/shared";

describe("Phase 4: Domain Constants & Plan Entitlements", () => {
  it("defines comprehensive application workflow statuses", () => {
    expect(APPLICATION_STATUSES).toContain("applied");
    expect(APPLICATION_STATUSES).toContain("under_review");
    expect(APPLICATION_STATUSES).toContain("shortlisted");
    expect(APPLICATION_STATUSES).toContain("offered");
    expect(APPLICATION_STATUSES).toContain("rejected");
    expect(APPLICATION_STATUSES).toContain("withdrawn");
  });

  it("defines all critical recruitment notification types", () => {
    expect(NOTIFICATION_TYPES).toContain("application_submitted");
    expect(NOTIFICATION_TYPES).toContain("application_status_changed");
    expect(NOTIFICATION_TYPES).toContain("interview_scheduled");
  });

  it("enforces free tier quotas according to specification", () => {
    expect(FREE_SEEKER_MONTHLY_APPLICATION_LIMIT).toBe(3);
    expect(FREE_SEEKER_SAVED_JOB_LIMIT).toBe(10);
  });
});

describe("Phase 4: Application Validation Schemas", () => {
  it("accepts valid application with resumeObjectKey and optional cover letter", () => {
    const valid = createApplicationSchema.parse({
      resumeObjectKey: "resumes/user-123.pdf",
      coverLetter: "I am excited to apply for this backend engineer position.",
    });
    expect(valid.resumeObjectKey).toBe("resumes/user-123.pdf");
    expect(valid.coverLetter).toBe("I am excited to apply for this backend engineer position.");
  });

  it("accepts application without cover letter and trims whitespace", () => {
    const valid = createApplicationSchema.parse({
      resumeObjectKey: "resumes/user-123.pdf",
      coverLetter: "   ",
    });
    expect(valid.resumeObjectKey).toBe("resumes/user-123.pdf");
    expect(valid.coverLetter).toBeUndefined();
  });

  it("rejects application without a resumeObjectKey", () => {
    const result = createApplicationSchema.safeParse({
      resumeObjectKey: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects application with cover letter exceeding 4,000 characters", () => {
    const oversizedNote = "a".repeat(4001);
    const result = createApplicationSchema.safeParse({
      resumeObjectKey: "resumes/test.pdf",
      coverLetter: oversizedNote,
    });
    expect(result.success).toBe(false);
  });
});

describe("Phase 4: Recruiter Status Update & Interview Scheduling", () => {
  it("validates permitted recruiter status transitions", () => {
    const validStatuses = ["under_review", "shortlisted", "offered", "rejected"] as const;
    for (const status of validStatuses) {
      const res = updateApplicationStatusStatus(status);
      expect(res.success).toBe(true);
    }
  });

  it("rejects unauthorized status transitions", () => {
    const res = updateApplicationStatusStatus("unknown_status" as any);
    expect(res.success).toBe(false);
  });

  it("accepts future interview dates", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = updateApplicationStatusSchema.safeParse({
      status: "shortlisted",
      interviewAt: tomorrow.toISOString(),
      recruiterNotes: "Strong candidate for panel interview",
    });
    expect(res.success).toBe(true);
  });

  it("rejects past interview dates", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const res = updateApplicationStatusSchema.safeParse({
      status: "shortlisted",
      interviewAt: yesterday.toISOString(),
    });
    expect(res.success).toBe(false);
  });

  it("rejects private recruiter notes exceeding 2,000 characters", () => {
    const longNotes = "x".repeat(2001);
    const res = updateApplicationStatusSchema.safeParse({
      status: "under_review",
      recruiterNotes: longNotes,
    });
    expect(res.success).toBe(false);
  });
});

describe("Phase 4: Application Query & Filter Schema", () => {
  it("defaults to 'all' status with page 1 and limit 20", () => {
    const parsed = applicationQuerySchema.parse({});
    expect(parsed.status).toBe("all");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it("coerces numeric string query parameters", () => {
    const parsed = applicationQuerySchema.parse({
      status: "shortlisted",
      page: "3",
      limit: "15",
    });
    expect(parsed.status).toBe("shortlisted");
    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(15);
  });
});

function updateApplicationStatusStatus(status: any) {
  return updateApplicationStatusSchema.safeParse({ status });
}

