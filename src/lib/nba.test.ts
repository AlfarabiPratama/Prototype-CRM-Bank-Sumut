// ==========================================
// NBA Service Tests
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  generateNBAForCustomer,
  getActionIcon,
  getActionLabel,
  getPriorityColor,
  getPriorityLabel,
  type NBAContext,
} from './nba';

describe('NBA Service', () => {
  describe('generateNBAForCustomer', () => {
    const baseContext: NBAContext = {
      customerId: 'test-customer-1',
      hasOpenCase: false,
      hasOverdueCase: false,
      hasConsentMarketing: false,
      daysSinceLastContact: 10,
      hasNewLead: false,
      hadFraudCase: false,
      isBirthdaySoon: false,
    };

    it('should return PRIORITIZE_CASE for overdue case', () => {
      const context: NBAContext = {
        ...baseContext,
        hasOverdueCase: true,
      };
      const recommendations = generateNBAForCustomer(context);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].action_type).toBe('PRIORITIZE_CASE');
      expect(recommendations[0].priority).toBe('HIGH');
    });

    it('should return CALL for AT_RISK customer with no contact 30+ days', () => {
      const context: NBAContext = {
        ...baseContext,
        rfmScore: {
          customer_id: 'test',
          recency_score: 2,
          recency_days: 100,
          frequency_score: 3,
          frequency_count: 20,
          monetary_score: 3,
          monetary_value: 30_000_000,
          total_score: 8,
          segment: 'AT_RISK',
          clv_proxy: 'DECLINING',
          segment_reason: 'Test',
          ruleset_version: 'v1-poc',
          window_label: 'static-seed',
          calculated_at: new Date().toISOString(),
        },
        daysSinceLastContact: 45,
      };
      const recommendations = generateNBAForCustomer(context);
      
      const callRec = recommendations.find(r => r.action_type === 'CALL');
      expect(callRec).toBeDefined();
      expect(callRec?.priority).toBe('HIGH');
    });

    it('should return WIN_BACK for LOST segment', () => {
      const context: NBAContext = {
        ...baseContext,
        rfmScore: {
          customer_id: 'test',
          recency_score: 1,
          recency_days: 200,
          frequency_score: 1,
          frequency_count: 2,
          monetary_score: 1,
          monetary_value: 1_000_000,
          total_score: 3,
          segment: 'LOST',
          clv_proxy: 'MINIMAL',
          segment_reason: 'Test',
          ruleset_version: 'v1-poc',
          window_label: 'static-seed',
          calculated_at: new Date().toISOString(),
        },
      };
      const recommendations = generateNBAForCustomer(context);
      
      const winBack = recommendations.find(r => r.action_type === 'WIN_BACK');
      expect(winBack).toBeDefined();
      expect(winBack?.priority).toBe('HIGH');
    });

    it('should return OFFER_PRODUCT for CHAMPION with consent', () => {
      const context: NBAContext = {
        ...baseContext,
        hasConsentMarketing: true,
        rfmScore: {
          customer_id: 'test',
          recency_score: 5,
          recency_days: 3,
          frequency_score: 5,
          frequency_count: 60,
          monetary_score: 5,
          monetary_value: 200_000_000,
          total_score: 15,
          segment: 'CHAMPION',
          clv_proxy: 'VERY_HIGH',
          segment_reason: 'Test',
          ruleset_version: 'v1-poc',
          window_label: 'static-seed',
          calculated_at: new Date().toISOString(),
        },
      };
      const recommendations = generateNBAForCustomer(context);
      
      const offer = recommendations.find(r => r.action_type === 'OFFER_PRODUCT');
      expect(offer).toBeDefined();
      expect(offer?.priority).toBe('MEDIUM');
    });

    it('should return FOLLOW_UP_LEAD for lead > 3 days old', () => {
      const context: NBAContext = {
        ...baseContext,
        hasNewLead: true,
        leadDaysOld: 5,
      };
      const recommendations = generateNBAForCustomer(context);
      
      const followUp = recommendations.find(r => r.action_type === 'FOLLOW_UP_LEAD');
      expect(followUp).toBeDefined();
      expect(followUp?.priority).toBe('MEDIUM');
    });

    it('should return EDUCATE for customer with fraud case history', () => {
      const context: NBAContext = {
        ...baseContext,
        hadFraudCase: true,
      };
      const recommendations = generateNBAForCustomer(context);
      
      const educate = recommendations.find(r => r.action_type === 'EDUCATE');
      expect(educate).toBeDefined();
      expect(educate?.priority).toBe('LOW');
    });

    it('should return GREET for CHAMPION with birthday soon', () => {
      const context: NBAContext = {
        ...baseContext,
        isBirthdaySoon: true,
        rfmScore: {
          customer_id: 'test',
          recency_score: 5,
          recency_days: 3,
          frequency_score: 5,
          frequency_count: 60,
          monetary_score: 5,
          monetary_value: 200_000_000,
          total_score: 15,
          segment: 'CHAMPION',
          clv_proxy: 'VERY_HIGH',
          segment_reason: 'Test',
          ruleset_version: 'v1-poc',
          window_label: 'static-seed',
          calculated_at: new Date().toISOString(),
        },
      };
      const recommendations = generateNBAForCustomer(context);
      
      const greet = recommendations.find(r => r.action_type === 'GREET');
      expect(greet).toBeDefined();
      expect(greet?.priority).toBe('LOW');
    });

    it('should sort recommendations by priority (HIGH first)', () => {
      const context: NBAContext = {
        ...baseContext,
        hasOverdueCase: true,
        hadFraudCase: true,
        hasNewLead: true,
        leadDaysOld: 5,
      };
      const recommendations = generateNBAForCustomer(context);
      
      expect(recommendations.length).toBeGreaterThan(1);
      expect(recommendations[0].priority).toBe('HIGH');
    });

    it('should return empty array when no rules match', () => {
      const context: NBAContext = {
        ...baseContext,
        rfmScore: {
          customer_id: 'test',
          recency_score: 3,
          recency_days: 50,
          frequency_score: 3,
          frequency_count: 20,
          monetary_score: 3,
          monetary_value: 30_000_000,
          total_score: 9,
          segment: 'POTENTIAL',
          clv_proxy: 'GROWING',
          segment_reason: 'Test',
          ruleset_version: 'v1-poc',
          window_label: 'static-seed',
          calculated_at: new Date().toISOString(),
        },
      };
      const recommendations = generateNBAForCustomer(context);
      
      // POTENTIAL with R>=4 would trigger OFFER, but R=3 so no match
      // In this case, no rules match so empty
      expect(recommendations.length).toBe(0);
    });
  });

  describe('UI Helpers', () => {
    it('should return correct action icons', () => {
      expect(getActionIcon('CALL')).toBe('📞');
      expect(getActionIcon('OFFER_PRODUCT')).toBe('🎁');
      expect(getActionIcon('PRIORITIZE_CASE')).toBe('⚡');
      expect(getActionIcon('EDUCATE')).toBe('📚');
      expect(getActionIcon('GREET')).toBe('🎂');
      expect(getActionIcon('FOLLOW_UP_LEAD')).toBe('📋');
      expect(getActionIcon('WIN_BACK')).toBe('🔄');
    });

    it('should return correct action labels', () => {
      expect(getActionLabel('CALL')).toBe('Hubungi');
      expect(getActionLabel('OFFER_PRODUCT')).toBe('Tawarkan Produk');
      expect(getActionLabel('PRIORITIZE_CASE')).toBe('Prioritaskan Case');
    });

    it('should return correct priority colors', () => {
      expect(getPriorityColor('HIGH')).toBe('#ef4444');
      expect(getPriorityColor('MEDIUM')).toBe('#f59e0b');
      expect(getPriorityColor('LOW')).toBe('#6b7280');
    });

    it('should return correct priority labels in Indonesian', () => {
      expect(getPriorityLabel('HIGH')).toBe('Tinggi');
      expect(getPriorityLabel('MEDIUM')).toBe('Sedang');
      expect(getPriorityLabel('LOW')).toBe('Rendah');
    });
  });
});
