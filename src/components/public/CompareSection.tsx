import React from 'react';
import { GitCompareArrows, Plus, Trash2, X } from 'lucide-react';
import { buildDirectWhatsappHref, formatCompactRupiah, formatRupiah } from '../../services/storageService';
import { Property, SiteSettings } from '../../types';
import { ArchitecturalReveal } from '../common/MotionPrimitives';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface CompareSectionProps {
  allProperties: Property[];
  compareIds: string[];
  settings?: SiteSettings;
  eyebrow?: string;
  title?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  onToggleCompare: (id: string) => void;
  onClearCompare: () => void;
  onOpenDetail: (property: Property) => void;
  onConsultUnit: (property: Property) => void;
}

export const CompareSection: React.FC<CompareSectionProps> = ({
  allProperties,
  compareIds,
  settings,
  eyebrow,
  title,
  emptyTitle,
  emptySubtitle,
  onToggleCompare,
  onClearCompare,
  onOpenDetail,
  onConsultUnit,
}) => {
  const showContactForm = settings ? settings.contactFormEnabled !== false : true;
  const showWhatsapp = settings ? settings.whatsappCtaEnabled !== false : true;
  const comparedProperties = compareIds
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p));

  const availableToAdd = allProperties.filter((p) => !compareIds.includes(p.id));

  const rows: {
    label: string;
    render: (p: Property) => React.ReactNode;
  }[] = [
    {
      label: 'Harga Tunai',
      render: (p) => (
        <span className="font-mono font-semibold text-slate-950 tabular-nums">
          {formatRupiah(p.price)}
        </span>
      ),
    },
    {
      label: 'Estimasi Cicilan',
      render: (p) => <span className="tabular-nums text-slate-700">{p.installmentText}</span>,
    },
    {
      label: 'Cluster',
      render: (p) => <span className="text-slate-700">{p.cluster}</span>,
    },
    {
      label: 'Tipe Properti',
      render: (p) => <span className="font-medium text-slate-900">{p.type}</span>,
    },
    {
      label: 'Status Unit',
      render: (p) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
            p.status === 'Promo'
              ? 'bg-amber-100 text-amber-900'
              : p.status === 'Available'
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      label: 'Luas Tanah (LT)',
      render: (p) => <span className="font-mono tabular-nums">{p.landArea} m²</span>,
    },
    {
      label: 'Luas Bangunan (LB)',
      render: (p) => (
        <span className="font-mono tabular-nums">
          {p.buildingArea > 0 ? `${p.buildingArea} m²` : 'Tanah Kavling'}
        </span>
      ),
    },
    {
      label: 'Kamar Tidur',
      render: (p) => (
        <span className="font-mono tabular-nums">
          {p.bedrooms > 0 ? `${p.bedrooms} Kamar` : '-'}
        </span>
      ),
    },
    {
      label: 'Kamar Mandi',
      render: (p) => (
        <span className="font-mono tabular-nums">
          {p.bathrooms > 0 ? `${p.bathrooms} Kamar` : '-'}
        </span>
      ),
    },
    {
      label: 'Kapasitas Carport',
      render: (p) => (
        <span className="font-mono tabular-nums">
          {p.carports > 0 ? `${p.carports} Mobil` : '-'}
        </span>
      ),
    },
  ];

  return (
    <section id="bandingkan" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArchitecturalReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-editorial italic text-lg text-[#A31C24]/75 leading-tight mb-0.5">
              {eyebrow || 'Evaluasi Spesifikasi'}
            </p>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-slate-800 uppercase tracking-wide">
              {title || 'BANDINGKAN HINGGA 3 UNIT'}
            </h2>
            <div aria-hidden="true" className="w-12 h-[3px] bg-[#A31C24] mt-2 rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {compareIds.length < 3 && availableToAdd.length > 0 && (
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) onToggleCompare(e.target.value);
                  }}
                  aria-label="Tambah unit untuk dibandingkan"
                  className="h-10 pl-3.5 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer"
                >
                  <option value="">+ Tambah Unit ({compareIds.length}/3)</option>
                  {availableToAdd.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatCompactRupiah(item.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {compareIds.length > 0 && (
              <button
                type="button"
                onClick={onClearCompare}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Pilihan</span>
              </button>
            )}
          </div>
        </div>

        {comparedProperties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center">
            <GitCompareArrows className="w-8 h-8 text-slate-400 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="font-display text-base font-semibold text-slate-900 mb-1">
              {emptyTitle || 'Belum ada unit dipilih untuk perbandingan'}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
              {emptySubtitle ||
                'Klik tombol “Bandingkan” pada kartu unit di katalog atau pilih unit langsung dari menu di bawah.'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allProperties.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleCompare(item.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="w-48 p-4 text-xs font-semibold text-slate-500 align-bottom">
                    Parameter Perbandingan
                  </th>
                  {comparedProperties.map((unit) => (
                    <th key={unit.id} className="p-4 align-top min-w-[210px]">
                      <div className="relative rounded-lg overflow-hidden aspect-[16/10] mb-3 bg-slate-100">
                        <SafeImage
                          src={unit.imageUrl}
                          alt={unit.name}
                          fallbackTitle={unit.name}
                          fitMode="adaptive"
                          className="w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => onToggleCompare(unit.id)}
                          aria-label={`Keluarkan ${unit.name} dari perbandingan`}
                          className="absolute top-2 right-2 w-7 h-7 rounded-md bg-slate-950/75 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenDetail(unit)}
                        className="font-display text-sm font-bold text-slate-950 hover:text-amber-700 text-left transition-colors cursor-pointer"
                      >
                        {unit.name}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 text-xs font-semibold text-slate-500">{row.label}</td>
                    {comparedProperties.map((unit) => (
                      <td key={unit.id} className="p-4">
                        {row.render(unit)}
                      </td>
                    ))}
                  </tr>
                ))}
                {(showContactForm || showWhatsapp) && (
                  <tr>
                    <td className="p-4 text-xs font-semibold text-slate-500">Langkah Berikutnya</td>
                    {comparedProperties.map((unit) => (
                      <td key={unit.id} className="p-4">
                        <div className="flex items-center gap-2">
                          {showContactForm && (
                            <button
                              type="button"
                              onClick={() => onConsultUnit(unit)}
                              className="flex-1 h-9 px-3 rounded-lg bg-[#8B1522] text-white text-xs font-semibold hover:bg-[#6E1019] transition-colors whitespace-nowrap cursor-pointer"
                            >
                              Jadwal Survey Unit
                            </button>
                          )}
                          {showWhatsapp &&
                            (showContactForm ? (
                              <button
                                type="button"
                                onClick={() => onConsultUnit(unit)}
                                title={`Tanya ${unit.name} via WhatsApp`}
                                aria-label={`Tanya ${unit.name} via WhatsApp`}
                                className="w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
                              >
                                <WhatsAppIcon className="w-4 h-4" />
                              </button>
                            ) : settings ? (
                              <a
                                href={buildDirectWhatsappHref(settings, unit)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 h-9 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-semibold"
                              >
                                <WhatsAppIcon className="w-4 h-4" />
                                <span>Tanya via WhatsApp</span>
                              </a>
                            ) : null)}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        </ArchitecturalReveal>
      </div>
    </section>
  );
};
