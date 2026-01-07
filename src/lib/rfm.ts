// ==========================================
// RFM Analysis Service - Bank Sumut CRM
// ==========================================
// RFM (Recency, Frequency, Monetary) untuk segmentasi customer value
//
// VERSION: v1-poc (December 2024)
// RULESET: threshold-based-v1
//
// DATA SOURCES:
//   - PoC: Static seed data (mock)
//   - Production: Postgres/DWH agregasi transaksi (12-month rolling)
//
// SCORING METHOD: Threshold-based (bukan percentile)
//   - Dipilih karena PoC hanya 5 customers → percentile tidak meaningful
//   - Threshold lebih stabil dan mudah dijelaskan ke business stakeholder
//   - Production: akan dikalibrasi dari distribusi transaksi 12 bulan rolling
//
// EDGE CASES (di-enforce dalam calculateRFMScore):
//   - Zero/negative values → Math.max(0, value) → Score 1
//   - Missing dates → Skip atau use customer.created_at (caller responsibility)
//   - Timezone → Semua timestamp diasumsikan UTC (ISO 8601)

// === CONFIGURABLE THRESHOLDS ===
// Nilai default ini hanya untuk PoC, akan dikalibrasi dari distribusi transaksi 12 bulan rolling
// Format: [score5_max, score4_max, score3_max, score2_max] → below = score1

/** Recency thresholds in DAYS (lower = better) */
export const RECENCY_THRESHOLDS_DAYS = {
  SCORE_5_MAX: 7,    // <= 7 days = Score 5
  SCORE_4_MAX: 30,   // 8-30 days = Score 4
  SCORE_3_MAX: 90,   // 31-90 days = Score 3
  SCORE_2_MAX: 180,  // 91-180 days = Score 2
  // > 180 days = Score 1
} as const;

/** Frequency thresholds in COUNT (higher = better) */
export const FREQUENCY_THRESHOLDS_COUNT = {
  SCORE_5_MIN: 50,   // >= 50 = Score 5
  SCORE_4_MIN: 30,   // 30-49 = Score 4
  SCORE_3_MIN: 15,   // 15-29 = Score 3
  SCORE_2_MIN: 5,    // 5-14 = Score 2
  // < 5 = Score 1
} as const;

/** Monetary thresholds in IDR (Rupiah penuh, bukan juta) */
export const MONETARY_THRESHOLDS_IDR = {
  SCORE_5_MIN: 100_000_000,  // >= 100 juta = Score 5
  SCORE_4_MIN: 50_000_000,   // 50-100 juta = Score 4
  SCORE_3_MIN: 20_000_000,   // 20-50 juta = Score 3
  SCORE_2_MIN: 5_000_000,    // 5-20 juta = Score 2
  // < 5 juta = Score 1
} as const;

/** Version tracking for auditability */
export const RFM_CONFIG = {
  RULESET_VERSION: 'v1-poc',
  WINDOW_LABEL: 'static-seed',  // Production: '12m_rolling'
} as const;

// === TYPES ===
export type RFMSegment = 
  | 'CHAMPION' 
  | 'LOYAL' 
  | 'POTENTIAL' 
  | 'AT_RISK' 
  | 'HIBERNATING' 
  | 'LOST';

export type CLVProxy = 
  | 'VERY_HIGH' 
  | 'HIGH' 
  | 'GROWING' 
  | 'DECLINING' 
  | 'LOW' 
  | 'MINIMAL';

export type RFMScoreValue = 1 | 2 | 3 | 4 | 5;

export interface RFMScore {
  customer_id: string;
  recency_score: RFMScoreValue;
  recency_days: number;
  frequency_score: RFMScoreValue;
  frequency_count: number;
  monetary_score: RFMScoreValue;
  monetary_value: number;  // dalam IDR (Rupiah penuh)
  total_score: number;
  segment: RFMSegment;
  clv_proxy: CLVProxy;
  segment_reason: string;  // Explainability untuk transparency
  ruleset_version: string; // untuk auditability, e.g. "v1-poc"
  window_label: string;    // untuk auditability, e.g. "12m_rolling"
  calculated_at: string;
}

