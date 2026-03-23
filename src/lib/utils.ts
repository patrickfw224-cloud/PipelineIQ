import { Deal, PipelineMetrics, StageMetrics, DealStage } from '@/types';
import { STAGE_CONFIG } from './mock-data';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

export function computeMetrics(deals: Deal[]): PipelineMetrics {
  const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const wonDeals = deals.filter(d => d.stage === 'closed_won');
  const lostDeals = deals.filter(d => d.stage === 'closed_lost');
  const totalDeals = activeDeals.length;
  const totalValue = activeDeals.reduce((s, d) => s + d.value, 0);
  const weightedValue = activeDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);
  const closedTotal = wonDeals.length + lostDeals.length;
  const conversionRate = closedTotal > 0 ? (wonDeals.length / closedTotal) * 100 : 0;
  const avgDealSize = wonDeals.length > 0 ? wonValue / wonDeals.length : 0;

  return {
    totalDeals,
    totalValue,
    weightedValue,
    wonDeals: wonDeals.length,
    wonValue,
    lostDeals: lostDeals.length,
    conversionRate,
    avgDealSize,
    avgSalesCycle: 45,
  };
}

export function computeStageMetrics(deals: Deal[]): StageMetrics[] {
  const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  return stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const cfg = STAGE_CONFIG[stage];
    return {
      stage,
      label: cfg.label,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + d.value, 0),
      color: cfg.color,
    };
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  if (score >= 40) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}
