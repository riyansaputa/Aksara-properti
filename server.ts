import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface SitePropertyContext {
  name?: string;
  cluster?: string;
  type?: string;
  price?: number;
  installmentText?: string;
  landArea?: number;
  buildingArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  carports?: number;
  status?: string;
  promoTag?: string;
  description?: string;
  highlights?: string[];
  nearbyAccess?: string[];
  sitePlanCoord?: { blockCode?: string };
  specs?: {
    certificate?: string;
    electricity?: string;
    water?: string;
  };
}

interface SiteSettingsContext {
  developerName?: string;
  projectName?: string;
  officeAddress?: string;
  officeEmail?: string;
  whatsappNumber?: string;
  marketingName?: string;
  defaultInterestRate?: number;
  promoBannerText?: string;
  topPromoBannerTitle?: string;
  chatbotName?: string;
  chatbotSystemInstruction?: string;
  faqItems?: Array<{ category?: string; question?: string; answer?: string }>;
}

function formatIdr(value?: number): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSystemInstruction(
  settings: SiteSettingsContext = {},
  properties: SitePropertyContext[] = []
): string {
  const unitLines = properties
    .map((p, idx) => {
      const specs = [
        p.cluster ? `Cluster: ${p.cluster}` : '',
        p.type ? `Tipe: ${p.type}` : '',
        p.status ? `Status: ${p.status}` : '',
        p.sitePlanCoord?.blockCode ? `Blok: ${p.sitePlanCoord.blockCode}` : '',
        p.price ? `Harga: ${formatIdr(p.price)}` : '',
        p.installmentText ? `Cicilan mulai: ${p.installmentText}` : '',
        p.landArea ? `LT: ${p.landArea}m²` : '',
        typeof p.buildingArea === 'number' ? `LB: ${p.buildingArea}m²` : '',
        typeof p.bedrooms === 'number' && p.bedrooms > 0 ? `${p.bedrooms} KT` : '',
        typeof p.bathrooms === 'number' && p.bathrooms > 0 ? `${p.bathrooms} KM` : '',
        p.specs?.certificate ? `Legalitas: ${p.specs.certificate}` : '',
        p.promoTag ? `Promo Unit: ${p.promoTag}` : '',
        p.nearbyAccess?.length ? `Akses: ${p.nearbyAccess.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      return `${idx + 1}. ${p.name || 'Unit'} — ${specs}`;
    })
    .join('\n');

  const faqLines = (settings.faqItems || [])
    .slice(0, 12)
    .map((f, idx) => `${idx + 1}. [${f.category || 'Umum'}] T: ${f.question || ''} -> J: ${f.answer || ''}`)
    .join('\n');

  return [
    `Anda adalah ${settings.chatbotName || 'Asisten Properti AI'} resmi untuk ${settings.developerName || 'Developer'} (${settings.projectName || 'Kawasan Township'}).`,
    `Tugas Anda membantu calon pembeli properti secara ramah, akurat, ringkas, profesional, dan real-time dalam Bahasa Indonesia berdasarkan data resmi terbaru di bawah ini.`,
    settings.chatbotSystemInstruction
      ? `Instruksi khusus admin: ${settings.chatbotSystemInstruction}`
      : '',
    '',
    'INFORMASI KAWASAN & MARKETING:',
    `- Nama Developer: ${settings.developerName || '-'}`,
    `- Nama Proyek/Kawasan: ${settings.projectName || '-'}`,
    `- Alamat Kantor Pemasaran: ${settings.officeAddress || '-'}`,
    `- Email Kantor: ${settings.officeEmail || '-'}`,
    `- PIC Marketing: ${settings.marketingName || 'Tim Marketing'}`,
    `- Nomor WhatsApp Resmi: +${settings.whatsappNumber || '-'}`,
    `- Suku Bunga Acuan KPR: ${settings.defaultInterestRate ?? 6.25}% per tahun`,
    `- Promo Utama Berjalan: ${settings.topPromoBannerTitle || '-'} | ${settings.promoBannerText || '-'}`,
    '',
    'KATALOG UNIT PROPERTI TERSEDIA:',
    unitLines || 'Belum ada unit terdaftar.',
    '',
    'FAQ & KEBIJAKAN RESMI:',
    faqLines || 'Tidak ada daftar FAQ tambahan.',
    '',
    'ATURAN MENJAWAB:',
    '1. Jawab HANYA berdasarkan data di atas dan pengetahuan umum KPR/properti yang relevan; jangan mengarang harga, blok, atau promo yang tidak tercantum.',
    '2. Gunakan format poin yang rapi jika membandingkan beberapa unit, dan sertakan harga/cicilan secara jelas.',
    '3. Jawab singkat dan mudah dibaca di layar chat (maksimal ~150-220 kata kecuali user meminta rincian lengkap).',
    '4. Jika user ingin booking fee, negosiasi harga, minta e-brosur, atau jadwal survei lokasi, arahkan dengan ramah untuk klik tombol "Chat WhatsApp" atau hubungi tim marketing resmi.',
  ]
    .filter(Boolean)
    .join('\n');
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorInfo(err: unknown): { code?: number; status?: string; rawMessage: string } {
  const errObj = err as { status?: number; code?: number; message?: string } | null;
  const rawMessage = err instanceof Error ? err.message : String(err ?? '');

  let parsedCode: number | undefined =
    typeof errObj?.status === 'number'
      ? errObj.status
      : typeof errObj?.code === 'number'
      ? errObj.code
      : undefined;
  let parsedStatus: string | undefined;

  // Attempt to parse embedded JSON error payloads from SDK exceptions
  const jsonStart = rawMessage.indexOf('{');
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(rawMessage.slice(jsonStart)) as {
        error?: { code?: number; status?: string; message?: string };
      };
      if (parsed?.error) {
        if (typeof parsed.error.code === 'number') parsedCode = parsed.error.code;
        if (typeof parsed.error.status === 'string') parsedStatus = parsed.error.status;
      }
    } catch {
      // Ignore non-JSON suffix
    }
  }

  return { code: parsedCode, status: parsedStatus, rawMessage };
}

function isTransientOrCapacityError(info: {
  code?: number;
  status?: string;
  rawMessage: string;
}): boolean {
  const msg = info.rawMessage.toUpperCase();
  return (
    info.code === 503 ||
    info.code === 502 ||
    info.code === 504 ||
    info.code === 500 ||
    info.code === 429 ||
    info.status === 'UNAVAILABLE' ||
    info.status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('503') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('HIGH DEMAND') ||
    msg.includes('OVERLOADED') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('FETCH FAILED')
  );
}

function formatFriendlyGeminiError(err: unknown): { statusCode: number; error: string } {
  const info = getErrorInfo(err);
  const msgUpper = info.rawMessage.toUpperCase();

  if (
    info.code === 403 ||
    info.status === 'PERMISSION_DENIED' ||
    msgUpper.includes('PERMISSION_DENIED') ||
    msgUpper.includes('API_KEY_INVALID') ||
    msgUpper.includes('API KEY NOT VALID')
  ) {
    return {
      statusCode: 403,
      error:
        'Konfigurasi kunci API Gemini belum valid. Admin dapat memeriksa GEMINI_API_KEY pada menu Settings > Secrets.',
    };
  }

  if (
    info.code === 429 ||
    info.status === 'RESOURCE_EXHAUSTED' ||
    msgUpper.includes('RESOURCE_EXHAUSTED') ||
    msgUpper.includes('QUOTA')
  ) {
    return {
      statusCode: 429,
      error:
        'Kuota permintaan asisten AI sementara mencapai batas. Silakan coba lagi sebentar lagi atau hubungi tim marketing via WhatsApp.',
    };
  }

  if (
    info.code === 503 ||
    info.status === 'UNAVAILABLE' ||
    msgUpper.includes('503') ||
    msgUpper.includes('UNAVAILABLE') ||
    msgUpper.includes('HIGH DEMAND') ||
    msgUpper.includes('OVERLOADED')
  ) {
    return {
      statusCode: 503,
      error:
        'Server asisten AI sedang padat sementara. Silakan tekan "Coba Lagi" dalam beberapa detik atau lanjutkan langsung via WhatsApp Marketing.',
    };
  }

  return {
    statusCode: 502,
    error:
      'Asisten AI sedang mengalami gangguan koneksi sementara. Silakan coba kirim ulang pertanyaan Anda atau hubungi WhatsApp Marketing.',
  };
}

function sanitizeConversationTurns(messages: ChatMessageInput[]): ChatMessageInput[] {
  const normalized: ChatMessageInput[] = [];
  for (const msg of messages) {
    const cleanText = msg.text.trim().slice(0, 2000);
    if (!cleanText) continue;

    // Conversation passed to generateContent must start with a user turn
    if (normalized.length === 0 && msg.role !== 'user') continue;

    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === msg.role) {
      prev.text = `${prev.text}\n${cleanText}`.slice(0, 3000);
    } else {
      normalized.push({ role: msg.role, text: cleanText });
    }
  }
  return normalized.slice(-14);
}

async function generateChatReplyWithResilience(
  ai: GoogleGenAI,
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  systemInstruction: string
): Promise<string> {
  const attempts: Array<{
    model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
    delayBeforeMs: number;
    useLowThinking: boolean;
  }> = [
    { model: 'gemini-4-hydrogen', delayBeforeMs: 0, useLowThinking: true },
    { model: 'gemini-4-hydrogen', delayBeforeMs: 650, useLowThinking: true },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 750, useLowThinking: false },
    { model: 'gemini-3.1-flash-lite', delayBeforeMs: 1100, useLowThinking: false },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    if (attempt.delayBeforeMs > 0) {
      await waitMs(attempt.delayBeforeMs);
    }

    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents,
        config: attempt.useLowThinking
          ? {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            }
          : {
              systemInstruction,
            },
      });

      const replyText = (response.text || '').trim();
      if (replyText) {
        return replyText;
      }
      lastError = new Error('Empty model response');
    } catch (err) {
      lastError = err;
      const info = getErrorInfo(err);
      // Do not retry non-transient auth/invalid-key errors
      if (
        info.code === 400 ||
        info.code === 401 ||
        info.code === 403 ||
        info.status === 'PERMISSION_DENIED'
      ) {
        throw err;
      }
      if (!isTransientOrCapacityError(info)) {
        continue;
      }
    }
  }

  throw lastError ?? new Error('All Gemini chat attempts failed');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req, res) => {
    try {
      const ai = createGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error:
            'Kunci API Gemini belum dikonfigurasi di server. Pastikan GEMINI_API_KEY tersedia di Settings > Secrets.',
        });
      }

      const body = req.body as {
        messages?: ChatMessageInput[];
        siteContext?: {
          settings?: SiteSettingsContext;
          properties?: SitePropertyContext[];
        };
      };

      const incomingMessages = Array.isArray(body?.messages) ? body.messages : [];
      const filteredMessages = incomingMessages.filter(
        (m): m is ChatMessageInput =>
          Boolean(m) &&
          (m.role === 'user' || m.role === 'model') &&
          typeof m.text === 'string' &&
          m.text.trim().length > 0
      );
      const validMessages = sanitizeConversationTurns(filteredMessages);

      if (validMessages.length === 0) {
        return res.status(400).json({ error: 'Pesan pertanyaan tidak boleh kosong.' });
      }

      const safeProperties = Array.isArray(body?.siteContext?.properties)
        ? body.siteContext.properties.slice(0, 60)
        : [];
      const systemInstruction = buildSystemInstruction(
        body?.siteContext?.settings,
        safeProperties
      );

      const contents = validMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const replyText = await generateChatReplyWithResilience(
        ai,
        contents,
        systemInstruction
      );

      return res.json({ reply: replyText });
    } catch (err: unknown) {
      const { statusCode, error } = formatFriendlyGeminiError(err);
      return res.status(statusCode).json({ error });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
