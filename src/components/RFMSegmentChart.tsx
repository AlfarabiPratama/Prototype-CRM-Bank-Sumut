// ==========================================
// RFM Segment Chart - Donut Chart Visualization
// ==========================================
// Pure CSS donut chart for RFM segment distribution
// No external chart library needed for PoC

import { useMemo } from 'react';
import { 
  getSegmentLabel, 
  getSegmentColor, 
  getCLVIcon,
  type RFMSegment 
} from '../../lib/rfm';

interface SegmentData {
  segment: RFMSegment;
  count: number;
  percentage: number;
  color: string;
  label: string;
  icon: string;
}

interface RFMSegmentChartProps {
  segmentCounts: Record<RFMSegment, number>;
  totalCustomers: number;
}

export function RFMSegmentChart({ segmentCounts, totalCustomers }: RFMSegmentChartProps) {
  const segments: SegmentData[] = useMemo(() => {
    const segmentOrder: RFMSegment[] = [
      'CHAMPION', 'LOYAL', 'POTENTIAL', 'AT_RISK', 'HIBERNATING', 'LOST'
    ];
    
    return segmentOrder.map(segment => ({
      segment,
      count: segmentCounts[segment] || 0,
      percentage: totalCustomers > 0 
        ? Math.round((segmentCounts[segment] || 0) / totalCustomers * 100) 
        : 0,
      color: getSegmentColor(segment),
      label: getSegmentLabel(segment),
      icon: getCLVIcon(
        segment === 'CHAMPION' ? 'VERY_HIGH' :
        segment === 'LOYAL' ? 'HIGH' :
        segment === 'POTENTIAL' ? 'GROWING' :
        segment === 'AT_RISK' ? 'DECLINING' :
        segment === 'HIBERNATING' ? 'LOW' : 'MINIMAL'
      ),
    }));
  }, [segmentCounts, totalCustomers]);

  // Calculate cumulative percentages for SVG arcs
  const arcs = useMemo(() => {
    let currentAngle = 0;
    return segments.map(seg => {
      const angle = (seg.count / totalCustomers) * 360;
      const arc = {
        ...seg,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return arc;
    });
  }, [segments, totalCustomers]);

  // Generate SVG path for arc
  const describeArc = (start: number, end: number, radius: number = 80) => {
    const startRad = (start - 90) * Math.PI / 180;
    const endRad = (end - 90) * Math.PI / 180;
    
    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);
    
    const largeArc = end - start > 180 ? 1 : 0;
    
    return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="rfm-segment-chart">
      <div className="rfm-chart-container">
        {/* SVG Donut Chart */}
        <svg viewBox="0 0 200 200" className="rfm-donut">
          {arcs.map((arc, i) => (
            arc.count > 0 && (
              <path
                key={arc.segment}
                d={describeArc(arc.startAngle, arc.endAngle)}
                fill={arc.color}
                className="rfm-donut-segment"
              >
                <title>{arc.label}: {arc.count} ({arc.percentage}%)</title>
              </path>
            )
          ))}
          {/* Center hole */}
          <circle cx="100" cy="100" r="50" fill="var(--color-bg-card)" />
          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className="rfm-donut-total">
            {totalCustomers}
          </text>
          <text x="100" y="115" textAnchor="middle" className="rfm-donut-label">
            Nasabah
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="rfm-chart-legend">
        {segments.map(seg => (
          <div key={seg.segment} className="rfm-legend-item">
            <span 
              className="rfm-legend-dot"
              style={{ backgroundColor: seg.color }}
            />
            <span className="rfm-legend-icon">{seg.icon}</span>
            <span className="rfm-legend-label">{seg.label}</span>
            <span className="rfm-legend-count">{seg.count}</span>
            <span className="rfm-legend-percent">({seg.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Summary Cards Component
interface RFMSummaryCardsProps {
  totalCustomers: number;
  championsCount: number;
  atRiskCount: number;
  avgTotalScore: number;
}

export function RFMSummaryCards({ 
  totalCustomers, 
  championsCount, 
  atRiskCount,
  avgTotalScore 
}: RFMSummaryCardsProps) {
  return (
    <div className="rfm-summary-cards">
      <div className="rfm-summary-card">
        <span className="rfm-summary-value">{totalCustomers}</span>
        <span className="rfm-summary-label">Total Nasabah</span>
      </div>
      <div className="rfm-summary-card rfm-summary-success">
        <span className="rfm-summary-icon">💎</span>
        <span className="rfm-summary-value">{championsCount}</span>
        <span className="rfm-summary-label">Champions</span>
      </div>
      <div className="rfm-summary-card rfm-summary-danger">
        <span className="rfm-summary-icon">⚠️</span>
        <span className="rfm-summary-value">{atRiskCount}</span>
        <span className="rfm-summary-label">At Risk</span>
      </div>
      <div className="rfm-summary-card">
        <span className="rfm-summary-value">{avgTotalScore.toFixed(1)}</span>
        <span className="rfm-summary-label">Avg Score /15</span>
      </div>
    </div>
  );
}
