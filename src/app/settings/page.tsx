'use client';

import { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import { getSheetConfig, saveSheetConfig, resetToMockData } from '@/lib/store';
import { SheetConfig } from '@/types';

type SyncStatus = 'idle' | 'testing' | 'syncing' | 'success' | 'error';

export default function SettingsPage() {
  const [config, setConfig] = useState<SheetConfig>({
    spreadsheetId: '', dealsRange: 'Deals!A:N', leadsRange: 'Leads!A:L',
    activitiesRange: 'Activities!A:I', serviceAccountEmail: '', lastSynced: null,
  });
  const [privateKey, setPrivateKey] = useState('');
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [message, setMessage] = useState('');
  const [syncResult, setSyncResult] = useState<{ deals: number; leads: number } | null>(null);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetTabs, setSheetTabs] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setConfig(getSheetConfig()); }, []);

  const handleSave = () => {
    saveSheetConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!config.spreadsheetId || !config.serviceAccountEmail || !privateKey) {
      setMessage('Please fill in Spreadsheet ID, Service Account Email, and Private Key.');
      setStatus('error');
      return;
    }
    setStatus('testing');
    setMessage('Testing connection...');
    try {
      const params = new URLSearchParams({
        spreadsheetId: config.spreadsheetId,
        serviceAccountEmail: config.serviceAccountEmail,
        privateKey,
      });
      const res = await fetch(`/api/sheets/sync?${params}`);
      const data = await res.json();
      if (data.success) {
        setSheetTitle(data.title || config.spreadsheetId);
        setSheetTabs(data.sheets || []);
        setStatus('success');
        setMessage(`Connected! Spreadsheet: "${data.title}"`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Connection failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error — check your configuration');
    }
  };

  const handleSync = async () => {
    if (!config.spreadsheetId || !config.serviceAccountEmail || !privateKey) {
      setMessage('Please configure and test your connection first.');
      setStatus('error');
      return;
    }
    setStatus('syncing');
    setMessage('Syncing data from Google Sheets...');
    try {
      const res = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: config.spreadsheetId,
          dealsRange: config.dealsRange,
          leadsRange: config.leadsRange,
          serviceAccountEmail: config.serviceAccountEmail,
          privateKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const now = new Date().toISOString();
        const updated = { ...config, lastSynced: now };
        setConfig(updated);
        saveSheetConfig(updated);
        setSyncResult(data.counts);
        setStatus('success');
        setMessage(`Synced ${data.counts.deals} deals and ${data.counts.leads} leads.`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Sync failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error during sync');
    }
  };

  const handleReset = () => {
    if (confirm('Reset all data to mock/demo data? This cannot be undone.')) {
      resetToMockData();
      setMessage('Data reset to demo data.');
      setStatus('success');
    }
  };

  const statusColors: Record<SyncStatus, string> = {
    idle: 'text-slate-500',
    testing: 'text-amber-600',
    syncing: 'text-indigo-600',
    success: 'text-emerald-600',
    error: 'text-red-600',
  };

  const statusIcons: Record<SyncStatus, string> = {
    idle: '',
    testing: '⟳',
    syncing: '⟳',
    success: '✓',
    error: '✗',
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Settings" subtitle="Google Sheets integration & configuration" />

      <div className="p-6 space-y-6 flex-1 max-w-3xl">
        {/* Connection Status Banner */}
        {message && (
          <div className={`rounded-xl p-4 border text-sm font-medium ${status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : status === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-indigo-50 border-indigo-200 text-indigo-800'}`}>
            {statusIcons[status]} {message}
          </div>
        )}

        {/* Google Sheets Setup */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl shrink-0">📊</div>
            <div>
              <h2 className="font-semibold text-slate-900">Google Sheets Integration</h2>
              <p className="text-sm text-slate-500 mt-0.5">Connect your Google Sheets to sync deals and leads data automatically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Spreadsheet ID *</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={config.spreadsheetId}
                onChange={e => setConfig(c => ({ ...c, spreadsheetId: e.target.value }))}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              />
              <p className="text-xs text-slate-400 mt-1">Found in the Google Sheets URL: /spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Account Email *</label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={config.serviceAccountEmail}
                onChange={e => setConfig(c => ({ ...c, serviceAccountEmail: e.target.value }))}
                placeholder="pipelineiq@your-project.iam.gserviceaccount.com"
              />
              <p className="text-xs text-slate-400 mt-1">Create a service account in Google Cloud Console and share your sheet with it.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Private Key *</label>
              <textarea
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none font-mono text-xs"
                value={privateKey}
                onChange={e => setPrivateKey(e.target.value)}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEpAIBAAKCAQEA...&#10;-----END RSA PRIVATE KEY-----"
              />
              <p className="text-xs text-slate-400 mt-1">Paste the private key from your service account JSON credentials file.</p>
            </div>
          </div>

          {/* Range Configuration */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Sheet Ranges</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Deals Range', key: 'dealsRange' as const, placeholder: 'Deals!A:N' },
                { label: 'Leads Range', key: 'leadsRange' as const, placeholder: 'Leads!A:L' },
                { label: 'Activities Range', key: 'activitiesRange' as const, placeholder: 'Activities!A:I' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                    value={config[f.key]}
                    onChange={e => setConfig(c => ({ ...c, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Detected sheets */}
          {sheetTabs.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-600 mb-2">Detected sheet tabs in "{sheetTitle}":</p>
              <div className="flex flex-wrap gap-2">
                {sheetTabs.map(tab => (
                  <span key={tab} className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-mono">{tab}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            >
              {saved ? '✓ Saved' : 'Save Config'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={status === 'testing'}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors disabled:opacity-50"
            >
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSync}
              disabled={status === 'syncing'}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'syncing' ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Syncing...
                </>
              ) : (
                '↻ Sync Now'
              )}
            </button>
            {config.lastSynced && (
              <span className="text-xs text-slate-400 ml-auto">Last synced: {new Date(config.lastSynced).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">📖 Setup Instructions</h2>
          <ol className="space-y-4 text-sm text-slate-600">
            {[
              {
                step: '1',
                title: 'Create a Google Cloud Project',
                body: 'Go to console.cloud.google.com → Create a new project or select an existing one.',
              },
              {
                step: '2',
                title: 'Enable the Google Sheets API',
                body: 'In your project, go to APIs & Services → Library → search for "Google Sheets API" → Enable it.',
              },
              {
                step: '3',
                title: 'Create a Service Account',
                body: 'Go to APIs & Services → Credentials → Create Credentials → Service Account. Give it a name and create a JSON key. Copy the client_email and private_key from the downloaded JSON file.',
              },
              {
                step: '4',
                title: 'Share Your Spreadsheet',
                body: 'Open your Google Sheet → Share → add the service account email (client_email from the JSON) as a Viewer.',
              },
              {
                step: '5',
                title: 'Configure Sheet Structure',
                body: 'Your sheets should have column headers in row 1. For Deals: id, title, company, contact_name, contact_email, value, stage, probability, close_date, owner, notes, source. For Leads: id, name, company, email, phone, status, source, score, owner, notes, industry, website.',
              },
              {
                step: '6',
                title: 'Paste credentials & sync',
                body: 'Enter your Spreadsheet ID, service account email, and private key above. Click "Test Connection" to verify, then "Sync Now" to import your data.',
              },
            ].map(item => (
              <li key={item.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</div>
                <div>
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="text-slate-500 mt-0.5">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Sync Results */}
        {syncResult && (
          <div className="bg-white rounded-xl border border-emerald-200 p-5">
            <h2 className="font-semibold text-emerald-800 mb-3">✅ Last Sync Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">{syncResult.deals}</div>
                <div className="text-xs text-emerald-600">Deals synced</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">{syncResult.leads}</div>
                <div className="text-xs text-emerald-600">Leads synced</div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h2 className="font-semibold text-red-700 mb-2">⚠️ Danger Zone</h2>
          <p className="text-sm text-slate-500 mb-4">Reset all data back to the demo dataset. This will overwrite any changes you've made.</p>
          <button onClick={handleReset} className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
            Reset to Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
