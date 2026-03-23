export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  owner: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  source: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  score: number;
  owner: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  industry: string;
  website: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  dealId?: string;
  leadId?: string;
  owner: string;
  date: string;
  completed: boolean;
}

export interface SheetConfig {
  spreadsheetId: string;
  dealsRange: string;
  leadsRange: string;
  activitiesRange: string;
  serviceAccountEmail: string;
  lastSynced: string | null;
}

export interface PipelineMetrics {
  totalDeals: number;
  totalValue: number;
  weightedValue: number;
  wonDeals: number;
  wonValue: number;
  lostDeals: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
}

export interface StageMetrics {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
  color: string;
}
