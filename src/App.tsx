/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  ArchitecturalScrollProgress,
  BackToTopButton,
} from './components/common/MotionPrimitives';
import { Footer } from './components/public/Footer';
import { HeroSection } from './components/public/HeroSection';
import type { LeadModalContext } from './components/public/LeadCaptureModal';
import { MobileBottomNav } from './components/public/MobileBottomNav';
import { Navbar } from './components/public/Navbar';
import { PrintablePropertyBrochure } from './components/public/PrintablePropertyBrochure';
import { BooleanSettingKey } from './data/featureRegistry';
import { INITIAL_PROPERTIES, INITIAL_SETTINGS } from './data/seedData';
import {
  applyRuntimeSeo,
  getBlogSlug,
  getPropertySlug,
  getSectionHash,
  resolveHashRoute,
  updateBrowserHash,
} from './services/seoService';
import {
  deleteLeadRecord,
  deletePropertyRecord,
  initializeStore,
  KprCalculation,
  loadCompareIds,
  loadWishlistIds,
  resetAllDemoData,
  saveCompareIds,
  saveSettingsRecord,
  saveWishlistIds,
  submitLead,
  updateLeadRecord,
  upsertPropertyRecord,
} from './services/storageService';
import {
  injectTrackingTags,
  recordPageVisit,
  recordUnitInteraction,
} from './services/trackingService';
import {
  AdminMenu,
  BlogPostItem,
  Lead,
  LeadSource,
  ListingCategory,
  Property,
  PropertyStatus,
  PropertyType,
  PublicSection,
  ReorderableSection,
  SiteSettings,
} from './types';

// Code-split heavy public sections & overlays via React.lazy for optimal FCP/LCP & SEO performance
const PropertyCatalog = lazy(() =>
  import('./components/public/PropertyCatalog').then((m) => ({ default: m.PropertyCatalog }))
);
const KprCalculator = lazy(() =>
  import('./components/public/KprCalculator').then((m) => ({ default: m.KprCalculator }))
);
const CompareSection = lazy(() =>
  import('./components/public/CompareSection').then((m) => ({ default: m.CompareSection }))
);
const TestimonialSection = lazy(() =>
  import('./components/public/TestimonialSection').then((m) => ({
    default: m.TestimonialSection,
  }))
);
const BlogSection = lazy(() =>
  import('./components/public/BlogSection').then((m) => ({ default: m.BlogSection }))
);
const FAQSection = lazy(() =>
  import('./components/public/FAQSection').then((m) => ({ default: m.FAQSection }))
);
const PropertyDetailModal = lazy(() =>
  import('./components/public/PropertyDetailModal').then((m) => ({
    default: m.PropertyDetailModal,
  }))
);
const LeadCaptureModal = lazy(() =>
  import('./components/public/LeadCaptureModal').then((m) => ({ default: m.LeadCaptureModal }))
);
const WishlistDrawer = lazy(() =>
  import('./components/public/WishlistDrawer').then((m) => ({ default: m.WishlistDrawer }))
);
const AiPropertyChatbot = lazy(() =>
  import('./components/public/AiPropertyChatbot').then((m) => ({
    default: m.AiPropertyChatbot,
  }))
);

