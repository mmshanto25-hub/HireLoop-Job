export interface GeneralSettings {
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  faviconUrl: string | null;
  primaryBrandColor: string;
  supportEmail: string;
  contactPhone: string | null;
}

export interface AnnouncementSettings {
  enabled: boolean;
  message: string;
  linkUrl: string | null;
  linkLabel: string | null;
  variant: "info" | "warning" | "success" | "danger";
  dismissible: boolean;
}

export interface MaintenanceSettings {
  enabled: boolean;
  noticeMessage: string;
  allowedIps: string[];
}

export interface HeaderNavLink {
  id: string;
  label: string;
  path: string;
  isExternal: boolean;
  order: number;
  visible: boolean;
}

export interface HeaderSettings {
  enableJobSearch: boolean;
  enableCompaniesLink: boolean;
  enablePricingLink: boolean;
  navLinks: HeaderNavLink[];
  primaryCta: {
    label: string;
    path: string;
    visible: boolean;
  };
}

export interface HeroStatItem {
  id: string;
  label: string;
  value: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface HomePageSettings {
  hero: {
    badgeText: string;
    headline: string;
    highlightedWord: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    showLiveCounter: boolean;
    customStats: HeroStatItem[];
  };
  featuredCategoriesSection: {
    visible: boolean;
    heading: string;
    subheading: string;
  };
  trustedCompaniesSection: {
    visible: boolean;
    heading: string;
    displayCompanyLogos: boolean;
  };
  featuresSection: {
    visible: boolean;
    heading: string;
    subheading: string;
  };
  howItWorksSection: {
    visible: boolean;
    heading: string;
    subheading: string;
  };
  ctaBanner: {
    visible: boolean;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
  };
  faq: {
    visible: boolean;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
}

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  order: number;
  links: FooterLinkItem[];
}

export interface FooterSettings {
  description: string;
  tagline: string;
  copyrightText: string;
  showNewsletterSignup: boolean;
  socialLinks: {
    twitter: string | null;
    linkedin: string | null;
    github: string | null;
    facebook: string | null;
    instagram: string | null;
  };
  columns: FooterColumn[];
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  googleAnalyticsId: string | null;
}

export interface SiteContent {
  general: GeneralSettings;
  announcement: AnnouncementSettings;
  maintenance: MaintenanceSettings;
  header: HeaderSettings;
  homePage: HomePageSettings;
  footer: FooterSettings;
  seo: SeoSettings;
  updatedAt?: string;
  updatedBy?: string | null;
}
