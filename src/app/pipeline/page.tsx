'use client';

import { useState, useEffect, useRef } from 'react';
import TopBar from '@/components/TopBar';
import { StageBadge } from '@/components/Badge';
import Modal from '@/components/Modal';
import { getDeals, moveDealStage, saveDeal, updateDeal, deleteDeal } from '@/lib/store';
import { STAGE_CONFIG } from '@/lib/mock-data';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Deal, DealStage } from '@/types';

const STAGES: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const EMPTY_DEAL: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', company: '', contactName: '', contactEmail: '', value: 0,
  stage: 'lead', probability: 10, closeDate: '', owner: 'Alex Rivera',
  notes: '', source: 'Inbound',
};

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Deal | null>(null);
  const [form, setForm] = useState<Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_DEAL);
  const [filter, setFilter] = useState('');

  useEffect(() => { setDeals(getDeals()); }, []);

  const reload = () => setDeals(getDeals());

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (dragId) {
      moveDealStage(dragId, stage);
      reload();
    }
    setDragId(null);
    setOverStage(null);
  };

  const openAdd = (stage: DealStage = 'lead') => {
    setForm({ ...EMPTY_DEAL, stage });
    setShowAdd(true);
  };

  const openEdit = (deal: Deal) => {
    setShowEdit(deal);
    setForm({ title: deal.title, company: deal.company, contactName: deal.contactName, contactEmail: deal.contactEmail, value: deal.value, stage: deal.stage, probability: deal.probability, closeDate: deal.closeDate, owner: deal.owner, notes: deal.notes, source: deal.source });
  };

  const handleSave = () => {
    if (showEdit) {
      updateDeal(showEdit.id, form);
      setShowEdit(null);
    } else {
      saveDeal(form);
      setShowAdd(false);
    }
    reload();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this deal?')) {
      deleteDeal(id);
      setShowEdit(null);
      reload();
    }
  };

  const filtered = deals.filter(d =>
    !filter || d.title.toLowerCase().includes(filter.toLowerCase()) || d.company.toLowerCase().includes(filter.toLowerCase())
  );

  const stageDeals = (stage: DealStage) => filtered.filter(d => d.stage === stage);
  const stageTotal = (stage: DealStage) => stageDeals(stage).reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Pipeline"
        subtitle="Drag & drop deals between stages"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter deals..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-40"
            />
            <button
              onClick={() => openAdd()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              + Add Deal
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 h-full min-w-max">
          {STAGES.map(stage => {
            const cfg = STAGE_CONFIG[stage];
            const stageDls = stageDeals(stage);
            const isOver = overStage === stage;

            return (
              <div
                key={stage}
                className={cn(
                  'w-64 flex flex-col rounded-xl border transition-all duration-150',
                  isOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                )}
                onDragOver={e => handleDragOver(e, stage)}
                onDragLeave={() => setOverStage(null)}
                onDrop={e => handleDrop(e, stage)}
              >
                {/* Column header */}
                <div className="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <StageBadge stage={stage} />
                    <span className="text-xs text-slate-500 font-medium">{stageDls.length}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700">{formatCurrency(stageTotal(stage))}</div>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {stageDls.map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      onClick={() => openEdit(deal)}
                      className={cn(
                        'bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 animate-fadein',
                        dragId === deal.id ? 'opacity-40' : 'opacity-100'
                      )}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <p className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">{deal.title}</p>
                        <div className="shrink-0 w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {deal.company.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{deal.company}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(deal.value)}</span>
                        <span className="text-xs text-slate-400">{deal.probability}%</span>
                      </div>
                      <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                        <span>📅</span>
                        <span>{formatDate(deal.closeDate)}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                        <span>👤</span>
                        <span>{deal.owner}</span>
                      </div>
                      {/* Probability bar */}
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-1">
                        <div
                          className={cn('h-1 rounded-full', deal.probability >= 75 ? 'bg-emerald-500' : deal.probability >= 50 ? 'bg-amber-400' : deal.probability >= 25 ? 'bg-violet-400' : 'bg-slate-400')}
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add to stage button */}
                  <button
                    onClick={() => openAdd(stage)}
                    className="w-full py-2 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    + Add deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={showAdd || !!showEdit}
        onClose={() => { setShowAdd(false); setShowEdit(null); }}
        title={showEdit ? 'Edit Deal' : 'New Deal'}
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Deal Title *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Enterprise CRM Upgrade" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
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
                {['Alex Rivera', 'Jamie Park', 'Morgan Lee'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Source</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                {['Inbound', 'Outbound', 'Referral', 'Partner', 'Conference', 'Cold Outreach', 'Account Expansion'].map(s => <option key={s}>{s}</option>)}
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
            {showEdit && (
              <button onClick={() => handleDelete(showEdit.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">Delete</button>
            )}
            <div className="flex-1" />
            <button onClick={() => { setShowAdd(false); setShowEdit(null); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={!form.title || !form.company} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {showEdit ? 'Save Changes' : 'Add Deal'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
