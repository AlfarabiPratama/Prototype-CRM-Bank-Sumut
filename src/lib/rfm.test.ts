// ==========================================
// RFM Service Tests
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  calculateRFMScore,
  getRFMSegment,
  getCLVIcon,
  getSegmentLabel,
  getSegmentColor,
  RECENCY_THRESHOLDS_DAYS,
  FREQUENCY_THRESHOLDS_COUNT,
  MONETARY_THRESHOLDS_IDR,
} from './rfm';

describe('RFM Scoring', () => {
  describe('calculateRFMScore', () => {
    it('should calculate score 5 for recent customer (<=7 days)', () => {
      const result = calculateRFMScore('test-1', 5, 60, 150_000_000);
      expect(result.recency_score).toBe(5);
    });

    it('should calculate score 1 for old customer (>180 days)', () => {
      const result = calculateRFMScore('test-2', 200, 10, 10_000_000);
      expect(result.recency_score).toBe(1);
    });

    it('should calculate frequency score 5 for >=50 transactions', () => {
      const result = calculateRFMScore('test-3', 10, 60, 50_000_000);
      expect(result.frequency_score).toBe(5);
    });

    it('should calculate frequency score 1 for <5 transactions', () => {
      const result = calculateRFMScore('test-4', 10, 3, 50_000_000);
      expect(result.frequency_score).toBe(1);
    });

    it('should calculate monetary score 5 for >=100M IDR', () => {
      const result = calculateRFMScore('test-5', 10, 30, 150_000_000);
      expect(result.monetary_score).toBe(5);
    });

    it('should calculate monetary score 1 for <5M IDR', () => {
      const result = calculateRFMScore('test-6', 10, 30, 3_000_000);
      expect(result.monetary_score).toBe(1);
    });

    it('should sanitize negative values to 0', () => {
      const result = calculateRFMScore('test-7', -10, -5, -1000);
      expect(result.recency_days).toBe(0);
      expect(result.frequency_count).toBe(0);
      expect(result.monetary_value).toBe(0);
    });

    it('should include ruleset_version and window_label', () => {
      const result = calculateRFMScore('test-8', 10, 30, 50_000_000);
      expect(result.ruleset_version).toBe('v1-poc');
      expect(result.window_label).toBe('static-seed');
    });

    it('should calculate total_score as sum of R+F+M', () => {
      const result = calculateRFMScore('test-9', 5, 60, 150_000_000);
      expect(result.total_score).toBe(result.recency_score + result.frequency_score + result.monetary_score);
    });
  });

  describe('getRFMSegment', () => {
    it('should return CHAMPION for R>=4, F>=4, M>=4', () => {
      const result = getRFMSegment(5, 5, 5);
      expect(result.segment).toBe('CHAMPION');
      expect(result.clv).toBe('VERY_HIGH');
    });

    it('should return LOYAL for F>=4', () => {
      const result = getRFMSegment(2, 5, 2);
      expect(result.segment).toBe('LOYAL');
      expect(result.clv).toBe('HIGH');
    });

    it('should return POTENTIAL for R>=4 (when F<4)', () => {
      const result = getRFMSegment(5, 2, 2);
      expect(result.segment).toBe('POTENTIAL');
      expect(result.clv).toBe('GROWING');
    });

    it('should return LOST for R=1, F=1, M=1', () => {
      const result = getRFMSegment(1, 1, 1);
      expect(result.segment).toBe('LOST');
      expect(result.clv).toBe('MINIMAL');
    });

    it('should return HIBERNATING for R<=2, F<=2, M<=2 (but not all 1)', () => {
      const result = getRFMSegment(2, 2, 2);
      expect(result.segment).toBe('HIBERNATING');
      expect(result.clv).toBe('LOW');
    });

    it('should return AT_RISK for R<=2 with F>=3 or M>=3', () => {
      const result = getRFMSegment(2, 3, 2);
      expect(result.segment).toBe('AT_RISK');
      expect(result.clv).toBe('DECLINING');
    });

    it('should prioritize LOST over HIBERNATING', () => {
      // This tests the fix for the segment ordering bug
      const lost = getRFMSegment(1, 1, 1);
      expect(lost.segment).toBe('LOST');
      expect(lost.segment).not.toBe('HIBERNATING');
    });
  });

  describe('UI Helpers', () => {
    it('should return correct CLV icon', () => {
      expect(getCLVIcon('VERY_HIGH')).toBe('💎');
      expect(getCLVIcon('HIGH')).toBe('💰');
      expect(getCLVIcon('GROWING')).toBe('📈');
      expect(getCLVIcon('DECLINING')).toBe('⚠️');
      expect(getCLVIcon('LOW')).toBe('😴');
      expect(getCLVIcon('MINIMAL')).toBe('🔻');
    });

    it('should return correct segment label', () => {
      expect(getSegmentLabel('CHAMPION')).toBe('Champion');
      expect(getSegmentLabel('LOYAL')).toBe('Loyal Customer');
      expect(getSegmentLabel('AT_RISK')).toBe('At Risk');
    });

    it('should return correct segment color', () => {
      expect(getSegmentColor('CHAMPION')).toBe('#f59e0b');
      expect(getSegmentColor('LOYAL')).toBe('#10b981');
      expect(getSegmentColor('AT_RISK')).toBe('#ef4444');
    });
  });

  describe('Threshold Constants', () => {
    it('should have correct recency thresholds', () => {
      expect(RECENCY_THRESHOLDS_DAYS.SCORE_5_MAX).toBe(7);
      expect(RECENCY_THRESHOLDS_DAYS.SCORE_4_MAX).toBe(30);
      expect(RECENCY_THRESHOLDS_DAYS.SCORE_3_MAX).toBe(90);
      expect(RECENCY_THRESHOLDS_DAYS.SCORE_2_MAX).toBe(180);
    });

    it('should have correct frequency thresholds', () => {
      expect(FREQUENCY_THRESHOLDS_COUNT.SCORE_5_MIN).toBe(50);
      expect(FREQUENCY_THRESHOLDS_COUNT.SCORE_4_MIN).toBe(30);
    });

    it('should have correct monetary thresholds in IDR', () => {
      expect(MONETARY_THRESHOLDS_IDR.SCORE_5_MIN).toBe(100_000_000);
      expect(MONETARY_THRESHOLDS_IDR.SCORE_4_MIN).toBe(50_000_000);
    });
  });
});
