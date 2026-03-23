'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { StatusBadge } from '@/components/Badge';
import Modal from '@/components/Modal';
import { getLeads, saveLead, updateLead, deleteLead } from '@/lib/store';
import { formatDate, getScoreBg } from '@/lib/utils';
import { Lead } from '@/types';

const EMPTY_LEAD: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', company: '', email: '', phone: '', status: 'new', source: 'Inbound',
  score: 50, owner: 'Alex Rivera', notes: '', industry: '', website: '',
};

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'] as const;
const SOURCE_OPTIONS = ['Inbound', 'Outbound', 'LinkedIn', 'Referral', 'Conference', 'Cold Outreach', 'Partner', 'Other'];
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Energy', 'Telecom', 'Logistics', 'Construction', 'Other'];
const OWNERS = ['Alex Rivera', 'Jamie Park', 'Morgan Lee'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'createdAt' | 'name'>('createdAt');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_LEAD);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { setLeads(getLeads()); }, []);
  const reload = () => setLeads(getLeads());

  const filtered = leads
    .filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.company.toLowerCase().includes(search.toLowerCase()) && !l.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const openAdd = () => { setForm(EMPTY_LEAD); setEditLead(null); setShowModal(true); };
  const openEdit = (l: Lead) => { setEditLead(l); setForm({ name: l.name, company: l.company, email: l.email, phone: l.phone, status: l.status, source: l.source, score: l.score, owner: l.owner, notes: l.notes, industry: l.industry, website: l.website }); setShowModal(true); };

  const handleSave = () => {
    if (editLead) updateLead(editLead.id, form);
    else saveLead(form);
    reload();
    setShowModal(false);
    setEditLead(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this lead?')) { deleteLead(id); reload(); setShowModal(false); setEditLead(null); }
  };

  const handleBulkDelete = () => {
    if (!selected.size || !confirm(`Delete ${selected.size} leads?`)) return;
    selected.forEach(id => deleteLead(id));
    setSelected(new Set());
    reload();
  };

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const allSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id));

  const stats = [
    { label: 'Total Leads', value: leads.length },
    { label: 'New', value: leads.filter(l => l.status === 'new').length },
    { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { label: 'Converted', value: leads.filter(l => l.status === 'converted').length },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Leads"
        subtitle="Manage and track your leads"
        actions={
          <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
            + Add Lead
          </button>
        }
      />

      <div className="p-6 space-y-5 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + Table */}
        <div className="bg-white rounded-xl border border-slate-200">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="createdAt">Newest First</option>
              <option value="score">By Score</option>
              <option value="name">By Name</option>
            </select>
            {selected.size > 0 && (
              <button onClick={handleBulkDelete} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                Delete {selected.size} selected
              </button>
            )}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="w-10 px-4 py-2.5">
                    <input type="checkbox" checked={allSelected} onChange={() => {
                      if (allSelected) setSelected(new Set());
                      else setSelected(new Set(filtered.map(l => l.id)));
                    }} className="rounded border-slate-300" />
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Name</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Company</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Email</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">Source</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden lg:table-cell">Owner</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500">Score</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden xl:table-cell">Added</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-slate-400 text-sm">No leads found</td></tr>
                )}
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded border-slate-300" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{lead.name}</p>
                          <p className="text-xs text-slate-400 md:hidden">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-700">{lead.company}</div>
                      {lead.industry && <div className="text-xs text-slate-400">{lead.industry}</div>}
                    </td>
                    <td className="px-3 py-3 text-slate-600 hidden md:table-cell">{lead.email}</td>
                    <td className="px-3 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-3 py-3 text-slate-500 hidden lg:table-cell">{lead.source}</td>
                    <td className="px-3 py-3 text-slate-500 hidden lg:table-cell">{lead.owner}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getScoreBg(lead.score)}`}>{lead.score}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-400 hidden xl:table-cell text-xs">{formatDate(lead.createdAt)}</td>
                    <td className="px-3 py-3">
                      <button onClick={() => openEdit(lead)} className="text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 text-xs font-medium">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditLead(null); }} title={editLead ? 'Edit Lead' : 'Add Lead'} size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company *</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lead['status'] }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Source</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                <option value="">Select...</option>
                {INDUSTRY_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Owner</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
                {OWNERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
              <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Lead Score (0–100)</label>
              <input type="number" min={0} max={100} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" value={form.score} onChange={e => setForm(f => ({ ...f, score: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            {editLead && (
              <button onClick={() => handleDelete(editLead.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">Delete</button>
            )}
            <div className="flex-1" />
            <button onClick={() => { setShowModal(false); setEditLead(null); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
            <button onClick={handleSave} disabled={!form.name || !form.company} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {editLead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
