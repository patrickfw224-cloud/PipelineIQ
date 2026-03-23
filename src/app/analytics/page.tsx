'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { StageBadge } from '@/components/Badge';
import { getDeals, getLeads } from '@/lib/store';
import { computeMetrics, computeStageMetrics, formatCurrency, formatCurrencyFull } from '@/lib/utils';
import { STAGE_CONFIG } from '@/lib/mock-data';
import { Deal, Lead, DealStage } from '@/types';

// Simple SVG bar chart
function BarChart({ data, height = 140 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 justify-around" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-semibold text-slate-700">{formatCurrency(d.value)}</span>
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max((d.value / max) * (height - 30), 4)}px`, background: d.color }} />
          <span className="text-xs text-slate-500 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Simple donut chart using SVG
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-slate-400 text-sm" style={{ width: size, height: size }}>No data</div>;

  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 20;

  let cumulative = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...seg, pct, start };
  });

  function polarToCartesian(pct: number) {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function describeArc(startPct: number, endPct: number) {
    const s = polarToCartesian(startPct);
    const e = polarToCartesian(endPct);
    const largeArc = endPct - startPct > 0.5 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        arc.pct > 0 ? (
          <path
            key={i}
            d={describeArc(arc.start, arc.start + arc.pct)}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ) : null
      ))}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold" fontSize={14} fill="#0f172a">{total}</text>
    </svg>
  );
}

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [period, setPeriod] = useState<'all' | 'quarter' | 'month'>('all');

  useEffect(() => { setDeals(getDeals()); setLeads(getLeads()); }, []);

  const metrics = computeMetrics(deals);
  const stageMetrics = computeStageMetrics(deals);

  // By stage bar chart data
  const stageBarData = stageMetrics
    .filter(s => s.stage !== 'closed_won' && s.stage !== 'closed_lost')
    .map(s => ({
      label: s.label,
      value: s.value,
      color: s.stage === 'lead' ? '#94a3b8' : s.stage === 'qualified' ? '#818cf8' : s.stage === 'proposal' ? '#a78bfa' : '#fbbf24',
    }));

  // Owner breakdown
  const ownerData = (['Alex Rivera', 'Jamie Park', 'Morgan Lee'] as const).map(owner => {
    const ownerDeals = deals.filter(d => d.owner === owner && d.stage !== 'closed_lost');
    return { owner, count: ownerDeals.length, value: ownerDeals.reduce((s, d) => s + d.value, 0) };
  });

  // Lead source breakdown
  const sourceMap: Record<string, number> = {};
  leads.forEach(l => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const sourceColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  // Deals by stage donut
  const donutSegments = stageMetrics.map((s, i) => ({
    value: s.count,
    label: s.label,
    color: ['#94a3b8', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][i],
  }));

  // Lead status donut
  const leadStatusColors: Record<string, string> = {
    new: '#94a3b8',
    contacted: '#6366f1',
    qualified: '#8b5cf6',
    converted: '#10b981',
    lost: '#ef4444',
  };
  const leadStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
  const leadDonut = leadStatuses.map(status => ({
    value: leads.filter(l => l.status === status).length,
    label: status,
    color: leadStatusColors[status],
  }));

  // Monthly trend (simulated)
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const trendData = [
    { label: 'Oct', value: 45000, color: '#c7d2fe' },
    { label: 'Nov', value: 82000, color: '#a5b4fc' },
    { label: 'Dec', value: 63000, color: '#818cf8' },
    { label: 'Jan', value: 110000, color: '#6366f1' },
    { label: 'Feb', value: 95000, color: '#4f46e5' },
    { label: 'Mar', value: metrics.wonValue || 18000, color: '#4338ca' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Analytics"
        subtitle="Pipeline performance & insights"
        actions={
          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
            {(['all', 'quarter', 'month'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                {p === 'all' ? 'All Time' : p === 'quarter' ? 'Quarter' : 'Month'}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-6 space-y-6 flex-1">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pipeline', value: formatCurrency(metrics.totalValue), sub: `${metrics.totalDeals} deals`, trend: '↑ 12%', up: true },
            { label: 'Won Revenue', value: formatCurrency(metrics.wonValue), sub: `${metrics.wonDeals} closed`, trend: '↑ 24%', up: true },
            { label: 'Win Rate', value: `${metrics.conversionRate.toFixed(0)}%`, sub: 'Conversion', trend: '↓ 3%', up: false },
            { label: 'Avg Deal Size', value: formatCurrency(metrics.avgDealSize), sub: 'Closed deals', trend: '↑ 5%', up: true },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">{k.label}</div>
              <div className="text-2xl font-bold text-slate-900">{k.value}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400">{k.sub}</span>
                <span className={`text-xs font-semibold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>{k.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-1">Won Revenue Trend</h2>
            <p className="text-xs text-slate-400 mb-4">Monthly closed revenue (last 6 months)</p>
            <BarChart data={trendData} height={180} />
          </div>

          {/* Pipeline by Stage */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-1">Active Pipeline by Stage</h2>
            <p className="text-xs text-slate-400 mb-4">Total deal value per active stage</p>
            <BarChart data={stageBarData} height={180} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deals donut */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Deals by Stage</h2>
            <div className="flex items-center gap-4">
              <DonutChart segments={donutSegments} size={120} />
              <div className="space-y-1.5">
                {stageMetrics.map((s, i) => (
                  <div key={s.stage} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ['#94a3b8', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][i] }} />
                    <span className="text-slate-600 flex-1">{s.label}</span>
                    <span className="font-semibold text-slate-800">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead status donut */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Leads by Status</h2>
            <div className="flex items-center gap-4">
              <DonutChart segments={leadDonut} size={120} />
              <div className="space-y-1.5">
                {leadDonut.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600 flex-1 capitalize">{s.label}</span>
                    <span className="font-semibold text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead sources */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Lead Sources</h2>
            <div className="space-y-3">
              {sourceData.map(([source, count], i) => {
                const pct = Math.round((count / leads.length) * 100);
                return (
                  <div key={source}>
                    <div className="flex justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: sourceColors[i] }} />
                        <span className="text-slate-600">{source}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: sourceColors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rep Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Rep Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 w-32">Rep</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Open Deals</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Pipeline Value</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Won Deals</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Won Value</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500">Win Rate</th>
                  <th className="py-2 text-xs font-semibold text-slate-500 w-32">Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownerData.map(row => {
                  const won = deals.filter(d => d.owner === row.owner && d.stage === 'closed_won');
                  const lost = deals.filter(d => d.owner === row.owner && d.stage === 'closed_lost');
                  const winRate = (won.length + lost.length) > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
                  const wonVal = won.reduce((s, d) => s + d.value, 0);
                  const maxVal = Math.max(...ownerData.map(o => o.value), 1);
                  return (
                    <tr key={row.owner} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-900">{row.owner}</td>
                      <td className="py-3 text-right text-slate-700">{row.count}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">{formatCurrency(row.value)}</td>
                      <td className="py-3 text-right text-slate-700">{won.length}</td>
                      <td className="py-3 text-right font-semibold text-emerald-700">{formatCurrency(wonVal)}</td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold ${winRate >= 60 ? 'text-emerald-600' : winRate >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>{winRate}%</span>
                      </td>
                      <td className="py-3 pl-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${(row.value / maxVal) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
