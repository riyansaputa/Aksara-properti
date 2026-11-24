import React from 'react';
import { Building2, Calculator, Home, MessageCircle } from 'lucide-react';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { PublicSection, SiteSettings } from '../../types';

interface MobileBottomNavProps {
  settings: SiteSettings;
  activeSection: PublicSection;
  onNavigate: (section: PublicSection) => void;
  onOpenChatWa: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings,
  activeSection,
  onNavigate,
  onOpenChatWa,
}) => {
  if (settings.mobileBottomNavEnabled === false) {
    return null;
  }

  const showHome = settings.heroEnabled !== false;
  const showCatalog = settings.catalogEnabled !== false;
  const showKpr = settings.kprEnabled !== false;
  const showWa = settings.whatsappCtaEnabled !== false;
  const showForm = settings.contactFormEnabled !== false;

  const itemCount =
    (showHome ? 1 : 0) +
    (showCatalog ? 1 : 0) +
    (showKpr ? 1 : 0) +
    (showWa ? 1 : 0);

  if (itemCount === 0) return null;

  const gridColsClass =
    itemCount === 4
      ? 'grid-cols-4'
      : itemCount === 3
      ? 'grid-cols-3'
      : itemCount === 2
      ? 'grid-cols-2'
      : 'grid-cols-1';

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl bg-[#3D070D]/95 backdrop-blur-lg border border-amber-400/25 shadow-2xl px-2 py-1.5"
    >
      <div className={`grid ${gridColsClass} gap-1`}>
        {showHome && (
          <button
            type="button"
            onClick={() => onNavigate('beranda')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'beranda'
                ? 'bg-white/12 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span>Beranda</span>
          </button>
        )}

        {showCatalog && (
          <button
            type="button"
            onClick={() => onNavigate('katalog')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'katalog'
                ? 'bg-white/12 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            <span>Katalog</span>
          </button>
        )}

        {showKpr && (
          <button
            type="button"
            onClick={() => onNavigate('kpr')}
            className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'kpr'
                ? 'bg-white/12 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5" />
            <span>Hitung KPR</span>
          </button>
        )}

        {showWa &&
          (showForm ? (
            <button
              type="button"
              onClick={onOpenChatWa}
              className="flex flex-col items-center justify-center min-h-[44px] rounded-xl text-[11px] font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 mb-0.5" />
              <span>Chat WA</span>
            </button>
          ) : (
            <a
              href={buildDirectWhatsappHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center min-h-[44px] rounded-xl text-[11px] font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 mb-0.5" />
              <span>Chat WA</span>
            </a>
          ))}
      </div>
    </nav>
  );
};
