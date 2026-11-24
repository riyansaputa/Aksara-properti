import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bath,
  BedDouble,
  Building2,
  Calculator,
  CalendarCheck,
  Car,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileDown,
  FileText,
  Heart,
  Landmark,
  MapPin,
  Maximize2,
  Orbit,
  PlayCircle,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  X,
} from 'lucide-react';
import { getPropertySlug } from '../../services/seoService';
import {
  buildDirectWhatsappHref,
  calculateKPR,
  formatCompactRupiah,
  formatRupiah,
} from '../../services/storageService';
import { Property, SiteSettings } from '../../types';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface PropertyDetailModalProps {
  property: Property | null;
  settings: SiteSettings;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onUseInCalculator: (property: Property) => void;
  onRequestAction: (
    property: Property,
    source: 'Jadwal Survey' | 'Minta Brosur' | 'Detail Unit'
  ) => void;
  onPrintOrPdf: (property: Property, mode: 'print' | 'pdf') => void;
  onShareTracked?: (property: Property, channel: 'wa' | 'social') => void;
}

type DetailTab = 'galeri' | 'denah' | 'video360' | 'maps' | 'spesifikasi' | 'kpr' | 'bagikan';

function toVideoEmbedUrl(rawUrl?: string): { type: 'iframe' | 'video'; src: string } | null {
  const url = rawUrl?.trim();
  if (!url) return null;
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return { type: 'video', src: url };
  }
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/);
  if (ytMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { type: 'iframe', src: url };
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  settings,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onUseInCalculator,
  onRequestAction,
  onPrintOrPdf,
  onShareTracked,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('galeri');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setActiveTab('galeri');
    setSelectedPhotoIdx(0);
    setCopiedLink(false);
  }, [property?.id]);

  useEffect(() => {
    if (!property) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [property, onClose]);

  const photos =
    property && property.galleryUrls && property.galleryUrls.length > 0
      ? property.galleryUrls
      : property
      ? [property.imageUrl]
      : [];
  const currentPhoto = property ? photos[selectedPhotoIdx] || property.imageUrl : '';

  const defaultInterestRate = settings.defaultInterestRate || 6.25;
  const quickKpr15 = property
    ? calculateKPR(property.price, 20, 15, defaultInterestRate)
    : calculateKPR(0, 20, 15, defaultInterestRate);
  const quickKpr20 = property
    ? calculateKPR(property.price, 20, 20, defaultInterestRate)
    : calculateKPR(0, 20, 20, defaultInterestRate);

  const slug = property ? getPropertySlug(property) : '';
  const baseHref =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://aksararaya.id/';
  const unitShareUrl = property ? `${baseHref}#/unit/${slug}` : baseHref;
  const qrShareUrl = property
    ? `${baseHref}?src=qr&unit=${encodeURIComponent(slug)}#/unit/${slug}`
    : baseHref;

  const waShareHref = property
    ? `https://wa.me/?text=${encodeURIComponent(
        `Cek properti ${property.name} (${property.cluster}) di ${settings.developerName}!\nHarga: ${formatRupiah(
          property.price
        )} · LT ${property.landArea}m² / LB ${property.buildingArea}m²\nLihat detail, denah & simulasi KPR: ${baseHref}?src=wa#/unit/${slug}`
      )}`
    : '#';

  const fbShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    unitShareUrl
  )}`;
  const twitterShareHref = property
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${property.name} (${property.cluster}) — ${formatRupiah(property.price)}`
      )}&url=${encodeURIComponent(unitShareUrl)}`
    : '#';
  const telegramShareHref = property
    ? `https://t.me/share/url?url=${encodeURIComponent(unitShareUrl)}&text=${encodeURIComponent(
        `${property.name} — ${formatRupiah(property.price)}`
      )}`
    : '#';

  const mapQuery = property
    ? encodeURIComponent(
        property.locationAddress?.trim() || `${property.cluster}, ${settings.officeAddress}`
      )
    : '';
  const mapsEmbedSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl =
    property?.googleMapsUrl?.trim() || `https://maps.google.com/?q=${mapQuery}`;

  const videoEmbed = toVideoEmbedUrl(property?.videoUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(unitShareUrl);
      setCopiedLink(true);
      if (property) onShareTracked?.(property, 'social');
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key={property.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Detail unit ${property.name}`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                  <span className="font-semibold text-slate-700">{property.cluster}</span>
                  <span aria-hidden="true">·</span>
                  <span>{property.type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">
                    {property.listingCategory || 'Primary'}
                  </span>
                  {property.isFeatured && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {settings.featuredBadgeLabel || 'Unggulan'}
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      property.status === 'Sold Out'
                        ? 'bg-rose-100 text-rose-800'
                        : property.status === 'Promo'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {property.status === 'Sold Out'
                      ? settings.soldOutLabel || 'Terjual'
                      : property.status}
                  </span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-950 truncate">
                  {property.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {settings.enablePropertyPrintAndPdf !== false && (
                  <button
                    type="button"
                    onClick={() => onPrintOrPdf(property, 'print')}
                    title="Print Halaman Properti"
                    aria-label="Print properti"
                    className="hidden sm:flex w-10 h-10 rounded-lg border border-slate-200 items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
                {settings.wishlistEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(property.id)}
                    aria-label="Simpan ke Favorit"
                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup detail unit"
                  className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Interactive Tabs */}
            <div className="px-5 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                {(
                  [
                    { id: 'galeri', label: 'Galeri & Info' },
                    { id: 'denah', label: 'Denah Lantai' },
                    ...(settings.enableVideoAndTour !== false
                      ? [{ id: 'video360' as const, label: 'Video & 360° Tour' }]
                      : []),
                    ...(settings.enableGoogleMaps !== false
                      ? [{ id: 'maps' as const, label: 'Lokasi & Google Maps' }]
                      : []),
                    { id: 'spesifikasi', label: 'Spesifikasi & Sertifikat' },
                    ...(settings.kprEnabled !== false
                      ? [{ id: 'kpr' as const, label: 'KPR & Bank Rekanan' }]
                      : []),
                    ...(settings.enableSocialShare !== false || settings.enableQrCode !== false
                      ? [{ id: 'bagikan' as const, label: 'QR Code & Bagikan' }]
                      : []),
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#8B1522] text-[#8B1522] bg-white rounded-t-lg'
                        : 'border-transparent text-slate-600 hover:text-[#8B1522]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {activeTab === 'galeri' && (
                <div className="space-y-4">
                  <div className="h-[290px] sm:h-[410px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <SafeImage
                      src={currentPhoto}
                      alt={property.name}
                      fallbackTitle={property.name}
                      fitMode="adaptive"
                      className="w-full h-full"
                    />
                  </div>

                  {photos.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {photos.map((url, idx) => (
                        <button
                          key={`${url.slice(0, 40)}-${idx}`}
                          type="button"
                          onClick={() => setSelectedPhotoIdx(idx)}
                          className={`w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                            selectedPhotoIdx === idx
                              ? 'border-amber-600 opacity-100'
                              : 'border-transparent opacity-65 hover:opacity-100'
                          }`}
                        >
                          <SafeImage
                            src={url}
                            alt={`${property.name} ${idx + 1}`}
                            fitMode="adaptive"
                            className="w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Promo Highlight Banner */}
                  {property.promoTag && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Tag className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                            Penawaran Khusus Unit Ini
                          </p>
                          <p className="text-sm font-semibold text-slate-950">{property.promoTag}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRequestAction(property, 'Detail Unit')}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>Klaim Promo via WA</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                    <div className="md:col-span-2 space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950 mb-2">
                          Deskripsi Arsitektur &amp; Tata Ruang
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {property.description}
                        </p>
                      </div>

                      {/* Fasilitas Property */}
                      {property.facilities && property.facilities.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-950 mb-2.5">
                            Fasilitas Kawasan &amp; Hunian
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {property.facilities.map((fac) => (
                              <span
                                key={fac}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                              >
                                <Building2 className="w-3.5 h-3.5 text-[#A31C24]" />
                                {fac}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Keunggulan Unit */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950 mb-2.5">
                          Keunggulan Utama &amp; Fitur Hunian
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(property.highlights && property.highlights.length > 0
                            ? property.highlights
                            : [
                                'Legalitas SHM Pecah Siap Akad KPR',
                                'Jaringan Utilitas PLN & Fiber Bawah Tanah',
                                'Sistem Keamanan One-Gate 24 Jam',
                                'Desain Pencahayaan & Sirkulasi Udara Optimal',
                              ]
                          ).map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Summary & Direct WhatsApp Conversion Card */}
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                        <div>
                          <p className="text-xs text-slate-500">Harga Penawaran</p>
                          <p className="font-mono text-xl font-bold text-slate-950 tabular-nums">
                            {formatRupiah(property.price)}
                          </p>
                          <p className="text-xs text-amber-800 font-medium">
                            Cicilan mulai {property.installmentText}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500">Legalitas Sertifikat</span>
                            <span className="font-semibold text-emerald-800 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {property.specs?.certificate?.split(' ')[0] || 'SHM'}
                            </span>
                          </div>
                          {property.locationAddress && (
                            <div className="flex items-start gap-1.5 text-[11px] text-slate-600 pt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#A31C24] shrink-0 mt-0.5" />
                              <span>{property.locationAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200 text-xs text-slate-700 tabular-nums">
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>LT {property.landArea} m²</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>LB {property.buildingArea} m²</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                            <span>{property.bedrooms} Kamar Tidur</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
                            <span>{property.bathrooms} Kamar Mandi</span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            <span>{property.carports} Kapasitas Carport</span>
                          </div>
                        </div>
                      </div>

                      {/* Direct WhatsApp Conversion Card */}
                      <div className="rounded-xl bg-gradient-to-br from-[#6E1019] to-[#4A0910] text-white p-4 space-y-3 border border-amber-400/25">
                        <p className="text-xs font-bold text-amber-300">
                          Konsultasi Cepat Unit Ini
                        </p>
                        <p className="text-xs text-rose-100 leading-relaxed">
                          Dapatkan rincian sisa blok tersedia, skema DP fleksibel, dan simulasi KPR bank rekanan langsung lewat WhatsApp.
                        </p>
                        <button
                          type="button"
                          onClick={() => onRequestAction(property, 'Detail Unit')}
                          className="w-full h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Chat Marketing via WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'denah' && (
                <div className="space-y-4">
                  {property.floorplanUrl ? (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                      <SafeImage
                        src={property.floorplanUrl}
                        alt={`Denah lantai ${property.name}`}
                        fallbackTitle={`Denah Lantai — ${property.name}`}
                        className="w-full max-h-[430px] object-contain bg-white p-2"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-3">
                      <p className="text-sm font-semibold text-slate-900">
                        File denah lantai untuk unit ini tersedia melalui tim marketing.
                      </p>
                      <button
                        type="button"
                        onClick={() => onRequestAction(property, 'Minta Brosur')}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>Minta Denah &amp; E-Brosur via WA</span>
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-slate-500 mb-0.5">Luas Tanah</p>
                      <p className="font-mono font-bold text-slate-950 tabular-nums">
                        {property.landArea} m²
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-slate-500 mb-0.5">Luas Bangunan</p>
                      <p className="font-mono font-bold text-slate-950 tabular-nums">
                        {property.buildingArea} m²
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-slate-500 mb-0.5">Kamar Tidur / Mandi</p>
                      <p className="font-mono font-bold text-slate-950 tabular-nums">
                        {property.bedrooms} KT / {property.bathrooms} KM
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-slate-500 mb-0.5">Carport</p>
                      <p className="font-mono font-bold text-slate-950 tabular-nums">
                        {property.carports} Mobil
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'video360' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Video Property */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-[#A31C24]" />
                      <h3 className="font-display text-sm font-bold text-slate-950">
                        Video Tour Unit Properti
                      </h3>
                    </div>

                    {videoEmbed ? (
                      videoEmbed.type === 'video' ? (
                        <video
                          controls
                          src={videoEmbed.src}
                          className="w-full aspect-video rounded-lg bg-black"
                        />
                      ) : (
                        <iframe
                          src={videoEmbed.src}
                          title={`Video ${property.name}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full aspect-video rounded-lg border border-slate-200 bg-black"
                        />
                      )
                    ) : (
                      <div className="aspect-video rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                        <PlayCircle className="w-9 h-9 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-800">
                          Video show unit dapat dikirimkan langsung via WhatsApp atau diatur di menu Kelola Properti Admin.
                        </p>
                        <button
                          type="button"
                          onClick={() => onRequestAction(property, 'Detail Unit')}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>Minta Video Show Unit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 360° Virtual Tour */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Orbit className="w-4 h-4 text-amber-600" />
                      <h3 className="font-display text-sm font-bold text-slate-950">
                        360° Interactive Virtual Tour
                      </h3>
                    </div>

                    {property.virtualTourUrl?.trim() ? (
                      <iframe
                        src={property.virtualTourUrl.trim()}
                        title={`360 Virtual Tour ${property.name}`}
                        allowFullScreen
                        className="w-full aspect-video rounded-lg border border-slate-200 bg-slate-900"
                      />
                    ) : (
                      <div className="aspect-video rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                        <Orbit className="w-9 h-9 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-800">
                          Link 360° Virtual Tour (Kuula / Matterport) dapat dipasang pada form unit di Admin Panel, atau jadwalkan live video call survey.
                        </p>
                        <button
                          type="button"
                          onClick={() => onRequestAction(property, 'Jadwal Survey')}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#8B1522] text-white text-xs font-semibold hover:bg-[#6E1019] cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Live Video Survey Unit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'maps' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="rounded-xl overflow-hidden border border-slate-200 h-[320px] sm:h-[360px] bg-slate-100">
                      <iframe
                        title={`Peta Lokasi ${property.name}`}
                        src={mapsEmbedSrc}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#A31C24]">
                        Lokasi Properti
                      </p>
                      <p className="text-sm font-semibold text-slate-950">{property.cluster}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {property.locationAddress || settings.officeAddress}
                        {property.city ? `, ${property.city}` : ''}
                      </p>
                      <a
                        href={externalMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Buka Petunjuk Arah Google Maps</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Aksesibilitas &amp; Fasilitas Terdekat
                      </h3>
                      <div className="space-y-2">
                        {(property.nearbyAccess && property.nearbyAccess.length > 0
                          ? property.nearbyAccess
                          : [
                              '5 Menit menuju Gerbang Tol Koridor Bintaro–Serpong',
                              '7 Menit menuju Stasiun KRL & Halte Shuttle Kawasan',
                              '8 Menit menuju Pusat Belanja, Rumah Sakit, & Sekolah',
                            ]
                        ).map((access) => (
                          <div
                            key={access}
                            className="flex items-start gap-2 text-xs text-slate-700"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>{access}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'spesifikasi' && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <tbody className="divide-y divide-slate-200">
                      {[
                        ['Kategori Listing', property.listingCategory || 'Primary'],
                        ['Struktur Bangunan', property.specs?.structure || 'Beton bertulang SNI'],
                        ['Dinding & Fasad', property.specs?.walls || 'Bata ringan plester aci'],
                        ['Material Lantai', property.specs?.flooring || 'Homogeneous tile 80x80'],
                        ['Sanitair', property.specs?.sanitary || 'Toto / Kohler standar arsitektur'],
                        ['Daya Listrik', property.specs?.electricity || 'Jaringan bawah tanah'],
                        ['Sumber Air', property.specs?.water || 'PDAM terpusat'],
                        ['Legalitas Sertifikat', property.specs?.certificate || 'SHM Pecah per Unit'],
                      ].map(([label, val]) => (
                        <tr key={label} className="hover:bg-slate-50">
                          <td className="w-48 px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50/70">
                            {label}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'kpr' && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-gradient-to-br from-[#5D0C15] to-[#2D050A] text-white p-6 space-y-5 border border-amber-400/25">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-amber-400 mb-1">
                          Simulasi Cepat KPR — {property.name}
                        </p>
                        <p className="font-mono text-2xl font-bold tabular-nums">
                          {formatRupiah(property.price)}
                        </p>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Asumsi DP 20% ({formatCompactRupiah(quickKpr15.downPaymentAmount)}) · Suku
                          bunga {defaultInterestRate}%/tahun
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUseInCalculator(property)}
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Buka di Kalkulator Lengkap</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-slate-300 mb-1">Tenor 15 Tahun</p>
                        <p className="font-mono text-xl font-bold text-white tabular-nums">
                          {formatRupiah(quickKpr15.monthlyInstallment)}
                          <span className="text-xs font-sans font-normal text-slate-400">
                            {' '}
                            /bln
                          </span>
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs text-slate-300 mb-1">Tenor 20 Tahun</p>
                        <p className="font-mono text-xl font-bold text-white tabular-nums">
                          {formatRupiah(quickKpr20.monthlyInstallment)}
                          <span className="text-xs font-sans font-normal text-slate-400">
                            {' '}
                            /bln
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {settings.bankPartnersEnabled !== false &&
                    settings.bankPartners &&
                    settings.bankPartners.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Landmark className="w-4 h-4 text-[#A31C24]" />
                          <h3 className="text-sm font-bold text-slate-900">
                            {settings.bankPartnersTitle || 'Bank Rekanan KPR Resmi'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {settings.bankPartners.map((bank) => (
                            <div
                              key={bank.id}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1"
                            >
                              <p
                                style={{ color: bank.accentColor || '#0f172a' }}
                                className="font-display text-xs font-extrabold"
                              >
                                {bank.name}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-900">
                                {bank.rateText}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {bank.dpMinText} · {bank.maxTenorText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'bagikan' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {settings.enableQrCode !== false && (
                    <div className="md:col-span-5 p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center text-center space-y-3">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A31C24]">
                        <QrCode className="w-4 h-4" />
                        <span>QR Code Khusus Unit Ini</span>
                      </div>
                      <QrCodeSvg
                        value={qrShareUrl}
                        size={168}
                        downloadFileName={`qr-${slug}.png`}
                        showDownload
                        label={`Scan untuk membuka ${property.name} dari HP atau cetak ke flyer promosi`}
                      />
                    </div>
                  )}

                  {settings.enableSocialShare !== false && (
                    <div
                      className={`${
                        settings.enableQrCode !== false ? 'md:col-span-7' : 'md:col-span-12'
                      } p-5 rounded-xl border border-slate-200 bg-white space-y-4`}
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#A31C24]" />
                        <h3 className="font-display text-sm font-bold text-slate-950">
                          Bagikan Properti ke WhatsApp &amp; Media Sosial
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Kirimkan tautan unit ini ke pasangan, keluarga, atau media sosial dengan format pratinjau judul, harga, dan foto otomatis.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <a
                          href={waShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onShareTracked?.(property, 'wa')}
                          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1DB954] text-white text-xs font-bold hover:bg-[#169C46] transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Bagikan via WhatsApp</span>
                        </a>

                        <a
                          href={fbShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onShareTracked?.(property, 'social')}
                          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#1877F2] text-white text-xs font-bold hover:brightness-110 transition-all"
                        >
                          <span>Share ke Facebook</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={twitterShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onShareTracked?.(property, 'social')}
                          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          <span>Share ke X / Twitter</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={telegramShareHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onShareTracked?.(property, 'social')}
                          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#229ED9] text-white text-xs font-bold hover:brightness-110 transition-all"
                        >
                          <span>Share ke Telegram</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                          Tautan Langsung Unit (SEO URL)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={unitShareUrl}
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700"
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0"
                          >
                            {copiedLink ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Modal Action Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Ingin melihat langsung kondisi unit &amp; lingkungan cluster?
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {settings.enablePropertyPrintAndPdf !== false && (
                  <>
                    <button
                      type="button"
                      onClick={() => onPrintOrPdf(property, 'pdf')}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#A31C24]" />
                      <span>Brosur PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintOrPdf(property, 'print')}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print</span>
                    </button>
                  </>
                )}
                {settings.contactFormEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => onRequestAction(property, 'Minta Brosur')}
                    className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Minta Pricelist</span>
                  </button>
                )}
                {settings.whatsappCtaEnabled !== false &&
                  (settings.contactFormEnabled !== false ? (
                    <button
                      type="button"
                      onClick={() => onRequestAction(property, 'Detail Unit')}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Tanya WA</span>
                    </button>
                  ) : (
                    <a
                      href={buildDirectWhatsappHref(settings, property)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Tanya WA</span>
                    </a>
                  ))}
                {settings.contactFormEnabled !== false && (
                  <button
                    type="button"
                    onClick={() => onRequestAction(property, 'Jadwal Survey')}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[#8B1522] text-white text-xs font-semibold hover:bg-[#6E1019] transition-colors cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Jadwal Survey</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
