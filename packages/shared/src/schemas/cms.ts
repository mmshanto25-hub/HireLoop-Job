import { z } from "zod";
import type { SiteContent } from "../types/cms.js";

export const generalSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(60),
  siteTagline: z.string().trim().max(120).default("The premier job hunting & hiring platform"),
  logoUrl: z.string().trim().max(500).nullable().default(null),
  darkLogoUrl: z.string().trim().max(500).nullable().default(null),
  faviconUrl: z.string().trim().max(500).nullable().default(null),
  primaryBrandColor: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid HEX color code").default("#0d9488"),
  supportEmail: z.string().trim().email("Invalid email address").default("support@hireloop.dev"),
  contactPhone: z.string().trim().max(30).nullable().default(null),
});

export const announcementSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  message: z.string().trim().max(300).default("Welcome to HireLoop! Discover thousands of curated jobs."),
  linkUrl: z.string().trim().max(500).nullable().default("/jobs"),
  linkLabel: z.string().trim().max(50).nullable().default("Explore Now"),
  variant: z.enum(["info", "warning", "success", "danger"]).default("info"),
  dismissible: z.boolean().default(true),
});

export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  noticeMessage: z.string().trim().max(500).default("HireLoop is currently undergoing scheduled maintenance. We will be right back."),
  allowedIps: z.array(z.string().trim()).default([]),
});

export const headerNavLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Label is required").max(50),
  path: z.string().trim().min(1, "Path is required").max(200),
  isExternal: z.boolean().default(false),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const headerSettingsSchema = z.object({
  enableJobSearch: z.boolean().default(true),
  enableCompaniesLink: z.boolean().default(true),
  enablePricingLink: z.boolean().default(true),
  navLinks: z.array(headerNavLinkSchema).default([]),
  primaryCta: z.object({
    label: z.string().trim().max(50).default("Get Started"),
    path: z.string().trim().max(200).default("/auth/signup"),
    visible: z.boolean().default(true),
  }),
});

export const heroStatItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(50),
  value: z.string().trim().min(1).max(30),
});

export const faqItemSchema = z.object({
  id: z.string().min(1),
  question: z.string().trim().min(1, "Question is required").max(200),
  answer: z.string().trim().min(1, "Answer is required").max(1000),
  order: z.number().int().default(0),
});

export const homePageSettingsSchema = z.object({
  hero: z.object({
    badgeText: z.string().trim().max(100).default("Modern hiring & job search platform"),
    headline: z.string().trim().min(1, "Headline is required").max(150).default("Find your next career move with"),
    highlightedWord: z.string().trim().max(50).default("HireLoop."),
    subheadline: z.string().trim().max(400).default("Connect with vetted companies, apply with verified credentials, and track your interviews in one real-time workspace."),
    primaryCtaText: z.string().trim().max(50).default("Browse jobs"),
    primaryCtaUrl: z.string().trim().max(200).default("/jobs"),
    secondaryCtaText: z.string().trim().max(50).default("Post a job"),
    secondaryCtaUrl: z.string().trim().max(200).default("/auth/signup?role=recruiter"),
    showLiveCounter: z.boolean().default(true),
    customStats: z.array(heroStatItemSchema).default([]),
  }),
  featuredCategoriesSection: z.object({
    visible: z.boolean().default(true),
    heading: z.string().trim().max(100).default("Browse by category"),
    subheading: z.string().trim().max(200).default("Explore opportunities across high-growth engineering, design, and product roles."),
  }),
  trustedCompaniesSection: z.object({
    visible: z.boolean().default(true),
    heading: z.string().trim().max(100).default("Trusted by innovative teams"),
    displayCompanyLogos: z.boolean().default(true),
  }),
  featuresSection: z.object({
    visible: z.boolean().default(true),
    heading: z.string().trim().max(100).default("Built for serious hiring"),
    subheading: z.string().trim().max(200).default("Everything you need to discover, manage, and close career opportunities without noise."),
  }),
  howItWorksSection: z.object({
    visible: z.boolean().default(true),
    heading: z.string().trim().max(100).default("How HireLoop Works"),
    subheading: z.string().trim().max(200).default("A modern workflow tailored for both top-tier talent and growing engineering organizations."),
  }),
  ctaBanner: z.object({
    visible: z.boolean().default(true),
    title: z.string().trim().max(150).default("Ready to accelerate your hiring?"),
    description: z.string().trim().max(400).default("Create your recruiter account in seconds, verify your company, and start publishing active listings today."),
    buttonText: z.string().trim().max(50).default("Create an employer account"),
    buttonUrl: z.string().trim().max(200).default("/auth/signup?role=recruiter"),
  }),
  faq: z.object({
    visible: z.boolean().default(true),
    title: z.string().trim().max(100).default("Frequently Asked Questions"),
    subtitle: z.string().trim().max(200).default("Everything you need to know about navigating opportunities on HireLoop."),
    items: z.array(faqItemSchema).default([]),
  }),
});

