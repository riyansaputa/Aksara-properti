import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { buildDirectWhatsappHref } from '../../services/storageService';
import { Property, SiteSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface AiPropertyChatbotProps {
  settings: SiteSettings;
  properties: Property[];
  onOpenWhatsApp: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AiPropertyChatbot: React.FC<AiPropertyChatbotProps> = ({
  settings,
  properties,
  onOpenWhatsApp,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedPromptText, setFailedPromptText] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text:
        settings.chatbotWelcomeMessage?.trim() ||
        `Halo! Saya ${settings.chatbotName || 'Asisten Properti AI'} resmi untuk ${settings.developerName}. Ada yang bisa saya bantu seputar unit, harga, promo, atau simulasi KPR?`,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'model',
            text:
              settings.chatbotWelcomeMessage?.trim() ||
              `Halo! Saya ${settings.chatbotName || 'Asisten Properti AI'} resmi untuk ${settings.developerName}.`,
          },
        ];
      }
      return prev;
    });
  }, [settings.chatbotWelcomeMessage, settings.chatbotName, settings.developerName]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  if (!settings.chatbotEnabled) {
    return null;
  }

  const botName = settings.chatbotName?.trim() || 'Asisten Properti AI';
  const botSubtitle = settings.chatbotSubtitle?.trim() || 'Online 24 Jam · Jawaban Real-Time';
  const suggestedQuestions = (settings.chatbotSuggestedQuestions || []).filter((q) => q.trim());

  const handleResetChat = () => {
    setErrorMessage(null);
    setFailedPromptText(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text:
          settings.chatbotWelcomeMessage?.trim() ||
          `Halo! Saya ${botName}. Silakan tanyakan detail unit, harga, promo, atau KPR.`,
      },
    ]);
  };

  const sendMessage = async (rawText: string, options?: { isRetry?: boolean }) => {
    const trimmed = rawText.trim();
    if (!trimmed || isLoading) return;

    let nextHistory = messages;
    if (!options?.isRetry) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      nextHistory = [...messages, userMessage];
      setMessages(nextHistory);
      setInput('');
    }

    setErrorMessage(null);
    setFailedPromptText(null);
    setIsLoading(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          siteContext: {
            settings: {
              developerName: settings.developerName,
              projectName: settings.projectName,
              officeAddress: settings.officeAddress,
              officeEmail: settings.officeEmail,
              whatsappNumber: settings.whatsappNumber,
              marketingName: settings.marketingName,
              defaultInterestRate: settings.defaultInterestRate,
              promoBannerText: settings.promoBannerText,
              topPromoBannerTitle: settings.topPromoBannerTitle,
              chatbotName: botName,
              chatbotSystemInstruction: settings.chatbotSystemInstruction,
              faqItems: settings.faqItems,
            },
            properties: properties.map((p) => ({
              name: p.name,
              cluster: p.cluster,
              type: p.type,
              price: p.price,
              installmentText: p.installmentText,
              landArea: p.landArea,
              buildingArea: p.buildingArea,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              carports: p.carports,
              status: p.status,
              promoTag: p.promoTag,
              nearbyAccess: p.nearbyAccess,
              sitePlanCoord: p.sitePlanCoord,
              specs: {
                certificate: p.specs?.certificate,
                electricity: p.specs?.electricity,
                water: p.specs?.water,
              },
            })),
          },
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? ((await response.json()) as { reply?: string; error?: string })
        : {};

      if (!response.ok || !data.reply) {
        throw new Error(
          data.error ||
            'Server asisten AI sedang padat sementara. Silakan tekan Coba Lagi atau lanjutkan via WhatsApp.'
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply!,
        },
      ]);
    } catch (err) {
      const rawMsg =
        err instanceof Error ? err.message : 'Layanan asisten AI sedang mengalami gangguan.';
      const cleanMsg =
        rawMsg.trim().startsWith('{') || rawMsg.includes('"status":"UNAVAILABLE"')
          ? 'Server asisten AI sedang padat sementara. Silakan tekan Coba Lagi beberapa detik lagi atau lanjutkan via WhatsApp Marketing.'
          : rawMsg;
      setFailedPromptText(trimmed);
      setErrorMessage(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={botName}
            className="mb-3 w-[calc(100vw-2rem)] sm:w-[385px] max-h-[75vh] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#8B1522] via-[#7A111D] to-[#5D0C15] text-white px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-[#4A0910] flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold leading-tight truncate">
                    {botName}
                  </p>
                  <p className="text-[11px] text-amber-200/95 truncate">{botSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Mulai percakapan baru"
                  aria-label="Reset percakapan"
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-rose-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup asisten chat"
                  className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80 min-h-[260px] max-h-[400px]"
            >
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line shadow-2xs ${
                        isUser
                          ? 'bg-[#A31C24] text-white rounded-br-sm'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Quick Suggested Questions */}
              {messages.length === 1 && suggestedQuestions.length > 0 && !isLoading && (
                <div className="pt-1 space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Pertanyaan Populer
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => void sendMessage(q)}
                        className="text-left text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#A31C24]/50 hover:text-[#A31C24] transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-slate-200 text-xs text-slate-500 inline-flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#A31C24] animate-spin" />
                    <span>Menyiapkan jawaban...</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {failedPromptText && (
                      <button
                        type="button"
                        onClick={() => void sendMessage(failedPromptText, { isRetry: true })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A31C24] text-white text-[11px] font-semibold hover:bg-[#8B1522] cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Coba Lagi</span>
                      </button>
                    )}
                    {settings.contactFormEnabled !== false ? (
                      <button
                        type="button"
                        onClick={onOpenWhatsApp}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>Lanjutkan via WhatsApp</span>
                      </button>
                    ) : settings.whatsappCtaEnabled !== false ? (
                      <a
                        href={buildDirectWhatsappHref(settings)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>Lanjutkan via WhatsApp</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input & WhatsApp Handoff Footer */}
            <div className="bg-white border-t border-slate-200 p-3 space-y-2">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya harga unit, promo, KPR, SHM..."
                  disabled={isLoading}
                  aria-label="Ketik pertanyaan properti"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A31C24] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Kirim pesan"
                  className="w-10 h-10 rounded-xl bg-[#A31C24] text-white hover:bg-[#8B1522] disabled:opacity-45 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                <span>Berdasarkan data resmi {settings.developerName}</span>
                {settings.contactFormEnabled !== false ? (
                  <button
                    type="button"
                    onClick={onOpenWhatsApp}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3 h-3" />
                    <span>Chat Sales</span>
                  </button>
                ) : settings.whatsappCtaEnabled !== false ? (
                  <a
                    href={buildDirectWhatsappHref(settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <WhatsAppIcon className="w-3 h-3" />
                    <span>Chat Sales</span>
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-Right Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? `Tutup ${botName}` : `Buka ${botName}`}
        className="group inline-flex items-center gap-2.5 h-12 px-4 rounded-full bg-gradient-to-r from-[#8B1522] to-[#A31C24] text-white shadow-2xl border-2 border-amber-300/75 hover:brightness-110 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A31C24]"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-amber-200 shrink-0" />
        ) : (
          <MessageCircle className="w-5 h-5 text-amber-300 shrink-0" />
        )}
        <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
          {isOpen ? 'Tutup Chat' : botName}
        </span>
      </button>
    </div>
  );
};
