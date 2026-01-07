// ==========================================
// Global Store using Zustand
// ==========================================

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { 
  User, 
  Branch, 
  Customer, 
  Case, 
  Segment, 
  Campaign,
  CampaignEligibility,
  Lead,
  RMActivity,
  CustomerAssignment,
  AuditLog,
  AuditEvent,
  CaseCategory,
  CasePriority,
  LeadStatus,
  RMActivityType,
  CampaignStatus,
  SegmentRule,
} from '../types';
import type { RFMScore } from '../lib/rfm';
import type { NBARecommendation, NBADecision } from '../lib/nba';
import {
  seedUsers,
  seedBranches,
  seedCustomers,
  seedCases,
  seedSegments,
  seedCampaigns,
  seedCampaignEligibilities,
  seedLeads,
  seedRMActivities,
  seedCustomerAssignments,
  seedAuditLogs,
  seedRFMScores,
  seedNBARecommendations,
} from '../data/seed';
import { createAuditLog } from '../lib/audit';
import { calculateSLA } from '../lib/sla';
import { checkCampaignEligibility, canCloseCase } from '../lib/policy';

interface AppStore {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (userId: string) => void;

  // Static data
  users: User[];
  branches: Branch[];

  // Core entities
  customers: Customer[];
  cases: Case[];
  segments: Segment[];
  campaigns: Campaign[];
  campaignEligibilities: CampaignEligibility[];
  leads: Lead[];
  rmActivities: RMActivity[];
  customerAssignments: CustomerAssignment[];
  auditLogs: AuditLog[];
  rfmScores: RFMScore[];
  nbaRecommendations: NBARecommendation[];

  // Actions - Audit
  addAuditLog: (event: AuditEvent, entityType: AuditLog['entity_type'], entityId: string | null, details?: Record<string, unknown>) => void;

  // Actions - Cases
  createCase: (data: {
    customer_id: string;
    category: CaseCategory;
    priority: CasePriority;
    subject: string;
    description: string;
    branch_id: string;
  }) => Case;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  assignCase: (caseId: string, assignedTo: string) => void;
  setFinalResponse: (caseId: string, response: string) => void;
  closeCase: (caseId: string) => { success: boolean; error?: string };

  // Actions - Campaigns & Eligibility
  createSegment: (data: { name: string; description: string; rules: SegmentRule[] }) => Segment;
  createCampaign: (data: { name: string; description: string; segment_id: string; channel: Campaign['channel'] }) => Campaign;
  updateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  evaluateCampaignEligibility: (campaignId: string) => void;
  executeCampaign: (campaignId: string) => void;

  // Actions - Leads
  createLead: (data: { customer_id: string; campaign_id: string | null; product_interest: string; notes: string }) => Lead;
  updateLeadStatus: (leadId: string, status: LeadStatus, notes?: string) => void;

  // Actions - RM Activities
  createRMActivity: (data: { customer_id: string; lead_id: string | null; type: RMActivityType; subject: string; notes: string }) => RMActivity;

  // Actions - Consent
  updateConsent: (customerId: string, field: 'marketing' | 'data_sharing', value: 'GRANTED' | 'WITHDRAWN') => void;

  // Getters
  getCustomerById: (id: string) => Customer | undefined;
  getCaseById: (id: string) => Case | undefined;
  getCasesByCustomer: (customerId: string) => Case[];
  getLeadsByCustomer: (customerId: string) => Lead[];
  getRMActivitiesByCustomer: (customerId: string) => RMActivity[];
  getBranchById: (id: string) => Branch | undefined;
  getUserById: (id: string) => User | undefined;
  hasActiveCase: (customerId: string) => boolean;
  getRFMByCustomer: (customerId: string) => RFMScore | undefined;
  getNBAByCustomer: (customerId: string) => NBARecommendation[];
  updateNBADecision: (nbaId: string, decision: NBADecision, reason?: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state from seed
  currentUser: seedUsers[2], // Default to AGENT for testing
  users: seedUsers,
  branches: seedBranches,
  customers: seedCustomers,
  cases: seedCases,
  segments: seedSegments,
  campaigns: seedCampaigns,
  campaignEligibilities: seedCampaignEligibilities,
  leads: seedLeads,
  rmActivities: seedRMActivities,
  customerAssignments: seedCustomerAssignments,
  auditLogs: seedAuditLogs,
  rfmScores: seedRFMScores,
  nbaRecommendations: seedNBARecommendations,

  // User management
  setCurrentUser: (user) => set({ currentUser: user }),
  
  switchRole: (userId) => {
    const user = get().users.find(u => u.id === userId);
    if (user) {
      set({ currentUser: user });
      get().addAuditLog('ROLE_SWITCH', 'USER', userId, { 
        switched_to_role: user.role,
        switched_to_name: user.name 
      });
    }
  },

  // Audit logging
  addAuditLog: (event, entityType, entityId, details = {}) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    const log = createAuditLog(currentUser, event, entityType, entityId, details);
    set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
  },

