import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bot,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Landmark,
  Layers,
  LayoutTemplate,
  Megaphone,
  MessageCircle,
  Newspaper,
  PanelBottom,
  Plus,
  Power,
  Quote,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  BooleanSettingKey,
  isSettingEnabled,
  SITE_TOGGLE_REGISTRY,
} from '../../data/featureRegistry';
import {
  ASSET_IMAGES,
  INITIAL_SETTINGS,
  PRESET_PROMO_BANNERS,
  PRESET_PROPERTY_IMAGES,
} from '../../data/seedData';
import { processImageFileToDataUrl } from '../../services/imageUploadService';
import { buildAutoBoostedSeo, getBlogSlug, getPropertySlug, slugify } from '../../services/seoService';
import { buildAutoReplyMessage } from '../../services/storageService';
import {
  BankPartnerItem,
  BlogPostItem,
  FaqItem,
  HeroSlideItem,
  Property,
  ReorderableSection,
  SiteSettings,
  TestimonialItem,
} from '../../types';
import { SafeImage } from '../common/SafeImage';

interface AdminSettingsProps {
  settings: SiteSettings;
  properties?: Property[];
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onResetDemoData: () => void;
}

type SettingsTab =
  | 'master-control'
  | 'brand-header'
  | 'content'
  | 'bank-features'
  | 'chatbot'
  | 'faq'
  | 'testimonials'
  | 'blog'
  | 'footer'
  | 'whatsapp'
  | 'tracking-access';

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  properties = [],
  onSaveSettings,
  onResetDemoData,
}) => {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('master-control');
  const [savedNotice, setSavedNotice] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [bannerError, setBannerError] = useState('');
  const [isProcessingBanner, setIsProcessingBanner] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handlePromoBannerUpload = async (
    target: 'desktop' | 'mobile',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBannerError('');
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsProcessingBanner(true);
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: target === 'desktop' ? 1920 : 1280,
        quality: 0.87,
        preserveTransparency: false,
      });
      setForm((prev) => ({
        ...prev,
        ...(target === 'desktop'
          ? { topPromoBannerImageUrl: processed.dataUrl, topPromoBannerEnabled: true }
          : { topPromoBannerMobileImageUrl: processed.dataUrl }),
      }));
    } catch (err) {
      setBannerError(
        err instanceof Error ? err.message : 'Gagal memproses gambar banner promosi.'
      );
    } finally {
      setIsProcessingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError('');
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 720,
        quality: 0.9,
        preserveTransparency: true,
      });
      setForm((prev) => ({ ...prev, logoUrl: processed.dataUrl }));
    } catch (err) {
      setLogoError(
        err instanceof Error ? err.message : 'Gagal memproses gambar logo.'
      );
    }
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 1920,
        quality: 0.87,
        preserveTransparency: false,
      });
      setForm((prev) => ({ ...prev, heroBackgroundImageUrl: processed.dataUrl }));
    } catch {
      // ignore invalid file
    }
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      const base =
        prev.sectionOrder && prev.sectionOrder.length > 0
          ? [...prev.sectionOrder]
          : [...INITIAL_SETTINGS.sectionOrder];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= base.length) return prev;
      const temp = base[index];
      base[index] = base[targetIndex];
      base[targetIndex] = temp;
      return { ...prev, sectionOrder: base };
    });
  };

  const getSectionEnabled = (sectionId: ReorderableSection): boolean => {
    switch (sectionId) {
      case 'katalog':
        return form.catalogEnabled !== false;
      case 'kpr':
        return form.kprEnabled !== false;
      case 'bandingkan':
        return form.compareEnabled !== false;
      case 'testimoni':
        return form.testimonialsEnabled;
      case 'berita':
        return form.blogEnabled;
      case 'faq':
        return form.faqEnabled;
    }
  };

  const setSectionEnabled = (sectionId: ReorderableSection, enabled: boolean) => {
    setForm((prev) => {
      switch (sectionId) {
        case 'katalog':
          return { ...prev, catalogEnabled: enabled };
        case 'kpr':
          return { ...prev, kprEnabled: enabled };
        case 'bandingkan':
          return { ...prev, compareEnabled: enabled };
        case 'testimoni':
          return { ...prev, testimonialsEnabled: enabled };
        case 'berita':
          return { ...prev, blogEnabled: enabled };
        case 'faq':
          return { ...prev, faqEnabled: enabled };
      }
    });
  };

  const handleUpdatePillar = (index: number, field: 'title' | 'detail', value: string) => {
    setForm((prev) => {
      const basePillars =
        prev.heroPillars && prev.heroPillars.length === 4
          ? [...prev.heroPillars]
          : [...INITIAL_SETTINGS.heroPillars];
      basePillars[index] = {
        ...basePillars[index],
        [field]: value,
      };
      return { ...prev, heroPillars: basePillars };
    });
  };

  const handleAddFooterLink = () => {
    setForm((prev) => ({
      ...prev,
      footerExtraLinks: [...(prev.footerExtraLinks || []), { label: '', url: '' }],
    }));
  };

  const handleUpdateFooterLink = (index: number, field: 'label' | 'url', value: string) => {
    setForm((prev) => {
      const next = [...(prev.footerExtraLinks || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, footerExtraLinks: next };
    });
  };

  const handleRemoveFooterLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      footerExtraLinks: (prev.footerExtraLinks || []).filter((_, i) => i !== index),
    }));
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      category: 'Kepemilikan & Legalitas',
      question: '',
      answer: '',
    };
    setForm((prev) => ({ ...prev, faqItems: [newItem, ...(prev.faqItems || [])] }));
  };

  const handleUpdateFaq = (index: number, patch: Partial<FaqItem>) => {
    setForm((prev) => {
      const next = [...(prev.faqItems || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, faqItems: next };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setForm((prev) => ({
      ...prev,
      faqItems: (prev.faqItems || []).filter((_, i) => i !== index),
    }));
  };

  // Testimonial Handlers
  const handleAddTestimonial = () => {
    const newItem: TestimonialItem = {
      id: `testi-${Date.now()}`,
      name: '',
      role: '',
      unitPurchased: '',
      rating: 5,
      quote: '',
      outcome: '',
      avatarUrl: '',
    };
    setForm((prev) => ({ ...prev, testimonials: [newItem, ...(prev.testimonials || [])] }));
  };

  const handleUpdateTestimonial = (index: number, patch: Partial<TestimonialItem>) => {
    setForm((prev) => {
      const next = [...(prev.testimonials || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, testimonials: next };
    });
  };

  const handleRemoveTestimonial = (index: number) => {
    setForm((prev) => ({
      ...prev,
      testimonials: (prev.testimonials || []).filter((_, i) => i !== index),
    }));
  };

  const handleTestimonialAvatarUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 400,
        quality: 0.85,
        preserveTransparency: false,
      });
      handleUpdateTestimonial(index, { avatarUrl: processed.dataUrl });
    } catch {
      // ignore invalid file
    }
  };

  // Blog Handlers
  const handleAddBlogPost = () => {
    const newPost: BlogPostItem = {
      id: `blog-${Date.now()}`,
      slug: '',
      title: '',
      category: 'Berita Kawasan',
      publishedAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      readTime: '3 menit baca',
      author: form.marketingName || 'Tim Redaksi',
      excerpt: '',
      content: '',
      imageUrl: PRESET_PROPERTY_IMAGES[0]?.url || '',
    };
    setForm((prev) => ({ ...prev, blogPosts: [newPost, ...(prev.blogPosts || [])] }));
  };

  const handleUpdateBlogPost = (index: number, patch: Partial<BlogPostItem>) => {
    setForm((prev) => {
      const next = [...(prev.blogPosts || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, blogPosts: next };
    });
  };

  const handleRemoveBlogPost = (index: number) => {
    setForm((prev) => ({
      ...prev,
      blogPosts: (prev.blogPosts || []).filter((_, i) => i !== index),
    }));
  };

  const handleBlogImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 1280,
        quality: 0.85,
        preserveTransparency: false,
      });
      handleUpdateBlogPost(index, { imageUrl: processed.dataUrl });
    } catch {
      // ignore invalid file
    }
  };

  // Hero Image Slider Handlers
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      imageUrl: PRESET_PROPERTY_IMAGES[0]?.url || ASSET_IMAGES.hero,
      badgeText: 'Hunian Eksklusif',
      title: form.heroTitle || 'Hunian Modern Bernilai Tinggi',
      subtitle: form.heroSubtitle || 'Lokasi strategis, legalitas SHM pecah, dan fasilitas kawasan lengkap.',
    };
    setForm((prev) => ({
      ...prev,
      heroSliderEnabled: true,
      heroSlides: [...(prev.heroSlides || []), newSlide],
    }));
  };

  const handleUpdateHeroSlide = (index: number, patch: Partial<HeroSlideItem>) => {
    setForm((prev) => {
      const next = [...(prev.heroSlides || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, heroSlides: next };
    });
  };

  const handleRemoveHeroSlide = (index: number) => {
    setForm((prev) => ({
      ...prev,
      heroSlides: (prev.heroSlides || []).filter((_, i) => i !== index),
    }));
  };

  const handleHeroSlideImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 1920,
        quality: 0.87,
        preserveTransparency: false,
      });
      handleUpdateHeroSlide(index, { imageUrl: processed.dataUrl });
    } catch {
      // ignore invalid file
    }
  };

  // Bank Partner Handlers
  const handleAddBankPartner = () => {
    const newBank: BankPartnerItem = {
      id: `bank-${Date.now()}`,
      name: '',
      rateText: 'Bunga 4.25% Fix 3 Thn',
      dpMinText: 'DP mulai 5%',
      maxTenorText: 'Tenor s.d. 20 Thn',
      accentColor: '#1d4ed8',
    };
    setForm((prev) => ({
      ...prev,
      bankPartnersEnabled: true,
      bankPartners: [...(prev.bankPartners || []), newBank],
    }));
  };

  const handleUpdateBankPartner = (index: number, patch: Partial<BankPartnerItem>) => {
    setForm((prev) => {
      const next = [...(prev.bankPartners || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, bankPartners: next };
    });
  };

  const handleRemoveBankPartner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      bankPartners: (prev.bankPartners || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedForm: SiteSettings = {
      ...form,
      developerName: form.developerName.trim() || INITIAL_SETTINGS.developerName,
      projectName: form.projectName.trim() || INITIAL_SETTINGS.projectName,
      adminUsername: form.adminUsername.trim() || INITIAL_SETTINGS.adminUsername,
      adminPassword: form.adminPassword.trim() || INITIAL_SETTINGS.adminPassword,
      heroSlides: (form.heroSlides || []).filter((s) => Boolean(s.imageUrl?.trim())),
      heroSlideIntervalSec: Math.max(3, Math.min(20, Number(form.heroSlideIntervalSec) || 6)),
      soldOutLabel: form.soldOutLabel?.trim() || INITIAL_SETTINGS.soldOutLabel,
      featuredBadgeLabel: form.featuredBadgeLabel?.trim() || INITIAL_SETTINGS.featuredBadgeLabel,
      bankPartnersTitle: form.bankPartnersTitle?.trim() || INITIAL_SETTINGS.bankPartnersTitle,
      bankPartners: (form.bankPartners || []).filter((b) => Boolean(b.name?.trim())),
      officeGoogleMapsUrl: form.officeGoogleMapsUrl?.trim() || '',
      officeMapEmbedQuery: form.officeMapEmbedQuery?.trim() || form.officeAddress,
      footerExtraLinks: (form.footerExtraLinks || []).filter(
        (item) => item.label.trim() || item.url.trim()
      ),
      faqItems: (form.faqItems || []).filter(
        (item) => item.question.trim() && item.answer.trim()
      ),
      testimonials: (form.testimonials || []).filter(
        (item) => item.name.trim() && item.quote.trim()
      ),
      blogPosts: (form.blogPosts || [])
        .filter((item) => item.title.trim())
        .map((item) => ({
          ...item,
          slug: item.slug?.trim() ? slugify(item.slug) : slugify(item.title),
        })),
      chatbotSuggestedQuestions: (form.chatbotSuggestedQuestions || [])
        .map((q) => q.trim())
        .filter(Boolean),
      chatbotName: form.chatbotName?.trim() || INITIAL_SETTINGS.chatbotName,
      chatbotSubtitle: form.chatbotSubtitle?.trim() || INITIAL_SETTINGS.chatbotSubtitle,
      seoTitle: form.seoTitle?.trim() || INITIAL_SETTINGS.seoTitle,
      seoDescription: form.seoDescription?.trim() || INITIAL_SETTINGS.seoDescription,
      seoKeywords: form.seoKeywords?.trim() || INITIAL_SETTINGS.seoKeywords,
      seoOgImageUrl: form.seoOgImageUrl?.trim() || '',
      googleSiteVerification: form.googleSiteVerification?.trim() || '',
    };
    await onSaveSettings(cleanedForm);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2600);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'master-control', label: 'Saklar Semua Fitur', icon: Power },
    { id: 'brand-header', label: 'Identitas & Header', icon: LayoutTemplate },
    { id: 'content', label: 'Seksi, Slider & Konten', icon: FileText },
    { id: 'bank-features', label: 'Bank KPR & Fitur', icon: Landmark },
    { id: 'chatbot', label: 'Chatbot AI Gemini', icon: Bot },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'testimonials', label: 'Testimoni', icon: Quote },
    { id: 'blog', label: 'Berita / Blog', icon: Newspaper },
    { id: 'footer', label: 'Footer & Tautan', icon: PanelBottom },
    { id: 'whatsapp', label: 'WA & Auto-Reply', icon: MessageCircle },
    { id: 'tracking-access', label: 'SEO Booster & Tracking', icon: ShieldCheck },
  ];

  const pillars =
    form.heroPillars && form.heroPillars.length === 4
      ? form.heroPillars
      : INITIAL_SETTINGS.heroPillars;

  const previewYear = String(new Date().getFullYear());
  const previewCopyright = (
    form.footerCopyrightText?.trim() || '© {{tahun}} {{developer}}. Seluruh hak cipta dilindungi.'
  )
    .replace(/\{\{\s*tahun\s*\}\}/gi, previewYear)
    .replace(/\{\{\s*developer\s*\}\}/gi, form.developerName || 'Developer');

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Pengaturan Konten, Header, Footer & CRM
          </h1>
          <p className="text-sm text-slate-600">
            Sesuaikan seluruh kalimat, judul seksi, header navigasi, footer, logo, banner promosi, auto-reply WhatsApp, dan tracking iklan secara fleksibel.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-slate-950 text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 0: SAKLAR SEMUA FITUR & SEKSI */}
        {activeTab === 'master-control' && (() => {
          const activeCount = SITE_TOGGLE_REGISTRY.filter((item) =>
            isSettingEnabled(form, item.key)
          ).length;
          const sectionItems = SITE_TOGGLE_REGISTRY.filter((i) => i.group === 'sections');
          const featureItems = SITE_TOGGLE_REGISTRY.filter((i) => i.group === 'features');

          const setToggleKey = (key: BooleanSettingKey, nextValue: boolean) => {
            setForm((prev) => ({ ...prev, [key]: nextValue }));
          };

          const handleEnableAllForm = () => {
            const patch: Partial<SiteSettings> = {};
            for (const item of SITE_TOGGLE_REGISTRY) {
              patch[item.key] = true;
            }
            setForm((prev) => ({ ...prev, ...patch }));
          };

          const handleMinimalModeForm = () => {
            setForm((prev) => ({
              ...prev,
              navbarEnabled: true,
              heroEnabled: true,
              heroSearchEnabled: true,
              catalogEnabled: true,
              footerEnabled: true,
              topPromoBannerEnabled: false,
              heroSliderEnabled: false,
              highlightsEnabled: false,
              pillarsEnabled: false,
              kprEnabled: false,
              bankPartnersEnabled: false,
              compareEnabled: false,
              testimonialsEnabled: false,
              blogEnabled: false,
              faqEnabled: false,
              chatbotEnabled: false,
              mobileBottomNavEnabled: false,
            }));
          };

          return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
                      <Power className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold text-slate-950">
                          Kendali Penuh Semua Seksi &amp; Fitur Website
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold tabular-nums">
                          {activeCount} / {SITE_TOGGLE_REGISTRY.length} Aktif
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Aktifkan atau nonaktifkan setiap seksi konten, navigasi, media, SEO, dan tombol interaksi. Klik &ldquo;Simpan Pengaturan Website&rdquo; di bawah setelah selesai mengubah.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleEnableAllForm}
                      className="h-9 px-3.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Aktifkan Semua
                    </button>
                    <button
                      type="button"
                      onClick={handleMinimalModeForm}
                      className="h-9 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Mode Ringkas
                    </button>
                  </div>
                </div>

                {/* Grup 1: Seksi & Konten Halaman */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. Seksi &amp; Tata Letak Halaman ({sectionItems.filter((i) => isSettingEnabled(form, i.key)).length}/{sectionItems.length} Aktif)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {sectionItems.map((item) => {
                      const enabled = isSettingEnabled(form, item.key);
                      return (
                        <div
                          key={item.key}
                          className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                            enabled
                              ? 'bg-emerald-50/40 border-emerald-200/90'
                              : 'bg-slate-50 border-slate-200/80 opacity-80'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">{item.label}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            aria-label={`${item.label} (${enabled ? 'Aktif' : 'Nonaktif'})`}
                            onClick={() => setToggleKey(item.key, !enabled)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                              enabled ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grup 2: Fitur Interaksi, Media, SEO & Konversi */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Fitur Interaksi, Media, SEO &amp; Konversi ({featureItems.filter((i) => isSettingEnabled(form, i.key)).length}/{featureItems.length} Aktif)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {featureItems.map((item) => {
                      const enabled = isSettingEnabled(form, item.key);
                      return (
                        <div
                          key={item.key}
                          className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                            enabled
                              ? 'bg-emerald-50/40 border-emerald-200/90'
                              : 'bg-slate-50 border-slate-200/80 opacity-80'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900">{item.label}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            aria-label={`${item.label} (${enabled ? 'Aktif' : 'Nonaktif'})`}
                            onClick={() => setToggleKey(item.key, !enabled)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                              enabled ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 1: IDENTITAS & HEADER */}
        {activeTab === 'brand-header' && (
          <div className="space-y-6">
            {/* Logo & Profil Developer */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <h2 className="font-display text-base font-bold text-slate-950 pb-3 border-b border-slate-100">
                Logo & Profil Developer
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center px-3 overflow-hidden shrink-0">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Preview Logo Developer"
                          referrerPolicy="no-referrer"
                          className="max-h-10 w-auto object-contain"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                          <span>Teks Wordmark</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Logo Resmi Developer</p>
                      <p className="text-[11px] text-slate-500">
                        Ditampilkan di Header, Footer, dan Dashboard Admin (PNG/SVG/JPG, maks. 500 KB).
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="sr-only"
                      />
                    </label>

                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logoUrl: '' })}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Logo</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Atau masukkan URL Logo secara manual
                  </label>
                  <input
                    type="text"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://domainanda.com/logo.png atau ./assets/logo.png (kosongkan untuk memakai teks)"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800"
                  />
                </div>

                {logoError && (
                  <p className="text-xs font-medium text-rose-600">{logoError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Developer
                  </label>
                  <input
                    type="text"
                    value={form.developerName}
                    onChange={(e) => setForm({ ...form, developerName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kawasan / Proyek
                  </label>
                  <input
                    type="text"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Kantor Pemasaran
                  </label>
                  <input
                    type="email"
                    value={form.officeEmail}
                    onChange={(e) => setForm({ ...form, officeEmail: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Kantor Pemasaran
                  </label>
                  <input
                    type="text"
                    value={form.officeAddress}
                    onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tautan Google Maps Kantor Pemasaran
                  </label>
                  <input
                    type="url"
                    value={form.officeGoogleMapsUrl || ''}
                    onChange={(e) => setForm({ ...form, officeGoogleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Kunci Embed Peta Lokasi Kantor
                  </label>
                  <input
                    type="text"
                    value={form.officeMapEmbedQuery || ''}
                    onChange={(e) => setForm({ ...form, officeMapEmbedQuery: e.target.value })}
                    placeholder="Kemang Jakarta Selatan Marketing Gallery"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Editor Header Website */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Pengaturan Header & Menu Navigasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ubah teks bar utilitas atas, tagline brand, label menu navigasi, tombol favorit, dan tombol aksi kanan pada header website.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.headerTopBarEnabled}
                    onChange={(e) =>
                      setForm({ ...form, headerTopBarEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <span>
                    {form.headerTopBarEnabled ? 'Bar Informasi Atas Aktif' : 'Bar Informasi Atas Nonaktif'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Operasional (Bar Atas Header)
                  </label>
                  <input
                    type="text"
                    value={form.headerTopBarHours}
                    onChange={(e) => setForm({ ...form, headerTopBarHours: e.target.value })}
                    placeholder="Marketing Gallery Buka Setiap Hari 09.00 – 18.00 WIB"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tautan Kanan (Bar Atas Header)
                  </label>
                  <input
                    type="text"
                    value={form.headerTopBarActionText}
                    onChange={(e) =>
                      setForm({ ...form, headerTopBarActionText: e.target.value })
                    }
                    placeholder="Jadwalkan Kunjungan →"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subjudul / Tagline di Bawah Logo Teks
                  </label>
                  <input
                    type="text"
                    value={form.headerTagline}
                    onChange={(e) => setForm({ ...form, headerTagline: e.target.value })}
                    placeholder="Aksara Raya Township"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol CTA Utama Header
                  </label>
                  <input
                    type="text"
                    value={form.headerCtaText}
                    onChange={(e) => setForm({ ...form, headerCtaText: e.target.value })}
                    placeholder="Hubungi Marketing"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  Label Menu Navigasi Header & Footer
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Menu 1 (Beranda)
                    </label>
                    <input
                      type="text"
                      value={form.headerNavLabels.beranda}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerNavLabels: {
                            ...form.headerNavLabels,
                            beranda: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Menu 2 (Katalog)
                    </label>
                    <input
                      type="text"
                      value={form.headerNavLabels.katalog}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerNavLabels: {
                            ...form.headerNavLabels,
                            katalog: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Menu 3 (Simulasi KPR)
                    </label>
                    <input
                      type="text"
                      value={form.headerNavLabels.kpr}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerNavLabels: {
                            ...form.headerNavLabels,
                            kpr: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Menu 4 (Bandingkan)
                    </label>
                    <input
                      type="text"
                      value={form.headerNavLabels.bandingkan}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          headerNavLabels: {
                            ...form.headerNavLabels,
                            bandingkan: e.target.value,
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tombol Favorit
                    </label>
                    <input
                      type="text"
                      value={form.headerWishlistLabel}
                      onChange={(e) =>
                        setForm({ ...form, headerWishlistLabel: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Live Mini-Preview Header */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Pratinjau Langsung Header
                </p>
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  {form.headerTopBarEnabled && (
                    <div className="bg-slate-950 text-slate-200 px-4 py-1.5 flex items-center justify-between gap-4 text-[10px]">
                      <span className="truncate">{form.officeAddress}</span>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="hidden sm:inline">{form.headerTopBarHours}</span>
                        <span className="text-amber-300 font-semibold">
                          {form.headerTopBarActionText}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 shrink-0">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt={form.developerName}
                          className="h-7 w-auto object-contain"
                        />
                      ) : (
                        <>
                          <span className="w-7 h-7 rounded bg-slate-950 text-amber-300 flex items-center justify-center">
                            <Building2 className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <p className="font-editorial text-sm font-bold text-slate-950 leading-none">
                              {form.developerName}
                            </p>
                            <p className="text-[8px] uppercase tracking-[0.2em] text-slate-500 mt-0.5">
                              {form.headerTagline || form.projectName}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-slate-700">
                      <span className="text-slate-950 font-semibold border-b border-amber-600">
                        {form.headerNavLabels.beranda}
                      </span>
                      <span>{form.headerNavLabels.katalog}</span>
                      <span>{form.headerNavLabels.kpr}</span>
                      <span>{form.headerNavLabels.bandingkan}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold text-slate-700">
                        {form.headerWishlistLabel || 'Favorit'} 0
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-950 text-white text-[10px] font-semibold">
                        {form.headerCtaText || 'Hubungi Marketing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEKSI, BANNER & KONTEN HALAMAN */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* CRM Page Builder: Kontrol Urutan & Visibilitas Seluruh Seksi */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-[#A31C24]/10 text-[#A31C24] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Manajemen Seksi &amp; Tata Letak Halaman (CRM Page Builder)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktifkan, nonaktifkan, atau atur urutan tampil setiap seksi pada halaman publik sesuai kebutuhan kampanye.
                  </p>
                </div>
              </div>

              {/* Seksi Area Atas, Navigasi & Tata Letak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  {
                    label: 'Banner Promo Atas',
                    checked: form.topPromoBannerEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, topPromoBannerEnabled: val }),
                  },
                  {
                    label: 'Header / Navbar',
                    checked: form.navbarEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, navbarEnabled: val }),
                  },
                  {
                    label: 'Hero Panorama Utama',
                    checked: form.heroEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, heroEnabled: val }),
                  },
                  {
                    label: 'Homepage Slider',
                    checked: form.heroSliderEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, heroSliderEnabled: val }),
                  },
                  {
                    label: 'Kotak Pencarian Hero',
                    checked: form.heroSearchEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, heroSearchEnabled: val }),
                  },
                  {
                    label: '3 Kartu Sorotan Utama',
                    checked: form.highlightsEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, highlightsEnabled: val }),
                  },
                  {
                    label: '4 Poin Keunggulan',
                    checked: form.pillarsEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, pillarsEnabled: val }),
                  },
                  {
                    label: 'Site Plan Interaktif',
                    checked: form.sitePlanEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, sitePlanEnabled: val }),
                  },
                  {
                    label: 'Seksi Footer Bawah',
                    checked: form.footerEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, footerEnabled: val }),
                  },
                  {
                    label: 'Navigasi Bawah Mobile',
                    checked: form.mobileBottomNavEnabled !== false,
                    onChange: (val: boolean) => setForm({ ...form, mobileBottomNavEnabled: val }),
                  },
                ].map((ctrl) => (
                  <label
                    key={ctrl.label}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 cursor-pointer hover:bg-slate-100/70"
                  >
                    <span className="truncate">{ctrl.label}</span>
                    <input
                      type="checkbox"
                      checked={ctrl.checked}
                      onChange={(e) => ctrl.onChange(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24] shrink-0"
                    />
                  </label>
                ))}
              </div>

              {/* Urutan & Status Seksi Utama */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-900">
                  Urutan &amp; Status Seksi Utama Halaman
                </p>
                <div className="space-y-2">
                  {(form.sectionOrder && form.sectionOrder.length > 0
                    ? form.sectionOrder
                    : INITIAL_SETTINGS.sectionOrder
                  ).map((sectionId, idx, arr) => {
                    const labels: Record<ReorderableSection, string> = {
                      katalog: 'Katalog Properti & Site Plan Interaktif',
                      kpr: 'Kalkulator Simulasi KPR Real-Time',
                      bandingkan: 'Tabel Bandingkan Hingga 3 Unit',
                      testimoni: 'Testimoni Penghuni & Investor',
                      berita: 'Berita Kawasan & Artikel Blog',
                      faq: 'FAQ (Pertanyaan yang Sering Diajukan)',
                    };
                    const enabled = getSectionEnabled(sectionId);
                    return (
                      <div
                        key={sectionId}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-700 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {labels[sectionId]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => setSectionEnabled(sectionId, e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                            />
                            <span>{enabled ? 'Tampil' : 'Sembunyi'}</span>
                          </label>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSection(idx, -1)}
                            aria-label={`Geser ${labels[sectionId]} ke atas`}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveSection(idx, 1)}
                            aria-label={`Geser ${labels[sectionId]} ke bawah`}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Banner Promosi Utama Paling Atas */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-950">
                      Banner Promosi Halaman Awal (Paling Atas)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tampil di posisi paling atas tepat di bawah Navbar. Mendukung upload langsung dari galeri HP/komputer.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.topPromoBannerEnabled}
                    onChange={(e) =>
                      setForm({ ...form, topPromoBannerEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <span>{form.topPromoBannerEnabled ? 'Banner Aktif' : 'Banner Nonaktif'}</span>
                </label>
              </div>

              {bannerError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                  {bannerError}
                </div>
              )}

              {isProcessingBanner && (
                <p className="text-xs font-semibold text-amber-700 animate-pulse">
                  Sedang mengoptimalkan gambar banner agar tampil tajam & cepat dimuat...
                </p>
              )}

              {/* Upload Banner Desktop */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Gambar Banner Utama (Desktop & Default)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Rekomendasi rasio 2:1 (1920×960 px). Gambar potret/kotak juga otomatis menyesuaikan tanpa terpotong.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ganti dari Galeri HP / PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePromoBannerUpload('desktop', e)}
                        className="sr-only"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          topPromoBannerImageUrl: PRESET_PROMO_BANNERS.desktopAvella,
                          topPromoBannerEnabled: true,
                        }))
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Pakai Contoh Avella (2:1)
                    </button>

                    {form.topPromoBannerImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, topPromoBannerImageUrl: '' }))
                        }
                        aria-label="Hapus banner utama"
                        className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {form.topPromoBannerImageUrl ? (
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950">
                    <SafeImage
                      src={form.topPromoBannerImageUrl}
                      alt="Preview Banner Promosi Utama"
                      className="w-full max-h-[240px] object-contain mx-auto block"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-500">
                    Belum ada gambar banner utama. Klik &ldquo;Ganti dari Galeri HP / PC&rdquo; di atas untuk mengunggah.
                  </div>
                )}
              </div>

              {/* Upload Banner Khusus Mobile (Opsional) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Gambar Banner Khusus Layar HP (Opsional)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Jika kosong, layar HP memakai gambar banner utama.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>Pilih Poster Mobile</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePromoBannerUpload('mobile', e)}
                        className="sr-only"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          topPromoBannerMobileImageUrl: PRESET_PROMO_BANNERS.mobileYearEndSale,
                        }))
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Pakai Contoh Potret (4:5)
                    </button>

                    {form.topPromoBannerMobileImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, topPromoBannerMobileImageUrl: '' }))
                        }
                        className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {form.topPromoBannerMobileImageUrl && (
                  <div className="w-40 h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-950 mx-auto sm:mx-0">
                    <SafeImage
                      src={form.topPromoBannerMobileImageUrl}
                      alt="Preview Banner Mobile"
                      fitMode="adaptive"
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Kecil Pita Banner Promo
                  </label>
                  <input
                    type="text"
                    value={form.promoTopEyebrow}
                    onChange={(e) => setForm({ ...form, promoTopEyebrow: e.target.value })}
                    placeholder="Penawaran Eksklusif"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol Banner (Kosongkan untuk teks default)
                  </label>
                  <input
                    type="text"
                    value={form.promoTopButtonText}
                    onChange={(e) => setForm({ ...form, promoTopButtonText: e.target.value })}
                    placeholder="Info & Klaim Promo via WA"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kalimat Judul Promo Banner
                  </label>
                  <input
                    type="text"
                    value={form.topPromoBannerTitle}
                    onChange={(e) =>
                      setForm({ ...form, topPromoBannerTitle: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aksi Saat Konsumen Klik Banner
                  </label>
                  <select
                    value={form.topPromoBannerAction}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        topPromoBannerAction: e.target.value as SiteSettings['topPromoBannerAction'],
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="whatsapp">Buka Form & WhatsApp Marketing (Klaim Promo)</option>
                    <option value="catalog">Arahkan ke Katalog Unit</option>
                    <option value="kpr">Arahkan ke Kalkulator Simulasi KPR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Konten, Latar & Kotak Pencarian Hero Beranda */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-slate-950 pb-3 border-b border-slate-100">
                Konten, Background &amp; Kotak Pencarian Hero Beranda
              </h2>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Foto Latar Belakang Hero Panorama (Paling Atas)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Bisa langsung upload dari galeri HP/komputer atau gunakan preset bawaan.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <label className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Foto Hero</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBgUpload}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          heroBackgroundImageUrl: ASSET_IMAGES.hero,
                        }))
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
                <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <SafeImage
                    src={form.heroBackgroundImageUrl || ASSET_IMAGES.hero}
                    alt="Preview Latar Hero"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Homepage Image Slider Manager */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Homepage Image Slider (Carousel Banner Hero)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tampilkan beberapa foto unggulan kawasan yang berganti otomatis di halaman awal.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.heroSliderEnabled !== false}
                        onChange={(e) =>
                          setForm({ ...form, heroSliderEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                      />
                      <span>{form.heroSliderEnabled !== false ? 'Slider Aktif' : 'Nonaktif'}</span>
                    </label>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs">
                      <span className="text-slate-600 font-medium">Interval:</span>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={form.heroSlideIntervalSec || 6}
                        onChange={(e) =>
                          setForm({ ...form, heroSlideIntervalSec: Number(e.target.value) || 6 })
                        }
                        className="w-12 text-center font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-slate-500">dtk</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHeroSlide}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tambah Slide</span>
                    </button>
                  </div>
                </div>

                {(form.heroSlides || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Belum ada slide khusus. Sistem akan menggunakan foto latar belakang Hero default di atas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(form.heroSlides || []).map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start"
                      >
                        <div className="sm:col-span-3 space-y-2">
                          <div className="h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                            <SafeImage
                              src={slide.imageUrl}
                              alt={`Slide ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <label className="w-full inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-800 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            <span>Upload Slide</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleHeroSlideImageUpload(idx, e)}
                              className="sr-only"
                            />
                          </label>
                        </div>

                        <div className="sm:col-span-8 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={slide.badgeText || ''}
                              onChange={(e) =>
                                handleUpdateHeroSlide(idx, { badgeText: e.target.value })
                              }
                              placeholder="Badge Slide (mis. Ready Stock)"
                              className="h-8 px-2.5 rounded-lg border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              value={slide.imageUrl}
                              onChange={(e) =>
                                handleUpdateHeroSlide(idx, { imageUrl: e.target.value })
                              }
                              placeholder="URL Foto Slide"
                              className="h-8 px-2.5 rounded-lg border border-slate-300 font-mono text-[11px]"
                            />
                          </div>
                          <input
                            type="text"
                            value={slide.title || ''}
                            onChange={(e) =>
                              handleUpdateHeroSlide(idx, { title: e.target.value })
                            }
                            placeholder="Judul Slide (opsional, tampil jika diisi)"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={slide.subtitle || ''}
                            onChange={(e) =>
                              handleUpdateHeroSlide(idx, { subtitle: e.target.value })
                            }
                            placeholder="Subjudul Slide (opsional)"
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroSlide(idx)}
                            aria-label={`Hapus Slide ${idx + 1}`}
                            className="w-8 h-8 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Utama Hero
                </label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paragraf Subjudul Hero
                </label>
                <textarea
                  rows={2}
                  value={form.heroSubtitle}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  Pengaturan Kotak Pencarian Hero (Merah Crimson)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Tab 1
                    </label>
                    <input
                      type="text"
                      value={form.heroSearchTabAllLabel}
                      onChange={(e) =>
                        setForm({ ...form, heroSearchTabAllLabel: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Tab 2
                    </label>
                    <input
                      type="text"
                      value={form.heroSearchTabReadyLabel}
                      onChange={(e) =>
                        setForm({ ...form, heroSearchTabReadyLabel: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Tab 3
                    </label>
                    <input
                      type="text"
                      value={form.heroSearchTabPromoLabel}
                      onChange={(e) =>
                        setForm({ ...form, heroSearchTabPromoLabel: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Placeholder Kolom Kata Kunci
                    </label>
                    <input
                      type="text"
                      value={form.heroSearchPlaceholder}
                      onChange={(e) =>
                        setForm({ ...form, heroSearchPlaceholder: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Teks Tombol Emas Cari
                    </label>
                    <input
                      type="text"
                      value={form.heroSearchButtonText}
                      onChange={(e) =>
                        setForm({ ...form, heroSearchButtonText: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  Teks Seksi Sorotan &amp; 3 Kartu Unggulan
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kicker Miring (Notable Highlights)
                    </label>
                    <input
                      type="text"
                      value={form.highlightsEyebrow}
                      onChange={(e) => setForm({ ...form, highlightsEyebrow: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Seksi Sorotan
                    </label>
                    <input
                      type="text"
                      value={form.highlightsTitle}
                      onChange={(e) => setForm({ ...form, highlightsTitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Kartu 2 (Konsultan)
                    </label>
                    <input
                      type="text"
                      value={form.highlightAdvisorLabel}
                      onChange={(e) =>
                        setForm({ ...form, highlightAdvisorLabel: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Kartu 3 (Masterplan / Site Plan)
                    </label>
                    <input
                      type="text"
                      value={form.highlightSitePlanEyebrow}
                      onChange={(e) =>
                        setForm({ ...form, highlightSitePlanEyebrow: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Kartu 3 (Site Plan)
                    </label>
                    <input
                      type="text"
                      value={form.highlightSitePlanTitle}
                      onChange={(e) =>
                        setForm({ ...form, highlightSitePlanTitle: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Kotak Promo Hero
                  </label>
                  <input
                    type="text"
                    value={form.heroPromoLabel}
                    onChange={(e) => setForm({ ...form, heroPromoLabel: e.target.value })}
                    placeholder="Program Penawaran Berjalan"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kalimat Promo Unggulan Hero
                  </label>
                  <input
                    type="text"
                    value={form.promoBannerText}
                    onChange={(e) => setForm({ ...form, promoBannerText: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol Utama Hero
                  </label>
                  <input
                    type="text"
                    value={form.heroPrimaryCtaText}
                    onChange={(e) => setForm({ ...form, heroPrimaryCtaText: e.target.value })}
                    placeholder="Jelajahi Katalog Unit"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol Sekunder / Kartu Survey
                  </label>
                  <input
                    type="text"
                    value={form.heroSecondaryCtaText}
                    onChange={(e) => setForm({ ...form, heroSecondaryCtaText: e.target.value })}
                    placeholder="Jadwal Survey & KPR"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* 4 Poin Keunggulan Kawasan */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  4 Poin Keunggulan Kawasan (Strip di Bawah Hero)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <p className="text-[11px] font-bold text-amber-800">
                        Keunggulan {idx + 1}
                      </p>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => handleUpdatePillar(idx, 'title', e.target.value)}
                        placeholder={`Judul keunggulan ${idx + 1}`}
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={pillar.detail}
                        onChange={(e) => handleUpdatePillar(idx, 'detail', e.target.value)}
                        placeholder={`Deskripsi singkat keunggulan ${idx + 1}`}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kalimat Seksi Katalog, KPR & Bandingkan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <h2 className="font-display text-base font-bold text-slate-950 pb-3 border-b border-slate-100">
                Judul & Kalimat Seksi Halaman (Katalog, KPR & Bandingkan)
              </h2>

              {/* Seksi Katalog */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">1. Seksi Katalog Properti</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Atas / Kicker (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={form.catalogEyebrow}
                      onChange={(e) => setForm({ ...form, catalogEyebrow: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Seksi Katalog
                    </label>
                    <input
                      type="text"
                      value={form.catalogTitle}
                      onChange={(e) => setForm({ ...form, catalogTitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Teks Tombol Emas Bawah
                    </label>
                    <input
                      type="text"
                      value={form.catalogShowMoreText}
                      onChange={(e) =>
                        setForm({ ...form, catalogShowMoreText: e.target.value })
                      }
                      placeholder="Lihat lebih banyak"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kalimat Pengantar Katalog
                  </label>
                  <textarea
                    rows={2}
                    value={form.catalogSubtitle}
                    onChange={(e) => setForm({ ...form, catalogSubtitle: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Seksi Kalkulator KPR */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">2. Seksi Kalkulator Simulasi KPR</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Atas (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={form.kprEyebrow}
                      onChange={(e) => setForm({ ...form, kprEyebrow: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Seksi KPR
                    </label>
                    <input
                      type="text"
                      value={form.kprTitle}
                      onChange={(e) => setForm({ ...form, kprTitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Teks Tombol Kirim Simulasi
                    </label>
                    <input
                      type="text"
                      value={form.kprCtaText}
                      onChange={(e) => setForm({ ...form, kprCtaText: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Catatan Kaki (Disclaimer) KPR
                    </label>
                    <input
                      type="text"
                      value={form.kprDisclaimerText}
                      onChange={(e) => setForm({ ...form, kprDisclaimerText: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kalimat Pengantar Kalkulator KPR
                  </label>
                  <textarea
                    rows={2}
                    value={form.kprSubtitle}
                    onChange={(e) => setForm({ ...form, kprSubtitle: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Seksi Bandingkan Unit */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-900">3. Seksi Bandingkan Unit</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Label Atas (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={form.compareEyebrow}
                      onChange={(e) => setForm({ ...form, compareEyebrow: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Seksi Bandingkan
                    </label>
                    <input
                      type="text"
                      value={form.compareTitle}
                      onChange={(e) => setForm({ ...form, compareTitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Judul Saat Belum Ada Unit Dipilih
                    </label>
                    <input
                      type="text"
                      value={form.compareEmptyTitle}
                      onChange={(e) => setForm({ ...form, compareEmptyTitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Keterangan Saat Belum Ada Unit Dipilih
                    </label>
                    <input
                      type="text"
                      value={form.compareEmptySubtitle}
                      onChange={(e) => setForm({ ...form, compareEmptySubtitle: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BANK PARTNERS KPR & KONTROL FITUR PROPERTI */}
        {activeTab === 'bank-features' && (
          <div className="space-y-6">
            {/* Kontrol Fitur Katalog, Print/PDF, QR Code & Label Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-[#A31C24]/10 text-[#A31C24] flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Kontrol Fitur Properti, Share, PDF Brosur, QR Code &amp; Label
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atur label unit Terjual/Unggulan serta aktifkan fitur pendukung konversi di setiap halaman detail properti.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Label Unit Terjual (Sold Out Stamp)
                  </label>
                  <input
                    type="text"
                    value={form.soldOutLabel || ''}
                    onChange={(e) => setForm({ ...form, soldOutLabel: e.target.value })}
                    placeholder="TERJUAL"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Badge Properti Unggulan
                  </label>
                  <input
                    type="text"
                    value={form.featuredBadgeLabel || ''}
                    onChange={(e) => setForm({ ...form, featuredBadgeLabel: e.target.value })}
                    placeholder="Unggulan"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.contactFormEnabled !== false}
                    onChange={(e) =>
                      setForm({ ...form, contactFormEnabled: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Contact Form &amp; Survey</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Modal pengumpulan leads CRM sebelum terhubung ke WhatsApp marketing.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsappCtaEnabled !== false}
                    onChange={(e) =>
                      setForm({ ...form, whatsappCtaEnabled: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Tombol WhatsApp CTA</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tombol chat WhatsApp di kartu properti, detail unit, header, &amp; mobile.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.wishlistEnabled !== false}
                    onChange={(e) =>
                      setForm({ ...form, wishlistEnabled: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Favorit / Wishlist Unit</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Simpan daftar unit favorit konsumen pada kartu properti &amp; header.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableVideoAndTour !== false}
                    onChange={(e) =>
                      setForm({ ...form, enableVideoAndTour: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Video &amp; 360° Virtual Tour</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tab pemutar video show unit, tur virtual 360°, serta badge kartu unit.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableGoogleMaps !== false}
                    onChange={(e) =>
                      setForm({ ...form, enableGoogleMaps: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Peta &amp; Google Maps</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Embed Google Maps lokasi tiap listing &amp; tautan peta kantor di footer.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enablePropertyPrintAndPdf !== false}
                    onChange={(e) =>
                      setForm({ ...form, enablePropertyPrintAndPdf: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Brosur PDF &amp; Print Properti</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tombol cetak halaman unit &amp; generator E-Brosur A4 PDF siap bagikan.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableSocialShare !== false}
                    onChange={(e) => setForm({ ...form, enableSocialShare: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">WhatsApp &amp; Sosmed Share</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bagikan listing ke WhatsApp, Facebook, X/Twitter, Telegram &amp; Salin Link.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enableQrCode !== false}
                    onChange={(e) => setForm({ ...form, enableQrCode: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">QR Code Unik per Listing</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      QR Code siap scan &amp; download PNG dengan pelacakan sumber kunjungan otomatis.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Partners Bank KPR */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-950">
                      Partners Bank KPR Resmi
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tampil di bawah Kalkulator KPR dan pada tab &ldquo;KPR &amp; Bank Rekanan&rdquo; di Detail Properti.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.bankPartnersEnabled !== false}
                      onChange={(e) =>
                        setForm({ ...form, bankPartnersEnabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                    />
                    <span>{form.bankPartnersEnabled !== false ? 'Tampilkan' : 'Sembunyikan'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBankPartner}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Bank</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Seksi Bank Rekanan
                </label>
                <input
                  type="text"
                  value={form.bankPartnersTitle || ''}
                  onChange={(e) => setForm({ ...form, bankPartnersTitle: e.target.value })}
                  placeholder="Didukung Bank Rekanan KPR Terpercaya"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              {(form.bankPartners || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Belum ada daftar bank rekanan. Klik &ldquo;Tambah Bank&rdquo; untuk menambahkan mitra KPR.
                </p>
              ) : (
                <div className="space-y-3">
                  {(form.bankPartners || []).map((bank, idx) => (
                    <div
                      key={bank.id || idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nama Bank
                        </label>
                        <input
                          type="text"
                          value={bank.name}
                          onChange={(e) =>
                            handleUpdateBankPartner(idx, { name: e.target.value })
                          }
                          placeholder="Bank BCA"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Promo Suku Bunga
                        </label>
                        <input
                          type="text"
                          value={bank.rateText}
                          onChange={(e) =>
                            handleUpdateBankPartner(idx, { rateText: e.target.value })
                          }
                          placeholder="Bunga 3.95% Fix 3 Thn"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Minimal DP
                        </label>
                        <input
                          type="text"
                          value={bank.dpMinText}
                          onChange={(e) =>
                            handleUpdateBankPartner(idx, { dpMinText: e.target.value })
                          }
                          placeholder="DP mulai 5%"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tenor Maksimal
                        </label>
                        <input
                          type="text"
                          value={bank.maxTenorText}
                          onChange={(e) =>
                            handleUpdateBankPartner(idx, { maxTenorText: e.target.value })
                          }
                          placeholder="Tenor s.d. 20 Thn"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Warna
                        </label>
                        <input
                          type="color"
                          value={bank.accentColor || '#1d4ed8'}
                          onChange={(e) =>
                            handleUpdateBankPartner(idx, { accentColor: e.target.value })
                          }
                          className="w-full h-9 p-1 rounded-lg border border-slate-300 bg-white cursor-pointer"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveBankPartner(idx)}
                          aria-label={`Hapus ${bank.name || 'Bank'}`}
                          className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CHATBOT AI GEMINI */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#A31C24]/10 text-[#A31C24] flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-950">
                      Chatbot Asisten Properti AI (Gemini Real-Time)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Menjawab pertanyaan pengunjung di sudut kanan bawah secara otomatis 24 jam berdasarkan data unit, harga, promo, &amp; FAQ di pengaturan admin.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.chatbotEnabled}
                    onChange={(e) => setForm({ ...form, chatbotEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <span>{form.chatbotEnabled ? 'Chatbot AI Aktif' : 'Chatbot AI Nonaktif'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Asisten Chatbot
                  </label>
                  <input
                    type="text"
                    value={form.chatbotName}
                    onChange={(e) => setForm({ ...form, chatbotName: e.target.value })}
                    placeholder="Asisten Properti AI"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subjudul Status Chatbot
                  </label>
                  <input
                    type="text"
                    value={form.chatbotSubtitle}
                    onChange={(e) => setForm({ ...form, chatbotSubtitle: e.target.value })}
                    placeholder="Online 24 Jam · Jawaban Real-Time"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pesan Sambutan Awal Chatbot
                </label>
                <textarea
                  rows={2}
                  value={form.chatbotWelcomeMessage}
                  onChange={(e) =>
                    setForm({ ...form, chatbotWelcomeMessage: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi &amp; Gaya Bahasa Tambahan untuk AI (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={form.chatbotSystemInstruction}
                  onChange={(e) =>
                    setForm({ ...form, chatbotSystemInstruction: e.target.value })
                  }
                  placeholder="Contoh: Selalu rekomendasikan jadwal survei akhir pekan & ingatkan promo subsidi biaya akad."
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">
                    Tombol Pertanyaan Cepat (Quick Prompts)
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        chatbotSuggestedQuestions: [
                          ...(prev.chatbotSuggestedQuestions || []),
                          '',
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Pertanyaan</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(form.chatbotSuggestedQuestions || []).map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => {
                          const next = [...(form.chatbotSuggestedQuestions || [])];
                          next[idx] = e.target.value;
                          setForm({ ...form, chatbotSuggestedQuestions: next });
                        }}
                        placeholder="Contoh: Unit mana yang sedang promo DP ringan?"
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            chatbotSuggestedQuestions: (
                              form.chatbotSuggestedQuestions || []
                            ).filter((_, i) => i !== idx),
                          })
                        }
                        aria-label="Hapus pertanyaan cepat"
                        className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Kelola Seksi FAQ (Pertanyaan Umum)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atur pertanyaan umum seputar kepemilikan properti (SHM/PBG), ketentuan pembayaran KPR, dan keunggulan lokasi kawasan.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.faqEnabled}
                    onChange={(e) => setForm({ ...form, faqEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <span>{form.faqEnabled ? 'Seksi FAQ Aktif' : 'Disembunyikan'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Atas (Eyebrow)
                  </label>
                  <input
                    type="text"
                    value={form.faqEyebrow}
                    onChange={(e) => setForm({ ...form, faqEyebrow: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Seksi FAQ
                  </label>
                  <input
                    type="text"
                    value={form.faqTitle}
                    onChange={(e) => setForm({ ...form, faqTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kalimat Pengantar FAQ
                  </label>
                  <textarea
                    rows={2}
                    value={form.faqSubtitle}
                    onChange={(e) => setForm({ ...form, faqSubtitle: e.target.value })}
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Tombol Konsultasi FAQ
                  </label>
                  <input
                    type="text"
                    value={form.faqCtaText}
                    onChange={(e) => setForm({ ...form, faqCtaText: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">
                    Daftar Pertanyaan & Jawaban ({(form.faqItems || []).length})
                  </p>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Pertanyaan FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(form.faqItems || []).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-800">
                          Pertanyaan #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Kategori Topik
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) =>
                              handleUpdateFaq(idx, { category: e.target.value })
                            }
                            className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                          >
                            <option value="Kepemilikan & Legalitas">Kepemilikan & Legalitas</option>
                            <option value="Pembayaran & KPR">Pembayaran & KPR</option>
                            <option value="Lokasi & Fasilitas">Lokasi & Fasilitas</option>
                            <option value="Serah Terima & Garansi">Serah Terima & Garansi</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Pertanyaan Konsumen
                          </label>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) =>
                              handleUpdateFaq(idx, { question: e.target.value })
                            }
                            placeholder="Contoh: Apakah sertifikat sudah pecah SHM per kavling?"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jawaban Resmi Developer
                        </label>
                        <textarea
                          rows={2}
                          value={item.answer}
                          onChange={(e) =>
                            handleUpdateFaq(idx, { answer: e.target.value })
                          }
                          placeholder="Tulis penjelasan lengkap & jelas di sini..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TESTIMONI */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Kelola Seksi Testimoni Penghuni & Investor
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tambahkan atau ubah ulasan nyata pembeli untuk memperkuat kepercayaan calon konsumen.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.testimonialsEnabled}
                    onChange={(e) =>
                      setForm({ ...form, testimonialsEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <span>{form.testimonialsEnabled ? 'Testimoni Aktif' : 'Disembunyikan'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Atas (Eyebrow)
                  </label>
                  <input
                    type="text"
                    value={form.testimonialsEyebrow}
                    onChange={(e) =>
                      setForm({ ...form, testimonialsEyebrow: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Seksi Testimoni
                  </label>
                  <input
                    type="text"
                    value={form.testimonialsTitle}
                    onChange={(e) =>
                      setForm({ ...form, testimonialsTitle: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kalimat Pengantar Testimoni
                  </label>
                  <textarea
                    rows={2}
                    value={form.testimonialsSubtitle}
                    onChange={(e) =>
                      setForm({ ...form, testimonialsSubtitle: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">
                    Daftar Testimoni Pembeli ({(form.testimonials || []).length})
                  </p>
                  <button
                    type="button"
                    onClick={handleAddTestimonial}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Testimoni</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(form.testimonials || []).map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-800">
                          Testimoni #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <select
                              value={item.rating}
                              onChange={(e) =>
                                handleUpdateTestimonial(idx, {
                                  rating: Number(e.target.value),
                                })
                              }
                              className="h-7 px-2 rounded border border-slate-300 bg-white text-xs"
                            >
                              {[5, 4, 3].map((r) => (
                                <option key={r} value={r}>
                                  {r} Bintang
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestimonial(idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nama Pembeli / Keluarga
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateTestimonial(idx, { name: e.target.value })
                            }
                            placeholder="Contoh: Budi Santoso"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Profesi / Status Penghuni
                          </label>
                          <input
                            type="text"
                            value={item.role}
                            onChange={(e) =>
                              handleUpdateTestimonial(idx, { role: e.target.value })
                            }
                            placeholder="Contoh: Pengusaha · Penghuni 2025"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Unit & Cluster yang Dibeli
                          </label>
                          <input
                            type="text"
                            value={item.unitPurchased}
                            onChange={(e) =>
                              handleUpdateTestimonial(idx, { unitPurchased: e.target.value })
                            }
                            placeholder="Amara Tipe 120 · Kemang Verde"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Kutipan Pengalaman Pembeli
                        </label>
                        <textarea
                          rows={2}
                          value={item.quote}
                          onChange={(e) =>
                            handleUpdateTestimonial(idx, { quote: e.target.value })
                          }
                          placeholder="Ceritakan pengalaman survei, akad, dan tinggal di kawasan..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Highlight Hasil / Bukti Nyata (Opsional)
                          </label>
                          <input
                            type="text"
                            value={item.outcome}
                            onChange={(e) =>
                              handleUpdateTestimonial(idx, { outcome: e.target.value })
                            }
                            placeholder="Contoh: KPR disetujui dalam 12 hari kerja"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                        <div className="sm:col-span-5 flex items-center gap-2">
                          <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{item.avatarUrl ? 'Ganti Foto Profil' : 'Upload Foto (Opsional)'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleTestimonialAvatarUpload(idx, e)}
                              className="sr-only"
                            />
                          </label>
                          {item.avatarUrl && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTestimonial(idx, { avatarUrl: '' })}
                              className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-rose-600 cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BERITA / BLOG */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Kelola Seksi Berita, Progres Kawasan & Blog
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Publikasikan pembaruan konstruksi, edukasi KPR, dan artikel SEO kawasan langsung dari admin.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.blogEnabled}
                    onChange={(e) => setForm({ ...form, blogEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                  />
                  <span>{form.blogEnabled ? 'Seksi Berita Aktif' : 'Disembunyikan'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Atas (Eyebrow)
                  </label>
                  <input
                    type="text"
                    value={form.blogEyebrow}
                    onChange={(e) => setForm({ ...form, blogEyebrow: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Seksi Berita / Blog
                  </label>
                  <input
                    type="text"
                    value={form.blogTitle}
                    onChange={(e) => setForm({ ...form, blogTitle: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kalimat Pengantar Berita / Blog
                  </label>
                  <textarea
                    rows={2}
                    value={form.blogSubtitle}
                    onChange={(e) => setForm({ ...form, blogSubtitle: e.target.value })}
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">
                    Daftar Artikel & Berita ({(form.blogPosts || []).length})
                  </p>
                  <button
                    type="button"
                    onClick={handleAddBlogPost}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tulis Artikel Baru</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(form.blogPosts || []).map((post, idx) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-800">
                          Artikel #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlogPost(idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Judul Artikel
                          </label>
                          <input
                            type="text"
                            value={post.title}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { title: e.target.value })
                            }
                            placeholder="Contoh: Progres Pembangunan Cluster Fase 2"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Kategori
                          </label>
                          <input
                            type="text"
                            value={post.category}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { category: e.target.value })
                            }
                            placeholder="Progres Kawasan"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Tanggal Terbit
                          </label>
                          <input
                            type="text"
                            value={post.publishedAt}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { publishedAt: e.target.value })
                            }
                            placeholder="24 Nov 2026"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nama Penulis / Redaksi
                          </label>
                          <input
                            type="text"
                            value={post.author}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { author: e.target.value })
                            }
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Estimasi Waktu Baca
                          </label>
                          <input
                            type="text"
                            value={post.readTime}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { readTime: e.target.value })
                            }
                            placeholder="4 menit baca"
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <label className="text-[11px] font-semibold text-slate-600">
                              URL Slug (SEO)
                            </label>
                            <span className="text-[10px] font-mono text-amber-800 truncate max-w-[140px]">
                              #/artikel/{getBlogSlug(post)}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={post.slug ?? ''}
                            onChange={(e) =>
                              handleUpdateBlogPost(idx, { slug: e.target.value })
                            }
                            placeholder={slugify(post.title || 'judul-artikel')}
                            className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3 aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                          <SafeImage
                            src={post.imageUrl}
                            alt={post.title || 'Sampul artikel'}
                            fitMode="adaptive"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="sm:col-span-9 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>Upload Sampul dari HP / PC</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleBlogImageUpload(idx, e)}
                                className="sr-only"
                              />
                            </label>
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateBlogPost(idx, { imageUrl: e.target.value });
                                }
                              }}
                              className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                            >
                              <option value="">Atau pilih foto preset...</option>
                              {PRESET_PROPERTY_IMAGES.map((img) => (
                                <option key={img.url} value={img.url}>
                                  {img.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Ringkasan Singkat (Tampil di Kartu Berita)
                            </label>
                            <textarea
                              rows={2}
                              value={post.excerpt}
                              onChange={(e) =>
                                handleUpdateBlogPost(idx, { excerpt: e.target.value })
                              }
                              className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Isi Lengkap Artikel (Muncul saat tombol &ldquo;Baca Artikel&rdquo; diklik)
                        </label>
                        <textarea
                          rows={4}
                          value={post.content}
                          onChange={(e) =>
                            handleUpdateBlogPost(idx, { content: e.target.value })
                          }
                          placeholder="Tulis isi artikel lengkap di sini (pisahkan paragraf dengan Enter)..."
                          className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOOTER & TAUTAN */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h2 className="font-display text-base font-bold text-slate-950">
                  Pengaturan Teks &amp; Kolom Footer
                </h2>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.footerEnabled !== false}
                    onChange={(e) => setForm({ ...form, footerEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                  />
                  <span>{form.footerEnabled !== false ? 'Footer Aktif' : 'Disembunyikan'}</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Profil Kawasan di Footer
                </label>
                <textarea
                  rows={3}
                  value={form.footerDescription}
                  onChange={(e) => setForm({ ...form, footerDescription: e.target.value })}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Kolom Navigasi Footer
                  </label>
                  <input
                    type="text"
                    value={form.footerNavHeading}
                    onChange={(e) => setForm({ ...form, footerNavHeading: e.target.value })}
                    placeholder="Navigasi"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Kolom Kontak Footer
                  </label>
                  <input
                    type="text"
                    value={form.footerContactHeading}
                    onChange={(e) => setForm({ ...form, footerContactHeading: e.target.value })}
                    placeholder="Kantor Pemasaran"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Kalimat Hak Cipta (Copyright) Footer
                  </label>
                  <div className="flex items-center gap-1.5">
                    {['{{tahun}}', '{{developer}}'].map((token) => (
                      <button
                        key={token}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            footerCopyrightText: `${prev.footerCopyrightText}${
                              prev.footerCopyrightText.endsWith(' ') ? '' : ' '
                            }${token}`,
                          }))
                        }
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer"
                      >
                        + {token}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={form.footerCopyrightText}
                  onChange={(e) => setForm({ ...form, footerCopyrightText: e.target.value })}
                  placeholder="© {{tahun}} {{developer}}. Seluruh hak cipta dilindungi."
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              {/* Tautan Tambahan Footer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Tautan Tambahan di Footer (Opsional)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tambahkan link E-Brosur PDF, Kebijakan Privasi, Website Perusahaan, atau Google Maps lokasi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFooterLink}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tambah Tautan</span>
                  </button>
                </div>

                {(form.footerExtraLinks || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Belum ada tautan tambahan. Klik &ldquo;Tambah Tautan&rdquo; jika ingin menambahkan link khusus di kolom navigasi footer.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(form.footerExtraLinks || []).map((link, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateFooterLink(idx, 'label', e.target.value)}
                          placeholder="Label (mis. Download E-Brosur)"
                          className="sm:col-span-5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateFooterLink(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="sm:col-span-6 h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink(idx)}
                          aria-label="Hapus tautan"
                          className="sm:col-span-1 h-9 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Sosial Footer */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-900">
                  Tautan Media Sosial Resmi (Kosongkan jika tidak ingin ditampilkan)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={form.footerSocialLinks.instagramUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          footerSocialLinks: {
                            ...form.footerSocialLinks,
                            instagramUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/aksararaya.official"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      value={form.footerSocialLinks.youtubeUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          footerSocialLinks: {
                            ...form.footerSocialLinks,
                            youtubeUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://youtube.com/@aksararaya"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={form.footerSocialLinks.facebookUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          footerSocialLinks: {
                            ...form.footerSocialLinks,
                            facebookUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://facebook.com/aksararaya"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      TikTok URL
                    </label>
                    <input
                      type="text"
                      value={form.footerSocialLinks.tiktokUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          footerSocialLinks: {
                            ...form.footerSocialLinks,
                            tiktokUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://tiktok.com/@aksararaya"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Live Mini-Preview Footer */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Pratinjau Langsung Footer
                </p>
                <div className="rounded-xl bg-slate-950 text-slate-300 p-5 border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-4 border-b border-white/10 text-xs">
                    <div className="md:col-span-5 space-y-1.5">
                      <p className="font-editorial text-base font-bold text-white">
                        {form.developerName}
                      </p>
                      <p className="text-[11px] text-amber-400">{form.projectName}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {form.footerDescription}
                      </p>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <p className="font-semibold text-white">{form.footerNavHeading || 'Navigasi'}</p>
                      <p className="text-slate-400">{form.headerNavLabels.beranda}</p>
                      <p className="text-slate-400">{form.headerNavLabels.katalog}</p>
                      <p className="text-slate-400">{form.headerNavLabels.kpr}</p>
                      {(form.footerExtraLinks || [])
                        .filter((l) => l.label.trim())
                        .map((l, i) => (
                          <p key={i} className="text-amber-300">
                            {l.label} ↗
                          </p>
                        ))}
                    </div>
                    <div className="md:col-span-4 space-y-1">
                      <p className="font-semibold text-white">
                        {form.footerContactHeading || 'Kantor Pemasaran'}
                      </p>
                      <p className="text-slate-400">{form.officeAddress}</p>
                      <p className="text-slate-400 font-mono">+{form.whatsappNumber}</p>
                      <p className="text-slate-400">{form.officeEmail}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">{previewCopyright}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP, KPR & AUTO-REPLY */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            {/* Marketing & KPR */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-slate-950 pb-3 border-b border-slate-100">
                Integrasi WhatsApp & Kalkulator KPR
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp Marketing (Awali 62)
                  </label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    placeholder="6281288990077"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama PIC Marketing
                  </label>
                  <input
                    type="text"
                    value={form.marketingName}
                    onChange={(e) => setForm({ ...form, marketingName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Suku Bunga Default KPR (%/thn)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={0.25}
                    value={form.defaultInterestRate}
                    onChange={(e) =>
                      setForm({ ...form, defaultInterestRate: Number(e.target.value) })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Reply WhatsApp Konsumen */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-950">
                      Auto-Reply WhatsApp Konsumen (Setelah Isi Form Leads)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Atur pesan konfirmasi otomatis yang langsung muncul dan disiapkan ke WhatsApp konsumen segera setelah mereka mengirim form konsultasi, survey, atau simulasi KPR.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-xs font-semibold text-slate-900 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.autoReplyEnabled}
                    onChange={(e) =>
                      setForm({ ...form, autoReplyEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>{form.autoReplyEnabled ? 'Auto-Reply Aktif' : 'Nonaktif'}</span>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Template Pesan Otomatis
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { token: '{{nama}}', label: '+ Nama' },
                      { token: '{{unit}}', label: '+ Unit' },
                      { token: '{{cluster}}', label: '+ Cluster' },
                      { token: '{{sumber}}', label: '+ Sumber' },
                      { token: '{{marketing}}', label: '+ PIC Sales' },
                      { token: '{{developer}}', label: '+ Developer' },
                    ].map((chip) => (
                      <button
                        key={chip.token}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            autoReplyTemplate: `${prev.autoReplyTemplate}${
                              prev.autoReplyTemplate.endsWith(' ') ? '' : ' '
                            }${chip.token}`,
                          }))
                        }
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono font-semibold text-slate-700 cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={form.autoReplyTemplate}
                  onChange={(e) =>
                    setForm({ ...form, autoReplyTemplate: e.target.value })
                  }
                  placeholder="Halo Kak {{nama}}, terima kasih telah menghubungi {{developer}}..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                  Pratinjau Pesan yang Diterima Konsumen
                </p>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {buildAutoReplyMessage(form, {
                    name: 'Andi Wijaya',
                    propertyName: 'Amara Residence Tipe 120',
                    cluster: 'Cluster Kemang Verde',
                    source: 'Jadwal Survey',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO, TRACKING & AKSES ADMIN */}
        {activeTab === 'tracking-access' && (
          <div className="space-y-6">
            {/* Pengaturan Meta SEO, SEO Booster & Live Audit Skor 100 */}
            {(() => {
              const titleLen = (form.seoTitle || '').trim().length;
              const descLen = (form.seoDescription || '').trim().length;
              const hasKeywords = (form.seoKeywords || '').trim().length > 10;
              const hasOgImage = Boolean(
                (form.seoOgImageUrl || form.topPromoBannerImageUrl || form.heroBackgroundImageUrl || '').trim()
              );
              const titleOk = titleLen >= 30 && titleLen <= 60;
              const descOk = descLen >= 120 && descLen <= 160;
              const indexable = form.seoRobotsIndex !== false;
              const schemaActive = form.seoAutoSchemaEnabled !== false;
              const allPropSlugsValid = properties.every((p) => Boolean(getPropertySlug(p)));
              const allBlogSlugsValid = (form.blogPosts || []).every((b) => Boolean(getBlogSlug(b)));

              const checks = [
                {
                  label: 'Judul Halaman (Title Tag 30–60 karakter)',
                  ok: titleOk,
                  detail: `${titleLen} karakter`,
                },
                {
                  label: 'Meta Deskripsi (120–160 karakter)',
                  ok: descOk,
                  detail: `${descLen} karakter`,
                },
                {
                  label: 'Kata Kunci & OpenGraph Social Card',
                  ok: hasKeywords && hasOgImage,
                  detail: hasKeywords && hasOgImage ? 'Lengkap (OG + Twitter)' : 'Perlu dilengkapi',
                },
                {
                  label: `Slug URL Bersih (${properties.length} Unit & ${(form.blogPosts || []).length} Artikel)`,
                  ok: allPropSlugsValid && allBlogSlugsValid,
                  detail: 'Canonical Dinamis Aktif',
                },
                {
                  label: 'Schema.org JSON-LD (RealEstateAgent, Product, FAQ, Blog)',
                  ok: schemaActive,
                  detail: schemaActive ? 'Otomatis Terinjeksi' : 'Dinonaktifkan',
                },
                {
                  label: 'Crawlability & Index (robots, sitemap.xml, html[lang="id"])',
                  ok: indexable,
                  detail: indexable ? 'Index & Follow Aktif' : 'NoIndex (Tersembunyi dari Google)',
                },
              ];
              const passedCount = checks.filter((c) => c.ok).length;
              const seoScore = Math.round((passedCount / checks.length) * 100);

              const handleAutoBoostSeo = () => {
                const boosted = buildAutoBoostedSeo(form, properties);
                setForm((prev) => ({
                  ...prev,
                  seoTitle: boosted.seoTitle,
                  seoDescription: boosted.seoDescription,
                  seoKeywords: boosted.seoKeywords,
                  seoOgImageUrl:
                    prev.seoOgImageUrl?.trim() ||
                    prev.topPromoBannerImageUrl ||
                    prev.heroBackgroundImageUrl ||
                    ASSET_IMAGES.hero,
                  seoRobotsIndex: true,
                  seoAutoSchemaEnabled: true,
                }));
              };

              return (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="font-display text-base font-bold text-slate-950">
                          SEO Booster &amp; Audit Teknis (Target Skor 100)
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Optimalkan ranking pencarian Google, meta tag, Schema.org, dan index mesin pencari dalam satu klik.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleAutoBoostSeo}
                        className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-gradient-to-r from-[#A31C24] to-[#7D1218] text-white text-xs font-bold shadow-sm hover:opacity-95 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Boost SEO (Skor 100)</span>
                      </button>

                      <div
                        className={`px-3.5 py-1.5 rounded-xl border text-right shrink-0 ${
                          seoScore === 100
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider">Skor SEO</p>
                        <p className="font-mono text-lg font-extrabold tabular-nums">
                          {seoScore} / 100
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Meta Title Utama (Ideal 30–60 karakter)
                        </label>
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            titleOk ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {titleLen} / 60 karakter {titleOk ? '✓ Ideal' : '· Sesuaikan 30–60'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={form.seoTitle}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                        placeholder="Aksara Raya — Hunian Modern & Kawasan Township Terpadu"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Meta Description Pencarian Google (Ideal 120–160 karakter)
                        </label>
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            descOk ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {descLen} / 160 karakter {descOk ? '✓ Ideal' : '· Sesuaikan 120–160'}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={form.seoDescription}
                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Kata Kunci Utama (SEO Keywords)
                        </label>
                        <input
                          type="text"
                          value={form.seoKeywords}
                          onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                          placeholder="rumah modern, cluster kemang, simulasi kpr..."
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gambar OpenGraph Share (URL)
                        </label>
                        <input
                          type="text"
                          value={form.seoOgImageUrl}
                          onChange={(e) => setForm({ ...form, seoOgImageUrl: e.target.value })}
                          placeholder="./assets/aistudio/AVELLA_DESKTOP_f6bf9c9d.jpg"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Google Search Console Verification
                        </label>
                        <input
                          type="text"
                          value={form.googleSiteVerification || ''}
                          onChange={(e) =>
                            setForm({ ...form, googleSiteVerification: e.target.value })
                          }
                          placeholder="Kode meta verifikasi GSC (opsional)"
                          className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Izinkan Indeks Google (Index &amp; Follow)
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Pastikan aktif agar seluruh listing muncul di hasil pencarian Google.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.seoRobotsIndex !== false}
                          onChange={(e) =>
                            setForm({ ...form, seoRobotsIndex: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Auto-Schema.org Rich Snippets JSON-LD
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Menampilkan harga properti, FAQ, dan artikel langsung di hasil Google.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.seoAutoSchemaEnabled !== false}
                          onChange={(e) =>
                            setForm({ ...form, seoAutoSchemaEnabled: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-slate-300 text-[#A31C24] focus:ring-[#A31C24]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Checklist Skor SEO */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900">
                      Checklist Audit Kesehatan SEO Website
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {checks.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs"
                        >
                          {item.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 leading-snug">{item.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pengaturan Google Ads, GA4 gtag.js, GTM & Meta Pixel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="font-display text-base font-bold text-slate-950">
                  Tracking Iklan & Konversi (Google Tag / Analytics / Meta Pixel)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pasang ID pelacakan resmi untuk mengukur konversi klik WhatsApp, pengisian form survey, dan simulasi KPR secara akurat untuk optimasi ROAS Google Ads & Meta Ads.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Analytics 4 Measurement ID (gtag.js)
                  </label>
                  <input
                    type="text"
                    value={form.ga4MeasurementId}
                    onChange={(e) => setForm({ ...form, ga4MeasurementId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Ads Tag ID
                  </label>
                  <input
                    type="text"
                    value={form.googleAdsId}
                    onChange={(e) => setForm({ ...form, googleAdsId: e.target.value })}
                    placeholder="AW-XXXXXXXXXX"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Ads Conversion Label — Form Lead / Survey
                  </label>
                  <input
                    type="text"
                    value={form.googleAdsLeadLabel}
                    onChange={(e) => setForm({ ...form, googleAdsLeadLabel: e.target.value })}
                    placeholder="AbCdEfGhIjKlMnOpQr"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Ads Conversion Label — Klik WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.googleAdsWhatsappLabel}
                    onChange={(e) => setForm({ ...form, googleAdsWhatsappLabel: e.target.value })}
                    placeholder="ZyXwVuTsRqPoNmLkJi"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Tag Manager Container ID (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.gtmContainerId}
                    onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta / Facebook Pixel ID (Opsional)
                  </label>
                  <input
                    type="text"
                    value={form.metaPixelId}
                    onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })}
                    placeholder="123456789012345"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableEnhancedConversions}
                  onChange={(e) =>
                    setForm({ ...form, enableEnhancedConversions: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-amber-600"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Aktifkan Enhanced Conversions & Parameter Nilai Properti (IDR)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mengirimkan nilai harga unit, cluster, dan tipe properti pada event <code className="font-mono text-slate-700">generate_lead</code> & <code className="font-mono text-slate-700">whatsapp_click</code>.
                  </p>
                </div>
              </label>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  Daftar Event Konversi Otomatis yang Dikirim ke Google Tag & Meta Pixel
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
                  <div className="p-3.5 space-y-1.5">
                    <p>
                      <code className="font-mono font-semibold text-slate-900">view_item</code> — Saat konsumen membuka Detail & Denah Unit
                    </p>
                    <p>
                      <code className="font-mono font-semibold text-slate-900">calculate_kpr</code> — Saat konsumen mensimulasikan KPR unit
                    </p>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <p>
                      <code className="font-mono font-semibold text-emerald-700">whatsapp_click</code> / <code className="font-mono">Contact</code> — Saat klik ikon WA per unit
                    </p>
                    <p>
                      <code className="font-mono font-semibold text-amber-700">generate_lead</code> / <code className="font-mono">Lead</code> — Saat form Survey / KPR dikirim
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Akses Login Admin */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-slate-950 pb-3 border-b border-slate-100">
                Kredensial Admin Login
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Admin
                  </label>
                  <input
                    type="text"
                    value={form.adminUsername}
                    onChange={(e) => setForm({ ...form, adminUsername: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password Admin
                  </label>
                  <input
                    type="text"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Row (Always Visible Across All Sub-Tabs) */}
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg">
          <div>
            {confirmReset ? (
              <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs">
                <span className="text-rose-800 font-medium">Kembalikan data ke contoh awal?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDemoData();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:text-rose-600 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Demo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengaturan berhasil disimpan</span>
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Simpan Semua Pengaturan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
