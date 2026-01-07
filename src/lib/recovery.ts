// ==========================================
// Service Recovery Automation
// ==========================================
// Auto-escalation dan recovery actions untuk case management
//
// REFERENSI: Pedoman Bab 8 - Service Recovery
// - Auto-escalate jika SLA breach
// - Sugesti aksi recovery berdasarkan kategori case
// - Notifikasi ke supervisor untuk case overdue

import type { Case, CasePriority } from '../types';
import { getSLAStatus, isSLABreached } from './sla';

// === TYPES ===

export type RecoveryActionType =
  | 'ESCALATE_TO_SUPERVISOR'
  | 'INCREASE_PRIORITY'
  | 'ASSIGN_SENIOR_AGENT'
  | 'NOTIFY_CUSTOMER'
  | 'REQUEST_EXTENSION'
  | 'ADD_RESOURCES';

export interface RecoveryAction {
  id: string;
  type: RecoveryActionType;
  label: string;
  description: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  auto_executable: boolean; // Can be auto-executed by system
}

export interface CaseRecoveryStatus {
  case_id: string;
  sla_status: 'OK' | 'WARNING' | 'BREACHED';
  is_overdue: boolean;
  overdue_hours: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggested_actions: RecoveryAction[];
  auto_escalated: boolean;
}

// === RECOVERY ACTION DEFINITIONS ===

const RECOVERY_ACTIONS: Record<RecoveryActionType, Omit<RecoveryAction, 'id'>> = {
  ESCALATE_TO_SUPERVISOR: {
    type: 'ESCALATE_TO_SUPERVISOR',
    label: 'Eskalasi ke Supervisor',
    description: 'Case akan dieskalasi ke supervisor cabang untuk penanganan prioritas',
    priority: 'URGENT',
    auto_executable: true,
  },
  INCREASE_PRIORITY: {
    type: 'INCREASE_PRIORITY',
    label: 'Tingkatkan Prioritas',
    description: 'Naikkan level prioritas case untuk percepatan penyelesaian',
    priority: 'HIGH',
    auto_executable: true,
  },
  ASSIGN_SENIOR_AGENT: {
    type: 'ASSIGN_SENIOR_AGENT',
    label: 'Assign ke Agent Senior',
    description: 'Tugaskan case ke agent yang lebih berpengalaman',
    priority: 'HIGH',
    auto_executable: false,
  },
  NOTIFY_CUSTOMER: {
    type: 'NOTIFY_CUSTOMER',
    label: 'Notifikasi ke Nasabah',
    description: 'Kirim update status ke nasabah tentang progress penanganan',
    priority: 'NORMAL',
    auto_executable: false,
  },
  REQUEST_EXTENSION: {
    type: 'REQUEST_EXTENSION',
    label: 'Minta Perpanjangan SLA',
    description: 'Ajukan perpanjangan batas waktu dengan justifikasi',
    priority: 'NORMAL',
    auto_executable: false,
  },
  ADD_RESOURCES: {
    type: 'ADD_RESOURCES',
    label: 'Tambah Resource',
    description: 'Libatkan tim tambahan untuk percepatan penyelesaian',
    priority: 'HIGH',
    auto_executable: false,
  },
};

// === MAIN FUNCTIONS ===

/**
 * Analyze case and generate recovery status with suggested actions
 */
export function analyzeRecoveryStatus(caseData: Case): CaseRecoveryStatus {
  const slaStatus = getSLAStatus(caseData.sla);
  const isOverdue = isSLABreached(caseData.sla);
  
  // Calculate overdue hours
  const now = new Date();
  const dueAt = new Date(caseData.sla.due_at);
  const overdueMs = Math.max(0, now.getTime() - dueAt.getTime());
  const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
  
  // Determine risk level
  const riskLevel = calculateRiskLevel(caseData, slaStatus, overdueHours);
  
  // Generate suggested actions
  const suggestedActions = generateRecoveryActions(caseData, slaStatus, overdueHours);
  
  // Check if auto-escalation should happen
  const autoEscalated = shouldAutoEscalate(caseData, slaStatus, overdueHours);
  
  return {
    case_id: caseData.id,
    sla_status: slaStatus,
    is_overdue: isOverdue,
    overdue_hours: overdueHours,
    risk_level: riskLevel,
    suggested_actions: suggestedActions,
    auto_escalated: autoEscalated,
  };
}

/**
 * Calculate risk level based on case properties and SLA status
 */
