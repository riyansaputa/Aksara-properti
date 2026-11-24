import { INITIAL_ANALYTICS_SEED } from '../data/seedData';
import {
  AnalyticsEventType,
  Lead,
  Property,
  SiteSettings,
  TrafficSource,
  UnitAnalyticsEvent,
  VisitorPageEvent,
} from '../types';

const ANALYTICS_STORAGE_KEY = 'aksara_unit_analytics_events_v1';
const VISITOR_PAGES_STORAGE_KEY = 'aksara_visitor_page_events_v1';
const SESSION_ID_KEY = 'aksara_visitor_session_id_v1';
const SESSION_SOURCE_KEY = 'aksara_visitor_source_v1';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __aksaraInjectedTags?: Record<string, boolean>;
  }
}

export function getOrCreateVisitorSessionId(): string {
  if (typeof window === 'undefined') return 'srv-session';
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `sess-${Date.now()}`;
  }
}

export function detectTrafficSource(): TrafficSource {
  if (typeof window === 'undefined') return 'Direct / Langsung';
  try {
    const params = new URLSearchParams(window.location.search);
    const srcParam = (params.get('src') || params.get('utm_source') || '').toLowerCase();
    const medium = (params.get('utm_medium') || '').toLowerCase();

    let detected: TrafficSource | null = null;
    if (srcParam.includes('qr')) detected = 'QR Code Brosur';
    else if (srcParam.includes('wa') || srcParam.includes('whatsapp')) detected = 'WhatsApp Share';
    else if (
      srcParam.includes('fb') ||
      srcParam.includes('facebook') ||
      srcParam.includes('ig') ||
      srcParam.includes('instagram') ||
      srcParam.includes('meta') ||
      medium.includes('paid_social')
    ) {
      detected = 'Facebook / IG Ads';
    } else if (srcParam.includes('google') || medium.includes('organic')) {
      detected = 'Organik Google';
    } else if (srcParam) {
      detected = 'Referral Lainnya';
    } else if (typeof document !== 'undefined' && document.referrer) {
      const ref = document.referrer.toLowerCase();
      if (ref.includes('google.')) detected = 'Organik Google';
      else if (ref.includes('facebook.') || ref.includes('instagram.') || ref.includes('l.instagram.'))
        detected = 'Facebook / IG Ads';
      else if (ref.includes('whatsapp.') || ref.includes('wa.me')) detected = 'WhatsApp Share';
      else if (!ref.includes(window.location.hostname)) detected = 'Referral Lainnya';
    }

    if (detected) {
      sessionStorage.setItem(SESSION_SOURCE_KEY, detected);
      return detected;
    }
    const cached = sessionStorage.getItem(SESSION_SOURCE_KEY) as TrafficSource | null;
    if (cached) return cached;
  } catch {
    // ignore
  }
  return 'Direct / Langsung';
}

export function injectTrackingTags(settings: SiteSettings): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  window.__aksaraInjectedTags = window.__aksaraInjectedTags || {};

  const ga4 = settings.ga4MeasurementId?.trim();
  const gads = settings.googleAdsId?.trim();
  const gtm = settings.gtmContainerId?.trim();
  const fbPixel = settings.metaPixelId?.trim();

  const primaryGtagId = ga4 || gads;

  if (primaryGtagId && !window.__aksaraInjectedTags[`gtag_${primaryGtagId}`]) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryGtagId)}`;
    document.head.appendChild(script);

    if (ga4) {
      window.gtag('config', ga4, {
        send_page_view: true,
        allow_enhanced_conversions: settings.enableEnhancedConversions,
      });
      window.__aksaraInjectedTags[`gtag_${ga4}`] = true;
    }

    if (gads) {
      window.gtag('config', gads, {
        allow_enhanced_conversions: settings.enableEnhancedConversions,
      });
      window.__aksaraInjectedTags[`gtag_${gads}`] = true;
    }
  }

  if (gtm && !window.__aksaraInjectedTags[`gtm_${gtm}`]) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`;
    document.head.appendChild(gtmScript);
    window.__aksaraInjectedTags[`gtm_${gtm}`] = true;
  }

  if (fbPixel && !window.__aksaraInjectedTags[`fb_${fbPixel}`]) {
    if (!window.fbq) {
      const n: ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void;
        queue: unknown[][];
        loaded: boolean;
        version: string;
      } = Object.assign(
        function (...args: unknown[]) {
          if (n.callMethod) {
            n.callMethod(...args);
          } else {
            n.queue.push(args);
          }
        },
        { queue: [] as unknown[][], loaded: true, version: '2.0' }
      );
      window.fbq = n;
      const fbScript = document.createElement('script');
      fbScript.async = true;
      fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(fbScript);
    }
    window.fbq('init', fbPixel);
    window.fbq('track', 'PageView');
    window.__aksaraInjectedTags[`fb_${fbPixel}`] = true;
  }
}

