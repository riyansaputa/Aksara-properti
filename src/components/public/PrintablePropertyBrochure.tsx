import React from 'react';
import { getPropertySlug } from '../../services/seoService';
import { calculateKPR, formatCompactRupiah, formatRupiah } from '../../services/storageService';
import { Property, SiteSettings } from '../../types';
import { QrCodeSvg } from '../common/QrCodeSvg';

interface PrintablePropertyBrochureProps {
  property: Property | null;
  settings: SiteSettings;
}

export const PrintablePropertyBrochure: React.FC<PrintablePropertyBrochureProps> = ({
  property,
  settings,
}) => {
  if (!property) return null;

  const slug = getPropertySlug(property);
  const origin =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://aksararaya.id/';
  const qrUrl = `${origin}?src=qr&unit=${encodeURIComponent(slug)}#/unit/${slug}`;

  const kpr10 = calculateKPR(property.price, 20, 10, settings.defaultInterestRate);
  const kpr15 = calculateKPR(property.price, 20, 15, settings.defaultInterestRate);
  const kpr20 = calculateKPR(property.price, 20, 20, settings.defaultInterestRate);

  return (
    <div id="printable-brochure-root" className="hidden print:block bg-white text-slate-900 p-8">
      {/* Header Brand Strip */}
      <div className="flex items-center justify-between gap-6 pb-4 border-b-2 border-[#A31C24]">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A31C24]">
            E-BROSUR RESMI PROPERTI · {(property.listingCategory || 'Primary').toUpperCase()}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-950 mt-0.5">
            {settings.developerName} — {settings.projectName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">{settings.officeAddress}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-slate-900">{settings.marketingName}</p>
          <p className="font-mono text-xs text-[#A31C24] font-semibold">
            WhatsApp: +{settings.whatsappNumber}
          </p>
          <p className="text-[11px] text-slate-500">{settings.officeEmail}</p>
        </div>
      </div>

      {/* Main Unit Headline & Price */}
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded bg-[#A31C24] text-white text-[10px] font-bold uppercase tracking-wide mb-2">
            {property.type} · {property.status === 'Sold Out' ? settings.soldOutLabel || 'Terjual' : property.status}
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-950">{property.name}</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {property.cluster}
            {property.locationAddress ? ` · ${property.locationAddress}` : ''}
          </p>
        </div>

        <div className="text-right p-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-500">Harga Penawaran</p>
          <p className="font-mono text-xl font-bold text-[#A31C24]">
            {formatRupiah(property.price)}
          </p>
          <p className="text-[11px] text-slate-600">Cicilan mulai {property.installmentText}</p>
        </div>
      </div>

      {/* Hero Photo & Floorplan Grid */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        <div className="col-span-7 rounded-xl overflow-hidden border border-slate-200 h-[250px]">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="col-span-5 rounded-xl overflow-hidden border border-slate-200 h-[250px] bg-slate-50 flex items-center justify-center p-2">
          {property.floorplanUrl ? (
            <img
              src={property.floorplanUrl}
              alt={`Denah ${property.name}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-xs text-slate-500 text-center px-4">
              Hubungi marketing untuk salinan denah blok terperinci.
            </p>
          )}
        </div>
      </div>

      {/* Promo Tag */}
      {property.promoTag && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs">
          <strong className="text-amber-900">Promo Spesial: </strong>
          <span className="text-slate-900">{property.promoTag}</span>
        </div>
      )}

      {/* Description & Key Metrics */}
      <div className="mt-4 grid grid-cols-12 gap-5">
        <div className="col-span-7 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
              Deskripsi Unit
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">{property.description}</p>
          </div>

          {property.facilities && property.facilities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Fasilitas Kawasan & Hunian
              </h3>
              <p className="text-xs text-slate-700">{property.facilities.join(' · ')}</p>
            </div>
          )}

          {property.nearbyAccess && property.nearbyAccess.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                Aksesibilitas Terdekat
              </h3>
              <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                {property.nearbyAccess.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-5 space-y-3">
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-100 text-[11px] font-bold text-slate-800">
              Spesifikasi Teknis & Dimensi
            </div>
            <table className="w-full text-[11px]">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-3 py-1.5 text-slate-500">Dimensi LT / LB</td>
                  <td className="px-3 py-1.5 font-mono font-semibold text-right">
                    {property.landArea} m² / {property.buildingArea} m²
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-500">KT / KM / Carport</td>
                  <td className="px-3 py-1.5 font-mono font-semibold text-right">
                    {property.bedrooms} KT · {property.bathrooms} KM · {property.carports} Mobil
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-500">Sertifikat</td>
                  <td className="px-3 py-1.5 font-semibold text-right">
                    {property.specs?.certificate || 'SHM'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-500">Listrik / Air</td>
                  <td className="px-3 py-1.5 text-right">
                    {property.specs?.electricity || 'PLN'} · {property.specs?.water || 'PDAM'}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 text-slate-500">Struktur</td>
                  <td className="px-3 py-1.5 text-right">{property.specs?.structure}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom KPR Matrix + Scannable QR Code */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Estimasi Simulasi KPR (DP 20%: {formatCompactRupiah(kpr15.downPaymentAmount)} · Bunga{' '}
            {settings.defaultInterestRate}%/thn)
          </h3>
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500">Tenor 10 Tahun</p>
              <p className="font-mono font-bold text-slate-900">
                {formatRupiah(kpr10.monthlyInstallment)}/bln
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500">Tenor 15 Tahun</p>
              <p className="font-mono font-bold text-[#A31C24]">
                {formatRupiah(kpr15.monthlyInstallment)}/bln
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500">Tenor 20 Tahun</p>
              <p className="font-mono font-bold text-slate-900">
                {formatRupiah(kpr20.monthlyInstallment)}/bln
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
          <QrCodeSvg value={qrUrl} size={88} />
          <div className="text-[10px] text-slate-600 max-w-[140px]">
            <p className="font-bold text-slate-900 mb-0.5">Scan QR Unit Online</p>
            <p>Lihat galeri foto lengkap, peta Google Maps & update stok unit real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
