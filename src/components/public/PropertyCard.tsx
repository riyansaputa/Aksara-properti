import React from 'react';
import {
  Bath,
  BedDouble,
  Calculator,
  Car,
  Check,
  FileCheck2,
  GitCompareArrows,
  Heart,
  MapPin,
  Maximize2,
  Orbit,
  Phone,
  Play,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatRupiah } from '../../services/storageService';
import { Property, PropertyStatus } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface PropertyCardProps {
  property: Property;
  soldOutLabel?: string;
  featuredBadgeLabel?: string;
  showWishlist?: boolean;
  showCompare?: boolean;
  showKpr?: boolean;
  showWhatsapp?: boolean;
  showMediaBadges?: boolean;
  contactFormEnabled?: boolean;
  directWhatsappHref?: string;
  isWishlisted: boolean;
  isCompared: boolean;
  compareLimitReached: boolean;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (property: Property) => void;
  onSimulateKpr: (property: Property) => void;
  onWhatsAppUnit: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  soldOutLabel = 'Terjual',
  featuredBadgeLabel = 'Unggulan',
  showWishlist = true,
  showCompare = true,
  showKpr = true,
  showWhatsapp = true,
  showMediaBadges = true,
  contactFormEnabled = true,
  directWhatsappHref,
  isWishlisted,
  isCompared,
  compareLimitReached,
  onToggleWishlist,
  onToggleCompare,
  onOpenDetail,
  onSimulateKpr,
  onWhatsAppUnit,
}) => {
  const isSoldOut = property.status === 'Sold Out';
  const listingCategory = property.listingCategory || 'Primary';
  const shortCert = property.specs?.certificate
    ? property.specs.certificate.split(' ')[0]
    : 'SHM';

  const getStatusClass = (status: PropertyStatus) => {
    switch (status) {
      case 'Promo':
        return 'bg-[#D9B64E] text-[#3B070D]';
      case 'Available':
        return 'bg-slate-900/85 text-white';
      case 'Sold Out':
        return 'bg-rose-700 text-white';
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      whileHover={isSoldOut ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col rounded-lg border overflow-hidden transition-shadow duration-200 bg-white ${
        isSoldOut
          ? 'border-slate-200/80 opacity-90'
          : property.isFeatured
          ? 'border-amber-400/70 hover:border-[#A31C24]/50 hover:shadow-lg ring-1 ring-amber-200/40'
          : 'border-slate-200 hover:border-[#A31C24]/40 hover:shadow-lg'
      }`}
    >
      {/* Top Property Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={() => onOpenDetail(property)}
          aria-label={`Lihat detail ${property.name}`}
          className="block w-full h-full cursor-pointer"
        >
          <SafeImage
            src={property.imageUrl}
            alt={property.name}
            fallbackTitle={property.name}
            fitMode="adaptive"
            className="w-full h-full"
            imgClassName={`transition-transform duration-300 ${
              isSoldOut ? 'grayscale opacity-75' : 'group-hover:scale-[1.04]'
            }`}
          />
        </button>

        {/* Sold Out Center Stamp */}
        {isSoldOut && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/35 flex items-center justify-center pointer-events-none"
          >
            <span className="px-4 py-1.5 rounded-md border-2 border-white/80 bg-rose-700/95 text-white font-display text-xs font-extrabold uppercase tracking-[0.2em] -rotate-6 shadow-lg">
              {soldOutLabel}
            </span>
          </div>
        )}

        {/* Top Bar: Heart & Featured Ribbon on Left + Status & Primary/Secondary on Right */}
        <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {showWishlist && (
              <button
                type="button"
                onClick={() => onToggleWishlist(property.id)}
                aria-label={
                  isWishlisted
                    ? `Hapus ${property.name} dari favorit`
                    : `Simpan ${property.name} ke favorit`
                }
                className="w-8 h-8 rounded-full bg-white/95 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-[#A31C24] transition-colors shadow-xs cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#A31C24] text-[#A31C24]' : ''}`}
                />
              </button>
            )}
            {property.isFeatured && !isSoldOut && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>{featuredBadgeLabel}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-xs ${getStatusClass(
                property.status
              )}`}
            >
              {property.status === 'Available'
                ? 'JUAL'
                : property.status === 'Sold Out'
                ? soldOutLabel
                : property.status}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/90 text-slate-800 text-[9px] font-bold uppercase tracking-wider shadow-2xs">
              {listingCategory}
            </span>
          </div>
        </div>

        {/* Bottom Media / Blok Badges */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
          {property.sitePlanCoord?.blockCode ? (
            <span className="px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] font-semibold">
              Blok {property.sitePlanCoord.blockCode}
            </span>
          ) : (
            <span />
          )}

          {showMediaBadges && (
            <div className="flex items-center gap-1">
              {property.videoUrl && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold">
                  <Play className="w-2.5 h-2.5 fill-current text-amber-300" />
                  Video
                </span>
              )}
              {property.virtualTourUrl && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-semibold">
                  <Orbit className="w-2.5 h-2.5 text-amber-300" />
                  360°
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display text-sm sm:text-[15px] font-bold leading-snug mb-1 line-clamp-1">
          <button
            type="button"
            onClick={() => onOpenDetail(property)}
            className={`text-left w-full truncate transition-colors cursor-pointer ${
              isSoldOut ? 'text-slate-600' : 'text-slate-900 hover:text-[#A31C24]'
            }`}
          >
            {property.name}
          </button>
        </h3>

        {/* Type, Cluster & Certificate */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
          <span className="font-medium text-slate-700 shrink-0">{property.type}</span>
          <span aria-hidden="true">·</span>
          <MapPin className="w-3 h-3 text-[#A31C24] shrink-0" />
          <span className="truncate">{property.cluster}</span>
          <span className="ml-auto inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold shrink-0">
            <FileCheck2 className="w-2.5 h-2.5 text-emerald-700" />
            {shortCert}
          </span>
        </div>

        {/* Compact Spec Strip */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 mb-3 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
            {property.bedrooms > 0 ? `${property.bedrooms}` : '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            {property.bathrooms > 0 ? (
              <>
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                {property.bathrooms}
              </>
            ) : (
              <>
                <Car className="w-3.5 h-3.5 text-slate-400" />
                {property.carports}
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-slate-400" />
            {property.landArea} m²
          </span>
          {property.buildingArea > 0 && (
            <span className="text-slate-500">LB {property.buildingArea} m²</span>
          )}
        </div>

        {/* Price + Circular Call/Detail & WhatsApp Action Buttons */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`font-sans text-sm sm:text-[15px] font-bold tabular-nums truncate ${
                isSoldOut ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {formatRupiah(property.price)}
            </p>
            <p className="text-[10px] text-slate-500 truncate tabular-nums">
              {isSoldOut ? `${soldOutLabel} Habis` : `Cicilan ${property.installmentText}`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenDetail(property)}
              title={`Detail, Peta & QR ${property.name}`}
              aria-label={`Lihat detail ${property.name}`}
              className="w-8 h-8 rounded-full bg-[#1C6BA0] text-white hover:bg-[#155580] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            {showWhatsapp &&
              (contactFormEnabled ? (
                <button
                  type="button"
                  onClick={() => onWhatsAppUnit(property)}
                  title={`Chat WhatsApp tentang ${property.name}`}
                  aria-label={`Chat WhatsApp ${property.name}`}
                  className="w-8 h-8 rounded-full bg-[#1DB954] text-white hover:bg-[#169C46] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href={directWhatsappHref || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Chat WhatsApp tentang ${property.name}`}
                  aria-label={`Chat WhatsApp ${property.name}`}
                  className="w-8 h-8 rounded-full bg-[#1DB954] text-white hover:bg-[#169C46] transition-colors flex items-center justify-center shadow-xs"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              ))}
          </div>
        </div>

        {/* Quick Utility Strip: Detail, KPR & Compare */}
        <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => onOpenDetail(property)}
            className="font-semibold text-[#A31C24] hover:underline cursor-pointer"
          >
            Detail, Peta &amp; Brosur
          </button>
          <div className="flex items-center gap-2.5">
            {showKpr && (
              <button
                type="button"
                onClick={() => onSimulateKpr(property)}
                className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-[#A31C24] cursor-pointer"
              >
                <Calculator className="w-3 h-3" />
                <span>KPR</span>
              </button>
            )}
            {showCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(property.id)}
                disabled={compareLimitReached}
                className={`inline-flex items-center gap-1 font-medium cursor-pointer disabled:opacity-40 ${
                  isCompared ? 'text-[#A31C24] font-semibold' : 'text-slate-600 hover:text-[#A31C24]'
                }`}
              >
                {isCompared ? (
                  <Check className="w-3 h-3 text-[#A31C24]" />
                ) : (
                  <GitCompareArrows className="w-3 h-3" />
                )}
                <span>{isCompared ? 'Dipilih' : 'Banding'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