  // Case actions
  createCase: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const caseNumber = `CS-${new Date().getFullYear()}-${String(get().cases.length + 1).padStart(4, '0')}`;
    const now = new Date();
    const sla = calculateSLA(data.category, data.priority, now);

    const newCase: Case = {
      id: uuidv4(),
      case_number: caseNumber,
      customer_id: data.customer_id,
      category: data.category,
      priority: data.priority,
      status: 'OPEN',
      subject: data.subject,
      description: data.description,
      assigned_to: null,
      branch_id: data.branch_id,
      sla,
      final_response: null,
      created_by: currentUser.id,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      closed_at: null,
    };

    set((state) => ({ cases: [...state.cases, newCase] }));
    get().addAuditLog('CREATE_CASE', 'CASE', newCase.id, { 
      case_number: caseNumber, 
      category: data.category,
      priority: data.priority,
      customer_id: data.customer_id,
    });

    return newCase;
  },

  updateCase: (caseId, updates) => {
    set((state) => ({
      cases: state.cases.map(c => 
        c.id === caseId 
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
      ),
    }));
    get().addAuditLog('UPDATE_CASE', 'CASE', caseId, updates);
  },

  assignCase: (caseId, assignedTo) => {
    set((state) => ({
      cases: state.cases.map(c => 
        c.id === caseId 
          ? { ...c, assigned_to: assignedTo, status: 'IN_PROGRESS', updated_at: new Date().toISOString() }
          : c
      ),
    }));
    const assignee = get().getUserById(assignedTo);
    get().addAuditLog('ASSIGN_CASE', 'CASE', caseId, { 
      assigned_to: assignedTo,
      assigned_to_name: assignee?.name,
    });
  },

  setFinalResponse: (caseId, response) => {
    set((state) => ({
      cases: state.cases.map(c => 
        c.id === caseId 
          ? { ...c, final_response: response, updated_at: new Date().toISOString() }
          : c
      ),
    }));
    get().addAuditLog('FINAL_RESPONSE', 'CASE', caseId, { 
      response_length: response.length,
    });
  },

  closeCase: (caseId) => {
    const caseData = get().cases.find(c => c.id === caseId);
    if (!caseData) return { success: false, error: 'Case not found' };

    const validation = canCloseCase(caseData);
    if (!validation.allowed) {
      return { success: false, error: validation.reason };
    }

    const now = new Date().toISOString();
    set((state) => ({
      cases: state.cases.map(c => 
        c.id === caseId 
          ? { ...c, status: 'CLOSED', closed_at: now, updated_at: now }
          : c
      ),
    }));
    get().addAuditLog('CLOSE_CASE', 'CASE', caseId, { closed_at: now });
    return { success: true };
  },

  // Campaign & Segment actions
  createSegment: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const newSegment: Segment = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      rules: data.rules,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ segments: [...state.segments, newSegment] }));
    get().addAuditLog('CREATE_SEGMENT', 'SEGMENT', newSegment.id, { name: data.name });
    return newSegment;
  },

  createCampaign: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const newCampaign: Campaign = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      segment_id: data.segment_id,
      status: 'DRAFT',
      channel: data.channel,
      scheduled_at: null,
      executed_at: null,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ campaigns: [...state.campaigns, newCampaign] }));
    get().addAuditLog('CREATE_CAMPAIGN', 'CAMPAIGN', newCampaign.id, { name: data.name });
    return newCampaign;
  },

  updateCampaignStatus: (campaignId, status) => {
    set((state) => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaignId ? { ...c, status } : c
      ),
    }));
  },

  evaluateCampaignEligibility: (campaignId) => {
    const customers = get().customers;
    const now = new Date().toISOString();
    
    const eligibilities: CampaignEligibility[] = customers.map(customer => {
      const hasActive = get().hasActiveCase(customer.id);
      const result = checkCampaignEligibility(customer, hasActive);
      
      return {
        customer_id: customer.id,
        campaign_id: campaignId,
        eligible: result.eligible,
        ineligible_reason: result.reason as CampaignEligibility['ineligible_reason'],
        evaluated_at: now,
      };
    });

    set((state) => ({
      campaignEligibilities: [
        ...state.campaignEligibilities.filter(e => e.campaign_id !== campaignId),
        ...eligibilities,
      ],
    }));
  },

  executeCampaign: (campaignId) => {
    const now = new Date().toISOString();
    set((state) => ({
      campaigns: state.campaigns.map(c => 
        c.id === campaignId 
          ? { ...c, status: 'EXECUTING' as CampaignStatus, executed_at: now }
          : c
      ),
    }));
    get().addAuditLog('EXECUTE_CAMPAIGN', 'CAMPAIGN', campaignId, { executed_at: now });

    // Simulate completion after a short delay
    setTimeout(() => {
      set((state) => ({
        campaigns: state.campaigns.map(c => 
          c.id === campaignId 
            ? { ...c, status: 'COMPLETED' as CampaignStatus }
            : c
        ),
      }));
    }, 2000);
  },

  // Lead actions
  createLead: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    // Find RM for this customer
    const assignment = get().customerAssignments.find(
      a => a.customer_id === data.customer_id && a.is_active
    );
    const assignedTo = assignment?.rm_id || currentUser.id;

    const newLead: Lead = {
      id: uuidv4(),
      customer_id: data.customer_id,
      campaign_id: data.campaign_id,
      assigned_to: assignedTo,
      status: 'NEW',
      product_interest: data.product_interest,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({ leads: [...state.leads, newLead] }));
    get().addAuditLog('CREATE_LEAD', 'LEAD', newLead.id, { 
      customer_id: data.customer_id,
      product: data.product_interest,
    });
    return newLead;
  },

  updateLeadStatus: (leadId, status, notes) => {
    set((state) => ({
      leads: state.leads.map(l => 
        l.id === leadId 
          ? { 
              ...l, 
              status, 
              notes: notes || l.notes,
              updated_at: new Date().toISOString() 
            }
          : l
      ),
    }));
    get().addAuditLog('UPDATE_LEAD', 'LEAD', leadId, { new_status: status });
  },

  // RM Activity actions
  createRMActivity: (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) throw new Error('No user logged in');

    const newActivity: RMActivity = {
      id: uuidv4(),
      customer_id: data.customer_id,
      lead_id: data.lead_id,
      rm_id: currentUser.id,
      type: data.type,
      subject: data.subject,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ rmActivities: [...state.rmActivities, newActivity] }));
    get().addAuditLog('CREATE_RM_ACTIVITY', 'CUSTOMER', data.customer_id, { 
      type: data.type,
      subject: data.subject,
    });
    return newActivity;
  },

  // Consent update
  updateConsent: (customerId, field, value) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    set((state) => ({
      customers: state.customers.map(c => 
        c.id === customerId 
          ? { 
              ...c, 
              consent: {
                ...c.consent,
                [field]: value,
                updated_at: new Date().toISOString(),
                updated_by: currentUser.id,
              }
            }
          : c
      ),
    }));
    get().addAuditLog('CHANGE_CONSENT', 'CUSTOMER', customerId, { 
      field,
      old_value: get().customers.find(c => c.id === customerId)?.consent[field],
      new_value: value,
    });
  },

  // Getters
  getCustomerById: (id) => get().customers.find(c => c.id === id),
  getCaseById: (id) => get().cases.find(c => c.id === id),
  getCasesByCustomer: (customerId) => get().cases.filter(c => c.customer_id === customerId),
  getLeadsByCustomer: (customerId) => get().leads.filter(l => l.customer_id === customerId),
  getRMActivitiesByCustomer: (customerId) => get().rmActivities.filter(a => a.customer_id === customerId),
  getBranchById: (id) => get().branches.find(b => b.id === id),
  getUserById: (id) => get().users.find(u => u.id === id),
  hasActiveCase: (customerId) => {
    return get().cases.some(c => 
      c.customer_id === customerId && 
      (c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'ESCALATED')
    );
  },
  getRFMByCustomer: (customerId) => get().rfmScores.find(r => r.customer_id === customerId),
  
  // NBA getters and actions
  getNBAByCustomer: (customerId) => get().nbaRecommendations.filter(n => 
    n.customer_id === customerId && !n.decision
  ),
  
  updateNBADecision: (nbaId, decision, reason) => {
    const currentUser = get().currentUser;
    set(state => ({
      nbaRecommendations: state.nbaRecommendations.map(nba =>
        nba.id === nbaId
          ? {
              ...nba,
              decision,
              decision_reason: reason,
              decided_at: new Date().toISOString(),
              decided_by: currentUser?.id || 'unknown',
            }
          : nba
      ),
    }));
  },
}));
