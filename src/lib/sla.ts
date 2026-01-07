// ==========================================
// SLA Configuration & Helpers
// ==========================================

import type { CaseCategory, CasePriority, CaseSLA } from '../types';

// SLA Matrix: Category x Priority -> Hours
interface SLAConfig {
  response_hours: number;
  resolution_hours: number;
}

const SLA_MATRIX: Record<CaseCategory, Record<CasePriority, SLAConfig>> = {
  TRX_FAIL: {
    LOW: { response_hours: 24, resolution_hours: 72 },
    MEDIUM: { response_hours: 8, resolution_hours: 48 },
    HIGH: { response_hours: 4, resolution_hours: 24 },
    CRITICAL: { response_hours: 1, resolution_hours: 8 },
  },
  CARD_ATM: {
    LOW: { response_hours: 24, resolution_hours: 72 },
    MEDIUM: { response_hours: 8, resolution_hours: 48 },
    HIGH: { response_hours: 4, resolution_hours: 24 },
    CRITICAL: { response_hours: 2, resolution_hours: 12 },
  },
  DIGITAL_ACCESS: {
    LOW: { response_hours: 24, resolution_hours: 72 },
    MEDIUM: { response_hours: 8, resolution_hours: 48 },
    HIGH: { response_hours: 4, resolution_hours: 24 },
    CRITICAL: { response_hours: 2, resolution_hours: 12 },
  },
  FRAUD_SCAM: {
    LOW: { response_hours: 4, resolution_hours: 24 },
    MEDIUM: { response_hours: 2, resolution_hours: 12 },
    HIGH: { response_hours: 1, resolution_hours: 8 },
    CRITICAL: { response_hours: 0.5, resolution_hours: 4 },
  },
  FEE_ADMIN: {
    LOW: { response_hours: 48, resolution_hours: 120 },
    MEDIUM: { response_hours: 24, resolution_hours: 72 },
    HIGH: { response_hours: 8, resolution_hours: 48 },
    CRITICAL: { response_hours: 4, resolution_hours: 24 },
  },
  LOAN_CREDIT: {
    LOW: { response_hours: 48, resolution_hours: 120 },
    MEDIUM: { response_hours: 24, resolution_hours: 72 },
    HIGH: { response_hours: 8, resolution_hours: 48 },
    CRITICAL: { response_hours: 4, resolution_hours: 24 },
  },
  OTHER: {
    LOW: { response_hours: 48, resolution_hours: 120 },
    MEDIUM: { response_hours: 24, resolution_hours: 72 },
    HIGH: { response_hours: 8, resolution_hours: 48 },
    CRITICAL: { response_hours: 4, resolution_hours: 24 },
  },
};

/**
 * Calculate SLA based on category and priority
 */
export function calculateSLA(
  category: CaseCategory,
  priority: CasePriority,
  createdAt: Date = new Date()
): CaseSLA {
  const config = SLA_MATRIX[category][priority];
  const dueAt = new Date(createdAt.getTime() + config.resolution_hours * 60 * 60 * 1000);

  return {
    response_hours: config.response_hours,
    resolution_hours: config.resolution_hours,
    due_at: dueAt.toISOString(),
  };
}

/**
 * Check if SLA is breached
 */
export function isSLABreached(sla: CaseSLA): boolean {
  return new Date() > new Date(sla.due_at);
}

/**
 * Get SLA status
 */
export function getSLAStatus(sla: CaseSLA): 'OK' | 'WARNING' | 'BREACHED' {
  const now = new Date();
  const dueAt = new Date(sla.due_at);
  const remaining = dueAt.getTime() - now.getTime();
  const totalTime = sla.resolution_hours * 60 * 60 * 1000;

  if (remaining <= 0) return 'BREACHED';
  if (remaining <= totalTime * 0.25) return 'WARNING'; // Less than 25% time remaining
  return 'OK';
}

/**
 * Format SLA remaining time
 */
export function formatSLARemaining(sla: CaseSLA): string {
  const now = new Date();
  const dueAt = new Date(sla.due_at);
  const remaining = dueAt.getTime() - now.getTime();

  if (remaining <= 0) {
    const overdue = Math.abs(remaining);
    const hours = Math.floor(overdue / (1000 * 60 * 60));
    if (hours > 24) {
      return `Overdue ${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `Overdue ${hours}h`;
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`;
  }
  return `${hours}h ${minutes}m remaining`;
}

// Priority auto-suggestion based on category
export function suggestPriority(category: CaseCategory): CasePriority {
  switch (category) {
    case 'FRAUD_SCAM':
      return 'HIGH';
    case 'TRX_FAIL':
    case 'CARD_ATM':
    case 'DIGITAL_ACCESS':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}
