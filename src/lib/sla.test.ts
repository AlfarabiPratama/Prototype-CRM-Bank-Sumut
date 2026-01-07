// ==========================================
// SLA Service Tests
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  calculateSLA,
  isSLABreached,
  getSLAStatus,
  formatSLARemaining,
  suggestPriority,
} from './sla';

describe('SLA Service', () => {
  describe('calculateSLA', () => {
    it('should calculate SLA for FRAUD_SCAM CRITICAL (fastest)', () => {
      const createdAt = new Date('2024-12-24T10:00:00Z');
      const sla = calculateSLA('FRAUD_SCAM', 'CRITICAL', createdAt);
      
      expect(sla.response_hours).toBe(0.5);
      expect(sla.resolution_hours).toBe(4);
      // Due at should be 4 hours after creation
      expect(new Date(sla.due_at).getTime()).toBe(
        createdAt.getTime() + 4 * 60 * 60 * 1000
      );
    });

    it('should calculate SLA for OTHER LOW (slowest)', () => {
      const createdAt = new Date('2024-12-24T10:00:00Z');
      const sla = calculateSLA('OTHER', 'LOW', createdAt);
      
      expect(sla.response_hours).toBe(48);
      expect(sla.resolution_hours).toBe(120);
    });

    it('should calculate SLA for TRX_FAIL HIGH', () => {
      const sla = calculateSLA('TRX_FAIL', 'HIGH');
      
      expect(sla.response_hours).toBe(4);
      expect(sla.resolution_hours).toBe(24);
    });

    it('should return due_at as ISO string', () => {
      const sla = calculateSLA('CARD_ATM', 'MEDIUM');
      
      expect(sla.due_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('isSLABreached', () => {
    it('should return true for past due date', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      };
      
      expect(isSLABreached(sla)).toBe(true);
    });

    it('should return false for future due date', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
      };
      
      expect(isSLABreached(sla)).toBe(false);
    });
  });

  describe('getSLAStatus', () => {
    it('should return BREACHED for past due date', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() - 1000).toISOString(), // 1 second ago
      };
      
      expect(getSLAStatus(sla)).toBe('BREACHED');
    });

    it('should return WARNING for <25% time remaining', () => {
      // 24 hour SLA with only 5 hours remaining (< 6 hours = 25% of 24)
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      };
      
      expect(getSLAStatus(sla)).toBe('WARNING');
    });

    it('should return OK for >25% time remaining', () => {
      // 24 hour SLA with 20 hours remaining
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      };
      
      expect(getSLAStatus(sla)).toBe('OK');
    });
  });

  describe('formatSLARemaining', () => {
    it('should format overdue hours', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      };
      
      expect(formatSLARemaining(sla)).toBe('Overdue 5h');
    });

    it('should format overdue days and hours', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours ago
      };
      
      expect(formatSLARemaining(sla)).toBe('Overdue 1d 6h');
    });

    it('should format remaining hours and minutes', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 24,
        due_at: new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 5h 30m from now
      };
      
      const result = formatSLARemaining(sla);
      expect(result).toMatch(/5h \d+m remaining/);
    });

    it('should format remaining days', () => {
      const sla = {
        response_hours: 4,
        resolution_hours: 120,
        due_at: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), // 50 hours from now
      };
      
      expect(formatSLARemaining(sla)).toBe('2d 2h remaining');
    });
  });

  describe('suggestPriority', () => {
    it('should suggest HIGH for FRAUD_SCAM', () => {
      expect(suggestPriority('FRAUD_SCAM')).toBe('HIGH');
    });

    it('should suggest MEDIUM for TRX_FAIL', () => {
      expect(suggestPriority('TRX_FAIL')).toBe('MEDIUM');
    });

    it('should suggest MEDIUM for CARD_ATM', () => {
      expect(suggestPriority('CARD_ATM')).toBe('MEDIUM');
    });

    it('should suggest MEDIUM for DIGITAL_ACCESS', () => {
      expect(suggestPriority('DIGITAL_ACCESS')).toBe('MEDIUM');
    });

    it('should suggest LOW for OTHER', () => {
      expect(suggestPriority('OTHER')).toBe('LOW');
    });

    it('should suggest LOW for FEE_ADMIN', () => {
      expect(suggestPriority('FEE_ADMIN')).toBe('LOW');
    });
  });
});
