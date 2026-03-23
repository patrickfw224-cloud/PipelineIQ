'use client';

import { Deal, Lead, Activity, SheetConfig, DealStage } from '@/types';
import { MOCK_DEALS, MOCK_LEADS, MOCK_ACTIVITIES } from './mock-data';

// Simple in-memory store with localStorage persistence
const STORAGE_KEYS = {
  deals: 'piq_deals',
  leads: 'piq_leads',
  activities: 'piq_activities',
  sheetConfig: 'piq_sheet_config',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Deals
export function getDeals(): Deal[] {
  return loadFromStorage(STORAGE_KEYS.deals, MOCK_DEALS);
}

export function saveDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal {
  const deals = getDeals();
  const now = new Date().toISOString().split('T')[0];
  const newDeal: Deal = { ...deal, id: generateId(), createdAt: now, updatedAt: now };
  const updated = [...deals, newDeal];
  saveToStorage(STORAGE_KEYS.deals, updated);
  return newDeal;
}

export function updateDeal(id: string, patch: Partial<Deal>): Deal | null {
  const deals = getDeals();
  const idx = deals.findIndex(d => d.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString().split('T')[0];
  deals[idx] = { ...deals[idx], ...patch, updatedAt: now };
  saveToStorage(STORAGE_KEYS.deals, deals);
  return deals[idx];
}

export function deleteDeal(id: string): boolean {
  const deals = getDeals();
  const updated = deals.filter(d => d.id !== id);
  saveToStorage(STORAGE_KEYS.deals, updated);
  return updated.length < deals.length;
}

export function moveDealStage(id: string, stage: DealStage): Deal | null {
  const { STAGE_CONFIG } = require('./mock-data');
  return updateDeal(id, { stage, probability: STAGE_CONFIG[stage].probability });
}

// Leads
export function getLeads(): Lead[] {
  return loadFromStorage(STORAGE_KEYS.leads, MOCK_LEADS);
}

export function saveLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
  const leads = getLeads();
  const now = new Date().toISOString().split('T')[0];
  const newLead: Lead = { ...lead, id: generateId(), createdAt: now, updatedAt: now };
  const updated = [...leads, newLead];
  saveToStorage(STORAGE_KEYS.leads, updated);
  return newLead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | null {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const now = new Date().toISOString().split('T')[0];
  leads[idx] = { ...leads[idx], ...patch, updatedAt: now };
  saveToStorage(STORAGE_KEYS.leads, leads);
  return leads[idx];
}

export function deleteLead(id: string): boolean {
  const leads = getLeads();
  const updated = leads.filter(l => l.id !== id);
  saveToStorage(STORAGE_KEYS.leads, updated);
  return updated.length < leads.length;
}

// Activities
export function getActivities(): Activity[] {
  return loadFromStorage(STORAGE_KEYS.activities, MOCK_ACTIVITIES);
}

export function saveActivity(activity: Omit<Activity, 'id'>): Activity {
  const activities = getActivities();
  const newActivity: Activity = { ...activity, id: generateId() };
  const updated = [...activities, newActivity];
  saveToStorage(STORAGE_KEYS.activities, updated);
  return newActivity;
}

export function toggleActivity(id: string): Activity | null {
  const activities = getActivities();
  const idx = activities.findIndex(a => a.id === id);
  if (idx === -1) return null;
  activities[idx] = { ...activities[idx], completed: !activities[idx].completed };
  saveToStorage(STORAGE_KEYS.activities, activities);
  return activities[idx];
}

// Sheet Config
export function getSheetConfig(): SheetConfig {
  return loadFromStorage(STORAGE_KEYS.sheetConfig, {
    spreadsheetId: '',
    dealsRange: 'Deals!A:N',
    leadsRange: 'Leads!A:L',
    activitiesRange: 'Activities!A:I',
    serviceAccountEmail: '',
    lastSynced: null,
  });
}

export function saveSheetConfig(config: SheetConfig): void {
  saveToStorage(STORAGE_KEYS.sheetConfig, config);
}

// Reset to mock data
export function resetToMockData(): void {
  saveToStorage(STORAGE_KEYS.deals, MOCK_DEALS);
  saveToStorage(STORAGE_KEYS.leads, MOCK_LEADS);
  saveToStorage(STORAGE_KEYS.activities, MOCK_ACTIVITIES);
}
