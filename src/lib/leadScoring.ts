// ==========================================
// Lead Scoring Service
// ==========================================
// Automated lead scoring berdasarkan behavior dan atribut
// untuk membantu RM memprioritaskan leads
//
// SCORING FACTORS:
// - Recency: Kapan terakhir aktivitas
// - Engagement: Jumlah aktivitas/interaksi
// - Source: Asal lead (campaign vs walk-in)
// - Status: Progress dalam pipeline
// - Customer Value: RFM segment jika ada

import type { Lead, RMActivity, Customer } from '../types';
import type { RFMScore } from './rfm';

// === TYPES ===

export interface LeadScore {
  lead_id: string;
  total_score: number;         // 0-100
  grade: 'HOT' | 'WARM' | 'COLD';
  breakdown: ScoreBreakdown;
  last_calculated: string;
}

export interface ScoreBreakdown {
  recency_score: number;       // 0-25 points
  engagement_score: number;    // 0-25 points  
  source_score: number;        // 0-15 points
  status_score: number;        // 0-20 points
  customer_value_score: number; // 0-15 points
}

// === SCORING WEIGHTS ===

const WEIGHTS = {
  RECENCY: 25,        // Max 25 points
  ENGAGEMENT: 25,     // Max 25 points
  SOURCE: 15,         // Max 15 points  
  STATUS: 20,         // Max 20 points
  CUSTOMER_VALUE: 15, // Max 15 points
} as const;

// === SCORING RULES ===

/**
 * Calculate recency score based on last activity
 * More recent = higher score
 */
function calculateRecencyScore(lead: Lead, activities: RMActivity[]): number {
  const leadActivities = activities.filter(a => a.lead_id === lead.id);
  
  if (leadActivities.length === 0) {
    // No activities - use lead created date
    const daysSinceCreated = getDaysSince(lead.created_at);
    if (daysSinceCreated <= 1) return WEIGHTS.RECENCY;          // Created today/yesterday
    if (daysSinceCreated <= 3) return WEIGHTS.RECENCY * 0.8;    // 3 days
    if (daysSinceCreated <= 7) return WEIGHTS.RECENCY * 0.5;    // 1 week
    if (daysSinceCreated <= 14) return WEIGHTS.RECENCY * 0.3;   // 2 weeks
    return WEIGHTS.RECENCY * 0.1;                               // Older
  }
  
  // Find most recent activity
  const latestActivity = leadActivities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  const daysSinceActivity = getDaysSince(latestActivity.created_at);
  
  if (daysSinceActivity <= 1) return WEIGHTS.RECENCY;           // Today/yesterday
  if (daysSinceActivity <= 3) return WEIGHTS.RECENCY * 0.9;     // 3 days
  if (daysSinceActivity <= 7) return WEIGHTS.RECENCY * 0.7;     // 1 week
  if (daysSinceActivity <= 14) return WEIGHTS.RECENCY * 0.4;    // 2 weeks
  if (daysSinceActivity <= 30) return WEIGHTS.RECENCY * 0.2;    // 1 month
  return WEIGHTS.RECENCY * 0.05;                                // Older
}

/**
 * Calculate engagement score based on activity count and types
 */
function calculateEngagementScore(lead: Lead, activities: RMActivity[]): number {
  const leadActivities = activities.filter(a => a.lead_id === lead.id);
  const count = leadActivities.length;
  
  if (count === 0) return 0;
  
  // Base score from count
  let score = Math.min(count * 5, WEIGHTS.ENGAGEMENT * 0.6); // Max 15 from count
  
  // Bonus for activity diversity
  const activityTypes = new Set(leadActivities.map(a => a.type));
  score += activityTypes.size * 2.5; // Bonus for variety
  
  // Bonus for high-value activity types
  if (leadActivities.some(a => a.type === 'MEETING')) score += 3;
  if (leadActivities.some(a => a.type === 'VISIT')) score += 2;
  
  return Math.min(score, WEIGHTS.ENGAGEMENT);
}

/**
 * Calculate source score based on lead origin
 */
function calculateSourceScore(lead: Lead): number {
  // Campaign-sourced leads are higher quality
  if (lead.campaign_id) {
    return WEIGHTS.SOURCE; // Full points for campaign leads
  }
  return WEIGHTS.SOURCE * 0.6; // Walk-in or manual leads
}

/**
 * Calculate status score based on pipeline progress
 */
function calculateStatusScore(lead: Lead): number {
  switch (lead.status) {
    case 'WON':
      return WEIGHTS.STATUS; // Already converted - max score
    case 'PROPOSAL':
      return WEIGHTS.STATUS * 0.95; // Very close to conversion
    case 'QUALIFIED':
      return WEIGHTS.STATUS * 0.75; // Good progress
    case 'CONTACTED':
      return WEIGHTS.STATUS * 0.5;  // Initial contact made
    case 'NEW':
      return WEIGHTS.STATUS * 0.25; // Fresh lead
    case 'LOST':
      return 0; // No value
    default:
      return WEIGHTS.STATUS * 0.1;
  }
}

