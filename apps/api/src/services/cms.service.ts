import { DEFAULT_SITE_CONTENT, type SiteContent, type UpdateSiteContentInput } from "@hireloop/shared";
import { SiteContentModel, AuditLogModel } from "../models/index.js";
import { Types } from "mongoose";

// In-memory cache for public site content
let cachedPublicContent: SiteContent | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidateCmsCache(): void {
  cachedPublicContent = null;
  cacheExpiresAt = 0;
}

function docToSiteContent(doc: any): SiteContent {
  return {
    general: {
      siteName: doc.general?.siteName ?? DEFAULT_SITE_CONTENT.general.siteName,
      siteTagline: doc.general?.siteTagline ?? DEFAULT_SITE_CONTENT.general.siteTagline,
      logoUrl: doc.general?.logoUrl ?? null,
      darkLogoUrl: doc.general?.darkLogoUrl ?? null,
      faviconUrl: doc.general?.faviconUrl ?? null,
      primaryBrandColor: doc.general?.primaryBrandColor ?? DEFAULT_SITE_CONTENT.general.primaryBrandColor,
      supportEmail: doc.general?.supportEmail ?? DEFAULT_SITE_CONTENT.general.supportEmail,
      contactPhone: doc.general?.contactPhone ?? DEFAULT_SITE_CONTENT.general.contactPhone,
    },
    announcement: {
      enabled: Boolean(doc.announcement?.enabled),
      message: doc.announcement?.message ?? DEFAULT_SITE_CONTENT.announcement.message,
      linkUrl: doc.announcement?.linkUrl ?? DEFAULT_SITE_CONTENT.announcement.linkUrl,
      linkLabel: doc.announcement?.linkLabel ?? DEFAULT_SITE_CONTENT.announcement.linkLabel,
      variant: doc.announcement?.variant ?? DEFAULT_SITE_CONTENT.announcement.variant,
      dismissible: doc.announcement?.dismissible ?? DEFAULT_SITE_CONTENT.announcement.dismissible,
    },
    maintenance: {
      enabled: Boolean(doc.maintenance?.enabled),
      noticeMessage: doc.maintenance?.noticeMessage ?? DEFAULT_SITE_CONTENT.maintenance.noticeMessage,
      allowedIps: doc.maintenance?.allowedIps ?? [],
    },
    header: {
      enableJobSearch: doc.header?.enableJobSearch ?? DEFAULT_SITE_CONTENT.header.enableJobSearch,
      enableCompaniesLink: doc.header?.enableCompaniesLink ?? DEFAULT_SITE_CONTENT.header.enableCompaniesLink,
      enablePricingLink: doc.header?.enablePricingLink ?? DEFAULT_SITE_CONTENT.header.enablePricingLink,
      navLinks: (doc.header?.navLinks && doc.header.navLinks.length > 0)
        ? doc.header.navLinks.map((l: any) => ({
            id: String(l.id),
            label: l.label,
            path: l.path,
            isExternal: Boolean(l.isExternal),
            order: Number(l.order ?? 0),
            visible: l.visible !== false,
          }))
        : DEFAULT_SITE_CONTENT.header.navLinks,
      primaryCta: {
        label: doc.header?.primaryCta?.label ?? DEFAULT_SITE_CONTENT.header.primaryCta.label,
        path: doc.header?.primaryCta?.path ?? DEFAULT_SITE_CONTENT.header.primaryCta.path,
        visible: doc.header?.primaryCta?.visible ?? DEFAULT_SITE_CONTENT.header.primaryCta.visible,
      },
    },
    homePage: {
      hero: {
        badgeText: doc.homePage?.hero?.badgeText ?? DEFAULT_SITE_CONTENT.homePage.hero.badgeText,
        headline: doc.homePage?.hero?.headline ?? DEFAULT_SITE_CONTENT.homePage.hero.headline,
        highlightedWord: doc.homePage?.hero?.highlightedWord ?? DEFAULT_SITE_CONTENT.homePage.hero.highlightedWord,
        subheadline: doc.homePage?.hero?.subheadline ?? DEFAULT_SITE_CONTENT.homePage.hero.subheadline,
        primaryCtaText: doc.homePage?.hero?.primaryCtaText ?? DEFAULT_SITE_CONTENT.homePage.hero.primaryCtaText,
        primaryCtaUrl: doc.homePage?.hero?.primaryCtaUrl ?? DEFAULT_SITE_CONTENT.homePage.hero.primaryCtaUrl,
        secondaryCtaText: doc.homePage?.hero?.secondaryCtaText ?? DEFAULT_SITE_CONTENT.homePage.hero.secondaryCtaText,
        secondaryCtaUrl: doc.homePage?.hero?.secondaryCtaUrl ?? DEFAULT_SITE_CONTENT.homePage.hero.secondaryCtaUrl,
        showLiveCounter: doc.homePage?.hero?.showLiveCounter ?? DEFAULT_SITE_CONTENT.homePage.hero.showLiveCounter,
        customStats: (doc.homePage?.hero?.customStats ?? []).map((s: any) => ({
          id: String(s.id),
          label: s.label,
          value: s.value,
        })),
      },
      featuredCategoriesSection: {
        visible: doc.homePage?.featuredCategoriesSection?.visible ?? DEFAULT_SITE_CONTENT.homePage.featuredCategoriesSection.visible,
        heading: doc.homePage?.featuredCategoriesSection?.heading ?? DEFAULT_SITE_CONTENT.homePage.featuredCategoriesSection.heading,
        subheading: doc.homePage?.featuredCategoriesSection?.subheading ?? DEFAULT_SITE_CONTENT.homePage.featuredCategoriesSection.subheading,
      },
      trustedCompaniesSection: {
        visible: doc.homePage?.trustedCompaniesSection?.visible ?? DEFAULT_SITE_CONTENT.homePage.trustedCompaniesSection.visible,
        heading: doc.homePage?.trustedCompaniesSection?.heading ?? DEFAULT_SITE_CONTENT.homePage.trustedCompaniesSection.heading,
        displayCompanyLogos: doc.homePage?.trustedCompaniesSection?.displayCompanyLogos ?? DEFAULT_SITE_CONTENT.homePage.trustedCompaniesSection.displayCompanyLogos,
      },
      featuresSection: {
        visible: doc.homePage?.featuresSection?.visible ?? DEFAULT_SITE_CONTENT.homePage.featuresSection.visible,
        heading: doc.homePage?.featuresSection?.heading ?? DEFAULT_SITE_CONTENT.homePage.featuresSection.heading,
        subheading: doc.homePage?.featuresSection?.subheading ?? DEFAULT_SITE_CONTENT.homePage.featuresSection.subheading,
      },
      howItWorksSection: {
        visible: doc.homePage?.howItWorksSection?.visible ?? DEFAULT_SITE_CONTENT.homePage.howItWorksSection.visible,
        heading: doc.homePage?.howItWorksSection?.heading ?? DEFAULT_SITE_CONTENT.homePage.howItWorksSection.heading,
        subheading: doc.homePage?.howItWorksSection?.subheading ?? DEFAULT_SITE_CONTENT.homePage.howItWorksSection.subheading,
      },
      ctaBanner: {
        visible: doc.homePage?.ctaBanner?.visible ?? DEFAULT_SITE_CONTENT.homePage.ctaBanner.visible,
        title: doc.homePage?.ctaBanner?.title ?? DEFAULT_SITE_CONTENT.homePage.ctaBanner.title,
        description: doc.homePage?.ctaBanner?.description ?? DEFAULT_SITE_CONTENT.homePage.ctaBanner.description,
        buttonText: doc.homePage?.ctaBanner?.buttonText ?? DEFAULT_SITE_CONTENT.homePage.ctaBanner.buttonText,
        buttonUrl: doc.homePage?.ctaBanner?.buttonUrl ?? DEFAULT_SITE_CONTENT.homePage.ctaBanner.buttonUrl,
      },
      faq: {
        visible: doc.homePage?.faq?.visible ?? DEFAULT_SITE_CONTENT.homePage.faq.visible,
        title: doc.homePage?.faq?.title ?? DEFAULT_SITE_CONTENT.homePage.faq.title,
        subtitle: doc.homePage?.faq?.subtitle ?? DEFAULT_SITE_CONTENT.homePage.faq.subtitle,
        items: (doc.homePage?.faq?.items && doc.homePage.faq.items.length > 0)
          ? doc.homePage.faq.items.map((f: any) => ({
              id: String(f.id),
              question: f.question,
              answer: f.answer,
              order: Number(f.order ?? 0),
            }))
          : DEFAULT_SITE_CONTENT.homePage.faq.items,
      },
    },
    footer: {
      description: doc.footer?.description ?? DEFAULT_SITE_CONTENT.footer.description,
      tagline: doc.footer?.tagline ?? DEFAULT_SITE_CONTENT.footer.tagline,
      copyrightText: doc.footer?.copyrightText ?? DEFAULT_SITE_CONTENT.footer.copyrightText,
      showNewsletterSignup: doc.footer?.showNewsletterSignup ?? DEFAULT_SITE_CONTENT.footer.showNewsletterSignup,
      socialLinks: {
        twitter: doc.footer?.socialLinks?.twitter ?? DEFAULT_SITE_CONTENT.footer.socialLinks.twitter,
        linkedin: doc.footer?.socialLinks?.linkedin ?? DEFAULT_SITE_CONTENT.footer.socialLinks.linkedin,
        github: doc.footer?.socialLinks?.github ?? DEFAULT_SITE_CONTENT.footer.socialLinks.github,
        facebook: doc.footer?.socialLinks?.facebook ?? null,
        instagram: doc.footer?.socialLinks?.instagram ?? null,
      },
      columns: (doc.footer?.columns && doc.footer.columns.length > 0)
        ? doc.footer.columns.map((c: any) => ({
            id: String(c.id),
            title: c.title,
            order: Number(c.order ?? 0),
            links: (c.links ?? []).map((l: any) => ({
              id: String(l.id),
              label: l.label,
              url: l.url,
              isExternal: Boolean(l.isExternal),
            })),
          }))
        : DEFAULT_SITE_CONTENT.footer.columns,
    },
    seo: {
      metaTitle: doc.seo?.metaTitle ?? DEFAULT_SITE_CONTENT.seo.metaTitle,
      metaDescription: doc.seo?.metaDescription ?? DEFAULT_SITE_CONTENT.seo.metaDescription,
      ogImageUrl: doc.seo?.ogImageUrl ?? null,
      googleAnalyticsId: doc.seo?.googleAnalyticsId ?? null,
    },
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
  };
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  const now = Date.now();
  if (cachedPublicContent && now < cacheExpiresAt) {
    return cachedPublicContent;
  }

  try {
    let doc = await SiteContentModel.findOne({ key: "primary" }).lean();
    if (!doc) {
      // First-time automatic bootstrap
      const created = await SiteContentModel.create({
        key: "primary",
        ...DEFAULT_SITE_CONTENT,
      });
      doc = created.toObject();
    }

    const content = docToSiteContent(doc);
    cachedPublicContent = content;
    cacheExpiresAt = now + CACHE_TTL_MS;
    return content;
  } catch (error) {
    // Zero-downtime fallback
    return DEFAULT_SITE_CONTENT;
  }
}

