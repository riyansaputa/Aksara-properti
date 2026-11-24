export type PropertyType = 'Rumah' | 'Ruko' | 'Kavling' | 'Villa' | 'Apartemen';
export type PropertyStatus = 'Available' | 'Promo' | 'Sold Out';
export type ListingCategory = 'Primary' | 'Secondary';

export interface TechnicalSpecs {
  structure: string;
  walls: string;
  flooring: string;
  sanitary: string;
  electricity: string;
  water: string;
  certificate: string;
}

export interface SitePlanCoord {
  x: number;
  y: number;
  blockCode: string;
}

export interface Property {
  id: string;
  slug?: string;
  name: string;
  cluster: string;
  type: PropertyType;
  listingCategory?: ListingCategory;
  isFeatured?: boolean;
  price: number;
  installmentText: string;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  carports: number;
  status: PropertyStatus;
  imageUrl: string;
  galleryUrls: string[];
  floorplanUrl: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  googleMapsUrl?: string;
  locationAddress?: string;
  city?: string;
  facilities?: string[];
  description: string;
  promoTag?: string;
  highlights?: string[];
  nearbyAccess?: string[];
  sitePlanCoord?: SitePlanCoord;
  specs: TechnicalSpecs;
  createdAt: string;
}

export type LeadStatus =
  | 'New Lead'
  | 'Follow Up'
  | 'Jadwal Survey'
  | 'Booking Fee'
  | 'Closing'
  | 'Batal';

export type LeadSource =
  | 'Konsultasi Marketing'
  | 'Jadwal Survey'
  | 'Minta Brosur'
  | 'Simulasi KPR'
  | 'Detail Unit';

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  propertyId?: string;
  propertyName: string;
  cluster: string;
  source: LeadSource;
  status: LeadStatus;
  salesNote: string;
  kprSummary?: string;
}

export interface HeaderNavLabels {
  beranda: string;
  katalog: string;
  kpr: string;
  bandingkan: string;
}

export interface HeroPillarItem {
  title: string;
  detail: string;
}

export interface HeroSlideItem {
  id: string;
  imageUrl: string;
  badgeText: string;
  title: string;
  subtitle: string;
}

export interface BankPartnerItem {
  id: string;
  name: string;
  rateText: string;
  dpMinText: string;
  maxTenorText: string;
  accentColor: string;
}

export interface FooterExtraLink {
  label: string;
  url: string;
}

export interface FooterSocialLinks {
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  unitPurchased: string;
  rating: number;
  quote: string;
  outcome: string;
  avatarUrl?: string;
}

export interface BlogPostItem {
  id: string;
  slug?: string;
  title: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}

export type ReorderableSection = 'katalog' | 'kpr' | 'bandingkan' | 'testimoni' | 'berita' | 'faq';

