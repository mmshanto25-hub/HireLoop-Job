import { useState, useEffect } from "react";
import {
  Globe,
  Layout,
  Megaphone,
  Home,
  Sliders,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import {
  useAdminSiteContent,
  useUpdateSiteContent,
  useResetSiteContent,
} from "@/features/cms/hooks";
import type {
  SiteContent,
  HeaderNavLink,
  FaqItem,
  FooterColumn,
  FooterLinkItem,
} from "@hireloop/shared";

type TabId = "general" | "announcement" | "header" | "home" | "footer" | "seo";

export function AdminSiteContentPage() {
  const { data: rawContent, isLoading, error } = useAdminSiteContent();
  const updateMutation = useUpdateSiteContent();
  const resetMutation = useResetSiteContent();

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [formData, setFormData] = useState<SiteContent | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    if (rawContent) {
      setFormData(JSON.parse(JSON.stringify(rawContent)));
    }
  }, [rawContent]);

  if (isLoading || !formData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="flex gap-2 border-b border-border pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center text-danger">
        Failed to load site content settings. Please refresh the page and try again.
      </div>
    );
  }

  const handleSave = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync(formData);
      setSuccessMessage("Site settings and content successfully published!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update site content. Check your input.",
      );
    }
  };

  const handleReset = async () => {
    try {
      const reset = await resetMutation.mutateAsync();
      setFormData(JSON.parse(JSON.stringify(reset)));
      setShowResetModal(false);
      setSuccessMessage("Site content restored to factory defaults!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to reset settings.",
      );
    }
  };

  // Nav link helpers
  const handleAddNavLink = () => {
    const newLink: HeaderNavLink = {
      id: `link-${Date.now()}`,
      label: "New Link",
      path: "/",
      isExternal: false,
      order: (formData.header.navLinks?.length ?? 0) + 1,
      visible: true,
    };
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        navLinks: [...(formData.header.navLinks || []), newLink],
      },
    });
  };

  const handleUpdateNavLink = (id: string, patch: Partial<HeaderNavLink>) => {
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        navLinks: (formData.header.navLinks || []).map((l) =>
          l.id === id ? { ...l, ...patch } : l,
        ),
      },
    });
  };

  const handleRemoveNavLink = (id: string) => {
    setFormData({
      ...formData,
      header: {
        ...formData.header,
        navLinks: formData.header.navLinks.filter((l) => l.id !== id),
      },
    });
  };

  // FAQ helpers
  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: "New Question?",
      answer: "Answer goes here...",
      order: (formData.homePage.faq.items?.length ?? 0) + 1,
    };
    setFormData({
      ...formData,
      homePage: {
        ...formData.homePage,
        faq: {
          ...formData.homePage.faq,
          items: [...(formData.homePage.faq.items || []), newFaq],
        },
      },
    });
  };

  const handleUpdateFaq = (id: string, patch: Partial<FaqItem>) => {
    setFormData({
      ...formData,
      homePage: {
        ...formData.homePage,
        faq: {
          ...formData.homePage.faq,
          items: (formData.homePage.faq.items || []).map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        },
      },
    });
  };

  const handleRemoveFaq = (id: string) => {
    setFormData({
      ...formData,
      homePage: {
        ...formData.homePage,
        faq: {
          ...formData.homePage.faq,
          items: formData.homePage.faq.items.filter((f) => f.id !== id),
        },
      },
    });
  };

  // Footer column helpers
  const handleAddFooterColumn = () => {
    const newCol: FooterColumn = {
      id: `col-${Date.now()}`,
      title: "New Column",
      order: (formData.footer.columns?.length ?? 0) + 1,
      links: [],
    };
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: [...(formData.footer.columns || []), newCol],
      },
    });
  };

  const handleUpdateFooterColumnTitle = (colId: string, title: string) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: (formData.footer.columns || []).map((c) =>
          c.id === colId ? { ...c, title } : c,
        ),
      },
    });
  };

  const handleRemoveFooterColumn = (colId: string) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: formData.footer.columns.filter((c) => c.id !== colId),
      },
    });
  };

  const handleAddFooterLink = (colId: string) => {
    const newLink: FooterLinkItem = {
      id: `fl-${Date.now()}`,
      label: "Link Label",
      url: "/",
      isExternal: false,
    };
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: (formData.footer.columns || []).map((c) =>
          c.id === colId ? { ...c, links: [...c.links, newLink] } : c,
        ),
      },
    });
  };

  const handleUpdateFooterLink = (
    colId: string,
    linkId: string,
    patch: Partial<FooterLinkItem>,
  ) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: (formData.footer.columns || []).map((c) =>
          c.id === colId
            ? {
                ...c,
                links: c.links.map((l) => (l.id === linkId ? { ...l, ...patch } : l)),
              }
            : c,
        ),
      },
    });
  };

  const handleRemoveFooterLink = (colId: string, linkId: string) => {
    setFormData({
      ...formData,
      footer: {
        ...formData.footer,
        columns: formData.footer.columns.map((c) =>
          c.id === colId
            ? { ...c, links: c.links.filter((l) => l.id !== linkId) }
            : c,
        ),
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Site Content & UI Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize branding, announcement banners, navigation, homepage copy, footer links, and SEO in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetModal(true)}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="gap-2 bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm font-semibold"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving Changes..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "general", label: "Branding & General", icon: Sliders },
          { id: "announcement", label: "Announcement & Alert", icon: Megaphone },
          { id: "header", label: "Header & Navbar", icon: Layout },
          { id: "home", label: "Homepage Sections", icon: Home },
          { id: "footer", label: "Footer & Socials", icon: Layers },
          { id: "seo", label: "SEO & Scripts", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground border border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Branding */}
      {activeTab === "general" && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Branding & Global Identity
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Control the platform name, logo URLs, and primary brand theme color.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Platform Name *
              </label>
              <Input
                type="text"
                value={formData.general.siteName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, siteName: e.target.value },
                  })
                }
                className="mt-1.5"
                placeholder="e.g. HireLoop"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Site Tagline
              </label>
              <Input
                type="text"
                value={formData.general.siteTagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, siteTagline: e.target.value },
                  })
                }
                className="mt-1.5"
                placeholder="e.g. The premier hiring platform"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Support Email Address
              </label>
              <Input
                type="email"
                value={formData.general.supportEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, supportEmail: e.target.value },
                  })
                }
                className="mt-1.5"
                placeholder="support@hireloop.dev"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Contact Phone Number
              </label>
              <Input
                type="text"
                value={formData.general.contactPhone || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, contactPhone: e.target.value || null },
                  })
                }
                className="mt-1.5"
                placeholder="+1 (555) 019-2834"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Primary Brand Theme Color (Hex)
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={formData.general.primaryBrandColor || "#0d9488"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, primaryBrandColor: e.target.value },
                    })
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-border bg-transparent p-1"
                />
                <Input
                  type="text"
                  value={formData.general.primaryBrandColor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, primaryBrandColor: e.target.value },
                    })
                  }
                  className="w-36 font-mono"
                  placeholder="#0d9488"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Custom Logo Image URL (Optional)
              </label>
              <Input
                type="text"
                value={formData.general.logoUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, logoUrl: e.target.value || null },
                  })
                }
                className="mt-1.5"
                placeholder="https://example.com/logo.png"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Leave empty to use built-in modern SVG brand icon.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Announcement & Alert */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Top Announcement Banner
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Displays a prominent alert banner at the very top of all public pages.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcement.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Announcement Message Text
                </label>
                <Textarea
                  value={formData.announcement.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        message: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className="mt-1.5"
                  placeholder="e.g. 🚀 Now in Public Beta — Join thousands of developers and recruiters hiring faster."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Link Action URL (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.announcement.linkUrl || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        linkUrl: e.target.value || null,
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="/jobs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Link Button Label
                </label>
                <Input
                  type="text"
                  value={formData.announcement.linkLabel || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        linkLabel: e.target.value || null,
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="Explore Now"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Banner Variant / Color Tone
                </label>
                <select
                  value={formData.announcement.variant}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        variant: e.target.value as any,
                      },
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="info">Info (Teal / Brand tone)</option>
                  <option value="warning">Warning (Amber)</option>
                  <option value="success">Success (Emerald Green)</option>
                  <option value="danger">Critical / Urgent (Rose Red)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="dismissible-check"
                  checked={formData.announcement.dismissible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      announcement: {
                        ...formData.announcement,
                        dismissible: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="dismissible-check" className="text-sm font-medium text-foreground cursor-pointer">
                  Allow users to dismiss the announcement banner
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Header & Navigation */}
      {activeTab === "header" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Header CTA & Primary Action
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure the primary call-to-action button shown on the right side of the navbar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Button Text
                </label>
                <Input
                  type="text"
                  value={formData.header.primaryCta.label}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      header: {
                        ...formData.header,
                        primaryCta: {
                          ...formData.header.primaryCta,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="Get Started"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Button Target Path
                </label>
                <Input
                  type="text"
                  value={formData.header.primaryCta.path}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      header: {
                        ...formData.header,
                        primaryCta: {
                          ...formData.header.primaryCta,
                          path: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="/signup"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="primary-cta-visible"
                  checked={formData.header.primaryCta.visible}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      header: {
                        ...formData.header,
                        primaryCta: {
                          ...formData.header.primaryCta,
                          visible: e.target.checked,
                        },
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="primary-cta-visible" className="text-sm font-medium text-foreground cursor-pointer">
                  Display Primary CTA Button
                </label>
              </div>
            </div>
          </div>

          {/* Navigation Links Manager */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Navigation Menu Links
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Add, edit, reorder, or toggle links in the desktop header and mobile drawer.
                </p>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddNavLink} className="gap-2">
                <Plus className="h-4 w-4" /> Add Link
              </Button>
            </div>

            <div className="space-y-3">
              {(formData.header.navLinks || []).map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3.5"
                >
                  <div className="w-full sm:w-44">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Label</label>
                    <Input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateNavLink(link.id, { label: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Path / URL</label>
                    <Input
                      type="text"
                      value={link.path}
                      onChange={(e) => handleUpdateNavLink(link.id, { path: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="w-full sm:w-20">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Order</label>
                    <Input
                      type="number"
                      value={link.order}
                      onChange={(e) => handleUpdateNavLink(link.id, { order: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4 sm:pt-4">
                    <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.visible}
                        onChange={(e) => handleUpdateNavLink(link.id, { visible: e.target.checked })}
                        className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                      />
                      Visible
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.isExternal}
                        onChange={(e) => handleUpdateNavLink(link.id, { isExternal: e.target.checked })}
                        className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                      />
                      External
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveNavLink(link.id)}
                      className="text-muted-foreground hover:text-danger p-1 rounded transition-colors"
                      title="Delete link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Homepage Sections */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Hero Editor */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Hero Section Content
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize the main banner text, CTA buttons, and highlighted keywords.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Badge Text
                </label>
                <Input
                  type="text"
                  value={formData.homePage.hero.badgeText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, badgeText: e.target.value },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="Modern hiring & job search platform"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Highlighted Word / Brand Accent
                </label>
                <Input
                  type="text"
                  value={formData.homePage.hero.highlightedWord}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, highlightedWord: e.target.value },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="HireLoop."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Main Headline
                </label>
                <Input
                  type="text"
                  value={formData.homePage.hero.headline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, headline: e.target.value },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="Find your next career move with"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Subheadline / Description
                </label>
                <Textarea
                  value={formData.homePage.hero.subheadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, subheadline: e.target.value },
                      },
                    })
                  }
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Primary CTA Text
                </label>
                <Input
                  type="text"
                  value={formData.homePage.hero.primaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, primaryCtaText: e.target.value },
                      },
                    })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Secondary CTA Text
                </label>
                <Input
                  type="text"
                  value={formData.homePage.hero.secondaryCtaText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, secondaryCtaText: e.target.value },
                      },
                    })
                  }
                  className="mt-1.5"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="live-counter-check"
                  checked={formData.homePage.hero.showLiveCounter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homePage: {
                        ...formData.homePage,
                        hero: { ...formData.homePage.hero, showLiveCounter: e.target.checked },
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="live-counter-check" className="text-sm font-medium text-foreground cursor-pointer">
                  Display live platform statistics counter (Active Jobs, Approved Companies, Job Seekers)
                </label>
              </div>
            </div>
          </div>

          {/* Section Visibility Toggles */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="border-b border-border pb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Homepage Section Visibility
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Toggle major blocks on or off with a single click.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "featuredCategoriesSection",
                  title: "Browse by Category Section",
                  state: formData.homePage.featuredCategoriesSection.visible,
                },
                {
                  key: "featuresSection",
                  title: "Why Choose HireLoop (Features Grid)",
                  state: formData.homePage.featuresSection.visible,
                },
                {
                  key: "howItWorksSection",
                  title: "How It Works Workflow Cards",
                  state: formData.homePage.howItWorksSection.visible,
                },
                {
                  key: "ctaBanner",
                  title: "Bottom Call-To-Action Banner",
                  state: formData.homePage.ctaBanner.visible,
                },
                {
                  key: "faq",
                  title: "Frequently Asked Questions (FAQ) Section",
                  state: formData.homePage.faq.visible,
                },
              ].map((section) => (
                <div
                  key={section.key}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/30 p-3.5"
                >
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                  <input
                    type="checkbox"
                    checked={section.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        homePage: {
                          ...formData.homePage,
                          [section.key]: {
                            ...(formData.homePage as any)[section.key],
                            visible: e.target.checked,
                          },
                        },
                      })
                    }
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic FAQ Builder */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  FAQ Accordions Builder
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Add, edit, or remove questions shown to candidates and employers.
                </p>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddFaq} className="gap-2">
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {(formData.homePage.faq.items || []).map((faq, idx) => (
                <div
                  key={faq.id}
                  className="rounded-xl border border-border bg-surface-muted/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand">
                      Question #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="text-muted-foreground hover:text-danger p-1 rounded transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Question
                    </label>
                    <Input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(faq.id, { question: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Answer
                    </label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(faq.id, { answer: e.target.value })}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Footer & Socials */}
      {activeTab === "footer" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Footer Content & Social Profiles
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize copyright text, footer brand description, and social media handles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Footer Brand Description
                </label>
                <Textarea
                  value={formData.footer.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: { ...formData.footer, description: e.target.value },
                    })
                  }
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Copyright Notice ({`use {year} placeholder`})
                </label>
                <Input
                  type="text"
                  value={formData.footer.copyrightText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: { ...formData.footer, copyrightText: e.target.value },
                    })
                  }
                  className="mt-1.5"
                  placeholder="© {year} HireLoop Technologies Inc."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Bottom Tagline
                </label>
                <Input
                  type="text"
                  value={formData.footer.tagline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: { ...formData.footer, tagline: e.target.value },
                    })
                  }
                  className="mt-1.5"
                  placeholder="Empowering global career growth."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Twitter / X Profile URL
                </label>
                <Input
                  type="text"
                  value={formData.footer.socialLinks.twitter || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: {
                        ...formData.footer,
                        socialLinks: {
                          ...formData.footer.socialLinks,
                          twitter: e.target.value || null,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  LinkedIn Profile URL
                </label>
                <Input
                  type="text"
                  value={formData.footer.socialLinks.linkedin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: {
                        ...formData.footer,
                        socialLinks: {
                          ...formData.footer.socialLinks,
                          linkedin: e.target.value || null,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  GitHub Organization URL
                </label>
                <Input
                  type="text"
                  value={formData.footer.socialLinks.github || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: {
                        ...formData.footer,
                        socialLinks: {
                          ...formData.footer.socialLinks,
                          github: e.target.value || null,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Facebook Profile URL
                </label>
                <Input
                  type="text"
                  value={formData.footer.socialLinks.facebook || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: {
                        ...formData.footer,
                        socialLinks: {
                          ...formData.footer.socialLinks,
                          facebook: e.target.value || null,
                        },
                      },
                    })
                  }
                  className="mt-1.5"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          {/* Footer Multi-Column Link Manager */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  Footer Link Columns
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage footer columns and their individual navigation links.
                </p>
              </div>

              <Button size="sm" variant="outline" onClick={handleAddFooterColumn} className="gap-2">
                <Plus className="h-4 w-4" /> Add Column
              </Button>
            </div>

            <div className="space-y-6">
              {(formData.footer.columns || []).map((col, cIdx) => (
                <div
                  key={col.id}
                  className="rounded-xl border border-border bg-surface-muted/30 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase text-brand">
                        Column #{cIdx + 1}
                      </span>
                      <Input
                        type="text"
                        value={col.title}
                        onChange={(e) => handleUpdateFooterColumnTitle(col.id, e.target.value)}
                        className="h-8 w-48 text-xs font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddFooterLink(col.id)}
                        className="text-xs h-7 gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Link
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFooterColumn(col.id)}
                        className="text-muted-foreground hover:text-danger p-1 rounded"
                        title="Delete column"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Links inside column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(col.links || []).map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                      >
                        <Input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink(col.id, link.id, { label: e.target.value })}
                          className="h-7 text-xs flex-1"
                          placeholder="Label"
                        />
                        <Input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateFooterLink(col.id, link.id, { url: e.target.value })}
                          className="h-7 text-xs flex-1"
                          placeholder="/path"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink(col.id, link.id)}
                          className="text-muted-foreground hover:text-danger p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: SEO & Scripts */}
      {activeTab === "seo" && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Search Engine Optimization (SEO) & Analytics
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure meta tags, OpenGraph sharing preview images, and analytics IDs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Default Meta Title
              </label>
              <Input
                type="text"
                value={formData.seo.metaTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, metaTitle: e.target.value },
                  })
                }
                className="mt-1.5"
                placeholder="HireLoop — Modern Tech Job Hunting & Hiring Platform"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Default Meta Description
              </label>
              <Textarea
                value={formData.seo.metaDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, metaDescription: e.target.value },
                  })
                }
                rows={2}
                className="mt-1.5"
                placeholder="Discover thousands of curated software engineering, design, and product jobs..."
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Social Share Image URL (og:image)
              </label>
              <Input
                type="text"
                value={formData.seo.ogImageUrl || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, ogImageUrl: e.target.value || null },
                  })
                }
                className="mt-1.5"
                placeholder="https://example.com/og-preview.png"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Google Analytics Measurement ID
              </label>
              <Input
                type="text"
                value={formData.seo.googleAnalyticsId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, googleAnalyticsId: e.target.value || null },
                  })
                }
                className="mt-1.5"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setShowResetModal(false)}
          title="Reset to Factory Defaults?"
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to restore all website content, announcement banners, navigation links, and copy back to their original factory defaults? Any custom modifications will be replaced.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setShowResetModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-danger text-white hover:bg-danger/90 font-semibold"
                onClick={handleReset}
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
