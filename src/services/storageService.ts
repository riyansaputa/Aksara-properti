import { INITIAL_LEADS, INITIAL_PROPERTIES, INITIAL_SETTINGS } from '../data/seedData';
import { Lead, LeadStatus, Property, SiteSettings } from '../types';

const KEYS = {
  properties: 'aksara_land_properties_v1',
  leads: 'aksara_land_leads_v1',
  settings: 'aksara_land_settings_v1',
  wishlist: 'aksara_land_wishlist_v1',
  compare: 'aksara_land_compare_v1',
};

const API_BASE = './api.php';

async function tryPhpApi<T>(
  action: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown
): Promise<T | null> {
  try {
    const url = `${API_BASE}?action=${encodeURIComponent(action)}`;
    const response = await fetch(url, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      return null;
    }
    const json = await response.json();
    if (json && json.ok) {
      return json.data as T;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadLocalProperties(): Property[] {
  try {
    const raw = localStorage.getItem(KEYS.properties);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: Property) => {
          if (item.sitePlanCoord) return item;
          const seedMatch = INITIAL_PROPERTIES.find((seed) => seed.id === item.id);
          return seedMatch?.sitePlanCoord
            ? { ...item, sitePlanCoord: seedMatch.sitePlanCoord }
            : item;
        });
      }
    }
  } catch {
    // ignore
  }
  localStorage.setItem(KEYS.properties, JSON.stringify(INITIAL_PROPERTIES));
  return INITIAL_PROPERTIES;
}

export function saveLocalProperties(properties: Property[]): void {
  try {
    localStorage.setItem(KEYS.properties, JSON.stringify(properties));
  } catch (err) {
    console.warn('Gagal menyimpan properti ke localStorage (kuota penuh):', err);
  }
}

export function loadLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(KEYS.leads);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(KEYS.leads, JSON.stringify(INITIAL_LEADS));
  } catch {
    // ignore
  }
  return INITIAL_LEADS;
}

export function saveLocalLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(KEYS.leads, JSON.stringify(leads));
  } catch {
    // ignore
  }
}

export function mergeSiteSettings(partial?: Partial<SiteSettings> | null): SiteSettings {
  if (!partial) return INITIAL_SETTINGS;
  return {
    ...INITIAL_SETTINGS,
    ...partial,
    headerNavLabels: {
      ...INITIAL_SETTINGS.headerNavLabels,
      ...(partial.headerNavLabels ?? {}),
    },
    heroPillars:
      Array.isArray(partial.heroPillars) && partial.heroPillars.length === 4
        ? partial.heroPillars
        : INITIAL_SETTINGS.heroPillars,
    heroSlides: Array.isArray(partial.heroSlides)
      ? partial.heroSlides
      : INITIAL_SETTINGS.heroSlides,
    bankPartners: Array.isArray(partial.bankPartners)
      ? partial.bankPartners
      : INITIAL_SETTINGS.bankPartners,
    sectionOrder:
      Array.isArray(partial.sectionOrder) && partial.sectionOrder.length > 0
        ? partial.sectionOrder
        : INITIAL_SETTINGS.sectionOrder,
    chatbotSuggestedQuestions: Array.isArray(partial.chatbotSuggestedQuestions)
      ? partial.chatbotSuggestedQuestions
      : INITIAL_SETTINGS.chatbotSuggestedQuestions,
    faqItems: Array.isArray(partial.faqItems) ? partial.faqItems : INITIAL_SETTINGS.faqItems,
    testimonials: Array.isArray(partial.testimonials)
      ? partial.testimonials
      : INITIAL_SETTINGS.testimonials,
    blogPosts: Array.isArray(partial.blogPosts) ? partial.blogPosts : INITIAL_SETTINGS.blogPosts,
    footerExtraLinks: Array.isArray(partial.footerExtraLinks)
      ? partial.footerExtraLinks
      : INITIAL_SETTINGS.footerExtraLinks,
    footerSocialLinks: {
      ...INITIAL_SETTINGS.footerSocialLinks,
      ...(partial.footerSocialLinks ?? {}),
    },
  };
}

