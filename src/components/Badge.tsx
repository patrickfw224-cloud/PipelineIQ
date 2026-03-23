import { cn } from '@/lib/utils';
import { STAGE_CONFIG } from '@/lib/mock-data';
import { DealStage } from '@/types';

interface StageBadgeProps {
  stage: DealStage;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-100 text-slate-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-violet-100 text-violet-700',
  converted: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status] || 'bg-slate-100 text-slate-600')}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

interface ActivityTypeBadgeProps {
  type: string;
}

const ACTIVITY_CONFIG: Record<string, { color: string; icon: string }> = {
  call: { color: 'bg-blue-100 text-blue-700', icon: '📞' },
  email: { color: 'bg-violet-100 text-violet-700', icon: '✉️' },
  meeting: { color: 'bg-amber-100 text-amber-700', icon: '🤝' },
  note: { color: 'bg-slate-100 text-slate-600', icon: '📝' },
  task: { color: 'bg-emerald-100 text-emerald-700', icon: '✅' },
};

export function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  const cfg = ACTIVITY_CONFIG[type] || { color: 'bg-slate-100 text-slate-600', icon: '•' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
      {cfg.icon} {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}
