import React, { useMemo, useState } from 'react';
import {
  Eye,
  FileDown,
  Flame,
  Globe,
  Monitor,
  MousePointerClick,
  Search,
  Share2,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildDemandTrendSeries,
  buildUnitInterestMatrix,
  buildVisitorOverviewReport,
} from '../../services/trackingService';
import { AdminMenu, Lead, Property } from '../../types';

interface AdminAnalyticsProps {
  properties: Property[];
  leads: Lead[];
  onNavigateMenu?: (menu: AdminMenu) => void;
}

const SOURCE_COLORS = ['#A31C24', '#1877F2', '#0f172a', '#1DB954', '#d97706', '#64748b'];

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  properties,
  leads,
  onNavigateMenu,
}) => {
  const [listingSearch, setListingSearch] = useState('');

  const unitMatrix = useMemo(
    () => buildUnitInterestMatrix(properties, leads),
    [properties, leads]
  );

  const filteredMatrix = useMemo(() => {
    const q = listingSearch.trim().toLowerCase();
    if (!q) return unitMatrix;
    return unitMatrix.filter((r) =>
      `${r.name} ${r.cluster} ${r.topSource} ${r.listingCategory}`.toLowerCase().includes(q)
    );
  }, [unitMatrix, listingSearch]);

  const trendSeries = useMemo(() => buildDemandTrendSeries(leads), [leads]);
  const visitorReport = useMemo(() => buildVisitorOverviewReport(properties), [properties]);

  const totals = useMemo(() => {
    const views = unitMatrix.reduce((acc, r) => acc + r.views, 0);
    const waClicks = unitMatrix.reduce((acc, r) => acc + r.waClicks, 0);
    const kprSims = unitMatrix.reduce((acc, r) => acc + r.kprSims, 0);
    const pdfOrPrints = unitMatrix.reduce((acc, r) => acc + r.pdfOrPrints, 0);
    const sharesCount = unitMatrix.reduce((acc, r) => acc + r.sharesCount, 0);
    const leadsCount = leads.length;
    const convRate = views > 0 ? ((waClicks / views) * 100).toFixed(1) : '0.0';
    return { views, waClicks, kprSims, pdfOrPrints, sharesCount, leadsCount, convRate };
  }, [unitMatrix, leads.length]);

  const maxes = useMemo(() => {
    return {
      views: Math.max(1, ...unitMatrix.map((u) => u.views)),
      kpr: Math.max(1, ...unitMatrix.map((u) => u.kprSims)),
      wa: Math.max(1, ...unitMatrix.map((u) => u.waClicks)),
      leads: Math.max(1, ...unitMatrix.map((u) => u.leadsCount)),
      score: Math.max(1, ...unitMatrix.map((u) => u.interestScore)),
    };
  }, [unitMatrix]);

  const getHeatCellClass = (value: number, max: number) => {
    const ratio = max > 0 ? value / max : 0;
    if (ratio >= 0.75) return 'bg-rose-600 text-white font-bold';
    if (ratio >= 0.5) return 'bg-amber-500 text-slate-950 font-semibold';
    if (ratio >= 0.25) return 'bg-amber-100 text-amber-950 font-medium';
    return 'bg-slate-100 text-slate-700';
  };

  const getPriorityBadgeClass = (
    label: ReturnType<typeof buildUnitInterestMatrix>[number]['priorityLabel']
  ) => {
    switch (label) {
      case 'Prioritas Iklan Tinggi':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
      case 'Optimasi Promo / CTA':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'Alihkan Traffic':
        return 'bg-slate-200 text-slate-700 border border-slate-300';
      default:
        return 'bg-sky-100 text-sky-900 border border-sky-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">
            Statistik Kunjungan &amp; Laporan Pengunjung per Listing
          </h1>
          <p className="text-sm text-slate-600">
            Laporan terperinci jumlah pengunjung, sumber traffic, halaman paling banyak dikunjungi, unduhan brosur PDF, dan performa konversi tiap unit properti.
          </p>
        </div>

        {onNavigateMenu && (
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start shrink-0">
            <button
              type="button"
              onClick={() => onNavigateMenu('overview')}
              className="px-3.5 py-1.5 rounded-md text-slate-600 hover:text-slate-950 text-xs font-medium cursor-pointer"
            >
              Ringkasan
            </button>
            <button
              type="button"
              onClick={() => onNavigateMenu('analytics')}
              className="px-3.5 py-1.5 rounded-md bg-white text-slate-950 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Statistik Kunjungan
            </button>
          </div>
        )}
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Tayangan Halaman</p>
            <p className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
              {visitorReport.totalPageviews.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              <strong className="text-slate-800">
                {visitorReport.uniqueVisitors.toLocaleString('id-ID')}
              </strong>{' '}
              pengunjung unik
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Sumber Pengunjung Teratas</p>
            <p className="font-display text-lg font-bold text-[#A31C24] line-clamp-1">
              {visitorReport.trafficSources[0]?.source || 'Organik Google'}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> {visitorReport.mobilePercent}%
              </span>
              <span className="inline-flex items-center gap-1">
                <Monitor className="w-3 h-3" /> {visitorReport.desktopPercent}%
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-[#A31C24] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Klik WhatsApp &amp; Konversi</p>
            <p className="font-mono text-3xl font-bold text-emerald-700 tabular-nums">
              {totals.waClicks.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Rasio klik WA: <span className="font-mono font-semibold">{totals.convRate}%</span> ·{' '}
              <span className="font-mono font-semibold">{totals.kprSims}</span> KPR
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MousePointerClick className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Brosur PDF, Print &amp; Share</p>
            <p className="font-mono text-3xl font-bold text-slate-950 tabular-nums">
              {(totals.pdfOrPrints + totals.sharesCount).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <FileDown className="w-3 h-3 text-amber-700" /> {totals.pdfOrPrints} PDF/Print
              </span>
              <span className="inline-flex items-center gap-1">
                <Share2 className="w-3 h-3 text-sky-700" /> {totals.sharesCount} Share
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Row: Tren 7 Hari + Sumber Pengunjung */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-950">
                Tren Kunjungan &amp; Minat Properti (7 Hari Terakhir)
              </h2>
              <p className="text-xs text-slate-500">
                Pergerakan harian tayangan unit dan klik tombol WhatsApp konsumen
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Dilihat (Views)"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="waClicks"
                  name="Klik WhatsApp"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sumber Pengunjung (Traffic Sources) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-bold text-slate-950">
              Sumber Pengunjung Website (Traffic Sources)
            </h2>
            <p className="text-xs text-slate-500">
              Asal kedatangan pengunjung dari Google, Meta Ads, WhatsApp, &amp; QR Code Brosur
            </p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visitorReport.trafficSources}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="source"
                  width={126}
                  tick={{ fontSize: 11, fill: '#0f172a' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="visits" name="Kunjungan" radius={[0, 4, 4, 0]}>
                  {visitorReport.trafficSources.map((entry, idx) => (
                    <Cell
                      key={entry.source}
                      fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {visitorReport.trafficSources.slice(0, 4).map((src, idx) => (
              <div key={src.source} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-700 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SOURCE_COLORS[idx % SOURCE_COLORS.length] }}
                  />
                  <span className="truncate">{src.source}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 shrink-0">
                  {src.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Visited Pages + Live Visitor Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-display text-base font-bold text-slate-950">
              Halaman yang Paling Banyak Dikunjungi
            </h2>
            <p className="text-xs text-slate-500">
              Peringkat halaman publik, katalog, dan listing properti berdasarkan volume kunjungan
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-2.5 px-4 font-semibold">Halaman / URL Slug</th>
                  <th className="py-2.5 px-4 font-semibold">Kategori</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Kunjungan</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Porsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitorReport.topPages.map((pg) => (
                  <tr key={pg.pagePath} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{pg.pageTitle}</p>
                      <p className="font-mono text-[11px] text-slate-500 truncate">
                        {pg.pagePath}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {pg.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {pg.visits.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {pg.sharePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Recent Visitor Log */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-950">
                Aktivitas Kunjungan Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Rekaman langsung pengunjung halaman &amp; listing sesi aktif
              </p>
            </div>
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="flex-1 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
            {visitorReport.recentVisits.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada sesi kunjungan terekam pada browser ini. Kunjungi halaman depan atau buka unit properti untuk melihat log real-time.
              </div>
            ) : (
              visitorReport.recentVisits.map((visit) => (
                <div key={visit.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {visit.pageTitle}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate">
                      {visit.pagePath}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-[#A31C24] font-semibold">
                        {visit.source}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {visit.device}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(visit.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Per-Listing Visitor & Conversion Report Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-950">
              Laporan Detail Statistik Pengunjung Tiap Listing Properti
            </h2>
            <p className="text-xs text-slate-500">
              Rincian tayangan, pengunjung unik, sumber traffic utama, unduhan PDF/Print, share sosmed, dan konversi per unit.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              placeholder="Cari unit atau sumber traffic..."
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="py-3 px-4 font-semibold">Listing Properti</th>
                <th className="py-3 px-3 font-semibold text-center">Pengunjung</th>
                <th className="py-3 px-3 font-semibold">Sumber Teratas</th>
                <th className="py-3 px-3 font-semibold text-center">KPR</th>
                <th className="py-3 px-3 font-semibold text-center">Klik WA</th>
                <th className="py-3 px-3 font-semibold text-center">PDF/Print</th>
                <th className="py-3 px-3 font-semibold text-center">Share</th>
                <th className="py-3 px-3 font-semibold text-center">Lead</th>
                <th className="py-3 px-3 font-semibold text-center">Skor</th>
                <th className="py-3 px-4 font-semibold">Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrix.map((row) => (
                <tr key={row.propertyId} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-950 text-xs sm:text-sm">{row.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {row.listingCategory} · {row.cluster} · {row.status}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block min-w-[54px] py-1 px-2 rounded-md font-mono text-xs tabular-nums ${getHeatCellClass(
                        row.views,
                        maxes.views
                      )}`}
                    >
                      {row.views}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                      {row.uniqueVisitors} unik
                    </p>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                      {row.topSource}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block min-w-[46px] py-1 px-2 rounded-md font-mono text-xs tabular-nums ${getHeatCellClass(
                        row.kprSims,
                        maxes.kpr
                      )}`}
                    >
                      {row.kprSims}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block min-w-[46px] py-1 px-2 rounded-md font-mono text-xs tabular-nums ${getHeatCellClass(
                        row.waClicks,
                        maxes.wa
                      )}`}
                    >
                      {row.waClicks}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums">
                    {row.pdfOrPrints}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-700 tabular-nums">
                    {row.sharesCount}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block min-w-[42px] py-1 px-2 rounded-md font-mono text-xs tabular-nums ${getHeatCellClass(
                        row.leadsCount,
                        maxes.leads
                      )}`}
                    >
                      {row.leadsCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block min-w-[52px] py-1 px-2 rounded-md font-mono text-xs tabular-nums ${getHeatCellClass(
                        row.interestScore,
                        maxes.score
                      )}`}
                    >
                      {row.interestScore}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap ${getPriorityBadgeClass(
                        row.priorityLabel
                      )}`}
                    >
                      {row.priorityLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