// === SEGMENT DETERMINATION ===
// Logic untuk menentukan segment berdasarkan RFM scores
// IMPORTANT: Urutan pengecekan diatur dari paling spesifik ke umum untuk menghindari overlap
export function getRFMSegment(r: RFMScoreValue, f: RFMScoreValue, m: RFMScoreValue): { 
  segment: RFMSegment; 
  clv: CLVProxy;
  reason: string;
} {
  // 1. LOST: R=1, F=1, M=1 → minimal engagement di semua dimensi
  //    Harus dicek PERTAMA karena paling spesifik
  if (r === 1 && f === 1 && m === 1) {
    return {
      segment: 'LOST',
      clv: 'MINIMAL',
      reason: `Recency rendah (>${RECENCY_THRESHOLDS_DAYS.SCORE_2_MAX} hari), Frequency rendah (<${FREQUENCY_THRESHOLDS_COUNT.SCORE_2_MIN} trx), Monetary rendah (<Rp${(MONETARY_THRESHOLDS_IDR.SCORE_2_MIN/1_000_000).toFixed(0)} juta)`
    };
  }
  
  // 2. HIBERNATING: R<=2, F<=2, M<=2 → low engagement di semua dimensi
  //    Dicek setelah LOST untuk menghindari overlap
  if (r <= 2 && f <= 2 && m <= 2) {
    return {
      segment: 'HIBERNATING',
      clv: 'LOW',
      reason: `Recency rendah (>${RECENCY_THRESHOLDS_DAYS.SCORE_3_MAX} hari), Frequency rendah, Monetary rendah → perlu re-engagement`
    };
  }
  
  // 3. CHAMPION: R>=4, F>=4, M>=4 → high di semua dimensi
  if (r >= 4 && f >= 4 && m >= 4) {
    return {
      segment: 'CHAMPION',
      clv: 'VERY_HIGH',
      reason: `Recency tinggi (<=${RECENCY_THRESHOLDS_DAYS.SCORE_4_MAX} hari), Frequency tinggi (>=${FREQUENCY_THRESHOLDS_COUNT.SCORE_4_MIN} trx), Monetary tinggi (>=Rp${(MONETARY_THRESHOLDS_IDR.SCORE_4_MIN/1_000_000).toFixed(0)} juta)`
    };
  }
  
  // 4. LOYAL: F>=4 → frequent customer regardless of recency/monetary
  if (f >= 4) {
    return {
      segment: 'LOYAL',
      clv: 'HIGH',
      reason: `Frequency tinggi (>=${FREQUENCY_THRESHOLDS_COUNT.SCORE_4_MIN} trx) → customer loyal dengan aktivitas rutin`
    };
  }
  
  // 5. POTENTIAL: R>=4 (dan F<4) → recently active, potential to grow
  if (r >= 4) {
    return {
      segment: 'POTENTIAL',
      clv: 'GROWING',
      reason: `Recency tinggi (<=${RECENCY_THRESHOLDS_DAYS.SCORE_4_MAX} hari), Frequency belum tinggi → potensi untuk ditingkatkan`
    };
  }
  
  // 6. AT_RISK: R<=2 DAN (F>=3 ATAU M>=3) → dulu aktif/bernilai, sekarang menurun
  //    Ini menangkap customer yang PERNAH bagus tapi mulai menurun
  if (r <= 2 && (f >= 3 || m >= 3)) {
    return {
      segment: 'AT_RISK',
      clv: 'DECLINING',
      reason: `Recency menurun (>${RECENCY_THRESHOLDS_DAYS.SCORE_3_MAX} hari), namun histori ${f >= 3 ? 'frequency' : 'monetary'} masih baik → perlu win-back campaign`
    };
  }
  
  // 7. Default: AT_RISK untuk middle-ground cases (R=3, F<=3, M<=3)
  //    Customer yang tidak masuk kategori lain → perlu perhatian
  return {
    segment: 'AT_RISK',
    clv: 'DECLINING',
    reason: `Skor campuran (R=${r}, F=${f}, M=${m}) → perlu analisis lebih lanjut`
  };
}