export const footerLinkItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Label is required").max(60),
  url: z.string().trim().min(1, "URL is required").max(200),
  isExternal: z.boolean().default(false),
});

export const footerColumnSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Column title is required").max(60),
  order: z.number().int().default(0),
  links: z.array(footerLinkItemSchema).default([]),
});

export const footerSettingsSchema = z.object({
  description: z.string().trim().max(400).default("HireLoop connects ambitious job seekers with world-class employers through verified credentials, transparent pay, and real-time application tracking."),
  tagline: z.string().trim().max(150).default("Empowering global career growth with precision and transparency."),
  copyrightText: z.string().trim().max(200).default("© {year} HireLoop Technologies Inc. All rights reserved."),
  showNewsletterSignup: z.boolean().default(true),
  socialLinks: z.object({
    twitter: z.string().trim().max(200).nullable().default("https://twitter.com"),
    linkedin: z.string().trim().max(200).nullable().default("https://linkedin.com"),
    github: z.string().trim().max(200).nullable().default("https://github.com"),
    facebook: z.string().trim().max(200).nullable().default(null),
    instagram: z.string().trim().max(200).nullable().default(null),
  }),
  columns: z.array(footerColumnSchema).default([]),
});

export const seoSettingsSchema = z.object({
  metaTitle: z.string().trim().max(100).default("HireLoop — Modern Tech Job Hunting & Hiring Platform"),
  metaDescription: z.string().trim().max(300).default("Discover thousands of curated software engineering, design, and product jobs. Connect directly with verified employers on HireLoop."),
  ogImageUrl: z.string().trim().max(500).nullable().default(null),
  googleAnalyticsId: z.string().trim().max(50).nullable().default(null),
});

export const updateSiteContentSchema = z.object({
  general: generalSettingsSchema.optional(),
  announcement: announcementSettingsSchema.optional(),
  maintenance: maintenanceSettingsSchema.optional(),
  header: headerSettingsSchema.optional(),
  homePage: homePageSettingsSchema.optional(),
  footer: footerSettingsSchema.optional(),
  seo: seoSettingsSchema.optional(),
});
export type UpdateSiteContentInput = z.infer<typeof updateSiteContentSchema>;

