import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CalendarCheck, Check, Copy, ExternalLink, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getBlogSlug } from '../../services/seoService';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { BlogPostItem, SiteSettings } from '../../types';
import { ArchitecturalReveal, InteractiveCardMotion } from '../common/MotionPrimitives';
import { SafeImage } from '../common/SafeImage';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface BlogSectionProps {
  settings: SiteSettings;
  activePost: BlogPostItem | null;
  onSelectPost: (post: BlogPostItem | null) => void;
  onConsultMarketing: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  settings,
  activePost,
  onSelectPost,
  onConsultMarketing,
}) => {
  const posts = settings.blogPosts || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedArticle, setCopiedArticle] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
    return ['Semua', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Semua') return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  if (!settings.blogEnabled || posts.length === 0) {
    return null;
  }

  return (
    <section id="berita" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ArchitecturalReveal className="text-center max-w-2xl mx-auto mb-8">
          <p className="font-editorial italic text-lg sm:text-xl text-[#A31C24]/75 leading-tight mb-0.5">
            {settings.blogEyebrow || 'Berita Kawasan & Panduan Properti'}
          </p>
          <h2 className="font-display text-2xl sm:text-[28px] font-bold text-slate-800 uppercase tracking-wide text-balance">
            {settings.blogTitle || 'PEMBARUAN PROYEK & INSIGHT KPR'}
          </h2>
          <div
            aria-hidden="true"
            className="w-12 h-[3px] bg-[#A31C24] mx-auto mt-2.5 mb-3 rounded-full"
          />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {settings.blogSubtitle ||
              'Informasi progres pembangunan infrastruktur, tips persiapan pengajuan KPR bank rekanan, serta analisis nilai investasi kawasan.'}
          </p>
        </ArchitecturalReveal>

        {/* Category Filter Bar */}
        {categories.length > 2 && (
          <div className="mb-7">
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
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
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredPosts.map((post, idx) => (
            <InteractiveCardMotion
              key={post.id}
              index={idx}
              className="group rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-shadow"
            >
              <article className="flex flex-col justify-between h-full">
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectPost(post)}
                    className="block w-full aspect-[16/10] bg-slate-100 overflow-hidden cursor-pointer"
                    aria-label={`Baca artikel ${post.title}`}
                  >
                    <SafeImage
                      src={post.imageUrl}
                      alt={post.title}
                      fallbackTitle={post.title}
                      fitMode="adaptive"
                      className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#8B1522]">{post.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{post.publishedAt}</span>
                      {post.readTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{post.readTime}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-950 leading-snug group-hover:text-[#8B1522] transition-colors">
                      <button
                        type="button"
                        onClick={() => onSelectPost(post)}
                        className="text-left cursor-pointer"
                      >
                        {post.title}
                      </button>
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-3 flex items-center justify-between gap-3 border-t border-slate-100 mt-auto">
                  <span className="text-xs text-slate-500 truncate">{post.author}</span>
                  <button
                    type="button"
                    onClick={() => onSelectPost(post)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1522] hover:text-[#6E1019] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </article>
            </InteractiveCardMotion>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      <AnimatePresence>
        {activePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={activePost.title}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                  <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-semibold text-amber-800 truncate">
                    {activePost.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums shrink-0">{activePost.publishedAt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPost(null)}
                  aria-label="Tutup artikel"
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5">
                {activePost.imageUrl && (
                  <div className="rounded-xl overflow-hidden aspect-[16/9] bg-slate-100 border border-slate-200">
                    <SafeImage
                      src={activePost.imageUrl}
                      alt={activePost.title}
                      fitMode="adaptive"
                      className="w-full h-full"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-950 leading-tight text-balance">
                    {activePost.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ditulis oleh <strong className="text-slate-800">{activePost.author}</strong>
                    {activePost.readTime ? ` · ${activePost.readTime}` : ''}
                  </p>
                </div>

                <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                  {activePost.content || activePost.excerpt}
                </div>

                {settings.enableSocialShare !== false && (
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Bagikan Artikel:</span>
                    {(() => {
                      const originUrl =
                        typeof window !== 'undefined'
                          ? `${window.location.origin}${window.location.pathname}`
                          : 'https://aksararaya.id/';
                      const articleUrl = `${originUrl}#/artikel/${getBlogSlug(activePost)}`;
                      const waUrl = `https://wa.me/?text=${encodeURIComponent(
                        `${activePost.title} — ${settings.developerName}\nBaca selengkapnya: ${articleUrl}`
                      )}`;
                      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        articleUrl
                      )}`;
                      const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        activePost.title
                      )}&url=${encodeURIComponent(articleUrl)}`;

                      return (
                        <>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1DB954] text-white text-xs font-semibold hover:bg-[#169C46]"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[#1877F2] text-white text-xs font-semibold hover:brightness-110"
                          >
                            <span>Facebook</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                          >
                            <span>X / Twitter</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(articleUrl).catch(() => {});
                              setCopiedArticle(true);
                              window.setTimeout(() => setCopiedArticle(false), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                          >
                            {copiedArticle ? (
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
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {(settings.contactFormEnabled !== false || settings.whatsappCtaEnabled !== false) && (
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-600">
                    Ingin berdiskusi langsung mengenai kawasan atau promo unit terbaru?
                  </p>
                  {settings.contactFormEnabled !== false ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPost(null);
                        onConsultMarketing();
                      }}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8B1522] text-white text-xs font-bold hover:bg-[#6E1019] transition-colors cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 text-amber-300" />
                      <span>Konsultasi & Jadwal Survey</span>
                    </button>
                  ) : (
                    <a
                      href={buildDirectWhatsappHref(settings)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      <span>Chat Marketing via WA</span>
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
