import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Landmark, MessageCircle, RotateCcw } from 'lucide-react';
import {
  buildDirectWhatsappHref,
  calculateKPR,
  formatCompactRupiah,
  formatRupiah,
  KprCalculation,
} from '../../services/storageService';
import { BankPartnerItem, Property, SiteSettings } from '../../types';
import { ArchitecturalReveal } from '../common/MotionPrimitives';

interface KprCalculatorProps {
  properties: Property[];
  settings?: SiteSettings;
  defaultInterestRate: number;
  selectedPropertyForKpr: Property | null;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  disclaimerText?: string;
  bankPartnersEnabled?: boolean;
  bankPartnersTitle?: string;
  bankPartners?: BankPartnerItem[];
  onSelectPropertyForKpr: (property: Property | null) => void;
  onSendSimulationToWa: (calc: KprCalculation, property: Property | null) => void;
}

export const KprCalculator: React.FC<KprCalculatorProps> = ({
  properties,
  settings,
  defaultInterestRate,
  selectedPropertyForKpr,
  eyebrow,
  title,
  subtitle,
  ctaText,
  disclaimerText,
  bankPartnersEnabled = true,
  bankPartnersTitle,
  bankPartners = [],
  onSelectPropertyForKpr,
  onSendSimulationToWa,
}) => {
  const showContactForm = settings ? settings.contactFormEnabled !== false : true;
  const showWhatsapp = settings ? settings.whatsappCtaEnabled !== false : true;
  const [price, setPrice] = useState<number>(2450000000);
  const [dpPercent, setDpPercent] = useState<number>(20);
  const [tenorYears, setTenorYears] = useState<number>(15);
  const [interestRate, setInterestRate] = useState<number>(defaultInterestRate);

  useEffect(() => {
    setInterestRate(defaultInterestRate);
  }, [defaultInterestRate]);

  useEffect(() => {
    if (selectedPropertyForKpr) {
      setPrice(selectedPropertyForKpr.price);
    }
  }, [selectedPropertyForKpr]);

  const calculation = useMemo(
    () => calculateKPR(price, dpPercent, tenorYears, interestRate),
    [price, dpPercent, tenorYears, interestRate]
  );

  const handlePropertyDropdown = (propertyId: string) => {
    if (!propertyId) {
      onSelectPropertyForKpr(null);
      return;
    }
    const found = properties.find((p) => p.id === propertyId) || null;
    onSelectPropertyForKpr(found);
    if (found) setPrice(found.price);
  };

  const handleReset = () => {
    onSelectPropertyForKpr(null);
    setPrice(2450000000);
    setDpPercent(20);
    setTenorYears(15);
    setInterestRate(defaultInterestRate);
  };

  return (
    <section id="kpr" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArchitecturalReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="font-editorial italic text-lg sm:text-xl text-[#A31C24]/75 leading-tight mb-0.5">
              {eyebrow || 'Perencanaan Pembiayaan'}
            </p>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold text-slate-800 uppercase tracking-wide">
              {title || 'KALKULATOR SIMULASI KPR'}
            </h2>
            <div
              aria-hidden="true"
              className="w-12 h-[3px] bg-[#A31C24] mx-auto mt-2.5 mb-3 rounded-full"
            />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle ||
                'Atur harga unit, persentase uang muka (DP), tenor cicilan, serta suku bunga acuan untuk melihat estimasi angsuran bulanan secara langsung.'}
            </p>
          </div>
        </ArchitecturalReveal>

        <ArchitecturalReveal delay={0.05}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Panel: Interactive Controls */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="flex-1 min-w-[220px]">
                <label
                  htmlFor="kpr-unit-select"
                  className="block text-xs font-semibold text-slate-500 mb-1.5"
                >
                  Pilih Unit Katalog (Opsional)
                </label>
                <select
                  id="kpr-unit-select"
                  value={selectedPropertyForKpr?.id ?? ''}
                  onChange={(e) => handlePropertyDropdown(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer"
                >
                  <option value="">Harga Kustom / Bebas</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCompactRupiah(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors cursor-pointer self-end"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Slider 1: Harga Properti */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="slider-price" className="text-sm font-semibold text-slate-800">
                  Harga Properti
                </label>
                <span className="font-mono text-base sm:text-lg font-bold text-slate-950 tabular-nums">
                  {formatRupiah(price)}
                </span>
              </div>
              <input
                id="slider-price"
                type="range"
                min={500000000}
                max={10000000000}
                step={50000000}
                value={price}
                onChange={(e) => {
                  onSelectPropertyForKpr(null);
                  setPrice(Number(e.target.value));
                }}
                className="w-full aksara-slider cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                <span>Rp 500 Jt</span>
                <span>Rp 5 M</span>
                <span>Rp 10 M</span>
              </div>
            </div>

            {/* Slider 2: Uang Muka (DP) */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="slider-dp" className="text-sm font-semibold text-slate-800">
                  Uang Muka / DP ({dpPercent}%)
                </label>
                <span className="font-mono text-base font-bold text-slate-950 tabular-nums">
                  {formatRupiah(calculation.downPaymentAmount)}
                </span>
              </div>
              <input
                id="slider-dp"
                type="range"
                min={5}
                max={60}
                step={5}
                value={dpPercent}
                onChange={(e) => setDpPercent(Number(e.target.value))}
                className="w-full aksara-slider cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                <span>5%</span>
                <span>30%</span>
                <span>60%</span>
              </div>
            </div>

            {/* Slider 3 & 4: Tenor & Suku Bunga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label htmlFor="slider-tenor" className="text-sm font-semibold text-slate-800">
                    Tenor Pinjaman
                  </label>
                  <span className="font-mono text-base font-bold text-slate-950 tabular-nums">
                    {tenorYears} Tahun
                  </span>
                </div>
                <input
                  id="slider-tenor"
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={tenorYears}
                  onChange={(e) => setTenorYears(Number(e.target.value))}
                  className="w-full aksara-slider cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                  <span>5 Thn</span>
                  <span>15 Thn</span>
                  <span>25 Thn</span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label htmlFor="slider-rate" className="text-sm font-semibold text-slate-800">
                    Suku Bunga / Thn
                  </label>
                  <span className="font-mono text-base font-bold text-slate-950 tabular-nums">
                    {interestRate.toFixed(2)}%
                  </span>
                </div>
                <input
                  id="slider-rate"
                  type="range"
                  min={3.5}
                  max={12.0}
                  step={0.25}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full aksara-slider cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                  <span>3.5%</span>
                  <span>7.5%</span>
                  <span>12.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Real-Time Calculation Result */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#5D0C15] via-[#3E080E] to-[#1D0407] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-[#8B1522]/40">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-3">
                <Calculator className="w-4 h-4" />
                <span>Estimasi Angsuran Per Bulan</span>
              </div>

              <p className="font-mono text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums mb-1.5">
                {formatRupiah(calculation.monthlyInstallment)}
                <span className="text-sm font-sans font-normal text-slate-400"> /bulan</span>
              </p>
              <p className="text-xs text-slate-400 mb-6">
                {selectedPropertyForKpr
                  ? `Unit: ${selectedPropertyForKpr.name} · Tenor ${tenorYears} tahun`
                  : `Simulasi harga ${formatCompactRupiah(price)} · Tenor ${tenorYears} tahun`}
              </p>

              {/* Breakdown Metrics */}
              <div className="space-y-3.5 py-5 border-y border-white/10 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Plafon Pinjaman KPR</span>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    {formatRupiah(calculation.loanPrincipal)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Total Uang Muka ({dpPercent}%)</span>
                  <span className="font-mono font-semibold text-amber-300 tabular-nums">
                    {formatRupiah(calculation.downPaymentAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Estimasi Total Bunga</span>
                  <span className="font-mono font-semibold text-slate-200 tabular-nums">
                    {formatRupiah(calculation.totalInterest)}
                  </span>
                </div>
              </div>

              {/* Principal vs Interest Stacked Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300">Komposisi Pokok vs Bunga</span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {calculation.principalRatioPercent}% Pokok · {calculation.interestRatioPercent}%
                    Bunga
                  </span>
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden bg-slate-800 flex">
                  <div
                    style={{ width: `${calculation.principalRatioPercent}%` }}
                    className="h-full bg-amber-400 transition-all duration-300"
                    title={`Pokok Pinjaman: ${calculation.principalRatioPercent}%`}
                  />
                  <div
                    style={{ width: `${calculation.interestRatioPercent}%` }}
                    className="h-full bg-sky-500 transition-all duration-300"
                    title={`Total Bunga: ${calculation.interestRatioPercent}%`}
                  />
                </div>
                <div className="flex items-center gap-5 text-[11px] text-slate-400 mt-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
                    Pokok Pinjaman
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" />
                    Bunga ({tenorYears} Thn)
                  </span>
                </div>
              </div>
            </div>

            {(showContactForm || showWhatsapp) && (
              <div className="mt-8 pt-6 border-t border-white/10">
                {showContactForm ? (
                  <button
                    type="button"
                    onClick={() => onSendSimulationToWa(calculation, selectedPropertyForKpr)}
                    className="w-full h-12 px-5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{ctaText || 'Kirim Simulasi ke WhatsApp'}</span>
                  </button>
                ) : settings ? (
                  <a
                    href={buildDirectWhatsappHref(settings, selectedPropertyForKpr || undefined)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-12 px-5 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{ctaText || 'Kirim Simulasi ke WhatsApp'}</span>
                  </a>
                ) : null}
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  {disclaimerText ||
                    'Perhitungan bersifat estimasi. Konsultasikan promo suku bunga bank rekanan dengan tim marketing kami.'}
                </p>
              </div>
            )}
          </div>
          </div>
        </ArchitecturalReveal>

        {/* Partners Bank KPR Strip */}
        {bankPartnersEnabled && bankPartners.length > 0 && (
          <ArchitecturalReveal delay={0.08}>
            <div className="mt-10 rounded-2xl bg-white border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#A31C24]/10 text-[#A31C24] flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {bankPartnersTitle || 'Bank Rekanan KPR Resmi'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Didukung bank nasional dengan suku bunga promo &amp; proses persetujuan cepat
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {bankPartners.map((bank) => (
                  <div
                    key={bank.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-1.5"
                  >
                    <p
                      style={{ color: bank.accentColor || '#0f172a' }}
                      className="font-display text-sm font-extrabold tracking-tight"
                    >
                      {bank.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-900">{bank.rateText}</p>
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{bank.dpMinText}</span>
                      <span>{bank.maxTenorText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ArchitecturalReveal>
        )}
      </div>
    </section>
  );
};