export interface SiteSettings {
  developerName: string;
  projectName: string;
  logoUrl: string;
  topPromoBannerEnabled: boolean;
  topPromoBannerImageUrl: string;
  topPromoBannerMobileImageUrl: string;
  topPromoBannerTitle: string;
  topPromoBannerAction: 'whatsapp' | 'catalog' | 'kpr';
  // Header Customization
  headerTopBarEnabled: boolean;
  headerTopBarHours: string;
  headerTopBarActionText: string;
  headerTagline: string;
  headerNavLabels: HeaderNavLabels;
  headerWishlistLabel: string;
  headerCtaText: string;
  // Section Visibility & Layout Order (CRM Page Builder)
  navbarEnabled: boolean;
  heroEnabled: boolean;
  heroSearchEnabled: boolean;
  highlightsEnabled: boolean;
  pillarsEnabled: boolean;
  catalogEnabled: boolean;
  sitePlanEnabled: boolean;
  kprEnabled: boolean;
  compareEnabled: boolean;
  footerEnabled: boolean;
  mobileBottomNavEnabled: boolean;
  sectionOrder: ReorderableSection[];
  // Homepage Image Slider
  heroSliderEnabled: boolean;
  heroSlideIntervalSec: number;
  heroSlides: HeroSlideItem[];
  // Property Feature Controls (Labels, Share, Print/PDF, QR, Bank Partners, Media & Maps)
  soldOutLabel: string;
  featuredBadgeLabel: string;
  wishlistEnabled: boolean;
  contactFormEnabled: boolean;
  whatsappCtaEnabled: boolean;
  enablePropertyPrintAndPdf: boolean;
  enableSocialShare: boolean;
  enableQrCode: boolean;
  enableVideoAndTour: boolean;
  enableGoogleMaps: boolean;
  bankPartnersEnabled: boolean;
  bankPartnersTitle: string;
  bankPartners: BankPartnerItem[];
  // Editable Public Content & Copywriting
  promoTopEyebrow: string;
  promoTopButtonText: string;
  heroBackgroundImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSearchTabAllLabel: string;
  heroSearchTabReadyLabel: string;
  heroSearchTabPromoLabel: string;
  heroSearchPlaceholder: string;
  heroSearchButtonText: string;
  highlightsEyebrow: string;
  highlightsTitle: string;
  highlightAdvisorLabel: string;
  highlightSitePlanEyebrow: string;
  highlightSitePlanTitle: string;
  promoBannerText: string;
  heroPromoLabel: string;
  heroPrimaryCtaText: string;
  heroSecondaryCtaText: string;
  heroPillars: HeroPillarItem[];
  catalogEyebrow: string;
  catalogTitle: string;
  catalogSubtitle: string;
  catalogShowMoreText: string;
  kprEyebrow: string;
  kprTitle: string;
  kprSubtitle: string;
  kprCtaText: string;
  kprDisclaimerText: string;
  compareEyebrow: string;
  compareTitle: string;
  compareEmptyTitle: string;
  compareEmptySubtitle: string;
  // Testimonials Section
  testimonialsEnabled: boolean;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonials: TestimonialItem[];
  // Blog / News Section
  blogEnabled: boolean;
  blogEyebrow: string;
  blogTitle: string;
  blogSubtitle: string;
  blogPosts: BlogPostItem[];
  // FAQ Section
  faqEnabled: boolean;
  faqEyebrow: string;
  faqTitle: string;
  faqSubtitle: string;
  faqCtaText: string;
  faqItems: FaqItem[];
  // Footer Customization & Google Maps
  footerDescription: string;
  footerNavHeading: string;
  footerContactHeading: string;
  footerCopyrightText: string;
  footerExtraLinks: FooterExtraLink[];
  footerSocialLinks: FooterSocialLinks;
  officeGoogleMapsUrl: string;
  officeMapEmbedQuery: string;
  // Marketing, KPR & Auto-Reply
  whatsappNumber: string;
  marketingName: string;
  autoReplyEnabled: boolean;
  autoReplyTemplate: string;
  officeAddress: string;
  officeEmail: string;
  defaultInterestRate: number;
  adminUsername: string;
  adminPassword: string;
  // Gemini AI Chatbot Settings
  chatbotEnabled: boolean;
  chatbotName: string;
  chatbotSubtitle: string;
  chatbotWelcomeMessage: string;
  chatbotSuggestedQuestions: string[];
  chatbotSystemInstruction: string;
  // SEO Booster & Social Metadata
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImageUrl: string;
  googleSiteVerification: string;
  seoRobotsIndex: boolean;
  seoAutoSchemaEnabled: boolean;
  // Tracking & Ads Conversion Settings
  ga4MeasurementId: string;
  googleAdsId: string;
  googleAdsLeadLabel: string;
  googleAdsWhatsappLabel: string;
  gtmContainerId: string;
  metaPixelId: string;
  enableEnhancedConversions: boolean;
}

export type AnalyticsEventType =
  | 'view'
  | 'wa_click'
  | 'kpr_sim'
  | 'lead_submit'
  | 'brochure_pdf'
  | 'print_property'
  | 'share_wa'
  | 'share_social'
  | 'qr_scan';

export type TrafficSource =
  | 'Organik Google'
  | 'Direct / Langsung'
  | 'Facebook / IG Ads'
  | 'WhatsApp Share'
  | 'QR Code Brosur'
  | 'Referral Lainnya';

export interface UnitAnalyticsEvent {
  id: string;
  propertyId: string;
  propertyName: string;
  cluster: string;
  type: AnalyticsEventType;
  source?: TrafficSource;
  timestamp: string;
}

export interface VisitorPageEvent {
  id: string;
  sessionId: string;
  pagePath: string;
  pageTitle: string;
  source: TrafficSource;
  device: 'Desktop' | 'Mobile';
  propertyId?: string;
  propertyName?: string;
  timestamp: string;
}

export type PublicSection =
  | 'beranda'
  | 'katalog'
  | 'kpr'
  | 'bandingkan'
  | 'testimoni'
  | 'berita'
  | 'faq';
export type AdminMenu = 'overview' | 'analytics' | 'properties' | 'leads' | 'settings';