export async function getAdminSiteContent(): Promise<SiteContent> {
  let doc = await SiteContentModel.findOne({ key: "primary" }).lean();
  if (!doc) {
    const created = await SiteContentModel.create({
      key: "primary",
      ...DEFAULT_SITE_CONTENT,
    });
    doc = created.toObject();
  }
  return docToSiteContent(doc);
}

export async function updateSiteContent(
  adminUserId: string,
  input: UpdateSiteContentInput,
): Promise<SiteContent> {
  const updateData: Record<string, unknown> = {
    updatedBy: Types.ObjectId.isValid(adminUserId) ? new Types.ObjectId(adminUserId) : null,
  };

  if (input.general) updateData["general"] = input.general;
  if (input.announcement) updateData["announcement"] = input.announcement;
  if (input.maintenance) updateData["maintenance"] = input.maintenance;
  if (input.header) updateData["header"] = input.header;
  if (input.homePage) updateData["homePage"] = input.homePage;
  if (input.footer) updateData["footer"] = input.footer;
  if (input.seo) updateData["seo"] = input.seo;

  const updatedDoc = await SiteContentModel.findOneAndUpdate(
    { key: "primary" },
    { $set: updateData },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  invalidateCmsCache();

  // Audit log
  try {
    await AuditLogModel.create({
      actorId: Types.ObjectId.isValid(adminUserId) ? new Types.ObjectId(adminUserId) : null,
      action: "site_content_updated",
      targetType: "site_content",
      targetId: "primary",
      details: {
        sectionsUpdated: Object.keys(input),
      },
    });
  } catch {
    // Non-blocking audit failure
  }

  return docToSiteContent(updatedDoc);
}

export async function resetSiteContent(adminUserId: string): Promise<SiteContent> {
  const updatedDoc = await SiteContentModel.findOneAndUpdate(
    { key: "primary" },
    {
      $set: {
        ...DEFAULT_SITE_CONTENT,
        updatedBy: Types.ObjectId.isValid(adminUserId) ? new Types.ObjectId(adminUserId) : null,
      },
    },
    { new: true, upsert: true },
  ).lean();

  invalidateCmsCache();

  try {
    await AuditLogModel.create({
      actorId: Types.ObjectId.isValid(adminUserId) ? new Types.ObjectId(adminUserId) : null,
      action: "site_content_reset_defaults",
      targetType: "site_content",
      targetId: "primary",
      details: {},
    });
  } catch {}

  return docToSiteContent(updatedDoc);
}
