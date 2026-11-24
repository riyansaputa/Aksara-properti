import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Power,
  Settings,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  BooleanSettingKey,
  isSettingEnabled,
  SITE_TOGGLE_REGISTRY,
} from '../../data/featureRegistry';
import { AdminMenu, Lead, Property, SiteSettings } from '../../types';

interface AdminOverviewProps {
  properties: Property[];
  leads: Lead[];
  settings: SiteSettings;
  onNavigateMenu: (menu: AdminMenu) => void;
  onQuickToggleSetting: (key: BooleanSettingKey, nextValue: boolean) => Promise<void>;
  onBulkToggleSettings: (patch: Partial<SiteSettings>, notice: string) => Promise<void>;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  properties,
  leads,
  settings,
  onNavigateMenu,
  onQuickToggleSetting,
  onBulkToggleSettings,
}) => {
  const [controlGroupFilter, setControlGroupFilter] = useState<'all' | 'sections' | 'features'>(
    'all'
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const activePropertiesCount = properties.filter((p) => p.status !== 'Sold Out').length;
  const surveyCount = leads.filter((l) => l.status === 'Jadwal Survey').length;
  const closingCount = leads.filter((l) => l.status === 'Closing').length;

  const activeFeaturesCount = useMemo(
    () => SITE_TOGGLE_REGISTRY.filter((item) => isSettingEnabled(settings, item.key)).length,
    [settings]
  );

  const visibleToggles = useMemo(() => {
    if (controlGroupFilter === 'all') return SITE_TOGGLE_REGISTRY;
    return SITE_TOGGLE_REGISTRY.filter((item) => item.group === controlGroupFilter);
  }, [controlGroupFilter]);

  const clusterChartData = useMemo(() => {
    const counts = new Map<string, number>();
    properties.forEach((p) => {
      if (p.cluster && !counts.has(p.cluster)) counts.set(p.cluster, 0);
    });
    leads.forEach((l) => {
      const key = l.cluster || 'Lainnya';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const entries = Array.from(counts.entries()).map(([cluster, count]) => ({
      cluster,
      count,
    }));
    const maxCount = Math.max(1, ...entries.map((e) => e.count));
    return { entries, maxCount };
  }, [properties, leads]);

  const recentLeads = leads.slice(0, 5);

  const stats = [
    {
      label: 'Total Unit Tayang',
      value: activePropertiesCount,
      sub: `Dari ${properties.length} total inventaris`,
      icon: Building2,
    },
    {
      label: 'Total Leads Masuk',
      value: leads.length,
      sub: `${leads.filter((l) => l.status === 'New Lead').length} belum ditindaklanjuti`,
      icon: Users,
    },
    {
      label: 'Jadwal Survey Aktif',
      value: surveyCount,
      sub: 'Kunjungan lokasi terjadwal',
      icon: CalendarCheck,
    },
    {
      label: 'Total Closing',
      value: closingCount,
      sub: `${leads.filter((l) => l.status === 'Booking Fee').length} dalam tahap Booking Fee`,
      icon: CheckCircle2,
    },
  ];

  const handleToggle = async (key: BooleanSettingKey, nextValue: boolean) => {
    setSavingKey(key);
    try {
      await onQuickToggleSetting(key, nextValue);
    } finally {
      setSavingKey(null);
    }
  };

  const handleEnableAll = async () => {
    setSavingKey('__bulk_all__');
    const patch: Partial<SiteSettings> = {};
    for (const item of SITE_TOGGLE_REGISTRY) {
      patch[item.key] = true;
    }
    try {
      await onBulkToggleSettings(patch, 'Seluruh seksi & fitur website berhasil diaktifkan.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleDisableOptionalSections = async () => {
    setSavingKey('__bulk_minimal__');
    const patch: Partial<SiteSettings> = {
      navbarEnabled: true,
      heroEnabled: true,
      heroSearchEnabled: true,
      catalogEnabled: true,
      footerEnabled: true,
      topPromoBannerEnabled: false,
      heroSliderEnabled: false,
      highlightsEnabled: false,
      pillarsEnabled: false,
      kprEnabled: false,
      bankPartnersEnabled: false,
      compareEnabled: false,
      testimonialsEnabled: false,
      blogEnabled: false,
      faqEnabled: false,
      chatbotEnabled: false,
      mobileBottomNavEnabled: false,
    };
    try {
      await onBulkToggleSettings(
        patch,
        'Mode fokus aktif — hanya Header, Pencarian, Katalog, & Footer yang tampil.'
      );
    } finally {
      setSavingKey(null);
    }
  };

  const getLeadStatusClass = (status: Lead['status']) => {
    switch (status) {
      case 'New Lead':
        return 'bg-sky-100 text-sky-900';
      case 'Follow Up':
        return 'bg-indigo-100 text-indigo-900';
      case 'Jadwal Survey':
        return 'bg-amber-100 text-amber-900';
      case 'Booking Fee':
        return 'bg-purple-100 text-purple-900';
      case 'Closing':
        return 'bg-emerald-100 text-emerald-900';
      case 'Batal':
        return 'bg-rose-100 text-rose-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Dashboard &amp; Pusat Kendali Admin
          </h1>
          <p className="text-sm text-slate-600">
            Aktif/nonaktifkan seluruh seksi konten &amp; fitur website, pantau performa listing, dan kelola prospek dari satu halaman.
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          <button
            type="button"
            onClick={() => onNavigateMenu('overview')}
            className="px-3.5 py-1.5 rounded-md bg-white text-slate-950 text-xs font-semibold shadow-xs cursor-pointer"
          >
            Ringkasan &amp; Kendali
          </button>
          <button
            type="button"
            onClick={() => onNavigateMenu('analytics')}
            className="px-3.5 py-1.5 rounded-md text-slate-600 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            Statistik Kunjungan
          </button>
          <button
            type="button"
            onClick={() => onNavigateMenu('properties')}
            className="px-3.5 py-1.5 rounded-md text-slate-600 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            Kelola Listing
          </button>
          <button
            type="button"
            onClick={() => onNavigateMenu('settings')}
            className="px-3.5 py-1.5 rounded-md text-slate-600 hover:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            Editor Konten &amp; SEO
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{stat.label}</p>
                <p className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* PUSAT KENDALI CEPAT: SAKLAR ON/OFF SEMUA SEKSI & FITUR */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold text-slate-950">
                  Pusat Kendali Seksi &amp; Semua Fitur Website
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold tabular-nums">
                  {activeFeaturesCount} / {SITE_TOGGLE_REGISTRY.length} Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik saklar untuk langsung mengaktifkan atau menonaktifkan konten section &amp; fitur secara real-time tanpa perlu klik simpan tambahan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={savingKey === '__bulk_all__'}
              onClick={handleEnableAll}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aktifkan Semua</span>
            </button>
            <button
              type="button"
              disabled={savingKey === '__bulk_minimal__'}
              onClick={handleDisableOptionalSections}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <Power className="w-3.5 h-3.5 text-slate-500" />
              <span>Mode Ringkas</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateMenu('settings')}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-slate-950 text-amber-300 text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Isi Konten</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {[
              { id: 'all' as const, label: `Semua (${SITE_TOGGLE_REGISTRY.length})` },
              {
                id: 'sections' as const,
                label: `Seksi & Konten (${
                  SITE_TOGGLE_REGISTRY.filter((i) => i.group === 'sections').length
                })`,
              },
              {
                id: 'features' as const,
                label: `Fitur & Integrasi (${
                  SITE_TOGGLE_REGISTRY.filter((i) => i.group === 'features').length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setControlGroupFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  controlGroupFilter === tab.id
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Perubahan langsung tersimpan &amp; diterapkan ke website publik.
          </p>
        </div>

        {/* Interactive Feature Toggle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visibleToggles.map((item) => {
            const enabled = isSettingEnabled(settings, item.key);
            const busy = savingKey === item.key;
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                  enabled
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : 'bg-slate-50 border-slate-200 opacity-85'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        enabled ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <p className="text-xs font-bold text-slate-950 truncate">{item.label}</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Aktifkan atau nonaktifkan ${item.label}`}
                  disabled={busy}
                  onClick={() => handleToggle(item.key, !enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A31C24] ${
                    enabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cluster Performance Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-slate-950">
                Performa Leads per Cluster
              </h2>
              <p className="text-xs text-slate-500">Distribusi prospek masuk berdasarkan kawasan</p>
            </div>
          </div>

          <div className="space-y-4">
            {clusterChartData.entries.map((entry) => {
              const widthPct = Math.max(8, Math.round((entry.count / clusterChartData.maxCount) * 100));
              return (
                <div key={entry.cluster}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-800 truncate pr-3">{entry.cluster}</span>
                    <span className="font-mono font-bold text-slate-950 tabular-nums shrink-0">
                      {entry.count} leads
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-md bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${entry.count === 0 ? 0 : widthPct}%` }}
                      className="h-full bg-slate-900 rounded-md transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Recent Leads Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-950">5 Prospek Terbaru</h2>
              <p className="text-xs text-slate-500">Data langsung dari formulir & simulasi KPR website</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateMenu('leads')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer whitespace-nowrap"
            >
              Kelola Semua Leads
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="py-2.5 px-4 font-semibold">Konsumen</th>
                  <th className="py-2.5 px-4 font-semibold">Unit Diminati</th>
                  <th className="py-2.5 px-4 font-semibold">Sumber</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-slate-500">
                      Belum ada data prospek masuk.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-950 text-xs sm:text-sm">{lead.name}</p>
                        <p className="font-mono text-xs text-slate-500 tabular-nums">{lead.phone}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs font-medium text-slate-900">{lead.propertyName}</p>
                        <p className="text-[11px] text-slate-500">{lead.cluster}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{lead.source}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${getLeadStatusClass(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