// Code-split Admin CRM Portal modules
const AdminLayout = lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminLogin = lazy(() =>
  import('./components/admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminOverview = lazy(() =>
  import('./components/admin/AdminOverview').then((m) => ({ default: m.AdminOverview }))
);
const AdminAnalytics = lazy(() =>
  import('./components/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);
const AdminProperties = lazy(() =>
  import('./components/admin/AdminProperties').then((m) => ({ default: m.AdminProperties }))
);
const AdminCrmLeads = lazy(() =>
  import('./components/admin/AdminCrmLeads').then((m) => ({ default: m.AdminCrmLeads }))
);
const AdminSettings = lazy(() =>
  import('./components/admin/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);

type ViewMode = 'public' | 'admin_login' | 'admin_dashboard';

const DEFAULT_SECTION_ORDER: ReorderableSection[] = [
  'katalog',
  'kpr',
  'bandingkan',
  'testimoni',
  'berita',
  'faq',
];

const SECTION_TITLES: Record<PublicSection, string> = {
  beranda: 'Beranda Utama',
  katalog: 'Katalog Properti & Site Plan',
  kpr: 'Kalkulator Simulasi KPR',
  bandingkan: 'Bandingkan Unit Properti',
  testimoni: 'Testimoni Penghuni & Investor',
  berita: 'Berita Kawasan & Artikel',
  faq: 'FAQ Properti & Legalitas',
};

function SectionSkeleton({
  id,
  heightClass = 'min-h-[380px]',
}: {
  id?: PublicSection;
  heightClass?: string;
}) {
  return (
    <section id={id} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 ${heightClass}`}>
      <div className="h-4 w-36 bg-slate-200/80 rounded mx-auto mb-3 animate-pulse" />
      <div className="h-8 w-72 max-w-full bg-slate-200 rounded mx-auto mb-10 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200/70 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200/70 animate-pulse hidden md:block" />
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200/70 animate-pulse hidden md:block" />
      </div>
    </section>
  );
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
        <div className="h-3.5 w-64 bg-slate-100 rounded animate-pulse" />
        <div className="h-24 w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function detectInitialAdminMode(): ViewMode {
  if (typeof window === 'undefined') return 'public';
  const isAdminPath =
    window.location.pathname.endsWith('/admin') ||
    window.location.hash === '#/admin' ||
    window.location.hash === '#admin';
  if (isAdminPath) {
    return sessionStorage.getItem('aksara_admin_auth') === '1'
      ? 'admin_dashboard'
      : 'admin_login';
  }
  return 'public';
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(detectInitialAdminMode);
  const [adminMenu, setAdminMenu] = useState<AdminMenu>('overview');

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => loadWishlistIds());
  const [compareIds, setCompareIds] = useState<string[]>(() => loadCompareIds());
  const [activeSection, setActiveSection] = useState<PublicSection>('beranda');

  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogCluster, setCatalogCluster] = useState('Semua');
  const [catalogType, setCatalogType] = useState<'Semua' | PropertyType>('Semua');
  const [catalogStatus, setCatalogStatus] = useState<'Semua' | PropertyStatus>('Semua');
  const [catalogListingCategory, setCatalogListingCategory] = useState<'Semua' | ListingCategory>('Semua');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'siteplan'>('grid');

  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [printProperty, setPrintProperty] = useState<Property | null>(null);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPostItem | null>(null);
  const [selectedPropertyForKpr, setSelectedPropertyForKpr] = useState<Property | null>(null);
  const [leadModalContext, setLeadModalContext] = useState<LeadModalContext | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const orderedSections = useMemo<ReorderableSection[]>(() => {
    const raw =
      settings.sectionOrder && settings.sectionOrder.length > 0
        ? settings.sectionOrder
        : DEFAULT_SECTION_ORDER;
    const deduped = raw.filter((item, idx) => raw.indexOf(item) === idx);
    for (const fallbackSection of DEFAULT_SECTION_ORDER) {
      if (!deduped.includes(fallbackSection)) {
        deduped.push(fallbackSection);
      }
    }
    return deduped;
  }, [settings.sectionOrder]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintProperty(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    initializeStore().then((data) => {
      setProperties(data.properties);
      setLeads(data.leads);
      setSettings(data.settings);

      if (typeof window !== 'undefined' && !window.location.hash.includes('admin')) {
        const resolved = resolveHashRoute(
          window.location.hash,
          data.properties,
          data.settings.blogPosts || []
        );
        const searchParams = new URLSearchParams(window.location.search);
        const isQrEntry = searchParams.get('src') === 'qr';

        if (resolved.property) {
          setDetailProperty(resolved.property);
          recordUnitInteraction(
            resolved.property,
            isQrEntry ? 'qr_scan' : 'view',
            data.settings
          );
          recordPageVisit({
            pagePath: `#/unit/${getPropertySlug(resolved.property)}`,
            pageTitle: resolved.property.name,
            propertyId: resolved.property.id,
            propertyName: resolved.property.name,
          });
        } else if (resolved.blogPost) {
          setActiveBlogPost(resolved.blogPost);
          recordPageVisit({
            pagePath: `#/artikel/${getBlogSlug(resolved.blogPost)}`,
            pageTitle: resolved.blogPost.title,
          });
        } else if (resolved.section) {
          setActiveSection(resolved.section);
          recordPageVisit({
            pagePath: getSectionHash(resolved.section),
            pageTitle: SECTION_TITLES[resolved.section],
          });
          window.setTimeout(() => {
            const target = document.getElementById(resolved.section!);
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 180);
        } else {
          recordPageVisit({
            pagePath: '#/beranda',
            pageTitle: SECTION_TITLES.beranda,
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    injectTrackingTags(settings);
  }, [settings]);

  useEffect(() => {
    applyRuntimeSeo({
      settings,
      properties,
      activeProperty: detailProperty,
      activeBlogPost,
      activeSection,
    });
  }, [settings, properties, detailProperty, activeBlogPost, activeSection]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
        setViewMode(
          sessionStorage.getItem('aksara_admin_auth') === '1'
            ? 'admin_dashboard'
            : 'admin_login'
        );
        return;
      }

      const resolved = resolveHashRoute(
        window.location.hash,
        properties,
        settings.blogPosts || []
      );
      if (resolved.property) {
        setDetailProperty(resolved.property);
      } else {
        setDetailProperty(null);
      }
      if (resolved.blogPost) {
        setActiveBlogPost(resolved.blogPost);
      } else {
        setActiveBlogPost(null);
      }
      if (resolved.section) {
        setActiveSection(resolved.section);
        const el = document.getElementById(resolved.section);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [properties, settings.blogPosts]);

  // Smooth IntersectionObserver scroll-spy for dynamic public sections
  useEffect(() => {
    if (viewMode !== 'public' || typeof IntersectionObserver === 'undefined') return;

    const sectionIds: PublicSection[] = ['beranda', ...orderedSections];
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const nextId = visible[0].target.id as PublicSection;
          if (sectionIds.includes(nextId)) {
            setActiveSection(nextId);
          }
        }
      },
      {
        rootMargin: '-22% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [
    viewMode,
    orderedSections,
    settings.catalogEnabled,
    settings.kprEnabled,
    settings.compareEnabled,
    settings.testimonialsEnabled,
    settings.blogEnabled,
    settings.faqEnabled,
  ]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2600);
  };

  const scrollToSection = (section: PublicSection) => {
    setActiveSection(section);
    updateBrowserHash(getSectionHash(section));
    recordPageVisit({
      pagePath: getSectionHash(section),
      pageTitle: SECTION_TITLES[section],
    });
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      saveWishlistIds(next);
      showToast(exists ? 'Unit dihapus dari daftar favorit.' : 'Unit disimpan ke daftar favorit.');
      return next;
    });
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const next = prev.filter((x) => x !== id);
        saveCompareIds(next);
        return next;
      }
      if (prev.length >= 3) {
        showToast('Maksimal 3 unit dapat dibandingkan secara bersamaan.');
        return prev;
      }
      const next = [...prev, id];
      saveCompareIds(next);
      showToast('Unit ditambahkan ke tabel perbandingan.');
      return next;
    });
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    saveCompareIds([]);
  };

  const handleOpenPropertyDetail = (property: Property) => {
    const slug = getPropertySlug(property);
    recordUnitInteraction(property, 'view', settings);
    recordPageVisit({
      pagePath: `#/unit/${slug}`,
      pageTitle: property.name,
      propertyId: property.id,
      propertyName: property.name,
    });
    setDetailProperty(property);
    updateBrowserHash(`#/unit/${slug}`);
  };

  const handleClosePropertyDetail = () => {
    setDetailProperty(null);
    updateBrowserHash(getSectionHash(activeSection));
  };

  const handleSelectBlogPost = (post: BlogPostItem | null) => {
    setActiveBlogPost(post);
    if (post) {
      const slug = getBlogSlug(post);
      recordPageVisit({
        pagePath: `#/artikel/${slug}`,
        pageTitle: post.title,
      });
      updateBrowserHash(`#/artikel/${slug}`);
    } else {
      updateBrowserHash(getSectionHash(activeSection));
    }
  };

  const handlePrintOrPdf = (property: Property, mode: 'print' | 'pdf') => {
    recordUnitInteraction(property, mode === 'pdf' ? 'brochure_pdf' : 'print_property', settings);
    setPrintProperty(property);
    showToast(
      mode === 'pdf'
        ? 'Menyiapkan Brosur PDF A4 — pilih "Save as PDF" pada dialog cetak.'
        : 'Menyiapkan halaman cetak properti...'
    );
    window.setTimeout(() => {
      window.print();
    }, 220);
  };

  const handleSimulateKprForUnit = (property: Property) => {
    recordUnitInteraction(property, 'kpr_sim', settings);
    setDetailProperty(null);
    setSelectedPropertyForKpr(property);
    scrollToSection('kpr');
  };

  const handleOpenLeadModal = (
    source: LeadSource,
    property: Property | null = null,
    kprCalculation: KprCalculation | null = null,
    customPromoLabel?: string
  ) => {
    if (settings.contactFormEnabled === false) {
      if (settings.whatsappCtaEnabled === false) {
        showToast('Contact Form & tombol WhatsApp sedang dinonaktifkan dari Dashboard Admin.');
      } else {
        showToast('Contact Form sedang dinonaktifkan — silakan gunakan tombol Chat WhatsApp langsung.');
      }
      return;
    }
    if (property) {
      recordUnitInteraction(property, 'wa_click', settings);
    } else if (source === 'Konsultasi Marketing' || source === 'Jadwal Survey') {
      recordUnitInteraction(null, 'wa_click', settings);
    }
    setDetailProperty(null);
    setLeadModalContext({ source, property, kprCalculation, customPromoLabel });
  };

  const handleQuickToggleSetting = async (key: BooleanSettingKey, nextValue: boolean) => {
    const nextSettings: SiteSettings = { ...settings, [key]: nextValue };
    const saved = await saveSettingsRecord(nextSettings);
    setSettings(saved);
    showToast(
      nextValue
        ? 'Fitur/seksi diaktifkan & langsung diterapkan ke situs.'
        : 'Fitur/seksi dinonaktifkan dari halaman publik.'
    );
  };

  const handleBulkToggleSettings = async (patch: Partial<SiteSettings>, notice: string) => {
    const nextSettings: SiteSettings = { ...settings, ...patch };
    const saved = await saveSettingsRecord(nextSettings);
    setSettings(saved);
    showToast(notice);
  };

  const handleTopBannerAction = () => {
    if (settings.topPromoBannerAction === 'catalog') {
      scrollToSection('katalog');
    } else if (settings.topPromoBannerAction === 'kpr') {
      scrollToSection('kpr');
    } else {
      handleOpenLeadModal(
        'Konsultasi Marketing',
        null,
        null,
        settings.topPromoBannerTitle || 'Banner Promo Halaman Awal'
      );
    }
  };

  const handleSubmitLead = async (payload: {
    name: string;
    phone: string;
    propertyId?: string;
    propertyName: string;
    cluster: string;
    source: LeadSource;
    kprSummary?: string;
  }) => {
    const result = await submitLead(payload);
    setLeads((prev) => [result.lead, ...prev]);
    const matchedProperty = payload.propertyId
      ? properties.find((p) => p.id === payload.propertyId) ?? null
      : null;
    recordUnitInteraction(matchedProperty, 'lead_submit', settings);
    showToast('Permintaan Anda berhasil dicatat oleh tim marketing.');
  };

  const handleOpenAdminLogin = () => {
    window.location.hash = '#/admin';
    if (sessionStorage.getItem('aksara_admin_auth') === '1') {
      setViewMode('admin_dashboard');
    } else {
      setViewMode('admin_login');
    }
  };

  const handleBackToPublic = () => {
    if (window.location.hash.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname || './');
    }
    setViewMode('public');
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('aksara_admin_auth', '1');
    setViewMode('admin_dashboard');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('aksara_admin_auth');
    handleBackToPublic();
  };

  const wishlistProperties = useMemo(
    () => properties.filter((p) => wishlistIds.includes(p.id)),
    [properties, wishlistIds]
  );

  const availableUnitsCount = useMemo(
    () => properties.filter((p) => p.status !== 'Sold Out').length,
    [properties]
  );

  const newLeadsCount = useMemo(
    () => leads.filter((l) => l.status === 'New Lead').length,
    [leads]
  );

  if (viewMode === 'admin_login') {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense fallback={<AdminSkeleton />}>
          <AdminLogin
            settings={settings}
            onLoginSuccess={handleLoginSuccess}
            onBackToSite={handleBackToPublic}
          />
        </Suspense>
      </MotionConfig>
    );
  }

  if (viewMode === 'admin_dashboard') {
    return (
      <MotionConfig reducedMotion="user">
        <Suspense fallback={<AdminSkeleton />}>
          <AdminLayout
            developerName={settings.developerName}
            logoUrl={settings.logoUrl}
            activeMenu={adminMenu}
            newLeadsCount={newLeadsCount}
            onSelectMenu={setAdminMenu}
            onBackToSite={handleBackToPublic}
            onLogout={handleAdminLogout}
          >
            <Suspense fallback={<SectionSkeleton heightClass="min-h-[420px]" />}>
              {adminMenu === 'overview' && (
                <AdminOverview
                  properties={properties}
                  leads={leads}
                  settings={settings}
                  onNavigateMenu={setAdminMenu}
                  onQuickToggleSetting={handleQuickToggleSetting}
                  onBulkToggleSettings={handleBulkToggleSettings}
                />
              )}

              {adminMenu === 'analytics' && (
                <AdminAnalytics
                  properties={properties}
                  leads={leads}
                  onNavigateMenu={setAdminMenu}
                />
              )}

              {adminMenu === 'properties' && (
                <AdminProperties
                  properties={properties}
                  onSaveProperty={async (prop) => {
                    const updated = await upsertPropertyRecord(prop);
                    setProperties(updated);
                    showToast('Data properti berhasil diperbarui.');
                  }}
                  onDeleteProperty={async (id) => {
                    const updated = await deletePropertyRecord(id);
                    setProperties(updated);
                    showToast('Unit properti dihapus.');
                  }}
                />
              )}

              {adminMenu === 'leads' && (
                <AdminCrmLeads
                  leads={leads}
                  settings={settings}
                  onUpdateLead={async (id, patch) => {
                    const updated = await updateLeadRecord(id, patch);
                    setLeads(updated);
                  }}
                  onDeleteLead={async (id) => {
                    const updated = await deleteLeadRecord(id);
                    setLeads(updated);
                    showToast('Prospek dihapus.');
                  }}
                />
              )}

              {adminMenu === 'settings' && (
                <AdminSettings
                  settings={settings}
                  properties={properties}
                  onSaveSettings={async (nextSettings) => {
                    const saved = await saveSettingsRecord(nextSettings);
                    setSettings(saved);
                    showToast('Pengaturan website berhasil disimpan.');
                  }}
                  onResetDemoData={() => {
                    const restored = resetAllDemoData();
                    setProperties(restored.properties);
                    setLeads(restored.leads);
                    setSettings(restored.settings);
                    showToast('Seluruh data dikembalikan ke setelan awal.');
                  }}
                />
              )}
            </Suspense>

            {toastMessage && (
              <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/15">
                {toastMessage}
              </div>
            )}
          </AdminLayout>
        </Suspense>
      </MotionConfig>
    );
  }

  const renderDynamicSection = (sectionId: ReorderableSection) => {
    switch (sectionId) {
      case 'katalog':
        if (settings.catalogEnabled === false) return null;
        return (
          <Suspense
            key="katalog"
            fallback={<SectionSkeleton id="katalog" heightClass="min-h-[520px]" />}
          >
            <PropertyCatalog
              properties={properties}
              settings={settings}
              wishlistIds={wishlistIds}
              compareIds={compareIds}
              eyebrow={settings.catalogEyebrow}
              title={settings.catalogTitle}
              subtitle={settings.catalogSubtitle}
              showMoreText={settings.catalogShowMoreText}
              soldOutLabel={settings.soldOutLabel}
              featuredBadgeLabel={settings.featuredBadgeLabel}
              sitePlanEnabled={settings.sitePlanEnabled !== false}
              wishlistEnabled={settings.wishlistEnabled !== false}
              compareEnabled={settings.compareEnabled !== false}
              kprEnabled={settings.kprEnabled !== false}
              whatsappCtaEnabled={settings.whatsappCtaEnabled !== false}
              contactFormEnabled={settings.contactFormEnabled !== false}
              enableVideoAndTour={settings.enableVideoAndTour !== false}
              searchQuery={catalogSearchQuery}
              selectedCluster={catalogCluster}
              selectedType={catalogType}
              selectedStatus={catalogStatus}
              selectedListingCategory={catalogListingCategory}
              viewMode={catalogViewMode}
              onSearchQueryChange={setCatalogSearchQuery}
              onSelectedClusterChange={setCatalogCluster}
              onSelectedTypeChange={setCatalogType}
              onSelectedStatusChange={setCatalogStatus}
              onSelectedListingCategoryChange={setCatalogListingCategory}
              onViewModeChange={setCatalogViewMode}
              onToggleWishlist={handleToggleWishlist}
              onToggleCompare={handleToggleCompare}
              onOpenDetail={handleOpenPropertyDetail}
              onSimulateKpr={handleSimulateKprForUnit}
              onWhatsAppUnit={(prop) => handleOpenLeadModal('Detail Unit', prop)}
            />
          </Suspense>
        );
      case 'kpr':
        if (settings.kprEnabled === false) return null;
        return (
          <Suspense
            key="kpr"
            fallback={<SectionSkeleton id="kpr" heightClass="min-h-[420px]" />}
          >
            <KprCalculator
              properties={properties}
              settings={settings}
              defaultInterestRate={settings.defaultInterestRate}
              selectedPropertyForKpr={selectedPropertyForKpr}
              eyebrow={settings.kprEyebrow}
              title={settings.kprTitle}
              subtitle={settings.kprSubtitle}
              ctaText={settings.kprCtaText}
              disclaimerText={settings.kprDisclaimerText}
              bankPartnersEnabled={settings.bankPartnersEnabled}
              bankPartnersTitle={settings.bankPartnersTitle}
              bankPartners={settings.bankPartners}
              onSelectPropertyForKpr={setSelectedPropertyForKpr}
              onSendSimulationToWa={(calc, prop) =>
                handleOpenLeadModal('Simulasi KPR', prop, calc)
              }
            />
          </Suspense>
        );
      case 'bandingkan':
        if (settings.compareEnabled === false) return null;
        return (
          <Suspense
            key="bandingkan"
            fallback={<SectionSkeleton id="bandingkan" heightClass="min-h-[340px]" />}
          >
            <CompareSection
              allProperties={properties}
              compareIds={compareIds}
              settings={settings}
              eyebrow={settings.compareEyebrow}
              title={settings.compareTitle}
              emptyTitle={settings.compareEmptyTitle}
              emptySubtitle={settings.compareEmptySubtitle}
              onToggleCompare={handleToggleCompare}
              onClearCompare={handleClearCompare}
              onOpenDetail={handleOpenPropertyDetail}
              onConsultUnit={(prop) => handleOpenLeadModal('Jadwal Survey', prop)}
            />
          </Suspense>
        );
      case 'testimoni':
        if (!settings.testimonialsEnabled) return null;
        return (
          <Suspense
            key="testimoni"
            fallback={<SectionSkeleton id="testimoni" heightClass="min-h-[340px]" />}
          >
            <TestimonialSection settings={settings} />
          </Suspense>
        );
      case 'berita':
        if (!settings.blogEnabled) return null;
        return (
          <Suspense
            key="berita"
            fallback={<SectionSkeleton id="berita" heightClass="min-h-[380px]" />}
          >
            <BlogSection
              settings={settings}
              activePost={activeBlogPost}
              onSelectPost={handleSelectBlogPost}
              onConsultMarketing={() => handleOpenLeadModal('Jadwal Survey')}
            />
          </Suspense>
        );
      case 'faq':
        if (!settings.faqEnabled) return null;
        return (
          <Suspense
            key="faq"
            fallback={<SectionSkeleton id="faq" heightClass="min-h-[340px]" />}
          >
            <FAQSection
              settings={settings}
              onConsultMarketing={() => handleOpenLeadModal('Konsultasi Marketing')}
            />
          </Suspense>
        );
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-white text-slate-900 print:hidden">
        <ArchitecturalScrollProgress />

        <Navbar
          settings={settings}
          hasTopPromoBanner={
            settings.topPromoBannerEnabled && Boolean(settings.topPromoBannerImageUrl)
          }
          activeSection={activeSection}
          wishlistCount={wishlistIds.length}
          compareCount={compareIds.length}
          onNavigate={scrollToSection}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenContact={() => handleOpenLeadModal('Konsultasi Marketing')}
        />

        <main className="flex-1">
          {(settings.heroEnabled !== false ||
            settings.heroSearchEnabled !== false ||
            settings.highlightsEnabled !== false ||
            settings.pillarsEnabled !== false) && (
            <HeroSection
              settings={settings}
              properties={properties}
              availableCount={availableUnitsCount}
              searchQuery={catalogSearchQuery}
              selectedType={catalogType}
              selectedCluster={catalogCluster}
              selectedStatus={catalogStatus}
              selectedListingCategory={catalogListingCategory}
              onSearchQueryChange={setCatalogSearchQuery}
              onSelectedTypeChange={setCatalogType}
              onSelectedClusterChange={setCatalogCluster}
              onSelectedStatusChange={setCatalogStatus}
              onSelectedListingCategoryChange={setCatalogListingCategory}
              onSubmitSearch={(openSitePlan) => {
                setCatalogViewMode(
                  openSitePlan && settings.sitePlanEnabled !== false ? 'siteplan' : 'grid'
                );
                scrollToSection('katalog');
              }}
              onExploreCatalog={() => scrollToSection('katalog')}
              onScheduleSurvey={() => handleOpenLeadModal('Jadwal Survey')}
              onTopBannerAction={handleTopBannerAction}
            />
          )}

          {orderedSections.map((sectionId) => renderDynamicSection(sectionId))}
        </main>

        {settings.footerEnabled !== false && (
          <Footer
            settings={settings}
            onNavigate={scrollToSection}
            onOpenAdminLogin={handleOpenAdminLogin}
          />
        )}

        <BackToTopButton />

        {/* Desktop Floating Compare Shortcut (left side, beside BackToTop, clear of bottom-right AI Chatbot) */}
        <AnimatePresence>
          {settings.compareEnabled !== false &&
            compareIds.length > 0 &&
            activeSection !== 'bandingkan' && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.94 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex fixed bottom-6 left-20 z-30"
              >
                <button
                  type="button"
                  onClick={() => scrollToSection('bandingkan')}
                  className="inline-flex items-center gap-2.5 h-11 px-4 rounded-xl bg-[#6E1019] text-white text-xs font-semibold shadow-xl border border-amber-400/40 hover:bg-[#5D0C15] transition-colors cursor-pointer"
                >
                  <GitCompareArrows className="w-4 h-4 text-amber-400" />
                  <span>Bandingkan ({compareIds.length}/3) Unit</span>
                </button>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Bottom-Right Gemini AI Property Chatbot (Lazy Loaded & Admin Toggleable) */}
        {settings.chatbotEnabled && (
          <Suspense fallback={null}>
            <AiPropertyChatbot
              settings={settings}
              properties={properties}
              onOpenWhatsApp={() => handleOpenLeadModal('Konsultasi Marketing')}
            />
          </Suspense>
        )}

        {/* Mobile Floating Bottom Navigation Bar */}
        <MobileBottomNav
          settings={settings}
          activeSection={activeSection}
          onNavigate={scrollToSection}
          onOpenChatWa={() => handleOpenLeadModal('Konsultasi Marketing')}
        />

        {/* Lazy-loaded Interactive Modals & Drawers */}
        {detailProperty && (
          <Suspense fallback={null}>
            <PropertyDetailModal
              property={detailProperty}
              settings={settings}
              isWishlisted={wishlistIds.includes(detailProperty.id)}
              onClose={handleClosePropertyDetail}
              onToggleWishlist={handleToggleWishlist}
              onUseInCalculator={handleSimulateKprForUnit}
              onRequestAction={(prop, source) => handleOpenLeadModal(source, prop)}
              onPrintOrPdf={handlePrintOrPdf}
              onShareTracked={(prop, channel) =>
                recordUnitInteraction(
                  prop,
                  channel === 'wa' ? 'share_wa' : 'share_social',
                  settings
                )
              }
            />
          </Suspense>
        )}

        {leadModalContext && settings.contactFormEnabled !== false && (
          <Suspense fallback={null}>
            <LeadCaptureModal
              context={leadModalContext}
              properties={properties}
              settings={settings}
              onClose={() => setLeadModalContext(null)}
              onSubmitLead={handleSubmitLead}
            />
          </Suspense>
        )}

        {isWishlistOpen && settings.wishlistEnabled !== false && (
          <Suspense fallback={null}>
            <WishlistDrawer
              isOpen={isWishlistOpen}
              wishlistProperties={wishlistProperties}
              onClose={() => setIsWishlistOpen(false)}
              onRemoveWishlist={handleToggleWishlist}
              onOpenDetail={handleOpenPropertyDetail}
            />
          </Suspense>
        )}

        {/* Feedback Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/15 whitespace-nowrap"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Printable A4 E-Brochure & Print Property View */}
      <PrintablePropertyBrochure property={printProperty} settings={settings} />
    </MotionConfig>
  );
}
