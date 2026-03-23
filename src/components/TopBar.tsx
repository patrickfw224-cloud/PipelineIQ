'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 text-sm text-slate-500 w-48">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search...</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(p => !p)}
            className="relative w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-fadein">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-semibold text-sm">Notifications</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { icon: '📅', msg: 'Legal Review meeting with FinGroup today', time: '9:00 AM' },
                  { icon: '💰', msg: 'FinGroup deal nearing close — $210K', time: 'Yesterday' },
                  { icon: '📄', msg: 'Proposal sent to TechFlow Inc', time: '2 days ago' },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 flex gap-3 hover:bg-slate-50 cursor-pointer">
                    <span className="text-lg mt-0.5">{n.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700">{n.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center">
                <button onClick={() => setShowNotif(false)} className="text-xs text-indigo-600 hover:underline">View all</button>
              </div>
            </div>
          )}
        </div>

        {/* Sync indicator */}
        <Link href="/settings" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Sync Sheets</span>
        </Link>
      </div>
    </header>
  );
}
