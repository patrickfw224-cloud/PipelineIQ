'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { StageBadge } from '@/components/Badge';
import Modal from '@/components/Modal';
import { getDeals, saveDeal, updateDeal, deleteDeal } from '@/lib/store';
import { STAGE_CONFIG } from '@/lib/mock-data';
import { formatCurrency, formatCurrencyFull, formatDate, computeMetrics } from '@/lib/utils';
import { Deal, DealStage } from '@/types';

const STAGES: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const OWNERS = ['Alex Rivera', 'Jamie Park', 'Morgan Lee'];
const SOURCES = ['Inbound', 'Outbound', 'Referral', 'Partner', 'Conference', 'Cold Outreach', 'Account Expansion'];

const EMPTY: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', company: '', contactName: '', contactEmail: '', value: 0,
  stage: 'lead', probability: 10, closeDate: '', owner: 'Alex Rivera', notes: '', source: 'Inbound',
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'value' | 'closeDate' | 'updatedAt'>('value');
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY);

  useEffect(() => { setDeals(getDeals()); }, []);
  const reload = () => setDeals(getDeals());

  const filtered = deals
    .filter(d => {
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.company.toLowerCase().includes(search.toLowerCase())) return false;
      if (stageFilter !== 'all' && d.stage !== stageFilter) return false;
      if (ownerFilter !== 'all' && d.owner !== ownerFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'value') return b.value - a.value;
      if (sortBy === 'closeDate') return a.closeDate.localeCompare(b.closeDate);
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  const metrics = computeMetrics(deals);

  const openAdd = () => { setForm(EMPTY); setEditDeal(null); setShowModal(true); };
  const openEdit = (d: Deal) => {
    setEditDeal(d);
    setForm({ title: d.title, company: d.company, contactName: d.contactName, contactEmail: d.contactEmail, value: d.value, stage: d.stage, probability: d.probability, closeDate: d.closeDate, owner: d.owner, notes: d.notes, source: d.source });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editDeal) updateDeal(editDeal.id, form);
    else saveDeal(form);
    reload();
    setShowModal(false);
    setEditDeal(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this deal?')) { deleteDeal(id); reload(); setShowModal(false); setEditDeal(null); }
  };

  const kpis = [
    { label: 'Total Pipeline', value: formatCurrency(metrics.totalValue), sub: `${metrics.totalDeals} open deals`, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Weighted Value', value: formatCurrency(metrics.weightedValue), sub: 'Risk-adjusted', color: 'text-violet-600 bg-violet-50' },
    { label: 'Won Revenue', value: formatCurrency(metrics.wonValue), sub: `${metrics.wonDeals} deals`, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Lost Deals', value: String(metrics.lostDeals), sub: 'This period', color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Deals"
        subtitle="All deals across the pipeline"
        actions={
          <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            + New Deal
          </button>
        }
      />

      <div className="p-6 space-y-5 flex-1">
        {/* KPI Strip */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`text-xs font-medium px-1.5 py-0.5 rounded-md inline-block mb-1 ${k.color}`}>{k.label}</div>
              <div className="text-2xl font-bold text-slate-900">{k.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search deals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
            />
            <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
            </select>
            <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Owners</option>
              {OWNERS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="value">By Value</option>
              <option value="closeDate">By Close Date</option>
              <option value="updatedAt">Recently Updated</option>
            </select>
            <span className="ml-auto text-xs text-slate-400">{filtered.length} deal{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Deal</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Stage</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500">Value</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Prob.</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">Close Date</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">Owner</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden xl:table-cell">Source</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">No deals found</td></tr>
                )}
                {filtered.map(deal => {
                  const isOverdue = deal.closeDate && new Date(deal.closeDate) < new Date() && deal.stage !== 'closed_won' && deal.stage !== 'closed_lost';
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {deal.company.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{deal.title}</p>
                            <p className="text-xs text-slate-400">{deal.company} · {deal.contactName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3"><StageBadge stage={deal.stage} /></td>
                      <td className="px-3 py-3 text-right font-bold text-slate-900">{formatCurrency(deal.value)}</td>
                      <td className="px-3 py-3 text-center hidden md:table-cell">
                        <span className="text-sm font-medium text-slate-600">{deal.probability}%</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={isOverdue ? 'text-red-500 font-medium' : 'text-slate-500'}>
                          {formatDate(deal.closeDate)}
                          {isOverdue && ' ⚠️'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500 hidden lg:table-cell">{deal.owner}</td>
                      <td className="px-3 py-3 text-slate-400 hidden xl:table-cell text-xs">{deal.source}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => openEdit(deal)} className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium">Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditDeal(null); }} title={editDeal ? 'Edit Deal' : 'New Deal'} size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Deal Title *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Enterprise CRM Upgrade" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Deal Value ($)</label>
              <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Name</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Stage</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as DealStage, probability: STAGE_CONFIG[e.target.value as DealStage].probability }))}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Close Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Owner</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Source</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            {editDeal && (
              <button onClick={() => handleDelete(editDeal.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            )}
            <div className="flex-1" />
            <button onClick={() => { setShowModal(false); setEditDeal(null); }} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button onClick={handleSave} disabled={!form.title || !form.company} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {editDeal ? 'Save Changes' : 'Add Deal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