/**
 * Calculate customer value score based on RFM segment
 */
function calculateCustomerValueScore(
  lead: Lead,
  customer: Customer | undefined,
  rfmScore: RFMScore | undefined
): number {
  if (!customer || !rfmScore) {
    return WEIGHTS.CUSTOMER_VALUE * 0.5; // Unknown - neutral score
  }
  
  // RFM segment based scoring
  switch (rfmScore.segment) {
    case 'CHAMPION':
      return WEIGHTS.CUSTOMER_VALUE; // Best customers - full points
    case 'LOYAL':
      return WEIGHTS.CUSTOMER_VALUE * 0.9;
    case 'POTENTIAL':
      return WEIGHTS.CUSTOMER_VALUE * 0.8;
    case 'AT_RISK':
      return WEIGHTS.CUSTOMER_VALUE * 0.6; // Still valuable
    case 'HIBERNATING':
      return WEIGHTS.CUSTOMER_VALUE * 0.4;
    case 'LOST':
      return WEIGHTS.CUSTOMER_VALUE * 0.2;
    default:
      return WEIGHTS.CUSTOMER_VALUE * 0.5;
  }
}

// === MAIN SCORING FUNCTION ===

/**
 * Calculate lead score with full breakdown
 */
export function calculateLeadScore(
  lead: Lead,
  activities: RMActivity[],
  customer?: Customer,
  rfmScore?: RFMScore
): LeadScore {
  const breakdown: ScoreBreakdown = {
    recency_score: Math.round(calculateRecencyScore(lead, activities)),
    engagement_score: Math.round(calculateEngagementScore(lead, activities)),
    source_score: Math.round(calculateSourceScore(lead)),
    status_score: Math.round(calculateStatusScore(lead)),
    customer_value_score: Math.round(calculateCustomerValueScore(lead, customer, rfmScore)),
  };
  
  const total_score = 
    breakdown.recency_score + 
    breakdown.engagement_score + 
    breakdown.source_score + 
    breakdown.status_score + 
    breakdown.customer_value_score;
  
  return {
    lead_id: lead.id,
    total_score,
    grade: getGrade(total_score),
    breakdown,
    last_calculated: new Date().toISOString(),
  };
}

/**
 * Score multiple leads at once
 */
export function scoreLeads(
  leads: Lead[],
  activities: RMActivity[],
  customers: Customer[],
  rfmScores: RFMScore[]
): LeadScore[] {
  return leads.map(lead => {
    const customer = customers.find(c => c.id === lead.customer_id);
    const rfmScore = rfmScores.find(r => r.customer_id === lead.customer_id);
    return calculateLeadScore(lead, activities, customer, rfmScore);
  });
}

// === HELPER FUNCTIONS ===

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getGrade(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 70) return 'HOT';
  if (score >= 40) return 'WARM';
  return 'COLD';
}

// === UI HELPERS ===

export function getGradeColor(grade: 'HOT' | 'WARM' | 'COLD'): string {
  switch (grade) {
    case 'HOT': return '#ef4444';   // Red/hot
    case 'WARM': return '#f59e0b';  // Orange/warm
    case 'COLD': return '#6b7280';  // Gray/cold
  }
}

export function getGradeIcon(grade: 'HOT' | 'WARM' | 'COLD'): string {
  switch (grade) {
    case 'HOT': return '🔥';
    case 'WARM': return '⚡';
    case 'COLD': return '❄️';
  }
}

export function getGradeLabel(grade: 'HOT' | 'WARM' | 'COLD'): string {
  switch (grade) {
    case 'HOT': return 'Hot Lead';
    case 'WARM': return 'Warm Lead';
    case 'COLD': return 'Cold Lead';
  }
}

export function formatScore(score: number): string {
  return `${score}/100`;
}

/**
 * Get scoring factor explanation for UI
 */
export function getScoreFactorLabel(factor: keyof ScoreBreakdown): string {
  switch (factor) {
    case 'recency_score': return 'Recency';
    case 'engagement_score': return 'Engagement';
    case 'source_score': return 'Source';
    case 'status_score': return 'Status';
    case 'customer_value_score': return 'Customer Value';
  }
}

export function getScoreFactorDescription(factor: keyof ScoreBreakdown): string {
  switch (factor) {
    case 'recency_score': return 'Aktivitas terakhir';
    case 'engagement_score': return 'Jumlah dan jenis interaksi';
    case 'source_score': return 'Asal lead (campaign/walk-in)';
    case 'status_score': return 'Progress dalam pipeline';
    case 'customer_value_score': return 'Nilai RFM nasabah';
  }
}
