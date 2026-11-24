import React, { useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Search, Star, Trash2, Upload, X } from 'lucide-react';
import { ASSET_IMAGES, PRESET_PROPERTY_IMAGES } from '../../data/seedData';
import { processImageFileToDataUrl } from '../../services/imageUploadService';
import { getPropertySlug, slugify } from '../../services/seoService';
import { formatCompactRupiah } from '../../services/storageService';
import { ListingCategory, Property, PropertyStatus, PropertyType } from '../../types';
import { SafeImage } from '../common/SafeImage';

interface AdminPropertiesProps {
  properties: Property[];
  onSaveProperty: (property: Property) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
}

const FACILITY_PRESETS = [
  'One-Gate Security 24 Jam',
  'Sports Clubhouse & Kolam Renang',
  'Smart Home & Fiber Optic',
  'Taman Tematik & Jogging Track',
  'CCTV Kawasan 24 Jam',
  'Masjid & Sarana Ibadah',
  'Underground Utilities (Kabel Bawah Tanah)',
  'EV Charger Ready',
];

const EMPTY_FORM: Omit<Property, 'id' | 'createdAt'> = {
  name: '',
  slug: '',
  cluster: 'Cluster Kemang Verde',
  type: 'Rumah',
  listingCategory: 'Primary',
  isFeatured: false,
  price: 2000000000,
  installmentText: '11 Jutaan/bln',
  landArea: 120,
  buildingArea: 105,
  bedrooms: 3,
  bathrooms: 2,
  carports: 2,
  status: 'Available',
  imageUrl: '',
  galleryUrls: [],
  floorplanUrl: '',
  videoUrl: '',
  virtualTourUrl: '',
  googleMapsUrl: '',
  locationAddress: '',
  city: 'Tangerang Selatan',
  facilities: ['One-Gate Security 24 Jam', 'Smart Home & Fiber Optic'],
  description: '',
  promoTag: '',
  highlights: [],
  nearbyAccess: [],
  sitePlanCoord: {
    x: 45,
    y: 45,
    blockCode: 'NEW-01',
  },
  specs: {
    structure: 'Beton bertulang SNI',
    walls: 'Bata ringan plester aci',
    flooring: 'Homogeneous tile 80x80 cm',
    sanitary: 'Toto / Kohler arsitektural',
    electricity: '3.500 VA bawah tanah',
    water: 'PDAM terpusat',
    certificate: 'SHM Pecah per Unit',
  },
};

