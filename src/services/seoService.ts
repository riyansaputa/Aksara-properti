import { BlogPostItem, Property, PublicSection, SiteSettings } from '../types';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getPropertySlug(property: Pick<Property, 'name' | 'slug'>): string {
  const custom = property.slug?.trim();
  return custom ? slugify(custom) : slugify(property.name);
}

export function getBlogSlug(post: Pick<BlogPostItem, 'title' | 'slug'>): string {
  const custom = post.slug?.trim();
  return custom ? slugify(custom) : slugify(post.title);
}

const SECTION_HASH_MAP: Record<PublicSection, string> = {
  beranda: '#/beranda',
  katalog: '#/katalog',
  kpr: '#/simulasi-kpr',
  bandingkan: '#/bandingkan-unit',
  testimoni: '#/testimoni',
  berita: '#/berita',
  faq: '#/faq',
};

export function getSectionHash(section: PublicSection): string {
  return SECTION_HASH_MAP[section] || '#/beranda';
}

export function resolveHashRoute(
  hash: string,
  properties: Property[],
  blogPosts: BlogPostItem[]
): {
  section?: PublicSection;
  property?: Property;
  blogPost?: BlogPostItem;
} {
  const clean = hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (!clean) return {};

  if (clean.startsWith('unit/')) {
    const targetSlug = clean.slice('unit/'.length);
    const matched = properties.find((p) => getPropertySlug(p) === targetSlug || p.id === targetSlug);
    if (matched) return { property: matched, section: 'katalog' };
  }

  if (clean.startsWith('artikel/') || clean.startsWith('berita/')) {
    const targetSlug = clean.replace(/^(artikel|berita)\//, '');
    const matched = blogPosts.find((b) => getBlogSlug(b) === targetSlug || b.id === targetSlug);
    if (matched) return { blogPost: matched, section: 'berita' };
  }

  if (clean === 'simulasi-kpr' || clean === 'kpr') return { section: 'kpr' };
  if (clean === 'bandingkan-unit' || clean === 'bandingkan') return { section: 'bandingkan' };
  if (clean === 'katalog') return { section: 'katalog' };
  if (clean === 'testimoni') return { section: 'testimoni' };
  if (clean === 'berita') return { section: 'berita' };
  if (clean === 'faq') return { section: 'faq' };
  if (clean === 'beranda') return { section: 'beranda' };

  return {};
}

export function updateBrowserHash(hash: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash === hash) return;
  try {
    window.history.replaceState(null, '', hash);
  } catch {
    // ignore in restricted environments
  }
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined' || !content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (typeof window === 'undefined') return pathOrUrl;
  if (!pathOrUrl) return `${window.location.origin}/`;
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const normalized = pathOrUrl.replace(/^\.\//, '/');
  return `${window.location.origin}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
}

export function applyRuntimeSeo(params: {
  settings: SiteSettings;
  properties: Property[];
  activeProperty?: Property | null;
  activeBlogPost?: BlogPostItem | null;
  activeSection?: PublicSection;
}): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const { settings, properties, activeProperty, activeBlogPost, activeSection } = params;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;

  const defaultTitle =
    settings.seoTitle?.trim() || `${settings.developerName} — ${settings.projectName}`;
  const defaultDesc =
    settings.seoDescription?.trim() ||
    settings.heroSubtitle ||
    `Website resmi ${settings.developerName} (${settings.projectName}).`;

  let pageTitle = defaultTitle;
  let pageDesc = defaultDesc;
  let canonicalUrl = baseUrl;
  let ogImage = toAbsoluteUrl(
    settings.seoOgImageUrl?.trim() ||
      settings.topPromoBannerImageUrl ||
      properties[0]?.imageUrl ||
      './assets/aistudio/AVELLA_DESKTOP_f6bf9c9d.jpg'
  );
  let ogType = 'website';

  if (activeProperty) {
    const slug = getPropertySlug(activeProperty);
    pageTitle = `${activeProperty.name} (${activeProperty.cluster}) — ${settings.developerName}`;
    pageDesc = `${activeProperty.name} di ${activeProperty.cluster}. LT ${activeProperty.landArea}m²${
      activeProperty.buildingArea > 0 ? ` / LB ${activeProperty.buildingArea}m²` : ''
    }. ${activeProperty.description.slice(0, 110)}`;
    canonicalUrl = `${baseUrl}#/unit/${slug}`;
    if (activeProperty.imageUrl && !activeProperty.imageUrl.startsWith('data:')) {
      ogImage = toAbsoluteUrl(activeProperty.imageUrl);
    }
    ogType = 'article';
  } else if (activeBlogPost) {
    const slug = getBlogSlug(activeBlogPost);
    pageTitle = `${activeBlogPost.title} — ${settings.developerName}`;
    pageDesc = activeBlogPost.excerpt.slice(0, 158);
    canonicalUrl = `${baseUrl}#/artikel/${slug}`;
    if (activeBlogPost.imageUrl && !activeBlogPost.imageUrl.startsWith('data:')) {
      ogImage = toAbsoluteUrl(activeBlogPost.imageUrl);
    }
    ogType = 'article';
  } else if (activeSection && activeSection !== 'beranda') {
    canonicalUrl = `${baseUrl}${getSectionHash(activeSection)}`;
  }

  document.title = pageTitle;
  upsertMetaTag('name', 'description', pageDesc);
  upsertMetaTag(
    'name',
    'robots',
    settings.seoRobotsIndex === false ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
  );
  if (settings.googleSiteVerification?.trim()) {
    upsertMetaTag('name', 'google-site-verification', settings.googleSiteVerification.trim());
  }
  if (settings.seoKeywords?.trim()) {
    upsertMetaTag('name', 'keywords', settings.seoKeywords.trim());
  }
  upsertCanonicalLink(canonicalUrl);

  upsertMetaTag('property', 'og:type', ogType);
  upsertMetaTag('property', 'og:site_name', settings.developerName);
  upsertMetaTag('property', 'og:title', pageTitle);
  upsertMetaTag('property', 'og:description', pageDesc);
  upsertMetaTag('property', 'og:url', canonicalUrl);
  upsertMetaTag('property', 'og:image', ogImage);

  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', pageTitle);
  upsertMetaTag('name', 'twitter:description', pageDesc);
  upsertMetaTag('name', 'twitter:image', ogImage);

  let scriptEl = document.getElementById('aksara-seo-jsonld') as HTMLScriptElement | null;
  if (settings.seoAutoSchemaEnabled === false) {
    if (scriptEl) scriptEl.remove();
    return;
  }

  // Build rich Schema.org @graph JSON-LD
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'RealEstateAgent',
      '@id': `${baseUrl}#organization`,
      name: settings.developerName,
      description: defaultDesc,
      url: baseUrl,
      email: settings.officeEmail,
      telephone: settings.whatsappNumber ? `+${settings.whatsappNumber}` : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.officeAddress,
        addressCountry: 'ID',
      },
      sameAs: Object.values(settings.footerSocialLinks || {}).filter((u) => Boolean(u && u.trim())),
    },
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      name: `${settings.developerName} — ${settings.projectName}`,
      url: baseUrl,
      inLanguage: 'id-ID',
      publisher: { '@id': `${baseUrl}#organization` },
    },
    {
      '@type': 'ItemList',
      name: settings.catalogTitle || 'Katalog Properti',
      numberOfItems: properties.length,
      itemListElement: properties.map((prop, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}#/unit/${getPropertySlug(prop)}`,
        item: {
          '@type': 'Product',
          name: prop.name,
          category: `${prop.listingCategory || 'Primary'} ${prop.type}`,
          description: prop.description,
          brand: { '@type': 'Brand', name: settings.developerName },
          offers: {
            '@type': 'Offer',
            price: prop.price,
            priceCurrency: 'IDR',
            availability:
              prop.status === 'Sold Out'
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            url: `${baseUrl}#/unit/${getPropertySlug(prop)}`,
          },
        },
      })),
    },
  ];

  if (settings.faqEnabled && settings.faqItems && settings.faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: settings.faqItems.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  if (settings.blogEnabled && settings.blogPosts && settings.blogPosts.length > 0) {
    graph.push({
      '@type': 'Blog',
      name: settings.blogTitle,
      blogPost: settings.blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        author: { '@type': 'Person', name: post.author },
        url: `${baseUrl}#/artikel/${getBlogSlug(post)}`,
      })),
    });
  }

  const ldJson = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'aksara-seo-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(ldJson);
}

