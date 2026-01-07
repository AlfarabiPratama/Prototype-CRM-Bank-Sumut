// ==========================================
// Data Masking Tests
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  canViewUnmasked,
  maskNIK,
  maskAccount,
  maskEmail,
  maskPhone,
  maskName,
  maskCustomerData,
} from './mask';

describe('Data Masking', () => {
  describe('canViewUnmasked', () => {
    it('should return true for SUPERVISOR', () => {
      expect(canViewUnmasked('SUPERVISOR')).toBe(true);
    });

    it('should return true for ADMIN', () => {
      expect(canViewUnmasked('ADMIN')).toBe(true);
    });

    it('should return false for RM', () => {
      expect(canViewUnmasked('RM')).toBe(false);
    });

    it('should return false for AGENT', () => {
      expect(canViewUnmasked('AGENT')).toBe(false);
    });
  });

  describe('maskNIK', () => {
    it('should show unmasked NIK for SUPERVISOR', () => {
      expect(maskNIK('1234567890123456', 'SUPERVISOR')).toBe('1234567890123456');
    });

    it('should mask NIK for RM (show first 4 and last 2)', () => {
      expect(maskNIK('1234567890123456', 'RM')).toBe('1234**********56');
    });

    it('should handle short NIK', () => {
      expect(maskNIK('12345', 'RM')).toBe('****');
    });

    it('should handle empty NIK', () => {
      expect(maskNIK('', 'RM')).toBe('****');
    });
  });

  describe('maskAccount', () => {
    it('should show unmasked account for ADMIN', () => {
      expect(maskAccount('1234567890', 'ADMIN')).toBe('1234567890');
    });

    it('should mask account for AGENT (show last 4)', () => {
      expect(maskAccount('1234567890', 'AGENT')).toBe('******7890');
    });

    it('should handle short account number', () => {
      expect(maskAccount('123', 'AGENT')).toBe('****');
    });
  });

  describe('maskEmail', () => {
    it('should show unmasked email for SUPERVISOR', () => {
      expect(maskEmail('john.doe@example.com', 'SUPERVISOR')).toBe('john.doe@example.com');
    });

    it('should mask email for RM (show first 2 and domain)', () => {
      expect(maskEmail('john.doe@example.com', 'RM')).toBe('jo***@example.com');
    });

    it('should handle short local part', () => {
      expect(maskEmail('j@example.com', 'RM')).toBe('j***@example.com');
    });

    it('should handle invalid email', () => {
      expect(maskEmail('invalid', 'RM')).toBe('***@***');
    });
  });

  describe('maskPhone', () => {
    it('should show unmasked phone for ADMIN', () => {
      expect(maskPhone('081234567890', 'ADMIN')).toBe('081234567890');
    });

    it('should mask phone for AGENT (show first 4 and last 2)', () => {
      expect(maskPhone('081234567890', 'AGENT')).toBe('0812******90');
    });

    it('should handle short phone', () => {
      expect(maskPhone('08123', 'AGENT')).toBe('****');
    });
  });

  describe('maskName', () => {
    it('should show unmasked name for SUPERVISOR', () => {
      expect(maskName('John Doe Smith', 'SUPERVISOR')).toBe('John Doe Smith');
    });

    it('should mask name for RM (show first name only)', () => {
      expect(maskName('John Doe Smith', 'RM')).toBe('John *** ***');
    });

    it('should handle single name', () => {
      expect(maskName('John', 'RM')).toBe('John');
    });

    it('should handle empty name', () => {
      expect(maskName('', 'RM')).toBe('***');
    });
  });

  describe('maskCustomerData', () => {
    const customer = {
      id: 'customer-1',
      cif: 'CIF001',
      name: 'John Doe',
      nik: '1234567890123456',
      email: 'john@example.com',
      phone: '081234567890',
      account_numbers: ['1234567890', '0987654321'],
    };

    it('should mask all fields for AGENT', () => {
      const masked = maskCustomerData(customer, 'AGENT');
      
      expect(masked.id).toBe('customer-1'); // ID not masked
      expect(masked.cif).toBe('CIF001'); // CIF not masked
      expect(masked.name).toBe('John ***');
      expect(masked.nik).toBe('1234**********56');
      expect(masked.email).toBe('jo***@example.com');
      expect(masked.phone).toBe('0812******90');
      expect(masked.account_numbers).toEqual(['******7890', '******4321']);
    });

    it('should not mask any fields for SUPERVISOR', () => {
      const masked = maskCustomerData(customer, 'SUPERVISOR');
      
      expect(masked.name).toBe('John Doe');
      expect(masked.nik).toBe('1234567890123456');
      expect(masked.email).toBe('john@example.com');
      expect(masked.phone).toBe('081234567890');
      expect(masked.account_numbers).toEqual(['1234567890', '0987654321']);
    });
  });
});
