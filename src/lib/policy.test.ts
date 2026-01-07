// ==========================================
// RBAC Policy Tests
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  can,
  filterCustomersByScope,
  filterCasesByScope,
  filterLeadsByScope,
  filterAuditLogsByScope,
  canCloseCase,
  checkCampaignEligibility,
} from './policy';
import type { User, Customer, Case, Lead, AuditLog } from '../types';

// Mock users (without is_active as it's not in User type)
const mockUsers: Record<string, User> = {
  director: {
    id: 'user-dir',
    name: 'Director',
    email: 'director@bank.com',
    role: 'DIRECTOR',
    branch_id: null,
  },
  supervisor: {
    id: 'user-sup',
    name: 'Supervisor',
    email: 'supervisor@bank.com',
    role: 'SUPERVISOR',
    branch_id: 'branch-1',
  },
  agent: {
    id: 'user-agent',
    name: 'Agent',
    email: 'agent@bank.com',
    role: 'AGENT',
    branch_id: 'branch-1',
  },
  rm: {
    id: 'user-rm',
    name: 'RM',
    email: 'rm@bank.com',
    role: 'RM',
    branch_id: 'branch-1',
  },
  marketing: {
    id: 'user-mkt',
    name: 'Marketing',
    email: 'marketing@bank.com',
    role: 'MARKETING',
    branch_id: null,
  },
  compliance: {
    id: 'user-comp',
    name: 'Compliance',
    email: 'compliance@bank.com',
    role: 'COMPLIANCE',
    branch_id: null,
  },
  admin: {
    id: 'user-admin',
    name: 'Admin',
    email: 'admin@bank.com',
    role: 'ADMIN',
    branch_id: null,
  },
};

