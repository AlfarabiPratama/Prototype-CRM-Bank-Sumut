// ==========================================
// Compliance Dashboard - Audit & Compliance Dashboard
// ==========================================

import { Link } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  Download,
  UserCog,
  AlertTriangle,
  Activity,
  FileText,
  ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { AuditEvent } from '../../types';

export function ComplianceDashboard() {
  const { auditLogs, customers } = useAppStore();

  // Event Counts
  const eventCounts: Partial<Record<AuditEvent, number>> = {};
  auditLogs.forEach(log => {
    eventCounts[log.event] = (eventCounts[log.event] || 0) + 1;
  });

  // High-risk actions
  const exportEvents = auditLogs.filter(l => l.event === 'EXPORT_DATA');
  const rbacChanges = auditLogs.filter(l => l.event === 'CHANGE_RBAC' || l.event === 'CHANGE_WORKFLOW');
  const profileViews = auditLogs.filter(l => l.event === 'VIEW_PROFILE');

  // Consent Governance
  const consentGranted = customers.filter(c => c.consent.marketing === 'GRANTED').length;
  const consentWithdrawn = customers.filter(c => c.consent.marketing === 'WITHDRAWN').length;
  const consentChanges = auditLogs.filter(l => l.event === 'CHANGE_CONSENT');

  // Top events
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 6);

  // Recent audit logs
  const recentLogs = [...auditLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="role-dashboard compliance-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Audit & Compliance Dashboard</h1>
          <p className="page-subtitle">
            Data access monitoring & governance
          </p>
        </div>
      </header>

      {/* High Risk Actions */}
      <div className="dashboard-section">
        <h2><AlertTriangle size={18} /> High-Risk Actions</h2>
        <div className="kpi-grid kpi-grid-4">
          <Link to="/audit" className="kpi-card kpi-danger">
            <div className="kpi-icon">
              <Download size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{exportEvents.length}</span>
              <span className="kpi-label">Data Exports</span>
            </div>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </Link>

          <Link to="/audit" className="kpi-card kpi-warning">
            <div className="kpi-icon">
              <UserCog size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{rbacChanges.length}</span>
              <span className="kpi-label">RBAC/Workflow Changes</span>
            </div>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </Link>

          <Link to="/audit" className="kpi-card kpi-info">
            <div className="kpi-icon">
              <Eye size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{profileViews.length}</span>
              <span className="kpi-label">Profile Views</span>
            </div>
            <ArrowUpRight size={14} className="kpi-arrow" />
          </Link>

          <div className="kpi-card kpi-primary">
            <div className="kpi-icon">
              <Activity size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{auditLogs.length}</span>
              <span className="kpi-label">Total Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Consent Governance */}
        <div className="dashboard-section">
          <h2><Shield size={18} /> Consent Governance</h2>
          <div className="consent-stats">
            <div className="consent-stat-row">
              <span className="consent-stat-label">Marketing Consent Granted</span>
              <span className="consent-stat-value success">{consentGranted}</span>
            </div>
            <div className="consent-stat-row">
              <span className="consent-stat-label">Marketing Consent Withdrawn</span>
              <span className="consent-stat-value danger">{consentWithdrawn}</span>
            </div>
            <div className="consent-stat-row">
              <span className="consent-stat-label">Consent Changes (Logged)</span>
              <span className="consent-stat-value">{consentChanges.length}</span>
            </div>
          </div>
          <div className="consent-chart">
            <div 
              className="consent-bar granted" 
              style={{ width: `${(consentGranted / customers.length) * 100}%` }}
            />
            <div 
              className="consent-bar withdrawn" 
              style={{ width: `${(consentWithdrawn / customers.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Event Distribution */}
        <div className="dashboard-section">
          <h2><Activity size={18} /> Event Distribution</h2>
          <div className="event-distribution">
            {topEvents.map(([event, count]) => (
              <div key={event} className="event-row">
                <span className="event-name">{event.replace(/_/g, ' ')}</span>
                <div className="event-bar-container">
                  <div 
                    className="event-bar"
                    style={{ width: `${(count! / auditLogs.length) * 100}%` }}
                  />
                </div>
                <span className="event-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2><FileText size={18} /> Recent Audit Trail</h2>
          <Link to="/audit" className="btn btn-sm btn-secondary">
            View All
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="audit-log-list">
          {recentLogs.map(log => (
            <div key={log.id} className="audit-log-item">
              <div className="audit-log-time">
                {new Date(log.timestamp).toLocaleString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="audit-log-event">
                <span className={`event-badge event-${log.event.toLowerCase().replace(/_/g, '-')}`}>
                  {log.event.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="audit-log-user">
                {log.user_name} ({log.user_role})
              </div>
              <div className="audit-log-entity">
                {log.entity_type}: {log.entity_id?.slice(0, 8) || 'N/A'}
              </div>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="audit-log-empty">No audit events recorded</div>
          )}
        </div>
      </div>
    </div>
  );
}
