// ==========================================
// RFM Card Component - Score Visualization
// ==========================================
// Displays RFM scores with visual progress bars
// and segment explanation

import { useMemo } from 'react';
import { 
  getSegmentLabel, 
  getSegmentColor, 
  getCLVIcon,
  type RFMScore,
  type RFMScoreValue
} from '../lib/rfm';

interface RFMCardProps {
  rfm: RFMScore;
  compact?: boolean;
}

interface ScoreBarProps {
  label: string;
  score: RFMScoreValue;
  rawValue: string;
  color: string;
}

function ScoreBar({ label, score, rawValue, color }: ScoreBarProps) {
  const percentage = (score / 5) * 100;
  
  return (
    <div className="rfm-score-bar">
      <div className="rfm-score-bar-header">
        <span className="rfm-score-bar-label">{label}</span>
        <span className="rfm-score-bar-value">{score}/5</span>
      </div>
      <div className="rfm-score-bar-track">
        <div 
          className="rfm-score-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="rfm-score-bar-raw">{rawValue}</span>
    </div>
  );
}

export function RFMCard({ rfm, compact = false }: RFMCardProps) {
  const segmentColor = useMemo(() => getSegmentColor(rfm.segment), [rfm.segment]);
  const segmentLabel = useMemo(() => getSegmentLabel(rfm.segment), [rfm.segment]);
  const clvIcon = useMemo(() => getCLVIcon(rfm.clv_proxy), [rfm.clv_proxy]);

  // Format monetary value
  const formatMonetary = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    }
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(0)} jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (compact) {
    return (
      <div className="rfm-card-compact" style={{ borderLeftColor: segmentColor }}>
        <div className="rfm-card-compact-header">
          <span className="rfm-segment-badge" style={{ backgroundColor: segmentColor }}>
            {clvIcon} {segmentLabel}
          </span>
          <span className="rfm-total-score">{rfm.total_score}/15</span>
        </div>
        <div className="rfm-card-compact-scores">
          <span title="Recency">R:{rfm.recency_score}</span>
          <span title="Frequency">F:{rfm.frequency_score}</span>
          <span title="Monetary">M:{rfm.monetary_score}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rfm-card" style={{ borderTopColor: segmentColor }}>
      {/* Header with Segment Badge */}
      <div className="rfm-card-header">
        <div className="rfm-segment-info">
          <span 
            className="rfm-segment-badge"
            style={{ backgroundColor: segmentColor }}
          >
            {clvIcon} {segmentLabel}
          </span>
          <span className="rfm-clv-label">
            CLV: {rfm.clv_proxy.replace('_', ' ')}
          </span>
        </div>
        <div className="rfm-total-score-container">
          <span className="rfm-total-score-value">{rfm.total_score}</span>
          <span className="rfm-total-score-max">/15</span>
        </div>
      </div>

      {/* Score Bars */}
      <div className="rfm-score-bars">
        <ScoreBar 
          label="Recency (R)"
          score={rfm.recency_score}
          rawValue={`${rfm.recency_days} hari lalu`}
          color="#3b82f6"
        />
        <ScoreBar 
          label="Frequency (F)"
          score={rfm.frequency_score}
          rawValue={`${rfm.frequency_count} transaksi`}
          color="#10b981"
        />
        <ScoreBar 
          label="Monetary (M)"
          score={rfm.monetary_score}
          rawValue={formatMonetary(rfm.monetary_value)}
          color="#8b5cf6"
        />
      </div>

      {/* Explanation */}
      <div className="rfm-explanation">
        <span className="rfm-explanation-icon">ℹ️</span>
        <p className="rfm-explanation-text">{rfm.segment_reason}</p>
      </div>

      {/* Metadata (for auditability) */}
      <div className="rfm-metadata">
        <span>Ruleset: {rfm.ruleset_version}</span>
        <span>•</span>
        <span>Window: {rfm.window_label}</span>
      </div>
    </div>
  );
}