function calculateRiskLevel(
  caseData: Case,
  slaStatus: 'OK' | 'WARNING' | 'BREACHED',
  overdueHours: number
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  // CRITICAL: FRAUD_SCAM or overdue by significant time
  if (caseData.category === 'FRAUD_SCAM') {
    if (slaStatus === 'BREACHED') return 'CRITICAL';
    if (slaStatus === 'WARNING') return 'HIGH';
    return 'MEDIUM';
  }
  
  // CRITICAL: Overdue > 24 hours
  if (overdueHours > 24) return 'CRITICAL';
  
  // HIGH: Overdue or HIGH/CRITICAL priority with warning
  if (slaStatus === 'BREACHED') return 'HIGH';
  if (slaStatus === 'WARNING' && (caseData.priority === 'HIGH' || caseData.priority === 'CRITICAL')) {
    return 'HIGH';
  }
  
  // MEDIUM: Warning status
  if (slaStatus === 'WARNING') return 'MEDIUM';
  
  return 'LOW';
}

/**
 * Generate recovery actions based on case status
 */
function generateRecoveryActions(
  caseData: Case,
  slaStatus: 'OK' | 'WARNING' | 'BREACHED',
  overdueHours: number
): RecoveryAction[] {
  const actions: RecoveryAction[] = [];
  
  // BREACHED - recommend escalation and priority increase
  if (slaStatus === 'BREACHED') {
    // Escalate if not already escalated
    if (caseData.status !== 'ESCALATED') {
      actions.push({
        id: `${caseData.id}-escalate`,
        ...RECOVERY_ACTIONS.ESCALATE_TO_SUPERVISOR,
      });
    }
    
    // Increase priority if not already CRITICAL
    if (caseData.priority !== 'CRITICAL') {
      actions.push({
        id: `${caseData.id}-priority`,
        ...RECOVERY_ACTIONS.INCREASE_PRIORITY,
      });
    }
    
    // Notify customer for transparency
    actions.push({
      id: `${caseData.id}-notify`,
      ...RECOVERY_ACTIONS.NOTIFY_CUSTOMER,
    });
  }
  
  // Significantly overdue - add more resources
  if (overdueHours > 12) {
    actions.push({
      id: `${caseData.id}-resources`,
      ...RECOVERY_ACTIONS.ADD_RESOURCES,
    });
    
    actions.push({
      id: `${caseData.id}-senior`,
      ...RECOVERY_ACTIONS.ASSIGN_SENIOR_AGENT,
    });
  }
  
  // WARNING status - preventive actions
  if (slaStatus === 'WARNING') {
    // Increase priority for early intervention
    if (caseData.priority === 'LOW' || caseData.priority === 'MEDIUM') {
      actions.push({
        id: `${caseData.id}-priority`,
        ...RECOVERY_ACTIONS.INCREASE_PRIORITY,
      });
    }
    
    // Request extension if case is complex
    if (caseData.category === 'LOAN_CREDIT' || caseData.category === 'FRAUD_SCAM') {
      actions.push({
        id: `${caseData.id}-extension`,
        ...RECOVERY_ACTIONS.REQUEST_EXTENSION,
      });
    }
  }
  
  // Sort by priority
  const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2 };
  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Determine if case should be auto-escalated
 */
function shouldAutoEscalate(
  caseData: Case,
  slaStatus: 'OK' | 'WARNING' | 'BREACHED',
  overdueHours: number
): boolean {
  // Don't auto-escalate if already escalated or closed
  if (caseData.status === 'ESCALATED' || caseData.status === 'CLOSED') {
    return false;
  }
  
  // Auto-escalate for CRITICAL priority breached
  if (caseData.priority === 'CRITICAL' && slaStatus === 'BREACHED') {
    return true;
  }
  
  // Auto-escalate for FRAUD_SCAM breached
  if (caseData.category === 'FRAUD_SCAM' && slaStatus === 'BREACHED') {
    return true;
  }
  
  // Auto-escalate if overdue > 24 hours
  if (overdueHours > 24) {
    return true;
  }
  
  return false;
}

/**
 * Get next priority level
 */
export function getNextPriority(current: CasePriority): CasePriority {
  const priorities: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const currentIndex = priorities.indexOf(current);
  return priorities[Math.min(currentIndex + 1, priorities.length - 1)];
}

// === UI HELPERS ===

export function getRecoveryActionIcon(action: RecoveryActionType): string {
  const icons: Record<RecoveryActionType, string> = {
    ESCALATE_TO_SUPERVISOR: '⬆️',
    INCREASE_PRIORITY: '🔺',
    ASSIGN_SENIOR_AGENT: '👤',
    NOTIFY_CUSTOMER: '📧',
    REQUEST_EXTENSION: '⏰',
    ADD_RESOURCES: '👥',
  };
  return icons[action];
}

export function getRiskLevelColor(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  const colors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
    CRITICAL: '#7c2d12',
  };
  return colors[level];
}

export function getRiskLevelLabel(level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  const labels: Record<string, string> = {
    LOW: 'Risiko Rendah',
    MEDIUM: 'Risiko Sedang',
    HIGH: 'Risiko Tinggi',
    CRITICAL: 'Risiko Kritis',
  };
  return labels[level];
}
