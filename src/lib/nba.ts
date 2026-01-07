// ==========================================
// NBA (Next Best Action) Service - Bank Sumut CRM
// ==========================================
// Rule-based recommendation engine untuk RM/Agent
//
// REFERENSI: Pedoman Bab 7 US-18, Bab 11.3.D
//
// RULES PRIORITY:
//   HIGH   - Case SLA overdue, AT_RISK no contact 30 days
//   MEDIUM - Consent granted + no case, Lead NEW > 3 days
//   LOW    - Had fraud case (educate), Champion birthday (greet)

import type { RFMScore } from './rfm';

// === TYPES ===
export type NBAActionType = 
  | 'CALL'           // Hubungi customer
  | 'OFFER_PRODUCT'  // Tawarkan produk
  | 'PRIORITIZE_CASE'// Prioritaskan case
  | 'EDUCATE'        // Kirim edukasi
  | 'GREET'          // Ucapan (birthday, etc)
  | 'FOLLOW_UP_LEAD' // Follow up lead
  | 'WIN_BACK';      // Win-back campaign

export type NBAPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type NBADecision = 'ACCEPTED' | 'REJECTED' | 'SNOOZED';

export interface NBARecommendation {
  id: string;
  customer_id: string;
  action_type: NBAActionType;
  title: string;
  reason_text: string;  // Explainability
  priority: NBAPriority;
  related_entity_type?: 'CASE' | 'LEAD' | 'CAMPAIGN';
  related_entity_id?: string;
  decision?: NBADecision;
  decision_reason?: string;
  decided_at?: string;
  decided_by?: string;
  created_at: string;
}

// === RULE ENGINE ===
// Generate NBA recommendations based on customer context
export interface NBAContext {
  customerId: string;
  rfmScore?: RFMScore;
  hasOpenCase: boolean;
  hasOverdueCase: boolean;
  hasConsentMarketing: boolean;
  daysSinceLastContact: number;
  hasNewLead: boolean;
  leadDaysOld?: number;
  hadFraudCase: boolean;
  isBirthdaySoon: boolean;
}

export function generateNBAForCustomer(context: NBAContext): NBARecommendation[] {
  const recommendations: NBARecommendation[] = [];
  const now = new Date().toISOString();
  let idCounter = 1;

  const makeId = () => `nba-${context.customerId}-${idCounter++}`;

  // === HIGH PRIORITY RULES ===
  
  // Rule 1: Case SLA overdue → Prioritize case
  if (context.hasOverdueCase) {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'PRIORITIZE_CASE',
      title: 'Prioritaskan Penyelesaian Case',
      reason_text: 'Customer memiliki case yang melewati SLA → segera selesaikan untuk menjaga kualitas layanan',
      priority: 'HIGH',
      related_entity_type: 'CASE',
      created_at: now,
    });
  }

  // Rule 2: AT_RISK/HIBERNATING + no contact 30 days → Retention call
  if (
    context.rfmScore &&
    (context.rfmScore.segment === 'AT_RISK' || context.rfmScore.segment === 'HIBERNATING') &&
    context.daysSinceLastContact >= 30
  ) {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'CALL',
      title: 'Hubungi untuk Retention',
      reason_text: `Customer segment ${context.rfmScore.segment} dan tidak ada kontak ${context.daysSinceLastContact} hari → perlu win-back call`,
      priority: 'HIGH',
      created_at: now,
    });
  }

  // Rule 3: LOST segment → Win-back campaign
  if (context.rfmScore?.segment === 'LOST') {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'WIN_BACK',
      title: 'Jalankan Win-Back Campaign',
      reason_text: 'Customer segment LOST dengan engagement minimal → pertimbangkan re-activation offer',
      priority: 'HIGH',
      created_at: now,
    });
  }

  // === MEDIUM PRIORITY RULES ===

  // Rule 4: Consent granted + no open case → Offer product
  if (context.hasConsentMarketing && !context.hasOpenCase && !context.hasOverdueCase) {
    const segment = context.rfmScore?.segment;
    if (segment === 'CHAMPION' || segment === 'LOYAL' || segment === 'POTENTIAL') {
      recommendations.push({
        id: makeId(),
        customer_id: context.customerId,
        action_type: 'OFFER_PRODUCT',
        title: 'Tawarkan Produk/Fitur Baru',
        reason_text: `Customer segment ${segment} dengan consent marketing aktif dan tidak ada case terbuka → peluang cross-sell`,
        priority: 'MEDIUM',
        related_entity_type: 'CAMPAIGN',
        created_at: now,
      });
    }
  }

  // Rule 5: Lead NEW > 3 days → Follow up
  if (context.hasNewLead && context.leadDaysOld && context.leadDaysOld > 3) {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'FOLLOW_UP_LEAD',
      title: 'Follow Up Lead Segera',
      reason_text: `Lead sudah ${context.leadDaysOld} hari tanpa follow-up → segera hubungi sebelum expired`,
      priority: 'MEDIUM',
      related_entity_type: 'LEAD',
      created_at: now,
    });
  }

  // === LOW PRIORITY RULES ===

  // Rule 6: Had fraud case → Educate
  if (context.hadFraudCase) {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'EDUCATE',
      title: 'Kirim Edukasi Anti-Scam',
      reason_text: 'Customer pernah mengalami kasus fraud/scam → kirimkan materi edukasi keamanan',
      priority: 'LOW',
      created_at: now,
    });
  }

  // Rule 7: Champion + birthday soon → Greet
  if (context.rfmScore?.segment === 'CHAMPION' && context.isBirthdaySoon) {
    recommendations.push({
      id: makeId(),
      customer_id: context.customerId,
      action_type: 'GREET',
      title: 'Kirim Ucapan Ulang Tahun',
      reason_text: 'Customer Champion dengan ulang tahun segera → kirim greeting personal untuk maintain relationship',
      priority: 'LOW',
      created_at: now,
    });
  }

  // Sort by priority (HIGH first)
  const priorityOrder: Record<NBAPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

// === UI HELPERS ===
export function getActionIcon(action: NBAActionType): string {
  const icons: Record<NBAActionType, string> = {
    CALL: '📞',
    OFFER_PRODUCT: '🎁',
    PRIORITIZE_CASE: '⚡',
    EDUCATE: '📚',
    GREET: '🎂',
    FOLLOW_UP_LEAD: '📋',
    WIN_BACK: '🔄',
  };
  return icons[action];
}

export function getActionLabel(action: NBAActionType): string {
  const labels: Record<NBAActionType, string> = {
    CALL: 'Hubungi',
    OFFER_PRODUCT: 'Tawarkan Produk',
    PRIORITIZE_CASE: 'Prioritaskan Case',
    EDUCATE: 'Edukasi',
    GREET: 'Ucapan',
    FOLLOW_UP_LEAD: 'Follow Up Lead',
    WIN_BACK: 'Win-Back',
  };
  return labels[action];
}

export function getPriorityColor(priority: NBAPriority): string {
  const colors: Record<NBAPriority, string> = {
    HIGH: '#ef4444',    // Red
    MEDIUM: '#f59e0b',  // Amber
    LOW: '#6b7280',     // Gray
  };
  return colors[priority];
}

export function getPriorityLabel(priority: NBAPriority): string {
  const labels: Record<NBAPriority, string> = {
    HIGH: 'Tinggi',
    MEDIUM: 'Sedang',
    LOW: 'Rendah',
  };
  return labels[priority];
}