export function loadUnitAnalyticsEvents(): UnitAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function loadVisitorPageEvents(): VisitorPageEvent[] {
  try {
    const raw = localStorage.getItem(VISITOR_PAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function recordPageVisit(params: {
  pagePath: string;
  pageTitle: string;
  propertyId?: string;
  propertyName?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadVisitorPageEvents();
    const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
    const nextVisit: VisitorPageEvent = {
      id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId: getOrCreateVisitorSessionId(),
      pagePath: params.pagePath || '#/beranda',
      pageTitle: params.pageTitle || 'Beranda Utama',
      source: detectTrafficSource(),
      device: isMobile ? 'Mobile' : 'Desktop',
      propertyId: params.propertyId,
      propertyName: params.propertyName,
      timestamp: new Date().toISOString(),
    };
    const updated = [nextVisit, ...existing].slice(0, 600);
    localStorage.setItem(VISITOR_PAGES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota
  }
}

export function recordUnitInteraction(
  property: Property | null,
  type: AnalyticsEventType,
  settings?: SiteSettings
): void {
  const source = detectTrafficSource();

  if (property) {
    try {
      const existing = loadUnitAnalyticsEvents();
      const nextEvent: UnitAnalyticsEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        propertyId: property.id,
        propertyName: property.name,
        cluster: property.cluster,
        type,
        source,
        timestamp: new Date().toISOString(),
      };
      const updated = [nextEvent, ...existing].slice(0, 600);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota
    }
  }

  // Dispatch real gtag / GTM / Meta Pixel conversion events when configured
  if (typeof window === 'undefined') return;

  const valueIdr = property?.price ?? 2000000000;
  const itemPayload = property
    ? [
        {
          item_id: property.id,
          item_name: property.name,
          item_category: property.cluster,
          item_variant: property.type,
          price: property.price,
        },
      ]
    : [];

  if (typeof window.gtag === 'function') {
    if (type === 'view' && property) {
      window.gtag('event', 'view_item', {
        currency: 'IDR',
        value: valueIdr,
        items: itemPayload,
      });
    } else if (type === 'kpr_sim') {
      window.gtag('event', 'calculate_kpr', {
        currency: 'IDR',
        value: valueIdr,
        property_name: property?.name ?? 'Kustom',
      });
    } else if (type === 'brochure_pdf' || type === 'print_property') {
      window.gtag('event', 'download_brochure', {
        method: type,
        property_name: property?.name ?? 'Katalog',
      });
    } else if (type === 'share_wa' || type === 'share_social') {
      window.gtag('event', 'share', {
        method: type,
        content_type: 'property',
        item_id: property?.id ?? 'site',
      });
    } else if (type === 'wa_click') {
      window.gtag('event', 'whatsapp_click', {
        currency: 'IDR',
        value: valueIdr,
        property_name: property?.name ?? 'Konsultasi Umum',
      });
      if (settings?.googleAdsId && settings?.googleAdsWhatsappLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${settings.googleAdsId.trim()}/${settings.googleAdsWhatsappLabel.trim()}`,
          value: 1,
          currency: 'IDR',
        });
      }
    } else if (type === 'lead_submit') {
      window.gtag('event', 'generate_lead', {
        currency: 'IDR',
        value: valueIdr,
        property_name: property?.name ?? 'Konsultasi Umum',
      });
      if (settings?.googleAdsId && settings?.googleAdsLeadLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${settings.googleAdsId.trim()}/${settings.googleAdsLeadLabel.trim()}`,
          value: valueIdr,
          currency: 'IDR',
        });
      }
    }
  }

  if (typeof window.fbq === 'function') {
    if (type === 'view' && property) {
      window.fbq('track', 'ViewContent', {
        content_name: property.name,
        content_category: property.cluster,
        value: property.price,
        currency: 'IDR',
      });
    } else if (type === 'wa_click') {
      window.fbq('track', 'Contact', {
        content_name: property?.name ?? 'Konsultasi WhatsApp',
      });
    } else if (type === 'lead_submit') {
      window.fbq('track', 'Lead', {
        content_name: property?.name ?? 'Konsultasi Properti',
        value: valueIdr,
        currency: 'IDR',
      });
    }
  }
}

export interface UnitInterestRow {
  propertyId: string;
  name: string;
  shortName: string;
  cluster: string;
  listingCategory: 'Primary' | 'Secondary';
  status: Property['status'];
  views: number;
  uniqueVisitors: number;
  topSource: TrafficSource;
  kprSims: number;
  waClicks: number;
  pdfOrPrints: number;
  sharesCount: number;
  leadsCount: number;
  conversionRate: string;
  interestScore: number;
  priorityLabel: 'Prioritas Iklan Tinggi' | 'Optimasi Promo / CTA' | 'Performa Stabil' | 'Alihkan Traffic';
}

const DEFAULT_SOURCES_BY_INDEX: TrafficSource[] = [
  'Organik Google',
  'Facebook / IG Ads',
  'Direct / Langsung',
  'WhatsApp Share',
  'QR Code Brosur',
  'Organik Google',
];

export function buildUnitInterestMatrix(
  properties: Property[],
  leads: Lead[]
): UnitInterestRow[] {
  const liveEvents = loadUnitAnalyticsEvents();
  const pageEvents = loadVisitorPageEvents();

  return properties
    .map((prop, idx) => {
      const base = INITIAL_ANALYTICS_SEED[prop.id] ?? {
        views: 45,
        waClicks: 4,
        kprSims: 8,
      };
      const unitEvents = liveEvents.filter((e) => e.propertyId === prop.id);
      const unitPageVisits = pageEvents.filter((p) => p.propertyId === prop.id);

      const views = base.views + unitEvents.filter((e) => e.type === 'view').length;
      const baseUnique = Math.max(12, Math.round(base.views * 0.72));
      const liveSessionCount = new Set(unitPageVisits.map((p) => p.sessionId)).size;
      const uniqueVisitors = baseUnique + liveSessionCount;

      const waClicks = base.waClicks + unitEvents.filter((e) => e.type === 'wa_click').length;
      const kprSims = base.kprSims + unitEvents.filter((e) => e.type === 'kpr_sim').length;
      const pdfOrPrints =
        Math.round(base.waClicks * 0.35) +
        unitEvents.filter((e) => e.type === 'brochure_pdf' || e.type === 'print_property').length;
      const sharesCount =
        Math.round(base.waClicks * 0.25) +
        unitEvents.filter((e) => e.type === 'share_wa' || e.type === 'share_social').length;
      const leadsCount = leads.filter(
        (l) => l.propertyId === prop.id || l.propertyName === prop.name
      ).length;

      // Determine top traffic source for this listing
      const sourceCountMap = new Map<TrafficSource, number>();
      unitEvents.forEach((e) => {
        if (e.source) {
          sourceCountMap.set(e.source, (sourceCountMap.get(e.source) ?? 0) + 1);
        }
      });
      unitPageVisits.forEach((p) => {
        sourceCountMap.set(p.source, (sourceCountMap.get(p.source) ?? 0) + 1);
      });
      let topSource: TrafficSource = DEFAULT_SOURCES_BY_INDEX[idx % DEFAULT_SOURCES_BY_INDEX.length];
      let maxSourceHits = 0;
      sourceCountMap.forEach((hits, src) => {
        if (hits > maxSourceHits) {
          maxSourceHits = hits;
          topSource = src;
        }
      });

      const conversionRate = views > 0 ? (((waClicks + leadsCount) / views) * 100).toFixed(1) : '0.0';

      // Weighted demand score
      const interestScore = Math.round(
        views * 0.2 + kprSims * 1.2 + waClicks * 3 + pdfOrPrints * 2 + sharesCount * 2 + leadsCount * 12
      );

      let priorityLabel: UnitInterestRow['priorityLabel'] = 'Performa Stabil';
      if (prop.status === 'Sold Out') {
        priorityLabel = 'Alihkan Traffic';
      } else if (waClicks + leadsCount * 2 >= 45 || interestScore >= 320) {
        priorityLabel = 'Prioritas Iklan Tinggi';
      } else if (views >= 150 && waClicks < 25) {
        priorityLabel = 'Optimasi Promo / CTA';
      }

      const shortName =
        prop.name.length > 20 ? `${prop.name.slice(0, 18).trim()}…` : prop.name;

      return {
        propertyId: prop.id,
        name: prop.name,
        shortName,
        cluster: prop.cluster,
        listingCategory: prop.listingCategory || 'Primary',
        status: prop.status,
        views,
        uniqueVisitors,
        topSource,
        kprSims,
        waClicks,
        pdfOrPrints,
        sharesCount,
        leadsCount,
        conversionRate,
        interestScore,
        priorityLabel,
      };
    })
    .sort((a, b) => b.interestScore - a.interestScore);
}

export interface DemandTrendPoint {
  dateLabel: string;
  views: number;
  waClicks: number;
  leads: number;
}

export function buildDemandTrendSeries(leads: Lead[]): DemandTrendPoint[] {
  const liveEvents = loadUnitAnalyticsEvents();
  const basePattern = [
    { offset: 6, views: 112, wa: 14, leads: 2 },
    { offset: 5, views: 138, wa: 18, leads: 3 },
    { offset: 4, views: 125, wa: 16, leads: 2 },
    { offset: 3, views: 164, wa: 24, leads: 4 },
    { offset: 2, views: 182, wa: 29, leads: 5 },
    { offset: 1, views: 205, wa: 34, leads: 6 },
    { offset: 0, views: 194, wa: 31, leads: 5 },
  ];

  const today = new Date();
  return basePattern.map((item) => {
    const d = new Date(today);
    d.setDate(today.getDate() - item.offset);
    const isoDay = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    const dayViews = liveEvents.filter(
      (e) => e.type === 'view' && e.timestamp.slice(0, 10) === isoDay
    ).length;
    const dayWa = liveEvents.filter(
      (e) => e.type === 'wa_click' && e.timestamp.slice(0, 10) === isoDay
    ).length;
    const dayLeads = leads.filter((l) => l.createdAt.slice(0, 10) === isoDay).length;

    return {
      dateLabel: label,
      views: item.views + dayViews,
      waClicks: item.wa + dayWa,
      leads: item.leads + dayLeads,
    };
  });
}

export interface TrafficSourceSummary {
  source: TrafficSource;
  visits: number;
  percentage: number;
}

export interface TopVisitedPageRow {
  pagePath: string;
  pageTitle: string;
  visits: number;
  sharePercent: number;
  category: 'Halaman Utama' | 'Listing Properti' | 'Artikel / Panduan' | 'Fitur Interaktif';
}

export interface VisitorOverviewReport {
  totalPageviews: number;
  uniqueVisitors: number;
  mobilePercent: number;
  desktopPercent: number;
  trafficSources: TrafficSourceSummary[];
  topPages: TopVisitedPageRow[];
  recentVisits: VisitorPageEvent[];
}

export function buildVisitorOverviewReport(properties: Property[]): VisitorOverviewReport {
  const pageEvents = loadVisitorPageEvents();
  const unitEvents = loadUnitAnalyticsEvents();

  // Combine seeded baseline + live session visits so admins always see a thorough, realistic + live-updating report
  const sourceTotals: Record<TrafficSource, number> = {
    'Organik Google': 485,
    'Facebook / IG Ads': 312,
    'Direct / Langsung': 248,
    'WhatsApp Share': 134,
    'QR Code Brosur': 68,
    'Referral Lainnya': 45,
  };

  pageEvents.forEach((pv) => {
    sourceTotals[pv.source] = (sourceTotals[pv.source] ?? 0) + 1;
  });

  const totalVisitsBySource = Object.values(sourceTotals).reduce((a, b) => a + b, 0);
  const trafficSources: TrafficSourceSummary[] = (
    Object.entries(sourceTotals) as [TrafficSource, number][]
  )
    .map(([source, visits]) => ({
      source,
      visits,
      percentage: totalVisitsBySource > 0 ? Math.round((visits / totalVisitsBySource) * 100) : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  // Page counts combining section & listing pageviews
  const pageMap = new Map<
    string,
    {
      pagePath: string;
      pageTitle: string;
      visits: number;
      category: TopVisitedPageRow['category'];
    }
  >();

  const seedPages: {
    pagePath: string;
    pageTitle: string;
    visits: number;
    category: TopVisitedPageRow['category'];
  }[] = [
    {
      pagePath: '#/beranda',
      pageTitle: 'Beranda Utama & Pencarian Properti',
      visits: 520,
      category: 'Halaman Utama',
    },
    {
      pagePath: '#/katalog',
      pageTitle: 'Katalog Properti & Site Plan Interaktif',
      visits: 386,
      category: 'Fitur Interaktif',
    },
    {
      pagePath: '#/simulasi-kpr',
      pageTitle: 'Kalkulator Simulasi KPR & Bank Rekanan',
      visits: 274,
      category: 'Fitur Interaktif',
    },
    {
      pagePath: '#/bandingkan-unit',
      pageTitle: 'Bandingkan Spesifikasi Unit',
      visits: 142,
      category: 'Fitur Interaktif',
    },
    {
      pagePath: '#/berita',
      pageTitle: 'Berita Kawasan & Artikel Properti',
      visits: 118,
      category: 'Artikel / Panduan',
    },
  ];

  seedPages.forEach((sp) => pageMap.set(sp.pagePath, { ...sp }));

  properties.forEach((prop) => {
    const base = INITIAL_ANALYTICS_SEED[prop.id]?.views ?? 45;
    const liveUnitViews = unitEvents.filter(
      (e) => e.propertyId === prop.id && e.type === 'view'
    ).length;
    const slugPath = `#/unit/${prop.slug || prop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    pageMap.set(slugPath, {
      pagePath: slugPath,
      pageTitle: `${prop.name} (${prop.cluster})`,
      visits: base + liveUnitViews,
      category: 'Listing Properti',
    });
  });

  pageEvents.forEach((pv) => {
    const existing = pageMap.get(pv.pagePath);
    if (existing) {
      existing.visits += 1;
    } else {
      pageMap.set(pv.pagePath, {
        pagePath: pv.pagePath,
        pageTitle: pv.pageTitle,
        visits: 1,
        category: pv.pagePath.startsWith('#/unit/')
          ? 'Listing Properti'
          : pv.pagePath.startsWith('#/artikel/')
          ? 'Artikel / Panduan'
          : pv.pagePath === '#/beranda'
          ? 'Halaman Utama'
          : 'Fitur Interaktif',
      });
    }
  });

  const allPages = Array.from(pageMap.values()).sort((a, b) => b.visits - a.visits);
  const totalPageviews = allPages.reduce((acc, p) => acc + p.visits, 0);

  const topPages: TopVisitedPageRow[] = allPages.slice(0, 10).map((p) => ({
    ...p,
    sharePercent: totalPageviews > 0 ? Math.round((p.visits / totalPageviews) * 100) : 0,
  }));

  const mobileCount =
    840 + pageEvents.filter((pv) => pv.device === 'Mobile').length;
  const desktopCount =
    452 + pageEvents.filter((pv) => pv.device === 'Desktop').length;
  const totalDev = mobileCount + desktopCount;

  const liveSessions = new Set(pageEvents.map((p) => p.sessionId)).size;
  const uniqueVisitors = 924 + liveSessions;

  return {
    totalPageviews,
    uniqueVisitors,
    mobilePercent: Math.round((mobileCount / totalDev) * 100),
    desktopPercent: Math.round((desktopCount / totalDev) * 100),
    trafficSources,
    topPages,
    recentVisits: pageEvents.slice(0, 15),
  };
}