describe('RBAC Policy', () => {
  describe('can', () => {
    it('should return false for null user', () => {
      expect(can(null, 'view_customer')).toBe(false);
    });

    it('should allow DIRECTOR to view_dashboard', () => {
      expect(can(mockUsers.director, 'view_dashboard')).toBe(true);
    });

    it('should NOT allow DIRECTOR to view_customer', () => {
      expect(can(mockUsers.director, 'view_customer')).toBe(false);
    });

    it('should allow SUPERVISOR to view_customer_sensitive', () => {
      expect(can(mockUsers.supervisor, 'view_customer_sensitive')).toBe(true);
    });

    it('should allow AGENT to create_case', () => {
      expect(can(mockUsers.agent, 'create_case')).toBe(true);
    });

    it('should NOT allow AGENT to close HIGH priority case', () => {
      expect(can(mockUsers.agent, 'close_case', { priority: 'HIGH' })).toBe(false);
    });

    it('should allow AGENT to close MEDIUM priority case', () => {
      expect(can(mockUsers.agent, 'close_case', { priority: 'MEDIUM' })).toBe(true);
    });

    it('should allow SUPERVISOR to close HIGH priority case', () => {
      expect(can(mockUsers.supervisor, 'close_case', { priority: 'HIGH' })).toBe(true);
    });

    it('should allow RM to update_lead', () => {
      expect(can(mockUsers.rm, 'update_lead')).toBe(true);
    });

    it('should NOT allow RM to create_case', () => {
      expect(can(mockUsers.rm, 'create_case')).toBe(false);
    });

    it('should allow MARKETING to create_campaign', () => {
      expect(can(mockUsers.marketing, 'create_campaign')).toBe(true);
    });

    it('should NOT allow MARKETING to change_consent', () => {
      expect(can(mockUsers.marketing, 'change_consent')).toBe(false);
    });

    it('should allow COMPLIANCE to view_audit', () => {
      expect(can(mockUsers.compliance, 'view_audit')).toBe(true);
    });

    it('should allow ADMIN to change_rbac', () => {
      expect(can(mockUsers.admin, 'change_rbac')).toBe(true);
    });
  });

  describe('filterCustomersByScope', () => {
    const customers: Customer[] = [
      {
        id: 'customer-1',
        cif: 'CIF001',
        name: 'Customer 1',
        branch_id: 'branch-1',
        segment: 'MASS',
        nik: '1234567890123456',
        email: 'c1@test.com',
        phone: '081234567890',
        account_numbers: ['1234567890'],
        consent: {
          marketing: 'GRANTED',
          data_sharing: 'GRANTED',
          updated_at: '2024-01-01',
          updated_by: 'admin',
        },
        created_at: '2024-01-01',
      },
      {
        id: 'customer-2',
        cif: 'CIF002',
        name: 'Customer 2',
        branch_id: 'branch-2',
        segment: 'MASS',
        nik: '9876543210987654',
        email: 'c2@test.com',
        phone: '081234567891',
        account_numbers: ['0987654321'],
        consent: {
          marketing: 'GRANTED',
          data_sharing: 'GRANTED',
          updated_at: '2024-01-01',
          updated_by: 'admin',
        },
        created_at: '2024-01-01',
      },
    ];

    const assignments = [
      { customer_id: 'customer-1', rm_id: 'user-rm', is_active: true },
    ];

    it('should return empty for DIRECTOR', () => {
      const result = filterCustomersByScope(mockUsers.director, customers);
      expect(result).toHaveLength(0);
    });

    it('should filter by branch for SUPERVISOR', () => {
      const result = filterCustomersByScope(mockUsers.supervisor, customers);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('customer-1');
    });

    it('should filter by assignment for RM', () => {
      const result = filterCustomersByScope(mockUsers.rm, customers, assignments);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('customer-1');
    });

    it('should return all for ADMIN', () => {
      const result = filterCustomersByScope(mockUsers.admin, customers);
      expect(result).toHaveLength(2);
    });

    it('should return empty for MARKETING', () => {
      const result = filterCustomersByScope(mockUsers.marketing, customers);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterCasesByScope', () => {
    const cases: Case[] = [
      {
        id: 'case-1',
        case_number: 'CS001',
        customer_id: 'customer-1',
        branch_id: 'branch-1',
        subject: 'Test Case',
        description: 'Test description',
        category: 'OTHER',
        priority: 'LOW',
        status: 'OPEN',
        created_by: 'user-1',
        assigned_to: 'user-agent',
        sla: { response_hours: 48, resolution_hours: 120, due_at: '2024-12-31' },
        final_response: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        closed_at: null,
      },
    ];

    it('should filter by branch for AGENT', () => {
      const result = filterCasesByScope(mockUsers.agent, cases);
      expect(result).toHaveLength(1);
    });

    it('should return empty for DIRECTOR', () => {
      const result = filterCasesByScope(mockUsers.director, cases);
      expect(result).toHaveLength(0);
    });

    it('should return empty for RM', () => {
      const result = filterCasesByScope(mockUsers.rm, cases);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterLeadsByScope', () => {
    const leads: Lead[] = [
      {
        id: 'lead-1',
        customer_id: 'customer-1',
        campaign_id: null,
        product_interest: 'Kredit Usaha',
        notes: 'Interested in business loan',
        status: 'NEW',
        assigned_to: 'user-rm',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'lead-2',
        customer_id: 'customer-2',
        campaign_id: null,
        product_interest: 'Tabungan',
        notes: 'Interested in savings',
        status: 'NEW',
        assigned_to: 'user-rm-2',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    it('should filter by assignment for RM', () => {
      const result = filterLeadsByScope(mockUsers.rm, leads);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('lead-1');
    });

    it('should return all for MARKETING', () => {
      const result = filterLeadsByScope(mockUsers.marketing, leads);
      expect(result).toHaveLength(2);
    });
  });

  describe('filterAuditLogsByScope', () => {
    const logs: AuditLog[] = [
      {
        id: 'log-1',
        timestamp: '2024-01-01T10:00:00Z',
        user_id: 'user-1',
        user_name: 'Test User',
        user_role: 'AGENT',
        event: 'VIEW_PROFILE',
        entity_type: 'CUSTOMER',
        entity_id: 'customer-1',
        details: {},
        ip_address: '127.0.0.1',
      },
    ];

    it('should return all for COMPLIANCE', () => {
      const result = filterAuditLogsByScope(mockUsers.compliance, logs);
      expect(result).toHaveLength(1);
    });

    it('should return empty for AGENT', () => {
      const result = filterAuditLogsByScope(mockUsers.agent, logs);
      expect(result).toHaveLength(0);
    });
  });

  describe('canCloseCase', () => {
    it('should NOT allow closing case without final_response', () => {
      const caseData: Case = {
        id: 'case-1',
        case_number: 'CS001',
        customer_id: 'customer-1',
        branch_id: 'branch-1',
        subject: 'Test',
        description: 'Test description',
        category: 'OTHER',
        priority: 'LOW',
        status: 'OPEN',
        created_by: 'user-1',
        assigned_to: 'user-agent',
        final_response: null,
        sla: { response_hours: 48, resolution_hours: 120, due_at: '2024-12-31' },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        closed_at: null,
      };

      const result = canCloseCase(caseData);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('final_response');
    });

    it('should allow closing case with final_response', () => {
      const caseData: Case = {
        id: 'case-1',
        case_number: 'CS001',
        customer_id: 'customer-1',
        branch_id: 'branch-1',
        subject: 'Test',
        description: 'Test description',
        category: 'OTHER',
        priority: 'LOW',
        status: 'OPEN',
        created_by: 'user-1',
        assigned_to: 'user-agent',
        final_response: 'Resolved by updating account settings.',
        sla: { response_hours: 48, resolution_hours: 120, due_at: '2024-12-31' },
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        closed_at: null,
      };

      const result = canCloseCase(caseData);
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkCampaignEligibility', () => {
    const customer: Customer = {
      id: 'customer-1',
      cif: 'CIF001',
      name: 'Test Customer',
      branch_id: 'branch-1',
      segment: 'MASS',
      nik: '1234567890123456',
      email: 'test@test.com',
      phone: '081234567890',
      account_numbers: ['1234567890'],
      consent: {
        marketing: 'GRANTED',
        data_sharing: 'GRANTED',
        updated_at: '2024-01-01',
        updated_by: 'admin',
      },
      created_at: '2024-01-01',
    };

    it('should be eligible with consent and no active case', () => {
      const result = checkCampaignEligibility(customer, false);
      expect(result.eligible).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('should NOT be eligible with withdrawn consent', () => {
      const customerWithdrawn: Customer = {
        ...customer,
        consent: {
          marketing: 'WITHDRAWN',
          data_sharing: 'GRANTED',
          updated_at: '2024-01-01',
          updated_by: 'admin',
        },
      };
      const result = checkCampaignEligibility(customerWithdrawn, false);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('CONSENT');
    });

    it('should NOT be eligible with active case', () => {
      const result = checkCampaignEligibility(customer, true);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('CASE_ACTIVE');
    });
  });
});
