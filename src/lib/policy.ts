// ==========================================
// RBAC Policy Engine - Server-like enforcement
// ==========================================

import type { User, Role, Customer, Case, Lead, AuditLog } from '../types';

// === PERMISSION DEFINITIONS ===
type Action = 
  | 'view_customer'
  | 'view_customer_sensitive'
  | 'search_customer'
  | 'view_case'
  | 'create_case'
  | 'update_case'
  | 'assign_case'
  | 'close_case'
  | 'final_response'
  | 'escalate_case'
  | 'view_segment'
  | 'create_segment'
  | 'view_campaign'
  | 'create_campaign'
  | 'execute_campaign'
  | 'change_consent'
  | 'view_lead'
  | 'update_lead'
  | 'create_rm_activity'
  | 'view_audit'
  | 'export_audit'
  | 'export_customer_data'
  | 'change_rbac'
  | 'change_workflow'
  | 'view_dashboard'
  | 'view_dashboard_detail';

// Role -> Actions mapping
const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  DIRECTOR: [
    'view_dashboard',
    // DIRECTOR hanya dashboard agregat, TIDAK boleh view profile atau export per nasabah
  ],
  SUPERVISOR: [
    'view_dashboard',
    'view_dashboard_detail',
    'search_customer',
    'view_customer',
    'view_customer_sensitive',
    'view_case',
    'create_case',
    'update_case',
    'assign_case',
    'escalate_case',
    'close_case',
    'final_response',
  ],
  AGENT: [
    'view_dashboard',
    'search_customer',
    'view_customer',
    'view_case',
    'create_case',
    'update_case',
    'final_response', // only for LOW/MEDIUM priority
    'close_case', // only for LOW/MEDIUM priority
  ],
  RM: [
    'view_dashboard',
    'view_customer',
    'view_customer_sensitive',
    'view_lead',
    'update_lead',
    'create_rm_activity',
  ],
  MARKETING: [
    'view_segment',
    'create_segment',
    'view_campaign',
    'create_campaign',
    'execute_campaign',
    // TIDAK boleh change_consent
  ],
  COMPLIANCE: [
    'view_audit',
    'export_audit',
    'search_customer', // untuk investigasi
    'view_customer',
    // TIDAK boleh edit data operasional
  ],
  ADMIN: [
    'view_dashboard',
    'view_dashboard_detail',
    'search_customer',
    'view_customer',
    'view_customer_sensitive',
    'view_case',
    'view_segment',
    'view_campaign',
    'view_lead',
    'view_audit',
    'change_rbac',
    'change_workflow',
    'change_consent', // untuk demo
  ],
};

// === MAIN PERMISSION CHECK ===
export function can(user: User | null, action: Action, context?: Record<string, unknown>): boolean {
  if (!user) return false;
  
  const allowed = ROLE_PERMISSIONS[user.role];
  if (!allowed.includes(action)) return false;

  // Additional context-based checks
  switch (action) {
    case 'final_response':
    case 'close_case':
      // AGENT only for LOW/MEDIUM
      if (user.role === 'AGENT' && context?.priority) {
        const priority = context.priority as string;
        if (priority === 'HIGH' || priority === 'CRITICAL') {
          return false;
        }
      }
      return true;
    
    default:
      return true;
  }
}

// === SCOPE FILTERING ===

/**
 * Filter customers by user scope
 * - DIRECTOR: no access to individual customers
 * - SUPERVISOR/AGENT: only their branch
 * - RM: only their portfolio
 * - COMPLIANCE: all (for investigation)
 * - MARKETING: none (they work with segments)
 * - ADMIN: all
 */
export function filterCustomersByScope(
  user: User | null, 
  customers: Customer[],
  customerAssignments?: { customer_id: string; rm_id: string; is_active: boolean }[]
): Customer[] {
  if (!user) return [];

  switch (user.role) {
    case 'DIRECTOR':
      return []; // No individual customer access
    
    case 'SUPERVISOR':
    case 'AGENT':
      return customers.filter(c => c.branch_id === user.branch_id);
    
    case 'RM': {
      // Only customers in active portfolio
      if (!customerAssignments) return [];
      const assignedIds = new Set(
        customerAssignments
          .filter(a => a.rm_id === user.id && a.is_active)
          .map(a => a.customer_id)
      );
      return customers.filter(c => assignedIds.has(c.id));
    }
    
    case 'COMPLIANCE':
    case 'ADMIN':
      return customers; // Full access for investigation/admin
    
    case 'MARKETING':
      return []; // No direct customer access
    
    default:
      return [];
  }
}

/**
 * Filter cases by user scope
 */
export function filterCasesByScope(user: User | null, cases: Case[]): Case[] {
  if (!user) return [];

  switch (user.role) {
    case 'DIRECTOR':
    case 'MARKETING':
      return [];
    
    case 'SUPERVISOR':
    case 'AGENT':
      return cases.filter(c => c.branch_id === user.branch_id);
    
    case 'COMPLIANCE':
    case 'ADMIN':
      return cases;
    
    case 'RM':
      return []; // RM doesn't handle cases
    
    default:
      return [];
  }
}

/**
 * Filter leads by user scope (RM only sees assigned leads)
 */
export function filterLeadsByScope(user: User | null, leads: Lead[]): Lead[] {
  if (!user) return [];

  switch (user.role) {
    case 'RM':
      return leads.filter(l => l.assigned_to === user.id);
    
    case 'MARKETING':
    case 'ADMIN':
      return leads;
    
    default:
      return [];
  }
}

/**
 * Filter audit logs by user scope
 */
export function filterAuditLogsByScope(user: User | null, logs: AuditLog[]): AuditLog[] {
  if (!user) return [];

  switch (user.role) {
    case 'COMPLIANCE':
    case 'ADMIN':
      return logs;
    
    default:
      return [];
  }
}

// === GUARDRAILS ===

/**
 * Guardrail: Case cannot be closed if final_response is empty
 */
export function canCloseCase(caseData: Case): { allowed: boolean; reason?: string } {
  if (!caseData.final_response || caseData.final_response.trim() === '') {
    return {
      allowed: false,
      reason: 'Case tidak dapat ditutup: final_response wajib diisi terlebih dahulu.'
    };
  }
  return { allowed: true };
}

/**
 * Check if customer is eligible for marketing campaign
 */
export function checkCampaignEligibility(
  customer: Customer,
  hasActiveCase: boolean
): { eligible: boolean; reason: string | null } {
  // Check consent first
  if (customer.consent.marketing === 'WITHDRAWN') {
    return { eligible: false, reason: 'CONSENT' };
  }

  // Check active case (sensitive case policy)
  if (hasActiveCase) {
    return { eligible: false, reason: 'CASE_ACTIVE' };
  }

  return { eligible: true, reason: null };
}
