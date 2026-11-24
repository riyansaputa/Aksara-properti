import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bus,
  ChevronLeft,
  ChevronRight,
  Compass,
  Dumbbell,
  FileCheck2,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ASSET_IMAGES, INITIAL_SETTINGS } from '../../data/seedData';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { ListingCategory, Property, PropertyStatus, PropertyType, SiteSettings } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface HeroSectionProps {
  settings: SiteSettings;
  properties: Property[];
  availableCount: number;
  searchQuery: string;
  selectedType: 'Semua' | PropertyType;
  selectedCluster: string;
  selectedStatus: 'Semua' | PropertyStatus;
  selectedListingCategory: 'Semua' | ListingCategory;
  onSearchQueryChange: (value: string) => void;
  onSelectedTypeChange: (value: 'Semua' | PropertyType) => void;
  onSelectedClusterChange: (value: string) => void;
  onSelectedStatusChange: (value: 'Semua' | PropertyStatus) => void;
  onSelectedListingCategoryChange: (value: 'Semua' | ListingCategory) => void;
  onSubmitSearch: (openSitePlan?: boolean) => void;
  onExploreCatalog: () => void;
  onScheduleSurvey: () => void;
  onTopBannerAction: () => void;
}

const PILLAR_ICONS = [Compass, Bus, Dumbbell, FileCheck2];

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  properties,
  availableCount,
  searchQuery,
  selectedType,
  selectedCluster,
  selectedStatus,
  selectedListingCategory,
  onSearchQueryChange,
  onSelectedTypeChange,
  onSelectedClusterChange,
  onSelectedStatusChange,
  onSelectedListingCategoryChange,
  onSubmitSearch,
  onScheduleSurvey,
  onTopBannerAction,
}) => {
  const [heroTab, setHeroTab] = useState<'all' | 'ready' | 'promo'>('all');
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  const slides = useMemo(() => {
    if (settings.heroSliderEnabled && settings.heroSlides && settings.heroSlides.length > 0) {
      return settings.heroSlides.filter((s) => Boolean(s.imageUrl?.trim()));
    }
    return [
      {
        id: 'default-hero',
        imageUrl: settings.heroBackgroundImageUrl?.trim() || ASSET_IMAGES.hero,
        badgeText: `${settings.developerName} · ${availableCount} Unit Tersedia`,
        title: settings.heroTitle?.trim() || settings.projectName,
        subtitle: settings.heroSubtitle || '',
      },
    ];
  }, [
    settings.heroSliderEnabled,
    settings.heroSlides,
    settings.heroBackgroundImageUrl,
    settings.developerName,
    settings.heroTitle,
    settings.heroSubtitle,
    settings.projectName,
    availableCount,
  ]);

  const activeSlideIndex = slides.length > 0 ? slideIndex % slides.length : 0;
  const activeSlide = slides[activeSlideIndex] || slides[0];

  useEffect(() => {
    if (slides.length <= 1 || isSliderPaused) return;
    const intervalMs = Math.max(3, settings.heroSlideIntervalSec || 5) * 1000;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, isSliderPaused, settings.heroSlideIntervalSec]);

  const clusters = useMemo(() => {
    const unique = Array.from(new Set(properties.map((p) => p.cluster).filter(Boolean)));
    return ['Semua', ...unique];
  }, [properties]);

  const pillarTexts =
    settings.heroPillars && settings.heroPillars.length === 4
      ? settings.heroPillars
      : INITIAL_SETTINGS.heroPillars;

  const pillars = pillarTexts.map((item, idx) => ({
    icon: PILLAR_ICONS[idx % PILLAR_ICONS.length],
    title: item.title,
    detail: item.detail,
  }));

  const handleHeroTabClick = (tab: 'all' | 'ready' | 'promo') => {
    setHeroTab(tab);
    if (tab === 'all') {
      onSelectedStatusChange('Semua');
      onSelectedTypeChange('Semua');
    } else if (tab === 'ready') {
      onSelectedStatusChange('Available');
      onSelectedTypeChange('Semua');
    } else {
      onSelectedStatusChange('Promo');
      onSelectedTypeChange('Semua');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitSearch(false);
  };

  const hasPromoBanner =
    settings.topPromoBannerEnabled && Boolean(settings.topPromoBannerImageUrl);
  const promoTitle =
    settings.topPromoBannerTitle?.trim() ||
    settings.promoBannerText ||
    'Launching Cluster & Promo Subsidi Akad KPR';

  return (
    <section id="beranda" className="bg-white">
      {/* 1. Panoramic Hero Image Slider */}
      {settings.heroEnabled !== false && (
        <div
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
          className="relative h-[320px] sm:h-[380px] lg:h-[430px] w-full overflow-hidden bg-slate-900"
        >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0.35, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <SafeImage
              src={activeSlide.imageUrl}
              alt={activeSlide.title || settings.projectName}
              className="w-full h-full object-cover object-center"
              fallbackTitle={settings.projectName}
            />
          </motion.div>
        </AnimatePresence>

        {/* Measured Contrast Scrim for Crisp Headline Readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/40 to-slate-950/80 pointer-events-none"
        />

        {/* Prev / Next Slider Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
              }
              aria-label="Slide sebelumnya"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 border border-white/20 text-white items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
              aria-label="Slide berikutnya"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 border border-white/20 text-white items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Centered Hero Heading Positioned Cleanly Above Search Box */}
        <div
          className={`relative z-10 h-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center ${
            settings.heroSearchEnabled !== false ? 'pb-16 sm:pb-24' : ''
          }`}
        >
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-amber-300 mb-2 drop-shadow">
            {activeSlide.badgeText || `${settings.developerName} · ${availableCount} Unit Tersedia`}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight text-balance drop-shadow-md max-w-4xl">
            {activeSlide.title || settings.heroTitle?.trim() || settings.projectName}
          </h1>
          {(activeSlide.subtitle || settings.heroSubtitle) && (
            <p className="mt-2 text-xs sm:text-sm text-slate-100/95 max-w-2xl line-clamp-2 drop-shadow">
              {activeSlide.subtitle || settings.heroSubtitle}
            </p>
          )}

          {/* Slider Indicator Dots */}
          {slides.length > 1 && (
            <div className="flex items-center gap-2 mt-4">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Pilih slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === activeSlideIndex
                      ? 'w-7 bg-[#D4AF37]'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      )}

      {/* 2. Floating Overlapping Crimson Complete Search Card */}
      {settings.heroSearchEnabled !== false && (
        <div
          className={`max-w-5xl mx-auto px-4 sm:px-6 relative z-20 ${
            settings.heroEnabled !== false ? '-mt-20 sm:-mt-24' : 'pt-8'
          }`}
        >
          <form
            onSubmit={handleFormSubmit}
            className="rounded-lg bg-[#A31C24] shadow-2xl border border-[#8B1522] px-4 sm:px-7 py-4 sm:py-5 text-white"
          >
            {/* Segmented Top Tabs */}
            <div className="grid grid-cols-3 border-b border-white/15 mb-4">
              {[
                { id: 'all' as const, label: settings.heroSearchTabAllLabel || 'SEMUA' },
                { id: 'ready' as const, label: settings.heroSearchTabReadyLabel || 'TERSEDIA' },
                { id: 'promo' as const, label: settings.heroSearchTabPromoLabel || 'PROMO SPESIAL' },
              ].map((tab) => {
                const active = heroTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleHeroTabClick(tab.id)}
                    className={`pb-2.5 text-center text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer relative ${
                      active ? 'text-white' : 'text-rose-100/80 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-[3px] bg-[#D4AF37] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Primary Search Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
              <div className="sm:col-span-2 lg:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder={
                    settings.heroSearchPlaceholder ||
                    'Cari unit, lokasi, SHM, atau blok...'
                  }
                  aria-label="Masukkan kata kunci pencarian properti"
                  className="w-full h-10 pl-9 pr-3.5 rounded bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedType}
                  onChange={(e) => onSelectedTypeChange(e.target.value as 'Semua' | PropertyType)}
                  aria-label="Jenis properti"
                  className="w-full h-10 px-2.5 rounded bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  <option value="Semua">Jenis properti</option>
                  <option value="Rumah">Rumah Tapak</option>
                  <option value="Villa">Villa Modern</option>
                  <option value="Ruko">Ruko Komersial</option>
                  <option value="Apartemen">Apartemen</option>
                  <option value="Kavling">Kavling Siap Bangun</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedListingCategory}
                  onChange={(e) =>
                    onSelectedListingCategoryChange(e.target.value as 'Semua' | ListingCategory)
                  }
                  aria-label="Tipe Primary atau Secondary"
                  className="w-full h-10 px-2.5 rounded bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  <option value="Semua">Primary &amp; Secondary</option>
                  <option value="Primary">Unit Primary (Baru)</option>
                  <option value="Secondary">Unit Secondary</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedCluster}
                  onChange={(e) => onSelectedClusterChange(e.target.value)}
                  aria-label="Pilih cluster"
                  className="w-full h-10 px-2.5 rounded bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  {clusters.map((c) => (
                    <option key={c} value={c}>
                      {c === 'Semua' ? 'Semua Cluster' : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    onSelectedStatusChange(e.target.value as 'Semua' | PropertyStatus)
                  }
                  aria-label="Pilih status unit"
                  className="w-full h-10 px-2.5 rounded bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Available">Tersedia</option>
                  <option value="Promo">Promo</option>
                  <option value="Sold Out">{settings.soldOutLabel || 'Terjual'}</option>
                </select>
              </div>
            </div>

            {/* Bottom Search Action Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center mt-3">
              <div className="lg:col-span-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => onSubmitSearch(settings.sitePlanEnabled !== false)}
                  className="inline-flex items-center gap-1.5 text-rose-50 hover:text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {settings.sitePlanEnabled !== false
                      ? 'Pencarian Lengkap & Site Plan'
                      : 'Pencarian Lengkap Katalog'}
                  </span>
                </button>
              </div>

              <div className="lg:col-span-6">
                <button
                  type="submit"
                  className="w-full h-10 rounded bg-gradient-to-r from-[#D9B64E] via-[#C9A236] to-[#B68E24] text-white text-xs sm:text-sm font-bold tracking-wide hover:brightness-105 transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  <Search className="w-4 h-4" />
                  <span>{settings.heroSearchButtonText || 'Cari'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 3. Notable Highlights / Penawaran & Layanan Unggulan */}
      {(settings.highlightsEnabled !== false || settings.pillarsEnabled !== false) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          {settings.highlightsEnabled !== false && (
            <>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <p className="font-editorial italic text-lg sm:text-xl text-[#A31C24]/75 leading-tight mb-0.5">
                  {settings.highlightsEyebrow || 'Notable Highlights'}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide">
                  {settings.highlightsTitle || 'PENAWARAN & LAYANAN UNGGULAN'}
                </h2>
                <div
                  aria-hidden="true"
                  className="w-12 h-[3px] bg-[#A31C24] mx-auto mt-2.5 rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Promo / Banner Highlight */}
                <motion.button
                  type="button"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  onClick={onTopBannerAction}
                  className="group relative h-[156px] rounded-xl overflow-hidden bg-gradient-to-br from-[#9E1B24] via-[#7A111D] to-[#4A0910] text-left shadow-md border border-[#8B1522] flex items-stretch cursor-pointer"
                >
                  <div className="w-[42%] relative overflow-hidden shrink-0">
                    <SafeImage
                      src={hasPromoBanner ? settings.topPromoBannerImageUrl : ASSET_IMAGES.villaOak}
                      alt={promoTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackTitle={settings.developerName}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#7A111D]/90" />
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded bg-[#D9B64E] text-[#3B070D] text-[10px] font-bold uppercase tracking-wide shadow">
                      Promo Utama
                    </span>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center relative">
                    <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#F3D77D] mb-1">
                      {settings.promoTopEyebrow || 'Penawaran Eksklusif'}
                    </p>
                    <h3 className="font-display text-sm sm:text-[15px] font-bold text-white leading-snug line-clamp-2 mb-2">
                      {promoTitle}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-200 group-hover:translate-x-0.5 transition-transform">
                      <span>Klaim Info Promo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.button>

                {/* Card 2: Property Advisor / Marketing Spotlight */}
                {(() => {
                  const canOpenForm = settings.contactFormEnabled !== false;
                  const canWa = settings.whatsappCtaEnabled !== false;
                  const cardBody = (
                    <>
                      <div className="w-[42%] relative overflow-hidden shrink-0 bg-[#5D0C15]">
                        <SafeImage
                          src={ASSET_IMAGES.townhouseSlate}
                          alt={settings.marketingName}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                          fallbackTitle={settings.marketingName}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#7A111D]/90" />
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded bg-[#D9B64E] text-[#3B070D] text-[10px] font-bold uppercase tracking-wide shadow">
                          Top Advisor
                        </span>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#F3D77D] mb-1">
                          {settings.highlightAdvisorLabel || 'Konsultan Resmi'}
                        </p>
                        <h3 className="font-display text-sm sm:text-[15px] font-bold text-white leading-snug line-clamp-2 mb-2">
                          {settings.marketingName}
                        </h3>
                        {(canOpenForm || canWa) && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>{settings.heroSecondaryCtaText || 'Jadwal Survey & KPR'}</span>
                          </span>
                        )}
                      </div>
                    </>
                  );

                  if (!canOpenForm && canWa) {
                    return (
                      <motion.a
                        href={buildDirectWhatsappHref(settings)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="group relative h-[156px] rounded-xl overflow-hidden bg-gradient-to-br from-[#9E1B24] via-[#7A111D] to-[#4A0910] text-left shadow-md border border-[#8B1522] flex items-stretch cursor-pointer"
                      >
                        {cardBody}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.button
                      type="button"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      onClick={canOpenForm ? onScheduleSurvey : () => onSubmitSearch(false)}
                      className="group relative h-[156px] rounded-xl overflow-hidden bg-gradient-to-br from-[#9E1B24] via-[#7A111D] to-[#4A0910] text-left shadow-md border border-[#8B1522] flex items-stretch cursor-pointer"
                    >
                      {cardBody}
                    </motion.button>
                  );
                })()}

                {/* Card 3: Kawasan & Site Plan Interaktif */}
                <motion.button
                  type="button"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSubmitSearch(settings.sitePlanEnabled !== false)}
                  className="group relative h-[156px] rounded-xl overflow-hidden bg-gradient-to-br from-[#9E1B24] via-[#7A111D] to-[#4A0910] text-left shadow-md border border-[#8B1522] flex items-stretch cursor-pointer"
                >
                  <div className="w-[42%] relative overflow-hidden shrink-0">
                    <SafeImage
                      src={ASSET_IMAGES.shophouseCorner}
                      alt="Site Plan Kawasan"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackTitle={settings.projectName}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#7A111D]/90" />
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded bg-[#D9B64E] text-[#3B070D] text-[10px] font-bold uppercase tracking-wide shadow">
                      {settings.sitePlanEnabled !== false ? 'Masterplan' : 'Katalog Unit'}
                    </span>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#F3D77D] mb-1">
                      {settings.sitePlanEnabled !== false
                        ? settings.highlightSitePlanEyebrow || 'Site Plan Interaktif'
                        : 'Katalog Pilihan'}
                    </p>
                    <h3 className="font-display text-sm sm:text-[15px] font-bold text-white leading-snug line-clamp-2 mb-2">
                      {settings.sitePlanEnabled !== false
                        ? settings.highlightSitePlanTitle || 'Cek Koordinat Blok & Unit Tersedia'
                        : 'Jelajahi Semua Unit & Promo Terbaru'}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 group-hover:translate-x-0.5 transition-transform">
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>
                        {settings.sitePlanEnabled !== false ? 'Buka Peta Kawasan' : 'Lihat Katalog Unit'}
                      </span>
                    </span>
                  </div>
                </motion.button>
              </div>
            </>
          )}

          {/* 4-Column Township Advantages Strip */}
          {settings.pillarsEnabled !== false && (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ${
                settings.highlightsEnabled !== false ? 'mt-8 pt-7 border-t border-slate-100' : ''
              }`}
            >
              {pillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={`${idx}-${item.title}`} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#A31C24]/10 text-[#A31C24] border border-[#A31C24]/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" strokeWidth={1.85} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
