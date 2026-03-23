'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { ActivityTypeBadge } from '@/components/Badge';
import Modal from '@/components/Modal';
import { getActivities, saveActivity, toggleActivity, getDeals, getLeads } from '@/lib/store';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { Activity, Deal, Lead } from '@/types';

const TYPES = ['call', 'email', 'meeting', 'note', 'task'] as const;
const OWNERS = ['Alex Rivera', 'Jamie Park', 'Morgan Lee'];

const EMPTY: Omit<Activity, 'id'> = {
  type: 'call', title: '', description: '', dealId: '', leadId: '',
  owner: 'Alex Rivera', date: new Date().toISOString().split('T')[0], completed: false,
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Activity, 'id'>>(EMPTY);

  useEffect(() => {
    setActivities(getActivities());
    setDeals(getDeals());
    setLeads(getLeads());
  }, []);

  const reload = () => setActivities(getActivities());

  const handleToggle = (id: string) => { toggleActivity(id); reload(); };

  const handleSave = () => {
    saveActivity({ ...form, dealId: form.dealId || undefined, leadId: form.leadId || undefined });
    reload();
    setShowModal(false);
    setForm(EMPTY);
  };

  const filtered = activities
    .filter(a => {
      if (filter === 'pending' && a.completed) return false;
      if (filter === 'done' && !a.completed) return false;
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return a.date.localeCompare(b.date);
    });

  const pending = activities.filter(a => !a.completed).length;
  const done = activities.filter(a => a.completed).length;

  const getDealName = (id?: string) => id ? deals.find(d => d.id === id)?.title || '' : '';
  const getLeadName = (id?: string) => id ? leads.find(l => l.id === id)?.name || '' : '';

  const typeIcons: Record<string, string> = { call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅' };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Activities"
        subtitle="Calls, emails, meetings, and tasks"
        actions={
          <button onClick={() => { setForm(EMPTY); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            + Log Activity
          </button>
        }
      />

      <div className="p-6 space-y-5 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Activities', value: activities.length, color: 'text-slate-700' },
            { label: 'Pending', value: pending, color: 'text-amber-600' },
            { label: 'Completed', value: done, color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48"
            />
            <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
              {(['all', 'pending', 'done'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 font-medium transition-colors capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{f}</button>
              ))}
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <span className="ml-auto text-xs text-slate-400">{filtered.length} activities</span>
          </div>

          {/* Activity list */}
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No activities found</div>
            )}
            {filtered.map(a => {
              const linked = getDealName(a.dealId) || getLeadName(a.leadId);
              return (
                <div key={a.id} className={`flex items-start gap-4 px-4 py-4 hover:bg-slate-50 transition-colors ${a.completed ? 'opacity-60' : ''}`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(a.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${a.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'}`}
                  >
                    {a.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="text-2xl shrink-0 mt-0.5">{typeIcons[a.type]}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${a.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{a.title}</p>
                      <ActivityTypeBadge type={a.type} />
                    </div>
                    {a.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">👤 {a.owner}</span>
                      <span className="text-xs text-slate-400">📅 {formatRelativeDate(a.date)}</span>
                      {linked && <span className="text-xs text-indigo-500">🔗 {linked}</span>}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 shrink-0">{formatDate(a.date)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Activity">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Discovery Call with Acme" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Activity['type'] }))}>
                {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Owner</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Linked Deal</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.dealId || ''} onChange={e => setForm(f => ({ ...f, dealId: e.target.value, leadId: '' }))}>
                <option value="">None</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.title} ({d.company})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Linked Lead</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.leadId || ''} onChange={e => setForm(f => ({ ...f, leadId: e.target.value, dealId: '' }))}>
                <option value="">None</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="completed" checked={form.completed} onChange={e => setForm(f => ({ ...f, completed: e.target.checked }))} className="rounded border-slate-300 text-indigo-600" />
              <label htmlFor="completed" className="text-sm text-slate-700">Mark as completed</label>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex-1" />
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              Log Activity
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
