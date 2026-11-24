import React from 'react';
import { Building2, Heart, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { getSectionHash } from '../../services/seoService';
import { PublicSection, SiteSettings } from '../../types';

interface NavbarProps {
  settings: SiteSettings;
  hasTopPromoBanner?: boolean;
  activeSection: PublicSection;
  wishlistCount: number;
  compareCount: number;
  onNavigate: (section: PublicSection) => void;
  onOpenWishlist: () => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeSection,
  wishlistCount,
  compareCount,
  onNavigate,
  onOpenWishlist,
  onOpenContact,
}) => {
  if (settings.navbarEnabled === false) {
    return null;
  }

  const navLabels = settings.headerNavLabels;
  const compareBaseLabel = navLabels?.bandingkan || 'Bandingkan';
  const showWishlist = settings.wishlistEnabled !== false;
  const showContactModal = settings.contactFormEnabled !== false;
  const showWhatsapp = settings.whatsappCtaEnabled !== false;
  const showCtaButton = showContactModal || showWhatsapp;

  const navItems: { id: PublicSection; label: string }[] = [
    ...(settings.heroEnabled !== false
      ? [{ id: 'beranda' as PublicSection, label: navLabels?.beranda || 'Beranda' }]
      : []),
    ...(settings.catalogEnabled !== false
      ? [{ id: 'katalog' as PublicSection, label: navLabels?.katalog || 'Katalog Unit' }]
      : []),
    ...(settings.kprEnabled !== false
      ? [{ id: 'kpr' as PublicSection, label: navLabels?.kpr || 'Simulasi KPR' }]
      : []),
    ...(settings.compareEnabled !== false
      ? [
          {
            id: 'bandingkan' as PublicSection,
            label: compareCount > 0 ? `${compareBaseLabel} (${compareCount})` : compareBaseLabel,
          },
        ]
      : []),
    ...(settings.blogEnabled ? [{ id: 'berita' as PublicSection, label: 'Berita' }] : []),
    ...(settings.faqEnabled ? [{ id: 'faq' as PublicSection, label: 'FAQ' }] : []),
  ];

  const tagline =
    settings.headerTagline?.trim() ||
    (settings.projectName ? settings.projectName.split('–')[0].trim() : 'Real Estate & Township');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#A31C24] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-6">
        {/* Zone 1: Brand Logo & Wordmark */}
        <a
          href="#/beranda"
          onClick={(e) => {
            e.preventDefault();
            onNavigate(settings.heroEnabled !== false ? 'beranda' : navItems[0]?.id || 'katalog');
          }}
          className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31C24] rounded-lg py-1"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.developerName}
              referrerPolicy="no-referrer"
              className="h-9 lg:h-10 w-auto max-w-[175px] object-contain"
            />
          ) : (
            <>
              <span className="w-10 h-10 rounded-full bg-[#A31C24] text-amber-200 border-2 border-[#D4AF37]/70 flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-4 h-4" strokeWidth={1.85} />
              </span>
              <span className="flex flex-col text-left">
                <span className="font-display text-lg lg:text-xl font-bold tracking-tight text-[#A31C24] leading-none">
                  {settings.developerName}
                </span>
                <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#B68E24] mt-1 leading-none">
                  {tagline}
                </span>
              </span>
            </>
          )}
        </a>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={getSectionHash(item.id)}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#A31C24] font-semibold'
                    : 'text-slate-700 hover:text-[#A31C24]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#A31C24] rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Favorit & Primary Contact CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {showWishlist && (
            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label={`Buka ${settings.headerWishlistLabel || 'Favorit'} (${wishlistCount} unit tersimpan)`}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full border border-slate-200 bg-white text-slate-700 hover:text-[#A31C24] hover:border-[#A31C24]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31C24]"
            >
              <Heart
                className={`w-3.5 h-3.5 ${wishlistCount > 0 ? 'fill-[#A31C24] text-[#A31C24]' : 'text-slate-600'}`}
              />
              <span className="hidden sm:inline text-xs font-semibold">
                {settings.headerWishlistLabel || 'Favorit'}
              </span>
              <span className="font-mono text-xs tabular-nums font-bold text-slate-900">
                {wishlistCount}
              </span>
            </button>
          )}

          {showCtaButton &&
            (showContactModal ? (
              <button
                type="button"
                onClick={onOpenContact}
                title={settings.headerCtaText || 'Hubungi Marketing'}
                aria-label={settings.headerCtaText || 'Hubungi Marketing'}
                className="inline-flex items-center justify-center gap-2 h-9 px-3.5 sm:px-4 rounded-full border border-[#A31C24] bg-[#A31C24] text-white text-xs font-semibold hover:bg-[#8B1522] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31C24]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">
                  {settings.headerCtaText || 'Hubungi Marketing'}
                </span>
              </button>
            ) : (
              <a
                href={buildDirectWhatsappHref(settings)}
                target="_blank"
                rel="noopener noreferrer"
                title={settings.headerCtaText || 'Hubungi Marketing'}
                aria-label={settings.headerCtaText || 'Hubungi Marketing'}
                className="inline-flex items-center justify-center gap-2 h-9 px-3.5 sm:px-4 rounded-full border border-[#A31C24] bg-[#A31C24] text-white text-xs font-semibold hover:bg-[#8B1522] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31C24]"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">
                  {settings.headerCtaText || 'Hubungi Marketing'}
                </span>
              </a>
            ))}
        </div>
      </div>
    </header>
  );
};
