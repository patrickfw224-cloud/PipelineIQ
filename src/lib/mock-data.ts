import { Deal, Lead, Activity, DealStage } from '@/types';

export const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string; border: string; probability: number }> = {
  lead: { label: 'Lead', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', probability: 10 },
  qualified: { label: 'Qualified', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300', probability: 25 },
  proposal: { label: 'Proposal', color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-300', probability: 50 },
  negotiation: { label: 'Negotiation', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300', probability: 75 },
  closed_won: { label: 'Closed Won', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-300', probability: 100 },
  closed_lost: { label: 'Closed Lost', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300', probability: 0 },
};

export const MOCK_DEALS: Deal[] = [
  { id: 'd1', title: 'Enterprise CRM Upgrade', company: 'Acme Corp', contactName: 'Sarah Johnson', contactEmail: 'sarah@acme.com', value: 85000, stage: 'negotiation', probability: 75, closeDate: '2026-04-15', owner: 'Alex Rivera', notes: 'Decision maker engaged. Legal review pending.', createdAt: '2026-01-10', updatedAt: '2026-03-20', source: 'Inbound' },
  { id: 'd2', title: 'Data Platform License', company: 'TechFlow Inc', contactName: 'Marcus Chen', contactEmail: 'mchen@techflow.io', value: 120000, stage: 'proposal', probability: 50, closeDate: '2026-05-01', owner: 'Jamie Park', notes: 'Sent proposal v2. Awaiting feedback.', createdAt: '2026-02-01', updatedAt: '2026-03-18', source: 'Referral' },
  { id: 'd3', title: 'Marketing Suite - Annual', company: 'Bright Media', contactName: 'Olivia Turner', contactEmail: 'o.turner@brightmedia.co', value: 42000, stage: 'qualified', probability: 25, closeDate: '2026-04-30', owner: 'Alex Rivera', notes: 'Budget confirmed. Evaluating competitors.', createdAt: '2026-02-15', updatedAt: '2026-03-15', source: 'Cold Outreach' },
  { id: 'd4', title: 'Security Compliance Package', company: 'FinGroup Ltd', contactName: 'David Kim', contactEmail: 'dkim@fingroup.com', value: 210000, stage: 'negotiation', probability: 75, closeDate: '2026-04-10', owner: 'Morgan Lee', notes: 'Final pricing discussion this week.', createdAt: '2025-12-01', updatedAt: '2026-03-21', source: 'Partner' },
  { id: 'd5', title: 'Cloud Migration Services', company: 'RetailChain Co', contactName: 'Emma Wilson', contactEmail: 'ewilson@retailchain.com', value: 67500, stage: 'proposal', probability: 50, closeDate: '2026-05-20', owner: 'Jamie Park', notes: 'Technical architecture review scheduled.', createdAt: '2026-02-20', updatedAt: '2026-03-19', source: 'Inbound' },
  { id: 'd6', title: 'HR Platform Implementation', company: 'Global Staffing', contactName: 'Raj Patel', contactEmail: 'raj@globalstaffing.com', value: 33000, stage: 'lead', probability: 10, closeDate: '2026-06-01', owner: 'Alex Rivera', notes: 'Initial demo scheduled next week.', createdAt: '2026-03-10', updatedAt: '2026-03-22', source: 'Conference' },
  { id: 'd7', title: 'Analytics Dashboard - Pro', company: 'StartupXYZ', contactName: 'Chloe Davis', contactEmail: 'chloe@startupxyz.com', value: 18000, stage: 'closed_won', probability: 100, closeDate: '2026-03-01', owner: 'Morgan Lee', notes: 'Signed and onboarding in progress.', createdAt: '2026-01-20', updatedAt: '2026-03-01', source: 'Inbound' },
  { id: 'd8', title: 'Legacy System Replacement', company: 'OldCo Industries', contactName: 'Frank Miller', contactEmail: 'fmiller@oldco.com', value: 95000, stage: 'closed_lost', probability: 0, closeDate: '2026-03-10', owner: 'Jamie Park', notes: 'Lost to competitor on pricing.', createdAt: '2026-01-05', updatedAt: '2026-03-10', source: 'Inbound' },
  { id: 'd9', title: 'SaaS Expansion License', company: 'GrowthCo', contactName: 'Nina Scott', contactEmail: 'nscott@growthco.com', value: 55000, stage: 'qualified', probability: 25, closeDate: '2026-05-15', owner: 'Morgan Lee', notes: 'Upsell from existing account.', createdAt: '2026-03-01', updatedAt: '2026-03-20', source: 'Account Expansion' },
  { id: 'd10', title: 'IoT Integration Platform', company: 'Smart Factory AG', contactName: 'Hans Mueller', contactEmail: 'hmueller@smartfactory.de', value: 180000, stage: 'proposal', probability: 50, closeDate: '2026-06-15', owner: 'Alex Rivera', notes: 'Complex technical requirements. POC running.', createdAt: '2026-02-10', updatedAt: '2026-03-22', source: 'Partner' },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Thomas Grant', company: 'NovaTech Solutions', email: 'tgrant@novatech.com', phone: '+1-555-0101', status: 'qualified', source: 'Inbound', score: 85, owner: 'Alex Rivera', createdAt: '2026-03-15', updatedAt: '2026-03-22', notes: 'Interested in enterprise plan.', industry: 'Technology', website: 'novatech.com' },
  { id: 'l2', name: 'Priya Sharma', company: 'Meridian Health', email: 'psharma@meridianhealth.org', phone: '+1-555-0102', status: 'contacted', source: 'LinkedIn', score: 62, owner: 'Jamie Park', createdAt: '2026-03-18', updatedAt: '2026-03-21', notes: 'Responded to outreach. Follow up call booked.', industry: 'Healthcare', website: 'meridianhealth.org' },
  { id: 'l3', name: 'Carlos Mendez', company: 'BuildRight Construction', email: 'cmendez@buildright.com', phone: '+1-555-0103', status: 'new', source: 'Conference', score: 45, owner: 'Morgan Lee', createdAt: '2026-03-20', updatedAt: '2026-03-20', notes: 'Met at TechSummit 2026.', industry: 'Construction', website: 'buildright.com' },
  { id: 'l4', name: 'Yuki Tanaka', company: 'Pacific Logistics', email: 'ytanaka@paclog.jp', phone: '+81-3-555-0104', status: 'converted', source: 'Referral', score: 95, owner: 'Alex Rivera', createdAt: '2026-02-28', updatedAt: '2026-03-15', notes: 'Converted to deal D-010.', industry: 'Logistics', website: 'paclog.jp' },
  { id: 'l5', name: 'Amara Osei', company: 'AfriComm Telecom', email: 'aosei@africomm.net', phone: '+233-555-0105', status: 'new', source: 'Cold Outreach', score: 30, owner: 'Jamie Park', createdAt: '2026-03-21', updatedAt: '2026-03-21', notes: 'Initial email sent.', industry: 'Telecom', website: 'africomm.net' },
  { id: 'l6', name: 'Sophie Laurent', company: 'EuroRetail Group', email: 'slaurent@euroretail.fr', phone: '+33-1-555-0106', status: 'qualified', source: 'Partner', score: 78, owner: 'Morgan Lee', createdAt: '2026-03-10', updatedAt: '2026-03-22', notes: 'Budget approved. Evaluating solutions.', industry: 'Retail', website: 'euroretail.fr' },
  { id: 'l7', name: 'Jake Thompson', company: 'ThunderCloud SaaS', email: 'jthompson@thundercloud.io', phone: '+1-555-0107', status: 'lost', source: 'Inbound', score: 20, owner: 'Alex Rivera', createdAt: '2026-02-20', updatedAt: '2026-03-10', notes: 'Went with competitor.', industry: 'Technology', website: 'thundercloud.io' },
  { id: 'l8', name: 'Fatima Al-Hassan', company: 'Gulf Energy Corp', email: 'falhassan@gulfenergy.sa', phone: '+966-555-0108', status: 'contacted', source: 'Inbound', score: 55, owner: 'Morgan Lee', createdAt: '2026-03-12', updatedAt: '2026-03-19', notes: 'Demo scheduled for next week.', industry: 'Energy', website: 'gulfenergy.sa' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'call', title: 'Discovery Call - Acme Corp', description: 'Discussed pain points and requirements for CRM upgrade', dealId: 'd1', owner: 'Alex Rivera', date: '2026-03-22', completed: true },
  { id: 'a2', type: 'email', title: 'Proposal sent to TechFlow', description: 'Sent revised proposal v2 with updated pricing', dealId: 'd2', owner: 'Jamie Park', date: '2026-03-21', completed: true },
  { id: 'a3', type: 'meeting', title: 'Legal Review - FinGroup', description: 'Meeting with legal team to finalize contract terms', dealId: 'd4', owner: 'Morgan Lee', date: '2026-03-23', completed: false },
  { id: 'a4', type: 'task', title: 'Follow up with Bright Media', description: 'Check if they reviewed the proposal', dealId: 'd3', owner: 'Alex Rivera', date: '2026-03-25', completed: false },
  { id: 'a5', type: 'note', title: 'Note: StartupXYZ Onboarding', description: 'Customer onboarding session went smoothly. Training scheduled.', dealId: 'd7', owner: 'Morgan Lee', date: '2026-03-20', completed: true },
  { id: 'a6', type: 'call', title: 'Intro Call - Thomas Grant', description: 'Introductory call. Highly interested. Qualified lead.', leadId: 'l1', owner: 'Alex Rivera', date: '2026-03-22', completed: true },
  { id: 'a7', type: 'email', title: 'Follow up - Priya Sharma', description: 'Sent product overview and case studies', leadId: 'l2', owner: 'Jamie Park', date: '2026-03-21', completed: true },
  { id: 'a8', type: 'meeting', title: 'Demo - Sophie Laurent', description: 'Product demo scheduled with EuroRetail team', leadId: 'l6', owner: 'Morgan Lee', date: '2026-03-26', completed: false },
];