// === SCORE CALCULATION ===
// Calculate RFM score based on raw data with input sanitization
export function calculateRFMScore(
  customerId: string,
  recencyDays: number,
  frequencyCount: number,
  monetaryValue: number  // dalam IDR (Rupiah penuh)
): RFMScore {
  // Input sanitization: negative/invalid values treated as 0
  const sanitizedRecency = Math.max(0, recencyDays);
  const sanitizedFrequency = Math.max(0, Math.floor(frequencyCount));
  const sanitizedMonetary = Math.max(0, monetaryValue);

  // Recency scoring (lower days = higher score)
  const recencyScore: RFMScoreValue = 
    sanitizedRecency <= RECENCY_THRESHOLDS_DAYS.SCORE_5_MAX ? 5 :
    sanitizedRecency <= RECENCY_THRESHOLDS_DAYS.SCORE_4_MAX ? 4 :
    sanitizedRecency <= RECENCY_THRESHOLDS_DAYS.SCORE_3_MAX ? 3 :
    sanitizedRecency <= RECENCY_THRESHOLDS_DAYS.SCORE_2_MAX ? 2 : 1;

  // Frequency scoring (higher count = higher score)
  const frequencyScore: RFMScoreValue = 
    sanitizedFrequency >= FREQUENCY_THRESHOLDS_COUNT.SCORE_5_MIN ? 5 :
    sanitizedFrequency >= FREQUENCY_THRESHOLDS_COUNT.SCORE_4_MIN ? 4 :
    sanitizedFrequency >= FREQUENCY_THRESHOLDS_COUNT.SCORE_3_MIN ? 3 :
    sanitizedFrequency >= FREQUENCY_THRESHOLDS_COUNT.SCORE_2_MIN ? 2 : 1;

  // Monetary scoring (higher value = higher score, dalam IDR)
  const monetaryScore: RFMScoreValue = 
    sanitizedMonetary >= MONETARY_THRESHOLDS_IDR.SCORE_5_MIN ? 5 :
    sanitizedMonetary >= MONETARY_THRESHOLDS_IDR.SCORE_4_MIN ? 4 :
    sanitizedMonetary >= MONETARY_THRESHOLDS_IDR.SCORE_3_MIN ? 3 :
    sanitizedMonetary >= MONETARY_THRESHOLDS_IDR.SCORE_2_MIN ? 2 : 1;

  const { segment, clv, reason } = getRFMSegment(recencyScore, frequencyScore, monetaryScore);

  return {
    customer_id: customerId,
    recency_score: recencyScore,
    recency_days: sanitizedRecency,
    frequency_score: frequencyScore,
    frequency_count: sanitizedFrequency,
    monetary_score: monetaryScore,
    monetary_value: sanitizedMonetary,
    total_score: recencyScore + frequencyScore + monetaryScore,
    segment,
    clv_proxy: clv,
    segment_reason: reason,
    ruleset_version: RFM_CONFIG.RULESET_VERSION,
    window_label: RFM_CONFIG.WINDOW_LABEL,
    calculated_at: new Date().toISOString(),
  };
}

// === UI HELPERS ===
// Get display icon for CLV proxy
export function getCLVIcon(clv: CLVProxy): string {
  const icons: Record<CLVProxy, string> = {
    VERY_HIGH: '💎',
    HIGH: '💰',
    GROWING: '📈',
    DECLINING: '⚠️',
    LOW: '😴',
    MINIMAL: '🔻',
  };
  return icons[clv];
}

// Get display color for segment
export function getSegmentColor(segment: RFMSegment): string {
  const colors: Record<RFMSegment, string> = {
    CHAMPION: '#f59e0b',   // Gold
    LOYAL: '#10b981',      // Green
    POTENTIAL: '#06b6d4',  // Cyan
    AT_RISK: '#ef4444',    // Red
    HIBERNATING: '#6b7280', // Gray
    LOST: '#374151',       // Dark Gray
  };
  return colors[segment];
}

// Get human-readable segment label
export function getSegmentLabel(segment: RFMSegment): string {
  const labels: Record<RFMSegment, string> = {
    CHAMPION: 'Champion',
    LOYAL: 'Loyal Customer',
    POTENTIAL: 'Potential Loyalist',
    AT_RISK: 'At Risk',
    HIBERNATING: 'Hibernating',
    LOST: 'Lost',
  };
  return labels[segment];
}
