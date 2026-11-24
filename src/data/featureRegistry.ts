import { SiteSettings } from '../types';

export type BooleanSettingKey = {
  [K in keyof SiteSettings]: SiteSettings[K] extends boolean ? K : never;
}[keyof SiteSettings];

export interface FeatureToggleMeta {
  key: BooleanSettingKey;
  label: string;
  description: string;
  group: 'sections' | 'features';
}

export const SITE_TOGGLE_REGISTRY: FeatureToggleMeta[] = [
  // 1. Seksi & Konten Halaman Publik
  {
    key: 'topPromoBannerEnabled',
    label: 'Banner Promo Paling Atas',
    description: 'Spanduk visual promosi di bagian atas halaman atau area sorotan utama.',
    group: 'sections',
  },
  {
    key: 'navbarEnabled',
    label: 'Header & Navigasi Atas (Navbar)',
    description: 'Bilah menu navigasi utama, logo brand, favorit, dan tombol aksi di atas.',
    group: 'sections',
  },
  {
    key: 'heroEnabled',
    label: 'Hero Panorama Utama',
    description: 'Bagian latar foto kawasan dan judul utama di halaman awal.',
    group: 'sections',
  },
  {
    key: 'heroSliderEnabled',
    label: 'Homepage Image Slider',
    description: 'Pergantian slide foto hero kawasan secara otomatis & interaktif.',
    group: 'sections',
  },
  {
    key: 'heroSearchEnabled',
    label: 'Kotak Pencarian Properti Hero',
    description: 'Formulir pencarian lengkap (tipe, Primary/Secondary, cluster, status).',
    group: 'sections',
  },
  {
    key: 'highlightsEnabled',
    label: '3 Kartu Sorotan Utama (Highlights)',
    description: 'Kartu promo utama, advisor resmi, dan shortcut masterplan kawasan.',
    group: 'sections',
  },
  {
    key: 'pillarsEnabled',
    label: '4 Poin Keunggulan Kawasan',
    description: 'Strip nilai jual utama kawasan di bawah kartu sorotan.',
    group: 'sections',
  },
  {
    key: 'catalogEnabled',
    label: 'Seksi Katalog Properti',
    description: 'Daftar unit properti dengan filter cluster, jenis, status, & sertifikat.',
    group: 'sections',
  },
  {
    key: 'sitePlanEnabled',
    label: 'Site Plan Peta Kawasan Interaktif',
    description: 'Tampilan peta blok interaktif yang bisa diklik langsung oleh konsumen.',
    group: 'sections',
  },
  {
    key: 'kprEnabled',
    label: 'Seksi Kalkulator Simulasi KPR',
    description: 'Kalkulator cicilan KPR real-time berdasarkan harga, DP, tenor, & bunga.',
    group: 'sections',
  },
  {
    key: 'bankPartnersEnabled',
    label: 'Partners Bank KPR Resmi',
    description: 'Daftar mitra bank KPR beserta promo bunga, minimal DP, & tenor maksimal.',
    group: 'sections',
  },
  {
    key: 'compareEnabled',
    label: 'Seksi Bandingkan Hingga 3 Unit',
    description: 'Tabel perbandingan spesifikasi teknis & harga antar unit pilihan.',
    group: 'sections',
  },
  {
    key: 'testimonialsEnabled',
    label: 'Seksi Testimoni Penghuni & Investor',
    description: 'Ulasan pembeli asli, rating bintang, & kisah serah terima unit.',
    group: 'sections',
  },
  {
    key: 'blogEnabled',
    label: 'Seksi Berita Kawasan & Artikel',
    description: 'Publikasi artikel progres proyek, tips KPR, dan panduan properti.',
    group: 'sections',
  },
  {
    key: 'faqEnabled',
    label: 'Seksi FAQ (Tanya Jawab)',
    description: 'Daftar pertanyaan umum legalitas, pembayaran, & fasilitas kawasan.',
    group: 'sections',
  },
  {
    key: 'footerEnabled',
    label: 'Seksi Footer Bawah & Info Kantor',
    description: 'Kolom profil developer, navigasi footer, sosmed, dan login admin.',
    group: 'sections',
  },
  {
    key: 'mobileBottomNavEnabled',
    label: 'Bar Navigasi Bawah Mobile',
    description: 'Menu cepat melayang khusus tampilan HP di bagian bawah layar.',
    group: 'sections',
  },

  // 2. Fitur Interaksi, Media, SEO & Konversi
  {
    key: 'contactFormEnabled',
    label: 'Contact Form & Modal Jadwal Survey',
    description: 'Formulir pengumpulan data prospek (Leads CRM) sebelum terhubung ke WA.',
    group: 'features',
  },
  {
    key: 'whatsappCtaEnabled',
    label: 'Tombol WhatsApp & CTA Marketing',
    description: 'Tombol chat WhatsApp di kartu unit, detail properti, header, dan mobile.',
    group: 'features',
  },
  {
    key: 'autoReplyEnabled',
    label: 'Auto-Reply Pesan WhatsApp',
    description: 'Otomatis menyiapkan balasan terpersonalisasi setelah form leads dikirim.',
    group: 'features',
  },
  {
    key: 'chatbotEnabled',
    label: 'Chatbot AI Property Assistant (Gemini)',
    description: 'Asisten virtual 24 jam di pojok kanan bawah berbasis katalog & settings.',
    group: 'features',
  },
  {
    key: 'wishlistEnabled',
    label: 'Fitur Favorit / Wishlist Unit',
    description: 'Tombol hati simpan unit favorit di kartu unit, detail, dan header.',
    group: 'features',
  },
  {
    key: 'enablePropertyPrintAndPdf',
    label: 'Generator Brosur PDF & Print Properti',
    description: 'Tombol cetak halaman & unduh E-Brosur A4 lengkap dengan QR Code.',
    group: 'features',
  },
  {
    key: 'enableSocialShare',
    label: 'Tombol Bagikan WhatsApp & Sosmed',
    description: 'Bagikan unit & artikel ke WhatsApp, Facebook, X/Twitter, Telegram, & salin link.',
    group: 'features',
  },
  {
    key: 'enableQrCode',
    label: 'QR Code Unik per Listing',
    description: 'QR Code siap scan & unduh PNG dengan pelacakan sumber kunjungan otomatis.',
    group: 'features',
  },
  {
    key: 'enableVideoAndTour',
    label: 'Video Property & 360° Virtual Tour',
    description: 'Tab video show unit & tur virtual 360° di detail properti serta badge kartu.',
    group: 'features',
  },
  {
    key: 'enableGoogleMaps',
    label: 'Peta Lokasi & Google Maps',
    description: 'Peta Google Maps interaktif di detail unit dan tautan lokasi kantor di footer.',
    group: 'features',
  },
  {
    key: 'seoRobotsIndex',
    label: 'Indeks Pencarian Google (SEO Index)',
    description: 'Mengizinkan mesin pencari mengindeks seluruh halaman & listing properti.',
    group: 'features',
  },
  {
    key: 'seoAutoSchemaEnabled',
    label: 'Schema.org JSON-LD Rich Snippets',
    description: 'Menyisipkan metadata harga properti, FAQ, dan artikel otomatis untuk Google.',
    group: 'features',
  },
  {
    key: 'enableEnhancedConversions',
    label: 'Enhanced Conversions (GA4 / Ads / Pixel)',
    description: 'Mengirim parameter nilai harga properti (IDR) pada event konversi iklan.',
    group: 'features',
  },
];

export function isSettingEnabled(settings: SiteSettings, key: BooleanSettingKey): boolean {
  return settings[key] !== false;
}
