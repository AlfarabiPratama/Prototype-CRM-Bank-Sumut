// ==========================================
// CRM Bank Sumut - Type Definitions
// ==========================================

// === ROLE & AUTH ===
export type Role = 
  | 'DIRECTOR' 
  | 'SUPERVISOR' 
  | 'AGENT' 
  | 'RM' 
  | 'MARKETING' 
  | 'COMPLIANCE' 
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branch_id: string | null;  // null for DIRECTOR, COMPLIANCE, MARKETING, ADMIN
  portfolio_customer_ids?: string[]; // only for RM
}

export type BranchType = 'HEAD_OFFICE' | 'COORDINATOR' | 'BRANCH' | 'BRANCH_SYARIAH' | 'SUB_BRANCH' | 'SUB_BRANCH_SYARIAH' | 'PAYMENT_POINT';

export interface Branch {
  id: string;
  name: string;
  code: string;
  city?: string;  // City code (e.g., MEDAN, BINJAI, KABANJAHE)
  type?: BranchType;  // Branch type classification
}

// === CUSTOMER ===
export type ConsentStatus = 'GRANTED' | 'WITHDRAWN';

export interface CustomerConsent {
  marketing: ConsentStatus;
  data_sharing: ConsentStatus;
  updated_at: string;
  updated_by: string;
}

export interface Customer {
  id: string;
  cif: string;
  name: string;
  nik: string;
  email: string;
  phone: string;
  account_numbers: string[];
  branch_id: string;
  segment: 'MASS' | 'EMERGING' | 'PRIORITY' | 'PRIVATE';
  consent: CustomerConsent;
  created_at: string;
}

// === CASE ===
export type CaseCategory = 
  | 'TRX_FAIL' 
  | 'CARD_ATM' 
  | 'DIGITAL_ACCESS' 
  | 'FRAUD_SCAM' 
  | 'FEE_ADMIN' 
  | 'LOAN_CREDIT' 
  | 'OTHER';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED';

export interface CaseSLA {
  response_hours: number;
  resolution_hours: number;
  due_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  customer_id: string;
  category: CaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  subject: string;
  description: string;
  assigned_to: string | null;
  branch_id: string;
  sla: CaseSLA;
  final_response: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// === MARKETING ===
export interface SegmentRule {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | string[] | number;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  created_by: string;
  created_at: string;
}

export type CampaignStatus = 'DRAFT' | 'APPROVED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  segment_id: string;
  status: CampaignStatus;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP';
  scheduled_at: string | null;
  executed_at: string | null;
  created_by: string;
  created_at: string;
}

export type IneligibleReason = 'CONSENT' | 'CASE_ACTIVE' | 'SEGMENT_MISMATCH' | null;

export interface CampaignEligibility {
  customer_id: string;
  campaign_id: string;
  eligible: boolean;
  ineligible_reason: IneligibleReason;
  evaluated_at: string;
}

// === SALES ===
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  customer_id: string;
  campaign_id: string | null;
  assigned_to: string; // RM user id
  status: LeadStatus;
  product_interest: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type RMActivityType = 'CALL' | 'VISIT' | 'EMAIL' | 'MEETING' | 'NOTE';

export interface RMActivity {
  id: string;
  customer_id: string;
  lead_id: string | null;
  rm_id: string;
  type: RMActivityType;
  subject: string;
  notes: string;
  created_at: string;
}

// === CUSTOMER ASSIGNMENT (for RM portfolio) ===
export interface CustomerAssignment {
  id: string;
  customer_id: string;
  rm_id: string;
  assigned_at: string;
  is_active: boolean;
}

// === AUDIT LOG ===
export type AuditEvent = 
  | 'SEARCH_CUSTOMER'
  | 'VIEW_PROFILE'
  | 'CREATE_CASE'
  | 'UPDATE_CASE'
  | 'ASSIGN_CASE'
  | 'FINAL_RESPONSE'
  | 'CLOSE_CASE'
  | 'CHANGE_CONSENT'
  | 'EXPORT_DATA'
  | 'CHANGE_RBAC'
  | 'CHANGE_WORKFLOW'
  | 'CREATE_SEGMENT'
  | 'CREATE_CAMPAIGN'
  | 'EXECUTE_CAMPAIGN'
  | 'CREATE_LEAD'
  | 'UPDATE_LEAD'
  | 'CREATE_RM_ACTIVITY'
  | 'LOGIN'
  | 'ROLE_SWITCH';

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  event: AuditEvent;
  entity_type: 'CUSTOMER' | 'CASE' | 'CAMPAIGN' | 'SEGMENT' | 'LEAD' | 'USER' | 'SYSTEM';
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
}

// === TIMELINE (aggregated view) ===
export type TimelineItemType = 'CASE' | 'CAMPAIGN' | 'RM_ACTIVITY' | 'CONSENT_CHANGE' | 'LEAD';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  timestamp: string;
  title: string;
  description: string;
  actor_name: string;
  metadata: Record<string, unknown>;
}

// === APP STATE ===
export interface AppState {
  currentUser: User | null;
  users: User[];
  branches: Branch[];
  customers: Customer[];
  cases: Case[];
  segments: Segment[];
  campaigns: Campaign[];
  campaignEligibilities: CampaignEligibility[];
  leads: Lead[];
  rmActivities: RMActivity[];
  customerAssignments: CustomerAssignment[];
  auditLogs: AuditLog[];
  rfmScores: import('../lib/rfm').RFMScore[];
}

// Re-export RFM types for convenience
export type { RFMScore, RFMSegment, CLVProxy, RFMScoreValue } from '../lib/rfm';

