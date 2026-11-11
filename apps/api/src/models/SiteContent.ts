import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const navLinkSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    isExternal: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const heroStatSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const faqItemSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const footerLinkSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    isExternal: { type: Boolean, default: false },
  },
  { _id: false },
);

const footerColumnSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    links: { type: [footerLinkSchema], default: [] },
  },
  { _id: false },
);

const siteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    general: {
      siteName: { type: String, default: "HireLoop" },
      siteTagline: { type: String, default: "The premier job hunting & hiring platform" },
      logoUrl: { type: String, default: null },
      darkLogoUrl: { type: String, default: null },
      faviconUrl: { type: String, default: null },
      primaryBrandColor: { type: String, default: "#0d9488" },
      supportEmail: { type: String, default: "support@hireloop.dev" },
      contactPhone: { type: String, default: "+1 (555) 019-2834" },
    },
    announcement: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "🚀 Now in Public Beta — Join thousands of developers and recruiters hiring faster." },
      linkUrl: { type: String, default: "/jobs" },
      linkLabel: { type: String, default: "Explore Opportunities" },
      variant: { type: String, enum: ["info", "warning", "success", "danger"], default: "info" },
      dismissible: { type: Boolean, default: true },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      noticeMessage: { type: String, default: "HireLoop is currently undergoing scheduled maintenance. We will be right back." },
      allowedIps: { type: [String], default: [] },
    },
    header: {
      enableJobSearch: { type: Boolean, default: true },
      enableCompaniesLink: { type: Boolean, default: true },
      enablePricingLink: { type: Boolean, default: true },
      navLinks: { type: [navLinkSchema], default: [] },
      primaryCta: {
        label: { type: String, default: "Get Started" },
        path: { type: String, default: "/signup" },
        visible: { type: Boolean, default: true },
      },
    },
    homePage: {
      hero: {
        badgeText: { type: String, default: "Modern hiring & job search platform" },
        headline: { type: String, default: "Find your next career move with" },
        highlightedWord: { type: String, default: "HireLoop." },
        subheadline: { type: String, default: "Connect with vetted companies, apply with verified credentials, and track your interviews in one real-time workspace." },
        primaryCtaText: { type: String, default: "Browse jobs" },
        primaryCtaUrl: { type: String, default: "/jobs" },
        secondaryCtaText: { type: String, default: "Post a job" },
        secondaryCtaUrl: { type: String, default: "/signup?role=recruiter" },
        showLiveCounter: { type: Boolean, default: true },
        customStats: { type: [heroStatSchema], default: [] },
      },
      featuredCategoriesSection: {
        visible: { type: Boolean, default: true },
        heading: { type: String, default: "Browse by category" },
        subheading: { type: String, default: "Explore opportunities across high-growth engineering, design, and product roles." },
      },
      trustedCompaniesSection: {
        visible: { type: Boolean, default: true },
        heading: { type: String, default: "Trusted by innovative teams worldwide" },
        displayCompanyLogos: { type: Boolean, default: true },
      },
      featuresSection: {
        visible: { type: Boolean, default: true },
        heading: { type: String, default: "Built for serious hiring" },
        subheading: { type: String, default: "Everything you need to discover, manage, and close career opportunities without noise." },
      },
      howItWorksSection: {
        visible: { type: Boolean, default: true },
        heading: { type: String, default: "How HireLoop Works" },
        subheading: { type: String, default: "A modern workflow tailored for both top-tier talent and growing engineering organizations." },
      },
      ctaBanner: {
        visible: { type: Boolean, default: true },
        title: { type: String, default: "Ready to accelerate your hiring?" },
        description: { type: String, default: "Create your recruiter account in seconds, verify your company, and start publishing active listings today." },
        buttonText: { type: String, default: "Create an employer account" },
        buttonUrl: { type: String, default: "/signup?role=recruiter" },
      },
      faq: {
        visible: { type: Boolean, default: true },
        title: { type: String, default: "Frequently Asked Questions" },
        subtitle: { type: String, default: "Everything you need to know about navigating opportunities and hiring on HireLoop." },
        items: { type: [faqItemSchema], default: [] },
      },
    },
    footer: {
      description: { type: String, default: "HireLoop connects ambitious job seekers with world-class employers through verified credentials, transparent pay, and real-time application tracking." },
      tagline: { type: String, default: "Empowering global career growth with precision and transparency." },
      copyrightText: { type: String, default: "© {year} HireLoop Technologies Inc. All rights reserved." },
      showNewsletterSignup: { type: Boolean, default: true },
      socialLinks: {
        twitter: { type: String, default: "https://twitter.com" },
        linkedin: { type: String, default: "https://linkedin.com" },
        github: { type: String, default: "https://github.com" },
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
      },
      columns: { type: [footerColumnSchema], default: [] },
    },
    seo: {
      metaTitle: { type: String, default: "HireLoop — Modern Tech Job Hunting & Hiring Platform" },
      metaDescription: { type: String, default: "Discover thousands of curated software engineering, design, and product jobs. Connect directly with verified employers on HireLoop." },
      ogImageUrl: { type: String, default: null },
      googleAnalyticsId: { type: String, default: null },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export type SiteContentAttributes = InferSchemaType<typeof siteContentSchema>;
export type SiteContentDocument = HydratedDocument<SiteContentAttributes>;

export const SiteContentModel = model("SiteContent", siteContentSchema);
