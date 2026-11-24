import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ExternalLink, MessageCircle, Sparkles, X } from 'lucide-react';
import {
  buildAutoReplyMessage,
  buildWhatsAppUrl,
  formatRupiah,
  KprCalculation,
} from '../../services/storageService';
import { LeadSource, Property, SiteSettings } from '../../types';

export interface LeadModalContext {
  source: LeadSource;
  property: Property | null;
  kprCalculation?: KprCalculation | null;
  customPromoLabel?: string;
}

interface LeadCaptureModalProps {
  context: LeadModalContext | null;
  properties: Property[];
  settings: SiteSettings;
  onClose: () => void;
  onSubmitLead: (payload: {
    name: string;
    phone: string;
    propertyId?: string;
    propertyName: string;
    cluster: string;
    source: LeadSource;
    kprSummary?: string;
  }) => Promise<void>;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  context,
  properties,
  settings,
  onClose,
  onSubmitLead,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedWaUrl, setSubmittedWaUrl] = useState<string | null>(null);
  const [autoReplyPreview, setAutoReplyPreview] = useState<string | null>(null);

  useEffect(() => {
    if (context) {
      setSelectedPropertyId(context.property?.id ?? '');
      setSubmittedWaUrl(null);
      setAutoReplyPreview(null);
      setError('');
    }
  }, [context]);

  useEffect(() => {
    if (!context) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [context, onClose]);

  const selectedProperty = context
    ? properties.find((p) => p.id === selectedPropertyId) ?? context.property ?? null
    : null;

  const modalTitle = !context
    ? ''
    : context.source === 'Simulasi KPR'
    ? 'Kirim Rincian Simulasi KPR ke WhatsApp'
    : context.source === 'Jadwal Survey'
    ? 'Jadwalkan Kunjungan & Survey Lokasi'
    : context.source === 'Minta Brosur'
    ? 'Dapatkan E-Brosur & Pricelist Resmi'
    : context.source === 'Detail Unit' && selectedProperty
    ? `Tanya Unit ${selectedProperty.name}`
    : context.customPromoLabel
    ? `Klaim Promo: ${context.customPromoLabel}`
    : 'Konsultasi Langsung dengan Marketing';

  const directPropertyWaUrl = selectedProperty
    ? buildWhatsAppUrl(
        settings.whatsappNumber,
        [
          `Halo tim marketing *${settings.developerName}* (${settings.projectName}),`,
          `Saya tertarik dengan unit *${selectedProperty.name}* (${selectedProperty.cluster} · Harga ${formatRupiah(selectedProperty.price)}).`,
          `Mohon informasi ketersediaan unit, rincian promo, dan skema pembayarannya.`,
        ].join('\n')
      )
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;
    setError('');

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    if (cleanName.length < 2) {
      setError('Mohon masukkan nama lengkap Anda.');
      return;
    }
    if (cleanPhone.length < 9) {
      setError('Mohon masukkan nomor WhatsApp yang valid (contoh: 081234567890).');
      return;
    }

    const propertyName = selectedProperty
      ? selectedProperty.name
      : context.customPromoLabel
      ? `Promo: ${context.customPromoLabel}`
      : 'Konsultasi Umum Kawasan';
    const cluster = selectedProperty ? selectedProperty.cluster : settings.projectName;

    let kprSummaryText: string | undefined;
    if (context.kprCalculation) {
      const c = context.kprCalculation;
      kprSummaryText = `Harga ${formatRupiah(c.propertyPrice)} · DP ${c.downPaymentPercent}% (${formatRupiah(c.downPaymentAmount)}) · Tenor ${c.tenorYears} Thn · Bunga ${c.annualInterestRate}% · Estimasi ${formatRupiah(c.monthlyInstallment)}/bln`;
    }

    setIsSubmitting(true);
    try {
      await onSubmitLead({
        name: cleanName,
        phone: cleanPhone,
        propertyId: selectedProperty?.id,
        propertyName,
        cluster,
        source: context.source,
        kprSummary: kprSummaryText,
      });

      const lines = [
        `Halo tim marketing *${settings.developerName}* (${settings.projectName}),`,
        `Saya *${cleanName}* (${cleanPhone}) ingin melakukan *${context.source}*.`,
        selectedProperty
          ? `Unit yang diminati: *${propertyName}* (${cluster} · ${formatRupiah(selectedProperty.price)}).`
          : context.customPromoLabel
          ? `Program promo yang diminati: *${context.customPromoLabel}* (${cluster}).`
          : `Unit yang diminati: *${propertyName}* (${cluster}).`,
      ];

      if (context.kprCalculation) {
        const c = context.kprCalculation;
        lines.push('');
        lines.push('*Rincian Simulasi KPR:*');
        lines.push(`• Harga Unit: ${formatRupiah(c.propertyPrice)}`);
        lines.push(`• Uang Muka (${c.downPaymentPercent}%): ${formatRupiah(c.downPaymentAmount)}`);
        lines.push(`• Plafon KPR: ${formatRupiah(c.loanPrincipal)}`);
        lines.push(`• Tenor & Bunga: ${c.tenorYears} Tahun (${c.annualInterestRate}%/thn)`);
        lines.push(`• Estimasi Cicilan: *${formatRupiah(c.monthlyInstallment)}/bulan*`);
      }

      if (note.trim()) {
        lines.push('');
        lines.push(`Catatan: ${note.trim()}`);
      }

      const waUrl = buildWhatsAppUrl(settings.whatsappNumber, lines.join('\n'));
      setSubmittedWaUrl(waUrl);

      if (settings.autoReplyEnabled) {
        const replyText = buildAutoReplyMessage(settings, {
          name: cleanName,
          propertyName,
          cluster,
          source: context.source,
        });
        setAutoReplyPreview(replyText);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {context && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl"
          >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#8B1522]">{settings.projectName}</p>
            <h2 className="font-display text-lg font-bold text-slate-950">{modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedWaUrl ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-950 mb-1">
                Data Anda Berhasil Tercatat
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Terima kasih, <strong>{name}</strong>. Permintaan Anda telah masuk ke tim{' '}
                {settings.marketingName}. Klik tombol di bawah untuk langsung terhubung via WhatsApp.
              </p>
            </div>

            {autoReplyPreview && (
              <div className="text-left p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Reply WhatsApp Resmi
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700">{phone}</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {autoReplyPreview}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={submittedWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 px-5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Lanjutkan ke WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {context.kprCalculation && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#6E1019] to-[#3B070D] text-white text-xs space-y-1">
                <p className="text-amber-300 font-semibold">Ringkasan Simulasi KPR Anda</p>
                <p className="font-mono text-sm font-bold tabular-nums">
                  {formatRupiah(context.kprCalculation.monthlyInstallment)}/bln
                </p>
                <p className="text-slate-300 tabular-nums">
                  DP {context.kprCalculation.downPaymentPercent}% · Tenor{' '}
                  {context.kprCalculation.tenorYears} Thn · Bunga{' '}
                  {context.kprCalculation.annualInterestRate}%
                </p>
              </div>
            )}

            <div>
              <label htmlFor="lead-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap <span className="text-rose-600">*</span>
              </label>
              <input
                id="lead-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Andi Wijaya"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1522]"
              />
            </div>

            <div>
              <label htmlFor="lead-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-600">*</span>
              </label>
              <input
                id="lead-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1522]"
              />
            </div>

            <div>
              <label htmlFor="lead-unit" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit yang Diminati
              </label>
              <select
                id="lead-unit"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1522] cursor-pointer"
              >
                <option value="">Konsultasi Umum Kawasan</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.cluster})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-note" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rencana Hari Survey / Pertanyaan (Opsional)
              </label>
              <textarea
                id="lead-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Rencana survey hari Sabtu pukul 10.00 WIB"
                className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B1522]"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 px-5 rounded-xl bg-[#8B1522] text-white text-sm font-bold hover:bg-[#6E1019] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <MessageCircle className="w-4 h-4 text-amber-300" />
              <span>{isSubmitting ? 'Menyimpan Data...' : 'Simpan & Buka WhatsApp'}</span>
            </button>

            {directPropertyWaUrl && (
              <div className="pt-1 text-center">
                <a
                  href={directPropertyWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                >
                  <span>Atau langsung chat WhatsApp tentang unit ini tanpa isi form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </form>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
