import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { SiteSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface PromoTopBannerProps {
  settings: SiteSettings;
  onActionClick: () => void;
  onExploreCatalog?: () => void;
}

export const PromoTopBanner: React.FC<PromoTopBannerProps> = ({
  settings,
  onActionClick,
  onExploreCatalog,
}) => {
  const desktopSrc = settings.topPromoBannerImageUrl;
  const mobileSrc = settings.topPromoBannerMobileImageUrl || settings.topPromoBannerImageUrl;

  const [desktopRatio, setDesktopRatio] = useState<number | null>(null);

  useEffect(() => {
    setDesktopRatio(null);
  }, [desktopSrc]);

  if (!settings.topPromoBannerEnabled || !desktopSrc) {
    return null;
  }

  const altText =
    settings.topPromoBannerTitle || `Promo Resmi ${settings.developerName}`;

  const defaultActionLabel =
    settings.topPromoBannerAction === 'catalog'
      ? 'Lihat Unit Promo'
      : settings.topPromoBannerAction === 'kpr'
      ? 'Simulasi KPR Promo'
      : 'Info & Klaim Promo via WA';

  const actionLabel = settings.promoTopButtonText?.trim() || defaultActionLabel;
  const eyebrowText = settings.promoTopEyebrow?.trim() || 'Penawaran Eksklusif';

  // Jika gambar desktop bertipe potret/kotak (< 1.35), tampilkan utuh dengan latar blur selaras
  const isDesktopNonWide = desktopRatio !== null && desktopRatio < 1.35;

  return (
    <div className="w-full bg-[#3B070D] border-b border-[#5D0C15]">
      {/* Hairline aksen emas tipis yang menyambungkan Navbar dengan panggung spanduk promo */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full bg-gradient-to-r from-[#5D0C15] via-amber-400 to-[#5D0C15]"
      />

      {/* Panggung Gambar Spanduk Promo Penuh Tanpa Terpotong */}
      <button
        type="button"
        onClick={onActionClick}
        aria-label={`${altText} — ${actionLabel}`}
        className="group relative block w-full overflow-hidden bg-[#3B070D] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {/* Layar Mobile */}
        <img
          src={mobileSrc}
          alt={altText}
          referrerPolicy="no-referrer"
          className="sm:hidden w-full h-auto max-h-[540px] object-contain mx-auto block"
        />

        {/* Layar Desktop / Tablet */}
        {isDesktopNonWide ? (
          <div className="hidden sm:flex relative w-full h-[460px] lg:h-[520px] items-center justify-center overflow-hidden bg-[#3B070D]">
            <img
              src={desktopSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 brightness-75 pointer-events-none"
            />
            <img
              src={desktopSrc}
              alt={altText}
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth && naturalHeight) {
                  setDesktopRatio(naturalWidth / naturalHeight);
                }
              }}
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        ) : (
          <img
            src={desktopSrc}
            alt={altText}
            referrerPolicy="no-referrer"
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalWidth && naturalHeight) {
                setDesktopRatio(naturalWidth / naturalHeight);
              }
            }}
            className="hidden sm:block w-full max-w-[1920px] h-auto object-cover object-center mx-auto transition-transform duration-700 group-hover:scale-[1.004]"
          />
        )}
      </button>

      {/* Pita Editorial Burgundy Kontras Tinggi di Dasar Spanduk (Selaras Graha Raya) */}
      <div className="bg-gradient-to-r from-[#5D0C15] via-[#7A111D] to-[#4A0910] text-white border-t border-amber-400/35">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-amber-300">
              {eyebrowText} <span aria-hidden="true">·</span> {settings.developerName}
            </p>
            <p className="font-editorial text-lg sm:text-xl lg:text-[22px] font-semibold text-white tracking-[-0.01em] leading-snug">
              {altText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              {settings.topPromoBannerAction === 'whatsapp' ? (
                <WhatsAppIcon className="w-4 h-4 text-slate-950" />
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-950" />
              )}
              <span>{actionLabel}</span>
            </button>

            {onExploreCatalog && settings.topPromoBannerAction !== 'catalog' && (
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-white/30 bg-white/10 text-white text-xs sm:text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Lihat Katalog</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
