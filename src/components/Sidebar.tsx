'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '⬛' },
  { href: '/pipeline', label: 'Pipeline', icon: '🗂' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/deals', label: 'Deals', icon: '💼' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/activities', label: 'Activities', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-sm">P</div>
          <div>
            <div className="font-bold text-sm leading-none">PipelineIQ</div>
            <div className="text-slate-400 text-xs mt-0.5">Sales Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-1">Menu</p>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5',
                  active
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <span className="text-base w-5 text-center leading-none">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-sm font-bold">AR</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Alex Rivera</div>
            <div className="text-xs text-slate-400 truncate">Sales Manager</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
        </div>
      </div>
    </aside>
  );
}
