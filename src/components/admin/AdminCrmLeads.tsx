import React, { useMemo, useState } from 'react';
import { Check, Download, MessageCircle, Search, Trash2 } from 'lucide-react';
import {
  buildAutoReplyMessage,
  buildWhatsAppUrl,
  LEAD_STATUS_ORDER,
} from '../../services/storageService';
import { Lead, LeadStatus, SiteSettings } from '../../types';

interface AdminCrmLeadsProps {
  leads: Lead[];
  settings: SiteSettings;
  onUpdateLead: (id: string, patch: Partial<Pick<Lead, 'status' | 'salesNote'>>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export const AdminCrmLeads: React.FC<AdminCrmLeadsProps> = ({
  leads,
  settings,
  onUpdateLead,
  onDeleteLead,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Semua' | LeadStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== 'Semua' && lead.status !== statusFilter) return false;
      if (q) {
        const hay = `${lead.name} ${lead.phone} ${lead.propertyName} ${lead.salesNote}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { Semua: leads.length };
    LEAD_STATUS_ORDER.forEach((st) => {
      map[st] = leads.filter((l) => l.status === st).length;
    });
    return map;
  }, [leads]);

  const handleSaveNote = async (lead: Lead) => {
    const nextNote = noteDrafts[lead.id] ?? lead.salesNote;
    await onUpdateLead(lead.id, { salesNote: nextNote });
    setSavedId(lead.id);
    setTimeout(() => {
      setSavedId((prev) => (prev === lead.id ? null : prev));
    }, 1800);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID Prospek',
      'Tanggal Masuk',
      'Nama Konsumen',
      'Nomor WhatsApp',
      'Unit Diminati',
      'Cluster',
      'Sumber Lead',
      'Status Prospek',
      'Catatan Sales',
      'Ringkasan KPR',
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString('id-ID'),
      l.name,
      l.phone,
      l.propertyName,
      l.cluster,
      l.source,
      l.status,
      (l.salesNote || '').replace(/"/g, '""'),
      (l.kprSummary || '').replace(/"/g, '""'),
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell)}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospek-crm-${statusFilter.toLowerCase().replace(/\s+/g, '-')}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-950">CRM & Manajemen Leads</h1>
          <p className="text-sm text-slate-600">
            Kelola status prospek konsumen, perbarui catatan follow-up sales, dan unduh data terfilter ke CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredLeads.length === 0}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Unduh CSV ({filteredLeads.length})</span>
        </button>
      </div>

      {/* Status Filter Tabs + Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['Semua', ...LEAD_STATUS_ORDER] as const).map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950'
                }`}
              >
                {status}{' '}
                <span className="font-mono tabular-nums opacity-80">
                  ({statusCounts[status] ?? 0})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama konsumen atau nomor WhatsApp..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* CRM Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Konsumen & WA</th>
                <th className="py-3 px-4 font-semibold">Unit Diminati</th>
                <th className="py-3 px-4 font-semibold">Sumber</th>
                <th className="py-3 px-4 font-semibold">Status Prospek</th>
                <th className="py-3 px-4 font-semibold min-w-[260px]">Catatan Sales</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-500">
                    Tidak ada prospek pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const noteVal = noteDrafts[lead.id] ?? lead.salesNote;
                  const replyText = settings.autoReplyEnabled
                    ? buildAutoReplyMessage(settings, {
                        name: lead.name,
                        propertyName: lead.propertyName,
                        cluster: lead.cluster,
                        source: lead.source,
                      })
                    : `Halo Bapak/Ibu ${lead.name}, saya ${settings.marketingName} dari ${settings.developerName}. Menindaklanjuti minat Anda pada unit ${lead.propertyName}...`;
                  const waFollowUpUrl = buildWhatsAppUrl(lead.phone, replyText);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-950">{lead.name}</p>
                        <p className="font-mono text-xs text-slate-600 tabular-nums">{lead.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900 text-xs">{lead.propertyName}</p>
                        <p className="text-[11px] text-slate-500">{lead.cluster}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {lead.source}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            onUpdateLead(lead.id, { status: e.target.value as LeadStatus })
                          }
                          aria-label={`Ubah status prospek ${lead.name}`}
                          className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer"
                        >
                          {LEAD_STATUS_ORDER.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={noteVal}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))
                            }
                            onBlur={() => handleSaveNote(lead)}
                            placeholder="Tulis catatan follow-up..."
                            className="w-full h-9 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveNote(lead)}
                            title="Simpan catatan"
                            className={`h-9 px-2.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                              savedId === lead.id
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {confirmDeleteId === lead.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteLead(lead.id);
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
                            <a
                              href={waFollowUpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Follow up via WhatsApp"
                              className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center justify-center"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(lead.id)}
                              title="Hapus prospek"
                              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
