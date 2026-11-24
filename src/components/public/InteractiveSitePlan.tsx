import React, { useEffect, useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Calculator,
  Compass,
  Eye,
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { formatCompactRupiah, formatRupiah } from '../../services/storageService';
import { Property, PropertyStatus } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface InteractiveSitePlanProps {
  allProperties: Property[];
  filteredProperties: Property[];
  onOpenDetail: (property: Property) => void;
  onSimulateKpr: (property: Property) => void;
  onWhatsAppUnit: (property: Property) => void;
}

const FALLBACK_COORDS = [
  { x: 18, y: 26, blockCode: 'BLOK-1' },
  { x: 48, y: 36, blockCode: 'BLOK-2' },
  { x: 75, y: 24, blockCode: 'BLOK-3' },
  { x: 24, y: 74, blockCode: 'BLOK-4' },
  { x: 74, y: 74, blockCode: 'BLOK-5' },
];

export const InteractiveSitePlan: React.FC<InteractiveSitePlanProps> = ({
  allProperties,
  filteredProperties,
  onOpenDetail,
  onSimulateKpr,
  onWhatsAppUnit,
}) => {
  const [selectedId, setSelectedId] = useState<string>(() => {
    return filteredProperties[0]?.id ?? allProperties[0]?.id ?? '';
  });
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    const stillVisible = filteredProperties.some((p) => p.id === selectedId);
    if (!stillVisible) {
      setSelectedId(filteredProperties[0]?.id ?? allProperties[0]?.id ?? '');
    }
  }, [filteredProperties, allProperties, selectedId]);

  const filteredIdSet = useMemo(
    () => new Set(filteredProperties.map((p) => p.id)),
    [filteredProperties]
  );

  const pins = useMemo(() => {
    return allProperties.map((prop, index) => {
      const coord =
        prop.sitePlanCoord ?? FALLBACK_COORDS[index % FALLBACK_COORDS.length];
      return {
        property: prop,
        coord,
        isMatched: filteredIdSet.has(prop.id),
      };
    });
  }, [allProperties, filteredIdSet]);

  const selectedPin =
    pins.find((p) => p.property.id === selectedId) ?? pins[0] ?? null;

  const getPinStyle = (status: PropertyStatus, isSelected: boolean, isMatched: boolean) => {
    if (!isMatched) {
      return 'bg-slate-300 text-slate-600 border-white opacity-45 hover:opacity-80';
    }
    if (isSelected) {
      return 'bg-[#6E1019] text-amber-300 border-amber-400 ring-4 ring-[#8B1522]/30 scale-110 z-20 shadow-xl';
    }
    switch (status) {
      case 'Promo':
        return 'bg-amber-400 text-[#4A0910] border-[#6E1019] hover:scale-105 shadow-md';
      case 'Available':
        return 'bg-emerald-600 text-white border-white hover:scale-105 shadow-md';
      case 'Sold Out':
        return 'bg-slate-600 text-slate-100 border-white/80 opacity-85 hover:opacity-100';
    }
  };

  const getStatusBadgeClass = (status: PropertyStatus) => {
    switch (status) {
      case 'Promo':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'Available':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
      case 'Sold Out':
        return 'bg-slate-200 text-slate-700 border border-slate-300';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-xs">
      {/* Site Plan Top Controls & Legend */}
      <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
            <MapPin className="w-4 h-4 text-[#8B1522]" />
            <span>Klik titik blok pada peta kawasan untuk pratinjau cepat</span>
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#6E1019]" />
              Promo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-slate-300" />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              Sold Out
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
            disabled={zoom <= 1}
            aria-label="Perkecil peta"
            className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] font-semibold text-slate-800 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.75, Number((z + 0.25).toFixed(2))))}
            disabled={zoom >= 1.75}
            aria-label="Perbesar peta"
            className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Grid: Masterplan Map + Quick Unit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Interactive Township Masterplan Canvas */}
        <div className="lg:col-span-8 bg-[#eef2ee] border-b lg:border-b-0 lg:border-r border-slate-200 overflow-auto relative">
          <div
            className="relative min-w-[640px] aspect-[16/10] transition-transform duration-300 origin-top-left"
            style={{ width: `${zoom * 100}%` }}
          >
            {/* Custom Architectural Masterplan SVG */}
            <svg
              viewBox="0 0 1000 620"
              className="w-full h-full block select-none"
              role="img"
              aria-label="Peta Site Plan Kawasan Township"
            >
              {/* Base Terrain */}
              <rect width="1000" height="620" fill="#eef2ed" />

              {/* Subtle Architectural Survey Grid */}
              <g stroke="#dce3db" strokeWidth="1">
                <line x1="200" y1="0" x2="200" y2="620" />
                <line x1="400" y1="0" x2="400" y2="620" />
                <line x1="600" y1="0" x2="600" y2="620" />
                <line x1="800" y1="0" x2="800" y2="620" />
                <line x1="0" y1="155" x2="1000" y2="155" />
                <line x1="0" y1="310" x2="1000" y2="310" />
                <line x1="0" y1="465" x2="1000" y2="465" />
              </g>

              {/* Cluster Kemang Verde Zone (Top-Left) */}
              <rect
                x="45"
                y="45"
                width="430"
                height="305"
                rx="18"
                fill="#e2ece2"
                stroke="#9bb89e"
                strokeWidth="2"
              />
              {/* Internal Roads Kemang Verde */}
              <path
                d="M70 215 H455 M245 75 V330 M375 75 V330"
                stroke="#ffffff"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Lot Outlines */}
              <g fill="#f7faf7" stroke="#c3d4c4" strokeWidth="1.2">
                <rect x="95" y="100" width="120" height="90" rx="6" />
                <rect x="275" y="95" width="75" height="95" rx="6" />
                <rect x="395" y="95" width="60" height="95" rx="6" />
                <rect x="95" y="240" width="120" height="85" rx="6" />
                <rect x="275" y="240" width="85" height="85" rx="6" />
              </g>
              <text
                x="68"
                y="74"
                fill="#1e3a24"
                fontSize="14"
                fontWeight="700"
                letterSpacing="1.2"
              >
                CLUSTER KEMANG VERDE
              </text>

              {/* Central Clubhouse & Retention Lake */}
              <rect
                x="490"
                y="55"
                width="105"
                height="295"
                rx="16"
                fill="#d8e7e9"
                stroke="#8bb8c0"
                strokeWidth="1.5"
              />
              <ellipse cx="542" cy="175" rx="34" ry="70" fill="#7fc0cb" opacity="0.7" />
              <rect
                x="512"
                y="265"
                width="60"
                height="52"
                rx="8"
                fill="#5D0C15"
              />
              <text
                x="542"
                y="289"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="9"
                fontWeight="700"
              >
                CLUB
              </text>
              <text
                x="542"
                y="302"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="600"
              >
                HOUSE
              </text>
              <text
                x="542"
                y="84"
                textAnchor="middle"
                fill="#164e63"
                fontSize="10"
                fontWeight="700"
              >
                DANAU &amp; TAMAN
              </text>

              {/* Cluster Senopati Pavilion Zone (Top-Right) */}
              <rect
                x="610"
                y="45"
                width="345"
                height="305"
                rx="18"
                fill="#f0ece3"
                stroke="#cbbba0"
                strokeWidth="2"
              />
              <path
                d="M635 210 H930 M765 75 V330"
                stroke="#ffffff"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <g fill="#fcfaf5" stroke="#d9cdb8" strokeWidth="1.2">
                <rect x="635" y="100" width="105" height="88" rx="6" />
                <rect x="795" y="100" width="120" height="88" rx="6" />
                <rect x="635" y="238" width="105" height="85" rx="6" />
                <rect x="795" y="238" width="120" height="85" rx="6" />
              </g>
              <text
                x="632"
                y="74"
                fill="#443825"
                fontSize="14"
                fontWeight="700"
                letterSpacing="1.2"
              >
                CLUSTER SENOPATI PAVILION
              </text>

              {/* Boulevard Utama Aksara Raya (Row 24m) */}
              <rect x="0" y="370" width="1000" height="58" fill="#334155" />
              <line
                x1="20"
                y1="399"
                x2="980"
                y2="399"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="14 10"
              />
              <text
                x="500"
                y="393"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="11"
                fontWeight="700"
                letterSpacing="2.5"
              >
                BOULEVARD UTAMA AKSARA RAYA (ROW 24M)
              </text>

              {/* Boulevard Komersial & Main Gate Zone (Bottom) */}
              <rect
                x="355"
                y="445"
                width="410"
                height="135"
                rx="16"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              <g fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2">
                <rect x="385" y="485" width="75" height="72" rx="6" />
                <rect x="475" y="485" width="90" height="72" rx="6" />
                <rect x="580" y="485" width="75" height="72" rx="6" />
                <rect x="670" y="485" width="75" height="72" rx="6" />
              </g>
              <text
                x="560"
                y="472"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="13"
                fontWeight="700"
                letterSpacing="1.1"
              >
                BOULEVARD KOMERSIAL AKSARA (RUKO)
              </text>

              {/* Main Gate & Toll Access Badge */}
              <rect
                x="45"
                y="455"
                width="275"
                height="115"
                rx="14"
                fill="#5D0C15"
              />
              <text
                x="68"
                y="490"
                fill="#fbbf24"
                fontSize="11"
                fontWeight="700"
                letterSpacing="1.4"
              >
                GERBANG UTAMA &amp; AKSES TOL
              </text>
              <text x="68" y="514" fill="#f8fafc" fontSize="13" fontWeight="600">
                ← 5 Menit ke Tol Parigi / JORR 2
              </text>
              <text x="68" y="538" fill="#cbd5e1" fontSize="11">
                Shuttle Bus Kawasan · Security One-Gate 24J
              </text>

              {/* Future Expansion / Green Park */}
              <rect
                x="790"
                y="455"
                width="165"
                height="115"
                rx="14"
                fill="#dce9dc"
                stroke="#9bb89e"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x="872"
                y="506"
                textAnchor="middle"
                fill="#1e3a24"
                fontSize="11"
                fontWeight="700"
              >
                BOTANICAL PARK
              </text>
              <text
                x="872"
                y="524"
                textAnchor="middle"
                fill="#36533b"
                fontSize="10"
              >
                Jogging Track 1,2 Km
              </text>
            </svg>

            {/* Compass Badge Overlay */}
            <div className="pointer-events-none absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
              <Compass className="w-3.5 h-3.5 text-[#8B1522]" />
              <span>UTARA ↑</span>
            </div>

            {/* Interactive Coordinate Pins */}
            {pins.map(({ property, coord, isMatched }) => {
              const isSelected = selectedPin?.property.id === property.id;
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedId(property.id)}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  aria-label={`Pilih koordinat ${coord.blockCode} — ${property.name} (${property.status})`}
                  className={`group -translate-x-1/2 -translate-y-1/2 absolute inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${getPinStyle(
                    property.status,
                    isSelected,
                    isMatched
                  )}`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-mono tracking-tight">{coord.blockCode}</span>
                  <span
                    className={`hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-black/15 text-current'
                    }`}
                  >
                    {formatCompactRupiah(property.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Unit Detail Panel */}
        <div className="lg:col-span-4 bg-white p-5 flex flex-col justify-between">
          {selectedPin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#6E1019] text-amber-300 font-mono text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Blok {selectedPin.coord.blockCode}</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${getStatusBadgeClass(
                    selectedPin.property.status
                  )}`}
                >
                  {selectedPin.property.status}
                </span>
              </div>

              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <SafeImage
                  src={selectedPin.property.imageUrl}
                  alt={selectedPin.property.name}
                  fallbackTitle={selectedPin.property.name}
                  fitMode="adaptive"
                  className="w-full h-full"
                />
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-0.5">
                  {selectedPin.property.cluster} · {selectedPin.property.type}
                </p>
                <h3 className="font-display text-lg font-bold text-slate-950 leading-snug">
                  {selectedPin.property.name}
                </h3>
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <p className="font-mono text-xl font-bold text-slate-950 tabular-nums">
                    {formatRupiah(selectedPin.property.price)}
                  </p>
                </div>
                <p className="text-xs font-medium text-[#8B1522] mt-0.5">
                  Cicilan mulai {selectedPin.property.installmentText}
                </p>
              </div>

              {selectedPin.property.promoTag && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-950">
                  {selectedPin.property.promoTag}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs text-slate-700 tabular-nums">
                <div className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {selectedPin.property.landArea}/{selectedPin.property.buildingArea}m²
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <BedDouble className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPin.property.bedrooms} KT</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Bath className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPin.property.bathrooms} KM</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onWhatsAppUnit(selectedPin.property)}
                  className="w-full h-10 px-4 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Tanya Blok {selectedPin.coord.blockCode} via WA</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(selectedPin.property)}
                    className="h-9 px-3 rounded-lg bg-[#8B1522] text-white text-xs font-semibold hover:bg-[#6E1019] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Detail &amp; Denah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSimulateKpr(selectedPin.property)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#8B1522]" />
                    <span>Simulasi KPR</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Pilih titik unit di peta kawasan untuk melihat detail properti.
            </div>
          )}

          {/* Quick Jump Chips Below Card */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">
              Pilih Cepat Kode Blok:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pins.map(({ property, coord, isMatched }) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedId(property.id)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                    selectedPin?.property.id === property.id
                      ? 'bg-[#6E1019] text-amber-300'
                      : isMatched
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {coord.blockCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
