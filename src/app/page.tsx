'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { StageBadge } from '@/components/Badge';
import { getDeals, getLeads, getActivities } from '@/lib/store';
import { computeMetrics, computeStageMetrics, formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils';
import { Deal, Lead, Activity } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setDeals(getDeals());
    setLeads(getLeads());
    setActivities(getActivities());
  }, []);

  const metrics = computeMetrics(deals);
  const stageMetrics = computeStageMetrics(deals);
  const recentDeals = [...deals]
    .filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const upcomingActivities = [...activities]
    .filter(a => !a.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const recentLeads = [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const kpis = [
    { label: 'Open Pipeline', value: formatCurrency(metrics.totalValue), sub: `${metrics.totalDeals} active deals`, icon: '💼', color: 'bg-indigo-50 text-indigo-600', trend: '+12%', up: true },
    { label: 'Weighted Value', value: formatCurrency(metrics.weightedValue), sub: 'Probability-adjusted', icon: '⚖️', color: 'bg-violet-50 text-violet-600', trend: '+8%', up: true },
    { label: 'Won This Month', value: formatCurrency(metrics.wonValue), sub: `${metrics.wonDeals} deals closed`, icon: '🏆', color: 'bg-emerald-50 text-emerald-600', trend: '+24%', up: true },
    { label: 'Conversion Rate', value: `${metrics.conversionRate.toFixed(0)}%`, sub: 'Win rate', icon: '🎯', color: 'bg-amber-50 text-amber-600', trend: '-3%', up: false },
    { label: 'Avg Deal Size', value: formatCurrency(metrics.avgDealSize), sub: 'Closed deals', icon: '📈', color: 'bg-sky-50 text-sky-600', trend: '+5%', up: true },
    { label: 'New Leads', value: String(leads.filter(l => l.status === 'new').length), sub: 'This period', icon: '👥', color: 'bg-rose-50 text-rose-600', trend: '+18%', up: true },
  ];

  const maxStageValue = Math.max(...stageMetrics.filter(s => s.stage !== 'closed_won' && s.stage !== 'closed_lost').map(s => s.value), 1);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Dashboard" subtitle="Sales overview & key metrics" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${kpi.color}`}>{kpi.icon}</span>
                <span className={`text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.trend}</span>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
                <div className="text-xs font-medium text-slate-700">{kpi.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pipeline Funnel */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Pipeline Stages</h2>
              <Link href="/pipeline" className="text-xs text-indigo-600 hover:underline font-medium">View Pipeline →</Link>
            </div>
            <div className="space-y-3">
              {stageMetrics.filter(s => s.stage !== 'closed_won' && s.stage !== 'closed_lost').map((s) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <StageBadge stage={s.stage} />
                      <span className="text-slate-500 text-xs">{s.count} deal{s.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{formatCurrency(s.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${Math.max((s.value / maxStageValue) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              {stageMetrics.filter(s => s.stage === 'closed_won' || s.stage === 'closed_lost').map(s => (
                <div key={s.stage} className={`rounded-lg p-3 ${s.stage === 'closed_won' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <StageBadge stage={s.stage} />
                  <div className="mt-1 font-bold text-slate-800">{formatCurrency(s.value)}</div>
                  <div className="text-xs text-slate-500">{s.count} deal{s.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Upcoming Tasks</h2>
              <Link href="/activities" className="text-xs text-indigo-600 hover:underline font-medium">All →</Link>
            </div>
            <div className="space-y-2">
              {upcomingActivities.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No upcoming tasks</p>
              )}
              {upcomingActivities.map(a => {
                const icons: Record<string, string> = { call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅' };
                return (
                  <div key={a.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-lg mt-0.5">{icons[a.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.owner} · {formatRelativeDate(a.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top Deals */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Top Active Deals</h2>
              <Link href="/deals" className="text-xs text-indigo-600 hover:underline font-medium">All Deals →</Link>
            </div>
            <div className="space-y-2">
              {recentDeals.map(deal => (
                <div key={deal.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {deal.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{deal.title}</p>
                    <p className="text-xs text-slate-500 truncate">{deal.company} · Closes {formatDate(deal.closeDate)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(deal.value)}</div>
                    <StageBadge stage={deal.stage} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent Leads</h2>
              <Link href="/leads" className="text-xs text-indigo-600 hover:underline font-medium">All Leads →</Link>
            </div>
            <div className="space-y-2">
              {recentLeads.map(lead => {
                const scoreColor = lead.score >= 80 ? 'text-emerald-600' : lead.score >= 60 ? 'text-amber-600' : 'text-slate-500';
                const statusColors: Record<string, string> = { new: 'bg-slate-100 text-slate-600', contacted: 'bg-blue-100 text-blue-700', qualified: 'bg-violet-100 text-violet-700', converted: 'bg-emerald-100 text-emerald-700', lost: 'bg-red-100 text-red-700' };
                return (
                  <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                      <p className="text-xs text-slate-500 truncate">{lead.company} · {lead.source}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-bold ${scoreColor}`}>{lead.score}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[lead.status]}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