/**
 * Built-in factory default settings for HireLoop.
 * This guarantees zero downtime even if the database has not been seeded yet.
 */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  general: {
    siteName: "HireLoop",
    siteTagline: "The premier job hunting & hiring platform",
    logoUrl: null,
    darkLogoUrl: null,
    faviconUrl: null,
    primaryBrandColor: "#0d9488",
    supportEmail: "support@hireloop.dev",
    contactPhone: "+1 (555) 019-2834",
  },
  announcement: {
    enabled: false,
    message: "🚀 Now in Public Beta — Join thousands of developers and recruiters hiring faster.",
    linkUrl: "/jobs",
    linkLabel: "Explore Opportunities",
    variant: "info",
    dismissible: true,
  },
  maintenance: {
    enabled: false,
    noticeMessage: "HireLoop is currently undergoing scheduled maintenance to upgrade system infrastructure. We will be back online shortly.",
    allowedIps: [],
  },
  header: {
    enableJobSearch: true,
    enableCompaniesLink: true,
    enablePricingLink: true,
    navLinks: [
      { id: "1", label: "Find jobs", path: "/jobs", isExternal: false, order: 1, visible: true },
      { id: "2", label: "Companies", path: "/companies", isExternal: false, order: 2, visible: true },
      { id: "3", label: "Pricing", path: "/pricing", isExternal: false, order: 3, visible: true },
      { id: "4", label: "About", path: "/about", isExternal: false, order: 4, visible: true },
      { id: "5", label: "Contact", path: "/contact", isExternal: false, order: 5, visible: true },
    ],
    primaryCta: {
      label: "Get Started",
      path: "/auth/signup",
      visible: true,
    },
  },
  homePage: {
    hero: {
      badgeText: "Modern hiring & job search platform",
      headline: "Find your next career move with",
      highlightedWord: "HireLoop.",
      subheadline: "Connect with vetted companies, apply with verified credentials, and track your interviews in one real-time workspace.",
      primaryCtaText: "Browse jobs",
      primaryCtaUrl: "/jobs",
      secondaryCtaText: "Post a job",
      secondaryCtaUrl: "/auth/signup?role=recruiter",
      showLiveCounter: true,
      customStats: [],
    },
    featuredCategoriesSection: {
      visible: true,
      heading: "Browse by category",
      subheading: "Explore opportunities across high-growth engineering, design, and product roles.",
    },
    trustedCompaniesSection: {
      visible: true,
      heading: "Trusted by innovative teams worldwide",
      displayCompanyLogos: true,
    },
    featuresSection: {
      visible: true,
      heading: "Built for serious hiring",
      subheading: "Everything you need to discover, manage, and close career opportunities without noise.",
    },
    howItWorksSection: {
      visible: true,
      heading: "How HireLoop Works",
      subheading: "A modern workflow tailored for both top-tier talent and growing engineering organizations.",
    },
    ctaBanner: {
      visible: true,
      title: "Ready to accelerate your hiring?",
      description: "Create your recruiter account in seconds, verify your company, and start publishing active listings today.",
      buttonText: "Create an employer account",
      buttonUrl: "/auth/signup?role=recruiter",
    },
    faq: {
      visible: true,
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about navigating opportunities and hiring on HireLoop.",
      items: [
        {
          id: "faq-1",
          question: "How do I create an account as a job seeker?",
          answer: "Click 'Get Started' or 'Sign in' in the header. Select 'Job Seeker', provide your name and email, and verify your account. Once registered, you can complete your profile and upload your resume.",
          order: 1,
        },
        {
          id: "faq-2",
          question: "Is HireLoop free for job seekers?",
          answer: "Yes! Job seekers can search jobs, submit applications, save opportunities, and track interview invitations completely free of charge.",
          order: 2,
        },
        {
          id: "faq-3",
          question: "How do recruiters get their company approved?",
          answer: "Recruiters register a company profile with official details. Our moderation team reviews employer verification within 24-48 business hours to protect candidate safety before listings go public.",
          order: 3,
        },
        {
          id: "faq-4",
          question: "Can I manage and track all applications in real time?",
          answer: "Both candidates and employers have dedicated workspace dashboards with real-time status tracking (Applied, Under Review, Shortlisted, Interview Scheduled, and Offer).",
          order: 4,
        },
      ],
    },
  },
  footer: {
    description: "HireLoop connects ambitious job seekers with world-class employers through verified credentials, transparent pay, and real-time application tracking.",
    tagline: "Empowering global career growth with precision and transparency.",
    copyrightText: "© {year} HireLoop Technologies Inc. All rights reserved.",
    showNewsletterSignup: true,
    socialLinks: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      facebook: null,
      instagram: null,
    },
    columns: [
      {
        id: "col-1",
        title: "For Job Seekers",
        order: 1,
        links: [
          { id: "l-1", label: "Browse jobs", url: "/jobs", isExternal: false },
          { id: "l-2", label: "Companies directory", url: "/companies", isExternal: false },
          { id: "l-3", label: "Candidate workspace", url: "/dashboard/seeker", isExternal: false },
          { id: "l-4", label: "Salary insights", url: "/pricing", isExternal: false },
        ],
      },
      {
        id: "col-2",
        title: "For Employers",
        order: 2,
        links: [
          { id: "l-5", label: "Post a job", url: "/auth/signup?role=recruiter", isExternal: false },
          { id: "l-6", label: "Recruiter workspace", url: "/dashboard/recruiter", isExternal: false },
          { id: "l-7", label: "Pricing plans", url: "/pricing", isExternal: false },
          { id: "l-8", label: "Company moderation", url: "/companies", isExternal: false },
        ],
      },
      {
        id: "col-3",
        title: "Company & Legal",
        order: 3,
        links: [
          { id: "l-9", label: "About HireLoop", url: "/about", isExternal: false },
          { id: "l-10", label: "Contact & support", url: "/contact", isExternal: false },
          { id: "l-11", label: "Privacy policy", url: "/privacy", isExternal: false },
          { id: "l-12", label: "Terms of service", url: "/terms", isExternal: false },
        ],
      },
    ],
  },
  seo: {
    metaTitle: "HireLoop — Modern Tech Job Hunting & Hiring Platform",
    metaDescription: "Discover thousands of curated software engineering, design, and product jobs. Connect directly with verified employers on HireLoop.",
    ogImageUrl: null,
    googleAnalyticsId: null,
  },
};
