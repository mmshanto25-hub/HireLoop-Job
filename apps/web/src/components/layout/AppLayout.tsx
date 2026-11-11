import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Twitter, Linkedin, Github, Facebook, Instagram } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { BrandMark } from "./BrandMark";
import { useSiteContent } from "@/features/cms/hooks";

/** Shared shell for public pages with dynamic site configuration. */
export function AppLayout() {
  const { content } = useSiteContent();

  // Dynamically update document title and SEO description from CMS
  useEffect(() => {
    if (content.seo?.metaTitle) {
      document.title = content.seo.metaTitle;
    }
    if (content.seo?.metaDescription) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", content.seo.metaDescription);
      }
    }
  }, [content.seo?.metaTitle, content.seo?.metaDescription]);

  const currentYear = new Date().getFullYear().toString();
  const copyright = (content.footer.copyrightText || "© {year} HireLoop Technologies Inc. All rights reserved.")
    .replace("{year}", currentYear);

  const sortedColumns = (content.footer.columns || [])
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const socials = content.footer.socialLinks || {};

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <BrandMark
                  siteName={content.general.siteName}
                  logoUrl={content.general.logoUrl}
                />
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
                {content.footer.description}
              </p>

              {/* Social links */}
              <div className="mt-5 flex items-center gap-3 text-muted-foreground">
                {socials.twitter && (
                  <a
                    href={socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-surface-muted hover:text-foreground transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {socials.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-surface-muted hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {socials.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-surface-muted hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-surface-muted hover:text-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-surface-muted hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Dynamic Columns */}
            {sortedColumns.map((col) => (
              <div key={col.id || col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {(col.links || []).map((link) => (
                    <li key={link.id || link.url}>
                      {link.isExternal ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.url}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>{copyright}</p>
            {content.footer.tagline && <p>{content.footer.tagline}</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}
