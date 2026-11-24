import React from 'react';
import { Quote, Star } from 'lucide-react';
import { SiteSettings } from '../../types';
import { ArchitecturalReveal, InteractiveCardMotion } from '../common/MotionPrimitives';
import { SafeImage } from '../common/SafeImage';

interface TestimonialSectionProps {
  settings: SiteSettings;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'AR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ settings }) => {
  const items = settings.testimonials || [];

  if (!settings.testimonialsEnabled || items.length === 0) {
    return null;
  }

  return (
    <section id="testimoni" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArchitecturalReveal className="text-center max-w-2xl mx-auto mb-10">
          <p className="font-editorial italic text-lg sm:text-xl text-[#A31C24]/75 leading-tight mb-0.5">
            {settings.testimonialsEyebrow || 'Pengalaman Nyata Penghuni'}
          </p>
          <h2 className="font-display text-2xl sm:text-[28px] font-bold text-slate-800 uppercase tracking-wide text-balance">
            {settings.testimonialsTitle || 'DIPERCAYA KELUARGA & INVESTOR'}
          </h2>
          <div
            aria-hidden="true"
            className="w-12 h-[3px] bg-[#A31C24] mx-auto mt-2.5 mb-3 rounded-full"
          />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {settings.testimonialsSubtitle ||
              'Simak pengalaman langsung pembeli sejak proses pemilihan unit, pengajuan KPR, hingga serah terima kunci dan kenyamanan tinggal di kawasan.'}
          </p>
        </ArchitecturalReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const safeRating = Math.min(5, Math.max(1, Math.round(item.rating || 5)));
            return (
              <InteractiveCardMotion
                key={item.id}
                index={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-5 hover:border-slate-300 hover:shadow-md transition-shadow"
              >
                <article className="flex flex-col justify-between gap-5 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center gap-0.5 text-amber-500"
                        aria-label={`Rating ${safeRating} dari 5 bintang`}
                      >
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-4 h-4 ${
                              starIdx < safeRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <Quote className="w-5 h-5 text-slate-300 shrink-0" />
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {item.outcome && (
                      <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-lg px-3 py-2">
                        {item.outcome}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <SafeImage
                            src={item.avatarUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#8B1522] text-amber-200 font-display text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(item.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-950 truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{item.role}</p>
                        <p className="text-[11px] font-medium text-[#8B1522] truncate mt-0.5">
                          {item.unitPurchased}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </InteractiveCardMotion>
            );
          })}
        </div>
      </div>
    </section>
  );
};
