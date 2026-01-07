// ==========================================
// Marketing Dashboard - Consent-aware Campaign Dashboard
// ==========================================

import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Mail,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getSegmentLabel, getSegmentColor, type RFMSegment } from '../../lib/rfm';

export function MarketingDashboard() {
  const { 
    customers, 
    cases,
    segments, 
    campaigns, 
    rfmScores
  } = useAppStore();

  // Eligible vs Ineligible
  const eligibleMarketing = customers.filter(c => c.consent.marketing === 'GRANTED');
  const ineligibleConsent = customers.filter(c => c.consent.marketing === 'WITHDRAWN');
  
  // Check for active cases
  const customersWithActiveCase = new Set(
    cases.filter(c => c.status !== 'CLOSED').map(c => c.customer_id)
  );
  const ineligibleCase = eligibleMarketing.filter(c => customersWithActiveCase.has(c.id));
  const reallyEligible = eligibleMarketing.filter(c => !customersWithActiveCase.has(c.id));

  // RFM Distribution for targeting
  const rfmDist: Record<RFMSegment, number> = {
    CHAMPION: rfmScores.filter(r => r.segment === 'CHAMPION').length,
    LOYAL: rfmScores.filter(r => r.segment === 'LOYAL').length,
    POTENTIAL: rfmScores.filter(r => r.segment === 'POTENTIAL').length,
    AT_RISK: rfmScores.filter(r => r.segment === 'AT_RISK').length,
    HIBERNATING: rfmScores.filter(r => r.segment === 'HIBERNATING').length,
    LOST: rfmScores.filter(r => r.segment === 'LOST').length,
  };

  // Campaign Stats
  const activeCampaigns = campaigns.filter(c => c.status === 'EXECUTING');
  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED');
  const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT');

  // Top segments to activate (sorted by opportunity)
  const segmentOpportunities = [
    { segment: 'POTENTIAL' as RFMSegment, count: rfmDist.POTENTIAL, reason: 'High potential, low frequency' },
    { segment: 'AT_RISK' as RFMSegment, count: rfmDist.AT_RISK, reason: 'Need retention campaign' },
    { segment: 'LOYAL' as RFMSegment, count: rfmDist.LOYAL, reason: 'Upsell opportunities' },
  ].filter(s => s.count > 0);

  return (
    <div className="role-dashboard marketing-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Campaign & Segmentation Dashboard</h1>
          <p className="page-subtitle">
            Consent-aware audience management
          </p>
        </div>
      </header>

      {/* Audience Eligibility */}
      <div className="dashboard-section">
        <h2><Users size={18} /> Audience Eligibility</h2>
        <div className="kpi-grid kpi-grid-4">
          <div className="kpi-card kpi-success">
            <div className="kpi-icon">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{reallyEligible.length}</span>
              <span className="kpi-label">Eligible</span>
            </div>
          </div>

          <div className="kpi-card kpi-danger">
            <div className="kpi-icon">
              <AlertCircle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{ineligibleConsent.length}</span>
              <span className="kpi-label">No Consent</span>
            </div>
          </div>

          <div className="kpi-card kpi-warning">
            <div className="kpi-icon">
              <AlertCircle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{ineligibleCase.length}</span>
              <span className="kpi-label">Active Case</span>
            </div>
          </div>

          <div className="kpi-card kpi-primary">
            <div className="kpi-icon">
              <Users size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{customers.length}</span>
              <span className="kpi-label">Total Base</span>
            </div>
          </div>
        </div>

        {/* Eligibility Bar */}
        <div className="eligibility-breakdown">
          <div className="eligibility-bar">
            <div 
              className="eligibility-segment eligible" 
              style={{ width: `${(reallyEligible.length / customers.length) * 100}%` }}
              title={`Eligible: ${reallyEligible.length}`}
            />
            <div 
              className="eligibility-segment case-block" 
              style={{ width: `${(ineligibleCase.length / customers.length) * 100}%` }}
              title={`Blocked by case: ${ineligibleCase.length}`}
            />
            <div 
              className="eligibility-segment no-consent" 
              style={{ width: `${(ineligibleConsent.length / customers.length) * 100}%` }}
              title={`No consent: ${ineligibleConsent.length}`}
            />
          </div>
          <div className="eligibility-legend">
            <span className="legend-item"><span className="dot eligible" /> Eligible</span>
            <span className="legend-item"><span className="dot case-block" /> Active Case</span>
            <span className="legend-item"><span className="dot no-consent" /> No Consent</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Campaign Status */}
        <div className="dashboard-section">
          <h2><Mail size={18} /> Campaign Status</h2>
          <div className="campaign-stats">
            <Link to="/marketing" className="campaign-stat-card">
              <span className="campaign-stat-value">{activeCampaigns.length}</span>
              <span className="campaign-stat-label">Executing</span>
              <ArrowUpRight size={14} />
            </Link>
            <div className="campaign-stat-card">
              <span className="campaign-stat-value">{draftCampaigns.length}</span>
              <span className="campaign-stat-label">Drafts</span>
            </div>
            <div className="campaign-stat-card">
              <span className="campaign-stat-value">{completedCampaigns.length}</span>
              <span className="campaign-stat-label">Completed</span>
            </div>
            <div className="campaign-stat-card">
              <span className="campaign-stat-value">{segments.length}</span>
              <span className="campaign-stat-label">Segments</span>
            </div>
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="dashboard-section">
          <h2><TrendingUp size={18} /> Top Segments to Activate</h2>
          <div className="opportunity-list">
            {segmentOpportunities.map(opp => (
              <div 
                key={opp.segment} 
                className="opportunity-item"
                style={{ borderLeftColor: getSegmentColor(opp.segment) }}
              >
                <div className="opportunity-header">
                  <span 
                    className="opportunity-segment"
                    style={{ color: getSegmentColor(opp.segment) }}
                  >
                    {getSegmentLabel(opp.segment)}
                  </span>
                  <span className="opportunity-count">{opp.count} customers</span>
                </div>
                <span className="opportunity-reason">{opp.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RFM Distribution */}
      <div className="dashboard-section">
        <h2><Star size={18} /> Segment Distribution (for Targeting)</h2>
        <div className="rfm-targeting-grid">
          {(Object.entries(rfmDist) as [RFMSegment, number][]).map(([segment, count]) => (
            <div 
              key={segment} 
              className="rfm-targeting-card"
              style={{ backgroundColor: `${getSegmentColor(segment)}10` }}
            >
              <div 
                className="rfm-targeting-dot"
                style={{ backgroundColor: getSegmentColor(segment) }}
              />
              <div className="rfm-targeting-info">
                <span className="rfm-targeting-label">{getSegmentLabel(segment)}</span>
                <span className="rfm-targeting-count">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="marketing-actions">
          <Link to="/marketing" className="btn btn-primary">
            <Target size={16} />
            Create Campaign
          </Link>
          <Link to="/marketing" className="btn btn-secondary">
            <Users size={16} />
            Manage Segments
          </Link>
        </div>
      </div>
    </div>
  );
}