export const AdminProperties: React.FC<AdminPropertiesProps> = ({
  properties,
  onSaveProperty,
  onDeleteProperty,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Property, 'id' | 'createdAt'>>(EMPTY_FORM);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      `${p.name} ${p.cluster} ${p.type} ${p.listingCategory || 'Primary'} ${p.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [properties, search]);

  const openAddModal = () => {
    setEditingId(null);
    setMediaError('');
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (property: Property) => {
    setEditingId(property.id);
    setMediaError('');
    setForm({
      name: property.name,
      slug: property.slug ?? '',
      cluster: property.cluster,
      type: property.type,
      listingCategory: property.listingCategory ?? 'Primary',
      isFeatured: Boolean(property.isFeatured),
      price: property.price,
      installmentText: property.installmentText,
      landArea: property.landArea,
      buildingArea: property.buildingArea,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      carports: property.carports,
      status: property.status,
      imageUrl: property.imageUrl,
      galleryUrls: property.galleryUrls?.length ? property.galleryUrls : [property.imageUrl],
      floorplanUrl: property.floorplanUrl,
      videoUrl: property.videoUrl ?? '',
      virtualTourUrl: property.virtualTourUrl ?? '',
      googleMapsUrl: property.googleMapsUrl ?? '',
      locationAddress: property.locationAddress ?? '',
      city: property.city ?? 'Tangerang Selatan',
      facilities: property.facilities ?? [],
      description: property.description,
      promoTag: property.promoTag ?? '',
      highlights: property.highlights ?? [],
      nearbyAccess: property.nearbyAccess ?? [],
      sitePlanCoord: property.sitePlanCoord ?? {
        x: 45,
        y: 45,
        blockCode: 'UNIT-01',
      },
      specs: property.specs ?? EMPTY_FORM.specs,
    });
    setIsModalOpen(true);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setMediaError('');
    setIsProcessingMedia(true);
    try {
      const results = await Promise.all(
        files.map((file) =>
          processImageFileToDataUrl(file, {
            maxDimension: 1400,
            quality: 0.84,
            preserveTransparency: false,
          })
        )
      );

      setForm((prev) => {
        const uploadedUrls = results.map((r) => r.dataUrl);
        const existingGallery = prev.galleryUrls.filter(Boolean);
        const nextGallery = [...existingGallery, ...uploadedUrls].slice(0, 8);
        const nextPrimary = prev.imageUrl || uploadedUrls[0] || '';
        return {
          ...prev,
          imageUrl: nextPrimary,
          galleryUrls: nextGallery,
        };
      });
    } catch (err) {
      setMediaError(
        err instanceof Error
          ? err.message
          : 'Gagal memproses foto dari galeri. Pastikan format gambar valid.'
      );
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleFloorplanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setMediaError('');
    setIsProcessingMedia(true);
    try {
      const processed = await processImageFileToDataUrl(file, {
        maxDimension: 1400,
        quality: 0.86,
        preserveTransparency: true,
      });
      setForm((prev) => ({ ...prev, floorplanUrl: processed.dataUrl }));
    } catch (err) {
      setMediaError(
        err instanceof Error ? err.message : 'Gagal memproses gambar denah lantai.'
      );
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleSelectPresetImage = (url: string) => {
    if (!url) return;
    setMediaError('');
    setForm((prev) => {
      const nextGallery = prev.galleryUrls.includes(url)
        ? prev.galleryUrls
        : [url, ...prev.galleryUrls].slice(0, 8);
      return {
        ...prev,
        imageUrl: url,
        galleryUrls: nextGallery,
      };
    });
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setForm((prev) => {
      const nextGallery = prev.galleryUrls.filter((_, idx) => idx !== idxToRemove);
      const removedUrl = prev.galleryUrls[idxToRemove];
      const nextPrimary =
        prev.imageUrl === removedUrl ? nextGallery[0] ?? '' : prev.imageUrl;
      return {
        ...prev,
        imageUrl: nextPrimary,
        galleryUrls: nextGallery,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setMediaError('Pilih minimal 1 foto unit atau poster promo langsung dari galeri HP/komputer.');
      return;
    }

    const existing = editingId ? properties.find((p) => p.id === editingId) : null;
    const orderedGallery = [
      form.imageUrl,
      ...form.galleryUrls.filter((url) => url && url !== form.imageUrl),
    ];

    const payload: Property = {
      ...form,
      slug: form.slug?.trim() ? slugify(form.slug) : slugify(form.name),
      id: editingId ?? `prop-${Date.now()}`,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      galleryUrls: orderedGallery,
      floorplanUrl: form.floorplanUrl || '',
      videoUrl: form.videoUrl?.trim() || undefined,
      virtualTourUrl: form.virtualTourUrl?.trim() || undefined,
      googleMapsUrl: form.googleMapsUrl?.trim() || undefined,
      locationAddress: form.locationAddress?.trim() || undefined,
      city: form.city?.trim() || undefined,
      facilities: (form.facilities ?? []).map((f) => f.trim()).filter(Boolean),
      promoTag: form.promoTag?.trim() || undefined,
      highlights: (form.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      nearbyAccess: (form.nearbyAccess ?? []).map((n) => n.trim()).filter(Boolean),
    };
    await onSaveProperty(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">Kelola Properti</h1>
          <p className="text-sm text-slate-600">
            Tambah, ubah harga, status unit, atau hapus unit. Perubahan langsung tampil di katalog publik.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Tambah Unit Baru</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama unit, cluster, atau tipe..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <span className="text-xs text-slate-500 tabular-nums">
          Total <strong className="text-slate-900">{filtered.length}</strong> unit properti
        </span>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="py-3 px-4 font-semibold">Unit Properti</th>
                <th className="py-3 px-4 font-semibold">Cluster</th>
                <th className="py-3 px-4 font-semibold">Tipe</th>
                <th className="py-3 px-4 font-semibold">Spesifikasi</th>
                <th className="py-3 px-4 font-semibold">Harga</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    Tidak ada properti ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-14 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.name}
                            fitMode="adaptive"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.installmentText}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-700 whitespace-nowrap">
                      {item.cluster}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-900">{item.type}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-mono tabular-nums whitespace-nowrap">
                      LT {item.landArea} · LB {item.buildingArea} · {item.bedrooms}KT/{item.bathrooms}KM
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-950 tabular-nums whitespace-nowrap">
                      {formatCompactRupiah(item.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          item.status === 'Promo'
                            ? 'bg-amber-100 text-amber-900'
                            : item.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {confirmDeleteId === item.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await onDeleteProperty(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit properti"
                            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            title="Hapus properti"
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Property Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit Unit Properti' : 'Tambah Unit Properti Baru'}
        >
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-950">
                {editingId ? 'Edit Unit Properti' : 'Tambah Unit Properti Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Amara Residence Tipe 120"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cluster / Kawasan *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.cluster}
                    onChange={(e) => setForm({ ...form, cluster: e.target.value })}
                    placeholder="Contoh: Cluster Kemang Verde"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      URL Slug Unit (SEO) — Opsional
                    </label>
                    <span className="text-[11px] font-mono text-amber-800">
                      #/unit/{getPropertySlug({ name: form.name || 'nama-unit', slug: form.slug })}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.slug ?? ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder={slugify(form.name || 'amara-residence-tipe-120')}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Properti
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="Rumah">Rumah</option>
                    <option value="Villa">Villa</option>
                    <option value="Ruko">Ruko</option>
                    <option value="Apartemen">Apartemen</option>
                    <option value="Kavling">Kavling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Pasar (Primary / Secondary)
                  </label>
                  <select
                    value={form.listingCategory || 'Primary'}
                    onChange={(e) =>
                      setForm({ ...form, listingCategory: e.target.value as ListingCategory })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="Primary">Primary (Unit Baru Developer)</option>
                    <option value="Secondary">Secondary (Siap Huni / Seken)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Unit
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as PropertyStatus })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="Available">Available (Tersedia)</option>
                    <option value="Promo">Promo Spesial</option>
                    <option value="Sold Out">Sold Out / Terjual</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="w-full h-10 px-3.5 rounded-lg border border-amber-300 bg-amber-50/70 flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.isFeatured)}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-amber-600"
                    />
                    <span className="text-xs font-bold text-amber-950">
                      Tandai sebagai Property Unggulan
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga (Angka Rupiah) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000000}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teks Estimasi Cicilan
                  </label>
                  <input
                    type="text"
                    required
                    value={form.installmentText}
                    onChange={(e) => setForm({ ...form, installmentText: e.target.value })}
                    placeholder="Contoh: 9 Jutaan/bln"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Luas Tanah (m²)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.landArea}
                    onChange={(e) => setForm({ ...form, landArea: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Luas Bangunan (m²)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.buildingArea}
                    onChange={(e) => setForm({ ...form, buildingArea: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kamar Tidur
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kamar Mandi
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Carport</label>
                  <input
                    type="number"
                    min={0}
                    value={form.carports}
                    onChange={(e) => setForm({ ...form, carports: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Media Direct Gallery Upload (HP / Komputer) */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Foto Properti / Poster Promo (Langsung dari Galeri HP & Komputer)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Mendukung ukuran apa pun (potret, kotak, maupun lanskap) dan otomatis disesuaikan tanpa memotong tulisan atau gambar penting.
                    </p>
                  </div>
                  {isProcessingMedia && (
                    <span className="text-[11px] font-semibold text-amber-700 animate-pulse shrink-0">
                      Memproses & menyesuaikan gambar...
                    </span>
                  )}
                </div>

                {mediaError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                    {mediaError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foto Utama & Galeri */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        Foto Utama & Galeri Unit *
                      </span>
                      <span className="text-[11px] text-slate-500">Maks. 8 foto</span>
                    </div>

                    {form.imageUrl ? (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <SafeImage
                          src={form.imageUrl}
                          alt="Preview Foto Utama"
                          fitMode="adaptive"
                          className="w-full h-full"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-semibold">
                          Foto Utama · Auto-Fit Aktif
                        </span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/40 transition-colors text-center cursor-pointer">
                        <ImagePlus className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Ketuk untuk Ambil Foto dari Galeri HP / Komputer
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Bisa pilih foto rumah, flyer promo potret, atau banyak foto sekaligus
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="sr-only"
                        />
                      </label>
                    )}

                    {/* Thumbnails Galeri & Tombol Tambah Foto */}
                    {form.galleryUrls.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {form.galleryUrls.map((url, idx) => {
                          const isPrimary = url === form.imageUrl;
                          return (
                            <div
                              key={`${url.slice(0, 32)}-${idx}`}
                              className={`relative w-16 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                isPrimary ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, imageUrl: url }))}
                                title="Jadikan foto utama"
                                className="w-full h-full cursor-pointer"
                              >
                                <SafeImage
                                  src={url}
                                  alt={`Foto ${idx + 1}`}
                                  fitMode="adaptive"
                                  className="w-full h-full"
                                />
                              </button>
                              {isPrimary && (
                                <span
                                  title="Foto Utama"
                                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center pointer-events-none"
                                >
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                aria-label="Hapus foto"
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}

                        <label className="inline-flex flex-col items-center justify-center w-16 h-14 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 text-slate-600 hover:text-slate-950 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-semibold">Tambah</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{form.imageUrl ? 'Tambah / Ganti Foto' : 'Pilih dari Galeri'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryUpload}
                          className="sr-only"
                        />
                      </label>

                      <select
                        value=""
                        onChange={(e) => handleSelectPresetImage(e.target.value)}
                        aria-label="Pilih contoh gambar bawaan"
                        className="flex-1 min-w-[160px] h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700"
                      >
                        <option value="">Atau pakai contoh gambar bawaan...</option>
                        {PRESET_PROPERTY_IMAGES.map((img) => (
                          <option key={img.url} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Denah Lantai (Floorplan) */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          Denah Lantai / Floorplan (Opsional)
                        </span>
                        {form.floorplanUrl && (
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, floorplanUrl: '' }))}
                            className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Hapus Denah
                          </button>
                        )}
                      </div>

                      {form.floorplanUrl ? (
                        <div className="aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                          <SafeImage
                            src={form.floorplanUrl}
                            alt="Preview Denah Lantai"
                            fitMode="adaptive"
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-slate-400 transition-colors text-center cursor-pointer">
                          <Upload className="w-7 h-7 text-slate-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              Unggah Gambar Denah dari Galeri HP / Komputer
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Boleh dikosongkan jika hanya memakai poster promo / foto fasad
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFloorplanUpload}
                            className="sr-only"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>{form.floorplanUrl ? 'Ganti Denah' : 'Pilih File Denah'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFloorplanUpload}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, floorplanUrl: ASSET_IMAGES.floorplan }))
                        }
                        className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Pakai Denah Contoh
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Promo Unit (Opsional — muncul sebagai banner menarik di Detail Properti)
                </label>
                <input
                  type="text"
                  value={form.promoTag ?? ''}
                  onChange={(e) => setForm({ ...form, promoTag: e.target.value })}
                  placeholder="Contoh: Free Kanopi Kaca, AC 3 Unit & Bebas Biaya BPHTB hingga Akhir Bulan"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Lengkap Unit
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan konsep arsitektur, keunggulan orientasi, dan material utama..."
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keunggulan Utama (1 poin per baris)
                  </label>
                  <textarea
                    rows={3}
                    value={(form.highlights ?? []).join('\n')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        highlights: e.target.value.split('\n'),
                      })
                    }
                    placeholder={'Smart Door Lock + CCTV\nDouble Carport Kanopi\nPlafon Tinggi 3,6 Meter'}
                    className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Aksesibilitas &amp; Fasilitas Terdekat (1 poin per baris)
                  </label>
                  <textarea
                    rows={3}
                    value={(form.nearbyAccess ?? []).join('\n')}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nearbyAccess: e.target.value.split('\n'),
                      })
                    }
                    placeholder={'5 Menit ke Gerbang Tol\n3 Menit ke Fresh Market\n7 Menit ke RS Internasional'}
                    className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Lokasi, Google Maps, Video Property & 360° Virtual Tour */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Lokasi Properti, Google Maps, Video &amp; 360° Virtual Tour
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tambahkan alamat lengkap, tautan Google Maps, link YouTube/MP4 video unit, atau embed 360° Virtual Tour (Kuula / Matterport).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat Lokasi Unit
                    </label>
                    <input
                      type="text"
                      value={form.locationAddress ?? ''}
                      onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
                      placeholder="Jl. Kemang Verde Blok A1, Bintaro"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kota / Wilayah
                    </label>
                    <input
                      type="text"
                      value={form.city ?? ''}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Tangerang Selatan"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Link Google Maps (Opsional — otomatis membuat peta interaktif dari alamat jika kosong)
                    </label>
                    <input
                      type="url"
                      value={form.googleMapsUrl ?? ''}
                      onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      URL Video Properti (YouTube / Vimeo / MP4)
                    </label>
                    <input
                      type="url"
                      value={form.videoUrl ?? ''}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      URL 360° Virtual Tour (Kuula / Matterport / Street View)
                    </label>
                    <input
                      type="url"
                      value={form.virtualTourUrl ?? ''}
                      onChange={(e) => setForm({ ...form, virtualTourUrl: e.target.value })}
                      placeholder="https://kuula.co/share/..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Fasilitas Properti */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Fasilitas Properti &amp; Kawasan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Centang fasilitas yang tersedia atau ubah daftar fasilitas per baris.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_PRESETS.map((preset) => {
                    const active = (form.facilities ?? []).includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const current = form.facilities ?? [];
                          setForm({
                            ...form,
                            facilities: active
                              ? current.filter((f) => f !== preset)
                              : [...current, preset],
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#A31C24] text-white border-[#A31C24]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spesifikasi Teknis & Jenis Sertifikat */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Jenis Sertifikat &amp; Spesifikasi Teknis Bangunan
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jenis Sertifikat / Legalitas
                    </label>
                    <input
                      type="text"
                      value={form.specs.certificate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specs: { ...form.specs, certificate: e.target.value },
                        })
                      }
                      placeholder="SHM Pecah per Unit / SHGB Murni"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Daya Listrik
                    </label>
                    <input
                      type="text"
                      value={form.specs.electricity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specs: { ...form.specs, electricity: e.target.value },
                        })
                      }
                      placeholder="4.400 VA kabel bawah tanah"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sumber Air
                    </label>
                    <input
                      type="text"
                      value={form.specs.water}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specs: { ...form.specs, water: e.target.value },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Struktur Bangunan
                    </label>
                    <input
                      type="text"
                      value={form.specs.structure}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specs: { ...form.specs, structure: e.target.value },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Koordinat Peta Site Plan Interaktif
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Atur kode blok serta posisi koordinat pin unit pada peta kawasan (0–100%).
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kode Blok / Kavling
                    </label>
                    <input
                      type="text"
                      value={form.sitePlanCoord?.blockCode ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sitePlanCoord: {
                            x: form.sitePlanCoord?.x ?? 45,
                            y: form.sitePlanCoord?.y ?? 45,
                            blockCode: e.target.value,
                          },
                        })
                      }
                      placeholder="Contoh: KV-A1"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Posisi Horizontal X (%)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={95}
                      value={form.sitePlanCoord?.x ?? 45}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sitePlanCoord: {
                            blockCode: form.sitePlanCoord?.blockCode ?? 'UNIT',
                            y: form.sitePlanCoord?.y ?? 45,
                            x: Math.min(95, Math.max(5, Number(e.target.value))),
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Posisi Vertikal Y (%)
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={92}
                      value={form.sitePlanCoord?.y ?? 45}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sitePlanCoord: {
                            blockCode: form.sitePlanCoord?.blockCode ?? 'UNIT',
                            x: form.sitePlanCoord?.x ?? 45,
                            y: Math.min(92, Math.max(8, Number(e.target.value))),
                          },
                        })
                      }
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