export function loadLocalSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (raw) {
      return mergeSiteSettings(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(KEYS.settings, JSON.stringify(INITIAL_SETTINGS));
  } catch {
    // ignore
  }
  return INITIAL_SETTINGS;
}

export function saveLocalSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch (err) {
    console.warn('Gagal menyimpan pengaturan ke localStorage (kuota penuh):', err);
  }
}

export function loadWishlistIds(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.wishlist);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveWishlistIds(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.wishlist, JSON.stringify(ids));
  } catch {
    // ignore storage quota errors
  }
}

export function loadCompareIds(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.compare);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveCompareIds(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.compare, JSON.stringify(ids));
  } catch {
    // ignore storage quota errors
  }
}

export async function initializeStore(): Promise<{
  properties: Property[];
  leads: Lead[];
  settings: SiteSettings;
}> {
  const remote = await tryPhpApi<{
    properties?: Property[];
    leads?: Lead[];
    settings?: SiteSettings;
  }>('get_init', 'GET');

  if (remote && Array.isArray(remote.properties) && remote.properties.length > 0) {
    saveLocalProperties(remote.properties);
    if (Array.isArray(remote.leads)) saveLocalLeads(remote.leads);
    if (remote.settings) saveLocalSettings(mergeSiteSettings(remote.settings));
    return {
      properties: remote.properties,
      leads: remote.leads ?? loadLocalLeads(),
      settings: remote.settings ? mergeSiteSettings(remote.settings) : loadLocalSettings(),
    };
  }

  return {
    properties: loadLocalProperties(),
    leads: loadLocalLeads(),
    settings: loadLocalSettings(),
  };
}

export async function submitLead(
  payload: Omit<Lead, 'id' | 'createdAt' | 'status' | 'salesNote'>
): Promise<{ lead: Lead; syncedRemote: boolean }> {
  const newLead: Lead = {
    ...payload,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'New Lead',
    salesNote: payload.kprSummary ? `Simulasi KPR: ${payload.kprSummary}` : '',
  };

  const remote = await tryPhpApi<Lead>('add_lead', 'POST', newLead);
  const current = loadLocalLeads();
  const updated = [remote ?? newLead, ...current];
  saveLocalLeads(updated);

  return {
    lead: remote ?? newLead,
    syncedRemote: Boolean(remote),
  };
}

export async function updateLeadRecord(
  id: string,
  patch: Partial<Pick<Lead, 'status' | 'salesNote'>>
): Promise<Lead[]> {
  const current = loadLocalLeads();
  const updated = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
  saveLocalLeads(updated);
  await tryPhpApi('update_lead', 'POST', { id, ...patch });
  return updated;
}

export async function deleteLeadRecord(id: string): Promise<Lead[]> {
  const current = loadLocalLeads();
  const updated = current.filter((item) => item.id !== id);
  saveLocalLeads(updated);
  await tryPhpApi('delete_lead', 'POST', { id });
  return updated;
}

export async function upsertPropertyRecord(property: Property): Promise<Property[]> {
  const current = loadLocalProperties();
  const exists = current.some((p) => p.id === property.id);
  const updated = exists
    ? current.map((p) => (p.id === property.id ? property : p))
    : [property, ...current];
  saveLocalProperties(updated);
  await tryPhpApi('save_property', 'POST', property);
  return updated;
}

export async function deletePropertyRecord(id: string): Promise<Property[]> {
  const current = loadLocalProperties();
  const updated = current.filter((p) => p.id !== id);
  saveLocalProperties(updated);
  await tryPhpApi('delete_property', 'POST', { id });
  return updated;
}

export async function saveSettingsRecord(settings: SiteSettings): Promise<SiteSettings> {
  saveLocalSettings(settings);
  await tryPhpApi('save_settings', 'POST', settings);
  return settings;
}

