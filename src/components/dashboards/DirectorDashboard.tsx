// ==========================================
// Director Dashboard - Executive Health Dashboard
// ==========================================

import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Star,
  Target,
  Shield,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getSLAStatus } from '../../lib/sla';
import { getSegmentLabel, getSegmentColor, type RFMSegment } from '../../lib/rfm';

export function DirectorDashboard() {
  const { 
    customers, 
    cases, 
    leads, 
    rfmScores,
    campaigns,
    auditLogs
  } = useAppStore();

  // Customer Base & Growth
  const totalCustomers = customers.length;
  const segmentDist = {
    MASS: customers.filter(c => c.segment === 'MASS').length,
    EMERGING: customers.filter(c => c.segment === 'EMERGING').length,
    PRIORITY: customers.filter(c => c.segment === 'PRIORITY').length,
    PRIVATE: customers.filter(c => c.segment === 'PRIVATE').length,
  };

  // Service Health
  const openCases = cases.filter(c => c.status !== 'CLOSED');
  const slaBreached = openCases.filter(c => getSLAStatus(c.sla) === 'BREACHED').length;
  const slaCompliance = openCases.length > 0 
    ? Math.round(((openCases.length - slaBreached) / openCases.length) * 100) 
    : 100;
  const closedCases = cases.filter(c => c.status === 'CLOSED').length;

  // Revenue/Sales Proxy
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(l => l.status === 'WON').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Marketing Summary
  const eligibleForMarketing = customers.filter(c => c.consent.marketing === 'GRANTED').length;
  const ineligible = totalCustomers - eligibleForMarketing;

  // RFM Summary
  const rfmDist: Record<RFMSegment, number> = {
    CHAMPION: rfmScores.filter(r => r.segment === 'CHAMPION').length,
    LOYAL: rfmScores.filter(r => r.segment === 'LOYAL').length,
    POTENTIAL: rfmScores.filter(r => r.segment === 'POTENTIAL').length,
    AT_RISK: rfmScores.filter(r => r.segment === 'AT_RISK').length,
    HIBERNATING: rfmScores.filter(r => r.segment === 'HIBERNATING').length,
    LOST: rfmScores.filter(r => r.segment === 'LOST').length,
  };
  const atRiskCustomers = rfmDist.AT_RISK + rfmDist.HIBERNATING + rfmDist.LOST;

  // Compliance Snapshot
  const exportEvents = auditLogs.filter(l => l.event === 'EXPORT_DATA').length;
  const consentChanges = auditLogs.filter(l => l.event === 'CHANGE_CONSENT').length;

  return (
    <div className="role-dashboard director-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Executive Health Dashboard</h1>
          <p className="page-subtitle">
            Bank-wide aggregate view • Data as of today
          </p>
        </div>
      </header>

      {/* Health Score Cards */}
      <div className="dashboard-section">
        <h2><BarChart3 size={18} /> Key Metrics</h2>
        <div className="kpi-grid kpi-grid-4">
          <div className="kpi-card kpi-primary">
            <div className="kpi-icon">
              <Users size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{totalCustomers.toLocaleString()}</span>
              <span className="kpi-label">Total Customers</span>
            </div>
          </div>

          <div className={`kpi-card ${slaCompliance >= 90 ? 'kpi-success' : slaCompliance >= 70 ? 'kpi-warning' : 'kpi-danger'}`}>
            <div className="kpi-icon">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{slaCompliance}%</span>
              <span className="kpi-label">SLA Compliance</span>
            </div>
          </div>

          <div className="kpi-card kpi-info">
            <div className="kpi-icon">
              <TrendingUp size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{totalLeads}</span>
              <span className="kpi-label">Total Leads</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">
              <Target size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{campaigns.length}</span>
              <span className="kpi-label">Active Campaigns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Service Health */}
        <div className="dashboard-section">
          <h2><AlertTriangle size={18} /> Service Health</h2>
          <div className="health-metrics">
            <div className="health-metric">
              <span className="health-metric-label">Open Cases</span>
              <span className="health-metric-value">{openCases.length}</span>
            </div>
            <div className="health-metric">
              <span className="health-metric-label">SLA Breached</span>
              <span className="health-metric-value danger">{slaBreached}</span>
            </div>
            <div className="health-metric">
              <span className="health-metric-label">Closed (Total)</span>
              <span className="health-metric-value success">{closedCases}</span>
            </div>
            <div className="health-metric">
              <span className="health-metric-label">Resolution Rate</span>
              <span className="health-metric-value">
                {cases.length > 0 ? Math.round((closedCases / cases.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Marketing Reach */}
        <div className="dashboard-section">
          <h2><Target size={18} /> Marketing Reach</h2>
          <div className="reach-chart">
            <div className="reach-bar-container">
              <div 
                className="reach-bar eligible" 
                style={{ width: `${(eligibleForMarketing / totalCustomers) * 100}%` }}
              />
              <div 
                className="reach-bar ineligible" 
                style={{ width: `${(ineligible / totalCustomers) * 100}%` }}
              />
            </div>
            <div className="reach-legend">
              <div className="reach-legend-item">
                <span className="reach-dot eligible" />
                <span>Eligible: {eligibleForMarketing} ({Math.round((eligibleForMarketing / totalCustomers) * 100)}%)</span>
              </div>
              <div className="reach-legend-item">
                <span className="reach-dot ineligible" />
                <span>Ineligible: {ineligible} ({Math.round((ineligible / totalCustomers) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RFM Distribution */}
      <div className="dashboard-section">
        <h2><Star size={18} /> Customer Value Distribution (RFM)</h2>
        <div className="rfm-executive-grid">
          {(Object.entries(rfmDist) as [RFMSegment, number][]).map(([segment, count]) => {
            const percentage = rfmScores.length > 0 ? (count / rfmScores.length) * 100 : 0;
            return (
              <div 
                key={segment} 
                className="rfm-executive-card"
                style={{ borderTopColor: getSegmentColor(segment) }}
              >
                <span className="rfm-exec-value" style={{ color: getSegmentColor(segment) }}>
                  {count}
                </span>
                <span className="rfm-exec-label">{getSegmentLabel(segment)}</span>
                <span className="rfm-exec-percent">{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        <div className="rfm-alert">
          <AlertTriangle size={16} />
          <span>{atRiskCustomers} customers at risk (At Risk + Hibernating + Lost)</span>
        </div>
      </div>

      {/* Compliance Snapshot */}
      <div className="dashboard-section">
        <h2><Shield size={18} /> Compliance Snapshot</h2>
        <div className="compliance-metrics">
          <div className="compliance-metric">
            <span className="compliance-metric-value">{exportEvents}</span>
            <span className="compliance-metric-label">Data Exports</span>
          </div>
          <div className="compliance-metric">
            <span className="compliance-metric-value">{consentChanges}</span>
            <span className="compliance-metric-label">Consent Changes</span>
          </div>
          <div className="compliance-metric">
            <span className="compliance-metric-value">{auditLogs.length}</span>
            <span className="compliance-metric-label">Total Audit Events</span>
          </div>
        </div>
      </div>

      {/* Customer Segment Distribution */}
      <div className="dashboard-section">
        <h2><Users size={18} /> Customer Segments</h2>
        <div className="segment-bars">
          {Object.entries(segmentDist).map(([segment, count]) => (
            <div key={segment} className="segment-bar-row">
              <span className="segment-bar-label">{segment}</span>
              <div className="segment-bar-container">
                <div 
                  className={`segment-bar segment-${segment.toLowerCase()}`}
                  style={{ width: `${(count / totalCustomers) * 100}%` }}
                />
              </div>
              <span className="segment-bar-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
