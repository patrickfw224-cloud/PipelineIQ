import { NextRequest, NextResponse } from 'next/server';

// Google Sheets API integration
// Uses a service account private key stored securely in environment variables
async function getGoogleAuth(privateKey: string, clientEmail: string) {
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return auth;
}

function parseDealsRows(rows: string[][]): Record<string, unknown>[] {
  if (!rows || rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data.map(row => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => { obj[h.trim().toLowerCase().replace(/\s+/g, '_')] = row[i] ?? ''; });
    return obj;
  });
}

function parseLeadsRows(rows: string[][]): Record<string, unknown>[] {
  if (!rows || rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data.map(row => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => { obj[h.trim().toLowerCase().replace(/\s+/g, '_')] = row[i] ?? ''; });
    return obj;
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      spreadsheetId: string;
      dealsRange: string;
      leadsRange: string;
      serviceAccountEmail: string;
      privateKey: string;
    };

    const { spreadsheetId, dealsRange, leadsRange, serviceAccountEmail, privateKey } = body;

    if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    const auth = await getGoogleAuth(privateKey, serviceAccountEmail);
    const { google } = await import('googleapis');
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch deals
    let deals: Record<string, unknown>[] = [];
    if (dealsRange) {
      try {
        const dealsRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: dealsRange,
        });
        deals = parseDealsRows((dealsRes.data.values as string[][]) || []);
      } catch (e) {
        console.warn('Failed to fetch deals:', e);
      }
    }

    // Fetch leads
    let leads: Record<string, unknown>[] = [];
    if (leadsRange) {
      try {
        const leadsRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: leadsRange,
        });
        leads = parseLeadsRows((leadsRes.data.values as string[][]) || []);
      } catch (e) {
        console.warn('Failed to fetch leads:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: { deals, leads },
      counts: { deals: deals.length, leads: leads.length },
      syncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    console.error('Sheets sync error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Verify connection without fetching data
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get('spreadsheetId');
  const serviceAccountEmail = searchParams.get('serviceAccountEmail');
  const privateKey = searchParams.get('privateKey');

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const auth = await getGoogleAuth(privateKey, serviceAccountEmail);
    const { google } = await import('googleapis');
    const sheets = google.sheets({ version: 'v4', auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'spreadsheetId,properties.title,sheets.properties.title' });
    return NextResponse.json({
      success: true,
      title: meta.data.properties?.title,
      sheets: (meta.data.sheets || []).map(s => s.properties?.title),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
