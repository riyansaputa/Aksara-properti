import React, { useMemo, useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { SiteSettings } from '../../types';
import { ArchitecturalReveal } from '../common/MotionPrimitives';

interface FAQSectionProps {
  settings: SiteSettings;
  onConsultMarketing: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ settings, onConsultMarketing }) => {
  const items = settings.faqItems || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [openId, setOpenId] = useState<string | null>(() => items[0]?.id ?? null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    return ['Semua', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Semua') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  if (!settings.faqEnabled || items.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <ArchitecturalReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Sticky Summary Column */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#8B1522] mb-1.5">
                {settings.faqEyebrow || 'Informasi Pembelian & Kepemilikan'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
                {settings.faqTitle || 'Pertanyaan yang Sering Diajukan'}
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {settings.faqSubtitle ||
                'Jawaban lengkap seputar legalitas sertifikat kepemilikan properti, ketentuan pembayaran KPR maupun cash bertahap, serta keunggulan lokasi kawasan.'}
            </p>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6E1019] to-[#4A0910] text-white border border-amber-400/25 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Konsultasi Legalitas & Skema Bayar</span>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                Butuh simulasi rincian biaya akad, cek ketersediaan blok tertentu, atau jadwal survei pribadi?
              </p>
              {settings.contactFormEnabled !== false ? (
                <button
                  type="button"
                  onClick={onConsultMarketing}
                  className="w-full h-10 px-4 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{settings.faqCtaText || 'Masih Ada Pertanyaan? Tanya Marketing via WA'}</span>
                </button>
              ) : settings.whatsappCtaEnabled !== false ? (
                <a
                  href={buildDirectWhatsappHref(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-10 px-4 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{settings.faqCtaText || 'Masih Ada Pertanyaan? Tanya Marketing via WA'}</span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Right Filter Tabs + Accordion Questions */}
          <div className="lg:col-span-8 space-y-5">
            {categories.length > 2 && (
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        const firstInCat =
                          cat === 'Semua'
                            ? items[0]?.id
                            : items.find((i) => i.category === cat)?.id;
                        if (firstInCat) setOpenId(firstInCat);
                      }}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#8B1522] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-[#8B1522]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
              {filteredItems.map((item, idx) => {
                const isOpen = openId === item.id;
                return (
                  <div key={item.id} className="transition-colors">
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      aria-expanded={isOpen}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#8B1522]">
                          <span className="font-mono tabular-nums text-slate-400 mr-2">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span>{item.category}</span>
                        </p>
                        <h3 className="font-display text-sm sm:text-base font-bold text-slate-950 leading-snug">
                          {item.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 mt-1 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#8B1522]' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 pt-0 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ArchitecturalReveal>
    </section>
  );
};
