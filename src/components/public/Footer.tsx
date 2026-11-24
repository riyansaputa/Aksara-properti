import React from 'react';
import { ExternalLink, Globe, Instagram, Lock, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { PublicSection, SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (section: PublicSection) => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenAdminLogin }) => {
  const navLabels = settings.headerNavLabels;
  const navEntries: [PublicSection, string][] = [
    ...(settings.heroEnabled !== false
      ? ([['beranda', navLabels?.beranda || 'Beranda']] as [PublicSection, string][])
      : []),
    ...(settings.catalogEnabled !== false
      ? ([['katalog', navLabels?.katalog || 'Katalog Unit']] as [PublicSection, string][])
      : []),
    ...(settings.kprEnabled !== false
      ? ([['kpr', navLabels?.kpr || 'Simulasi KPR']] as [PublicSection, string][])
      : []),
    ...(settings.compareEnabled !== false
      ? ([['bandingkan', navLabels?.bandingkan || 'Bandingkan Unit']] as [PublicSection, string][])
      : []),
    ...(settings.testimonialsEnabled
      ? ([['testimoni', 'Testimoni Penghuni']] as [PublicSection, string][])
      : []),
    ...(settings.blogEnabled ? ([['berita', 'Berita & Panduan']] as [PublicSection, string][]) : []),
    ...(settings.faqEnabled ? ([['faq', 'FAQ Pembelian']] as [PublicSection, string][]) : []),
  ];

  const currentYear = String(new Date().getFullYear());
  const rawCopyright =
    settings.footerCopyrightText?.trim() ||
    '© {{tahun}} {{developer}}. Seluruh hak cipta dilindungi.';
  const copyrightLine = rawCopyright
    .replace(/\{\{\s*tahun\s*\}\}/gi, currentYear)
    .replace(/\{\{\s*developer\s*\}\}/gi, settings.developerName || 'Developer');

  const socialItems = [
    { label: 'Instagram', url: settings.footerSocialLinks?.instagramUrl, icon: Instagram },
    { label: 'Facebook', url: settings.footerSocialLinks?.facebookUrl, icon: Globe },
    { label: 'YouTube', url: settings.footerSocialLinks?.youtubeUrl, icon: Youtube },
    { label: 'TikTok', url: settings.footerSocialLinks?.tiktokUrl, icon: Globe },
  ].filter((item) => Boolean(item.url && item.url.trim()));

  const extraLinks = (settings.footerExtraLinks || []).filter(
    (item) => item.label.trim() && item.url.trim()
  );

  return (
    <footer className="bg-gradient-to-b from-[#4A0910] via-[#35060B] to-[#1D0407] text-rose-100 pt-14 pb-28 md:pb-12 border-t border-amber-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/15">
          <div className="md:col-span-5">
            {settings.logoUrl ? (
              <div className="inline-block bg-white/95 px-3 py-1.5 rounded-lg mb-3">
                <img
                  src={settings.logoUrl}
                  alt={settings.developerName}
                  referrerPolicy="no-referrer"
                  className="h-8 w-auto max-w-[160px] object-contain"
                />
              </div>
            ) : (
              <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                {settings.developerName}
              </h2>
            )}
            <p className="text-xs font-medium text-amber-300 mb-3">{settings.projectName}</p>
            <p className="text-sm text-rose-100/80 leading-relaxed max-w-md">
              {settings.footerDescription ||
                'Kawasan hunian dan komersial terintegrasi yang dirancang harmonis dengan infrastruktur modern, ruang terbuka hijau luas, serta legalitas terjamin.'}
            </p>

            {socialItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                {socialItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-rose-50 hover:text-amber-300 hover:border-amber-400/50 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {settings.footerNavHeading || 'Navigasi'}
            </h3>
            <ul className="space-y-2 text-sm">
              {navEntries.map(([id, label]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    className="text-rose-100/80 hover:text-amber-300 transition-colors cursor-pointer text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
              {extraLinks.map((link, idx) => (
                <li key={`${idx}-${link.label}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-rose-100/80 hover:text-amber-300 transition-colors"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {settings.footerContactHeading || 'Kantor Pemasaran'}
            </h3>
            <div className="flex items-start gap-2.5 text-rose-100/80">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{settings.officeAddress}</span>
                {settings.enableGoogleMaps !== false && settings.officeGoogleMapsUrl && (
                  <div>
                    <a
                      href={settings.officeGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:underline"
                    >
                      <span>Buka Lokasi di Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-rose-100/80">
              <Phone className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-mono tabular-nums">+{settings.whatsappNumber}</span>
            </div>
            <div className="flex items-center gap-2.5 text-rose-100/80">
              <Mail className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{settings.officeEmail}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rose-200/70">
          <p>{copyrightLine}</p>

          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="inline-flex items-center gap-1.5 text-rose-100/80 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