export function buildAutoBoostedSeo(settings: SiteSettings, properties: Property[]): {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
} {
  const dev = settings.developerName.trim() || 'Aksara Raya';
  const project = settings.projectName.trim() || dev;
  const types = Array.from(new Set(properties.map((p) => p.type))).slice(0, 3);
  const clusters = Array.from(new Set(properties.map((p) => p.cluster))).slice(0, 3);

  let seoTitle = `${dev} — Rumah & Properti SHM Terpadu`;
  if (seoTitle.length < 34) {
    seoTitle = `${project} — Rumah, Ruko & Kavling SHM`;
  }
  if (seoTitle.length > 58) {
    seoTitle = `${dev} — Hunian Modern & Ruko SHM`;
  }

  const typePhrase = types.length > 0 ? types.join(', ') : 'Rumah, Ruko & Kavling';
  let seoDescription = `Temukan ${typePhrase} di ${project}. Legalitas SHM pecah, simulasi KPR real-time, site plan interaktif & promo KPR terbaik.`;
  if (seoDescription.length < 122) {
    seoDescription = `Jelajahi unit ${typePhrase} eksklusif di ${project}. Legalitas SHM terjamin, site plan interaktif, simulasi KPR & jadwal survey lokasi sekarang.`;
  }
  if (seoDescription.length > 158) {
    seoDescription = seoDescription.slice(0, 155).trimEnd() + '...';
  }

  const keywordSet = new Set<string>([
    dev.toLowerCase(),
    project.toLowerCase(),
    'jual rumah modern',
    'perumahan shm pecah',
    'simulasi kpr rumah',
    'properti primary secondary',
    ...types.map((t) => `${t.toLowerCase()} dijual`),
    ...clusters.map((c) => c.toLowerCase()),
  ]);

  return {
    seoTitle,
    seoDescription,
    seoKeywords: Array.from(keywordSet).slice(0, 10).join(', '),
  };
}
