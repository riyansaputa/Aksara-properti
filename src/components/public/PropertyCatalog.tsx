import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  LayoutGrid,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { ListingCategory, Property, PropertyStatus, PropertyType, SiteSettings } from '../../types';
import { ArchitecturalReveal } from '../common/MotionPrimitives';
import { InteractiveSitePlan } from './InteractiveSitePlan';
import { PropertyCard } from './PropertyCard';

interface PropertyCatalogProps {
  properties: Property[];
  settings?: SiteSettings;
  wishlistIds: string[];
  compareIds: string[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showMoreText?: string;
  soldOutLabel?: string;
  featuredBadgeLabel?: string;
  sitePlanEnabled?: boolean;
  wishlistEnabled?: boolean;
  compareEnabled?: boolean;
  kprEnabled?: boolean;
  whatsappCtaEnabled?: boolean;
  contactFormEnabled?: boolean;
  enableVideoAndTour?: boolean;
  searchQuery: string;
  selectedCluster: string;
  selectedType: 'Semua' | PropertyType;
  selectedStatus: 'Semua' | PropertyStatus;
  selectedListingCategory: 'Semua' | ListingCategory;
  viewMode: 'grid' | 'siteplan';
  onSearchQueryChange: (value: string) => void;
  onSelectedClusterChange: (value: string) => void;
  onSelectedTypeChange: (value: 'Semua' | PropertyType) => void;
  onSelectedStatusChange: (value: 'Semua' | PropertyStatus) => void;
  onSelectedListingCategoryChange: (value: 'Semua' | ListingCategory) => void;
  onViewModeChange: (mode: 'grid' | 'siteplan') => void;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (property: Property) => void;
  onSimulateKpr: (property: Property) => void;
  onWhatsAppUnit: (property: Property) => void;
}

type SortOption = 'featured' | 'newest' | 'price_asc' | 'price_desc';

export const PropertyCatalog: React.FC<PropertyCatalogProps> = ({
  properties,
  settings,
  wishlistIds,
  compareIds,
  eyebrow,
  title,
  subtitle,
  showMoreText,
  soldOutLabel,
  featuredBadgeLabel,
  sitePlanEnabled = true,
  wishlistEnabled = true,
  compareEnabled = true,
  kprEnabled = true,
  whatsappCtaEnabled = true,
  contactFormEnabled = true,
  enableVideoAndTour = true,
  searchQuery,
  selectedCluster,
  selectedType,
  selectedStatus,
  selectedListingCategory,
  viewMode,
  onSearchQueryChange,
  onSelectedClusterChange,
  onSelectedTypeChange,
  onSelectedStatusChange,
  onSelectedListingCategoryChange,
  onViewModeChange,
  onToggleWishlist,
  onToggleCompare,
  onOpenDetail,
  onSimulateKpr,
  onWhatsAppUnit,
}) => {
  const effectiveViewMode = sitePlanEnabled ? viewMode : 'grid';
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [certificateFilter, setCertificateFilter] = useState<string>('Semua');
  const [showAllUnits, setShowAllUnits] = useState<boolean>(false);

  const clusters = useMemo(() => {
    const unique = Array.from(new Set(properties.map((p) => p.cluster).filter(Boolean)));
    return ['Semua', ...unique];
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return properties
      .filter((item) => {
        const cat = item.listingCategory || 'Primary';
        const cert = (item.specs?.certificate || '').toLowerCase();
        if (selectedCluster !== 'Semua' && item.cluster !== selectedCluster) return false;
        if (selectedType !== 'Semua' && item.type !== selectedType) return false;
        if (selectedStatus !== 'Semua' && item.status !== selectedStatus) return false;
        if (selectedListingCategory !== 'Semua' && cat !== selectedListingCategory) return false;
        if (onlyFeatured && !item.isFeatured) return false;
        if (certificateFilter !== 'Semua' && !cert.includes(certificateFilter.toLowerCase())) {
          return false;
        }
        if (query) {
          const hay = `${item.name} ${item.cluster} ${item.type} ${cat} ${
            item.locationAddress || ''
          } ${item.city || ''} ${item.specs?.certificate || ''} ${item.description} ${
            item.sitePlanCoord?.blockCode || ''
          }`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.status === 'Sold Out' && b.status !== 'Sold Out') return 1;
          if (a.status !== 'Sold Out' && b.status === 'Sold Out') return -1;
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'newest') {
          if (a.status === 'Sold Out' && b.status !== 'Sold Out') return 1;
          if (a.status !== 'Sold Out' && b.status === 'Sold Out') return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
      });
  }, [
    properties,
    searchQuery,
    selectedCluster,
    selectedType,
    selectedStatus,
    selectedListingCategory,
    onlyFeatured,
    certificateFilter,
    sortBy,
  ]);

  const hasActiveFilter = Boolean(
    searchQuery ||
      selectedCluster !== 'Semua' ||
      selectedType !== 'Semua' ||
      selectedStatus !== 'Semua' ||
      selectedListingCategory !== 'Semua' ||
      onlyFeatured ||
      certificateFilter !== 'Semua'
  );

  const visibleProperties =
    showAllUnits || hasActiveFilter ? filteredProperties : filteredProperties.slice(0, 4);

  const resetFilters = () => {
    onSearchQueryChange('');
    onSelectedClusterChange('Semua');
    onSelectedTypeChange('Semua');
    onSelectedStatusChange('Semua');
    onSelectedListingCategoryChange('Semua');
    setOnlyFeatured(false);
    setCertificateFilter('Semua');
    setSortBy('featured');
    setShowAllUnits(false);
  };

  return (
    <section id="katalog" className="py-14 lg:py-18 bg-slate-50/60 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Heading */}
        <ArchitecturalReveal>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <p className="font-editorial italic text-lg sm:text-xl text-[#A31C24]/75 leading-tight mb-0.5">
              {eyebrow || 'Newest Properties'}
            </p>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-slate-800 uppercase tracking-wide text-balance">
              {title || 'PROPERTY TERBARU'}
            </h2>
            <div
              aria-hidden="true"
              className="w-12 h-[3px] bg-[#A31C24] mx-auto mt-2.5 mb-3 rounded-full"
            />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle ||
                'Temukan pilihan hunian tapak, ruko komersial, dan kavling strategis dengan legalitas SHM pecah serta akses tol terdekat.'}
            </p>
          </div>
        </ArchitecturalReveal>

        {/* Cluster Filter Pills + Advanced Filters & View Switcher Toolbar */}
        <ArchitecturalReveal delay={0.04}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            {/* Cluster Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {clusters.map((cluster) => {
                const active = selectedCluster === cluster;
                const unitCount =
                  cluster === 'Semua'
                    ? properties.filter((p) => p.status !== 'Sold Out').length
                    : properties.filter((p) => p.cluster === cluster && p.status !== 'Sold Out')
                        .length;
                return (
                  <button
                    key={cluster}
                    type="button"
                    onClick={() => onSelectedClusterChange(cluster)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#A31C24] text-white border-[#A31C24] shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#A31C24]/40 hover:text-[#A31C24]'
                    }`}
                  >
                    <span>{cluster === 'Semua' ? 'Semua Cluster' : cluster}</span>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        active ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {unitCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid vs Site Plan Toggle & Sort */}
            <div className="flex flex-wrap items-center gap-2.5">
              {sitePlanEnabled && (
                <div className="inline-flex items-center gap-1 p-1 bg-slate-200/75 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onViewModeChange('grid')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      effectiveViewMode === 'grid'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Grid 4 Kolom</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange('siteplan')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      effectiveViewMode === 'siteplan'
                        ? 'bg-[#A31C24] text-amber-200 shadow-2xs'
                        : 'text-slate-700 hover:text-[#A31C24]'
                    }`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>Site Plan Interaktif</span>
                  </button>
                </div>
              )}

              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Urutkan Properti"
                  className="h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A31C24] cursor-pointer"
                >
                  <option value="featured">Unggulan &amp; Tersedia</option>
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Complete Secondary/Primary, Featured & Certificate Filter Strip */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg text-[11px]">
              {(['Semua', 'Primary', 'Secondary'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectedListingCategoryChange(cat)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    selectedListingCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'Semua' ? 'Semua Tipe Pasar' : cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOnlyFeatured((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                onlyFeatured
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
              }`}
            >
              <Star className={`w-3 h-3 ${onlyFeatured ? 'fill-current' : 'text-amber-500'}`} />
              <span>Property {featuredBadgeLabel || 'Unggulan'}</span>
            </button>

            <select
              value={certificateFilter}
              onChange={(e) => setCertificateFilter(e.target.value)}
              aria-label="Filter Sertifikat"
              className="h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A31C24] cursor-pointer"
            >
              <option value="Semua">Semua Sertifikat</option>
              <option value="SHM">SHM (Hak Milik)</option>
              <option value="SHGB">SHGB</option>
            </select>
          </div>

          {/* Inline Filter Status Strip if Active */}
          {(hasActiveFilter || effectiveViewMode === 'siteplan') && (
            <div className="mb-6 p-3 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A31C24]" />
                <span>
                  Menampilkan <strong className="text-slate-950">{filteredProperties.length}</strong>{' '}
                  dari {properties.length} unit
                </span>
                {selectedType !== 'Semua' && (
                  <span className="font-semibold text-[#A31C24]">· Tipe: {selectedType}</span>
                )}
                {selectedListingCategory !== 'Semua' && (
                  <span className="font-semibold text-[#A31C24]">
                    · Kategori: {selectedListingCategory}
                  </span>
                )}
                {selectedStatus !== 'Semua' && (
                  <span className="font-semibold text-[#A31C24]">· Status: {selectedStatus}</span>
                )}
                {certificateFilter !== 'Semua' && (
                  <span className="font-semibold text-[#A31C24]">· Sertifikat: {certificateFilter}</span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    · <Search className="w-3 h-3" /> &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-semibold text-[#A31C24] hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </ArchitecturalReveal>

        {/* Interactive Site Plan or 4-Column Card Grid */}
        {effectiveViewMode === 'siteplan' ? (
          <InteractiveSitePlan
            allProperties={properties}
            filteredProperties={filteredProperties}
            onOpenDetail={onOpenDetail}
            onSimulateKpr={onSimulateKpr}
            onWhatsAppUnit={onWhatsAppUnit}
          />
        ) : visibleProperties.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-xl border border-dashed border-slate-300 bg-white">
            <p className="font-display text-lg font-semibold text-slate-900 mb-1.5">
              Tidak ada unit yang sesuai dengan filter Anda
            </p>
            <p className="text-sm text-slate-600 mb-5">
              Coba ubah pilihan cluster, tipe properti, kategori Primary/Secondary, atau kata kunci pencarian.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-lg bg-[#A31C24] text-white text-xs font-semibold hover:bg-[#8B1522] transition-colors cursor-pointer"
            >
              Tampilkan Semua Unit
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleProperties.map((property) => {
                const isWishlisted = wishlistIds.includes(property.id);
                const isCompared = compareIds.includes(property.id);
                const compareLimitReached = !isCompared && compareIds.length >= 3;

                return (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    soldOutLabel={soldOutLabel}
                    featuredBadgeLabel={featuredBadgeLabel}
                    showWishlist={wishlistEnabled}
                    showCompare={compareEnabled}
                    showKpr={kprEnabled}
                    showWhatsapp={whatsappCtaEnabled}
                    showMediaBadges={enableVideoAndTour}
                    contactFormEnabled={contactFormEnabled}
                    directWhatsappHref={
                      settings ? buildDirectWhatsappHref(settings, property) : undefined
                    }
                    isWishlisted={isWishlisted}
                    isCompared={isCompared}
                    compareLimitReached={compareLimitReached}
                    onToggleWishlist={onToggleWishlist}
                    onToggleCompare={onToggleCompare}
                    onOpenDetail={onOpenDetail}
                    onSimulateKpr={onSimulateKpr}
                    onWhatsAppUnit={onWhatsAppUnit}
                  />
                );
              })}
            </div>

            {/* Warm Gold "Lihat lebih banyak" Button */}
            {!hasActiveFilter && filteredProperties.length > 4 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllUnits((prev) => !prev)}
                  className="inline-flex items-center justify-center h-10 px-8 rounded bg-gradient-to-r from-[#D9B64E] via-[#C9A236] to-[#B68E24] text-white text-xs sm:text-sm font-semibold hover:brightness-105 transition-all shadow-sm cursor-pointer"
                >
                  {showAllUnits
                    ? 'Tampilkan Lebih Sedikit'
                    : `${showMoreText || 'Lihat lebih banyak'} (${filteredProperties.length} unit)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