export function resetAllDemoData(): {
  properties: Property[];
  leads: Lead[];
  settings: SiteSettings;
} {
  saveLocalProperties(INITIAL_PROPERTIES);
  saveLocalLeads(INITIAL_LEADS);
  saveLocalSettings(INITIAL_SETTINGS);
  return {
    properties: INITIAL_PROPERTIES,
    leads: INITIAL_LEADS,
    settings: INITIAL_SETTINGS,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactRupiah(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000;
    return `Rp ${billions.toLocaleString('id-ID', {
      minimumFractionDigits: billions % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })} M`;
  }
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `Rp ${millions.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} Jt`;
  }
  return formatRupiah(amount);
}

export interface KprCalculation {
  propertyPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  loanPrincipal: number;
  tenorYears: number;
  annualInterestRate: number;
  monthlyInstallment: number;
  totalInterest: number;
  totalPayment: number;
  principalRatioPercent: number;
  interestRatioPercent: number;
}

export function calculateKPR(
  propertyPrice: number,
  downPaymentPercent: number,
  tenorYears: number,
  annualInterestRate: number
): KprCalculation {
  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const loanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);
  const totalMonths = tenorYears * 12;
  const monthlyRate = annualInterestRate / 100 / 12;

  let monthlyInstallment = 0;
  if (loanPrincipal > 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      monthlyInstallment = loanPrincipal / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyInstallment = (loanPrincipal * monthlyRate * factor) / (factor - 1);
    }
  }

  const totalPayment = Math.round(monthlyInstallment * totalMonths);
  const totalInterest = Math.max(0, totalPayment - loanPrincipal);
  const totalSum = loanPrincipal + totalInterest;
  const principalRatioPercent = totalSum > 0 ? Math.round((loanPrincipal / totalSum) * 100) : 100;
  const interestRatioPercent = 100 - principalRatioPercent;

  return {
    propertyPrice,
    downPaymentPercent,
    downPaymentAmount,
    loanPrincipal,
    tenorYears,
    annualInterestRate,
    monthlyInstallment: Math.round(monthlyInstallment),
    totalInterest,
    totalPayment,
    principalRatioPercent,
    interestRatioPercent,
  };
}

export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(targetNumber: string, message: string): string {
  const cleanTarget = normalizeWhatsAppNumber(targetNumber);
  return `https://wa.me/${cleanTarget}?text=${encodeURIComponent(message)}`;
}

export function buildAutoReplyMessage(
  settings: SiteSettings,
  data: {
    name: string;
    propertyName: string;
    cluster: string;
    source: string;
  }
): string {
  const template =
    settings.autoReplyTemplate?.trim() ||
    'Halo Kak {{nama}}, terima kasih telah menghubungi *{{developer}}*. Permintaan *{{sumber}}* untuk *{{unit}}* ({{cluster}}) telah kami terima dan akan segera ditindaklanjuti oleh {{marketing}}.';

  return template
    .replace(/\{\{\s*nama\s*\}\}/gi, data.name || 'Bapak/Ibu')
    .replace(/\{\{\s*unit\s*\}\}/gi, data.propertyName || 'Kawasan Utama')
    .replace(/\{\{\s*cluster\s*\}\}/gi, data.cluster || settings.projectName)
    .replace(/\{\{\s*sumber\s*\}\}/gi, data.source || 'Konsultasi')
    .replace(/\{\{\s*marketing\s*\}\}/gi, settings.marketingName || 'Tim Marketing')
    .replace(/\{\{\s*developer\s*\}\}/gi, settings.developerName || 'Developer');
}

export function buildDirectWhatsappHref(
  settings: Pick<SiteSettings, 'whatsappNumber' | 'developerName' | 'projectName'>,
  property?: Property | null
): string {
  const cleanTarget = normalizeWhatsAppNumber(settings.whatsappNumber);
  const text = property
    ? `Halo ${settings.developerName}, saya ingin menanyakan info detail, ketersediaan, & promo untuk unit ${property.name} (${property.cluster}).`
    : `Halo ${settings.developerName}, saya ingin konsultasi properti & promo terbaru di ${settings.projectName}.`;
  return `https://wa.me/${cleanTarget}?text=${encodeURIComponent(text)}`;
}

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'New Lead',
  'Follow Up',
  'Jadwal Survey',
  'Booking Fee',
  'Closing',
  'Batal',
];

