// ==========================================
// Dashboard Page - Role-Based Routing
// ==========================================

import { useAppStore } from '../store/useAppStore';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Building2,
  Star
} from 'lucide-react';
import { can } from '../lib/policy';
import { getSegmentLabel, getSegmentColor, type RFMSegment } from '../lib/rfm';
import { 
  SupervisorDashboard, 
  AgentDashboard, 
  RMDashboard,
  DirectorDashboard,
  MarketingDashboard,
  ComplianceDashboard,
  AdminDashboard
} from '../components/dashboards';

export function DashboardPage() {
  const { currentUser, customers, cases, leads, branches, rfmScores } = useAppStore();

  if (!currentUser) {
    return <div className="page-empty">Please log in</div>;
  }

  // Route to role-specific dashboard
  switch (currentUser.role) {
    case 'DIRECTOR':
      return <DirectorDashboard />;
    case 'SUPERVISOR':
      return <SupervisorDashboard />;
    case 'AGENT':
      return <AgentDashboard />;
    case 'RM':
      return <RMDashboard />;
    case 'MARKETING':
      return <MarketingDashboard />;
    case 'COMPLIANCE':
      return <ComplianceDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
  }

  // Generic Executive Dashboard (for DIRECTOR, MARKETING, COMPLIANCE, ADMIN)
  const openCases = cases.filter(c => c.status === 'OPEN').length;
  const inProgressCases = cases.filter(c => c.status === 'IN_PROGRESS').length;
  const closedCases = cases.filter(c => c.status === 'CLOSED').length;
  const newLeads = leads.filter(l => l.status === 'NEW').length;

  // RFM Distribution
  const rfmDistribution: Record<RFMSegment, number> = {
    CHAMPION: rfmScores.filter(r => r.segment === 'CHAMPION').length,
    LOYAL: rfmScores.filter(r => r.segment === 'LOYAL').length,
    POTENTIAL: rfmScores.filter(r => r.segment === 'POTENTIAL').length,
    AT_RISK: rfmScores.filter(r => r.segment === 'AT_RISK').length,
    HIBERNATING: rfmScores.filter(r => r.segment === 'HIBERNATING').length,
    LOST: rfmScores.filter(r => r.segment === 'LOST').length,
  };

  const stats = [
    {
      label: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: '#6366f1',
      visible: can(currentUser, 'view_dashboard'),
    },
    {
      label: 'Open Cases',
      value: openCases,
      icon: AlertTriangle,
      color: '#f59e0b',
      visible: can(currentUser, 'view_dashboard'),
    },
    {
      label: 'In Progress',
      value: inProgressCases,
      icon: Clock,
      color: '#06b6d4',
      visible: can(currentUser, 'view_dashboard'),
    },
    {
      label: 'Closed Cases',
      value: closedCases,
      icon: CheckCircle,
      color: '#10b981',
      visible: can(currentUser, 'view_dashboard'),
    },
    {
      label: 'New Leads',
      value: newLeads,
      icon: TrendingUp,
      color: '#8b5cf6',
      visible: can(currentUser, 'view_dashboard'),
    },
  ];

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h1>Executive Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {currentUser.name} • {currentUser.role}
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats
          .filter(s => s.visible)
          .map(stat => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="stat-card"
                style={{ '--stat-color': stat.color } as React.CSSProperties}
              >
                <div className="stat-icon-wrapper">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                <ArrowUpRight size={16} className="stat-arrow" />
              </div>
            );
          })}
      </div>

      {/* Quick Info for DIRECTOR */}
      {currentUser.role === 'DIRECTOR' && (
        <div className="dashboard-section">
          <h2>Branch Overview</h2>
          <div className="branch-overview-grid">
            {branches.slice(0, 6).map(branch => {
              const branchCustomers = customers.filter(c => c.branch_id === branch.id).length;
              const branchCases = cases.filter(c => c.branch_id === branch.id).length;
              
              return (
                <div key={branch.id} className="branch-card">
                  <div className="branch-card-header">
                    <Building2 size={20} />
                    <span>{branch.name}</span>
                  </div>
                  <div className="branch-card-stats">
                    <div className="branch-stat">
                      <span className="branch-stat-value">{branchCustomers}</span>
                      <span className="branch-stat-label">Customers</span>
                    </div>
                    <div className="branch-stat">
                      <span className="branch-stat-value">{branchCases}</span>
                      <span className="branch-stat-label">Cases</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RFM Distribution */}
      <div className="dashboard-section">
        <h2><Star size={20} /> Customer Value Distribution (RFM)</h2>
        <div className="rfm-distribution-grid">
          {(Object.keys(rfmDistribution) as RFMSegment[]).map(segment => {
            const count = rfmDistribution[segment];
            const percentage = rfmScores.length > 0 ? (count / rfmScores.length) * 100 : 0;
            return (
              <div 
                key={segment} 
                className={`rfm-dist-card rfm-${segment.toLowerCase()}`}
                style={{ '--rfm-color': getSegmentColor(segment) } as React.CSSProperties}
              >
                <div className="rfm-dist-header">
                  <span className="rfm-dist-label">{getSegmentLabel(segment)}</span>
                  <span className="rfm-dist-count">{count}</span>
                </div>
                <div className="rfm-dist-bar-container">
                  <div 
                    className="rfm-dist-bar" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="rfm-dist-percentage">{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
        <div className="rfm-summary">
          <div className="rfm-summary-item highlight-positive">
            <span className="rfm-summary-value">{rfmDistribution.CHAMPION}</span>
            <span className="rfm-summary-label">Champions</span>
          </div>
          <div className="rfm-summary-item highlight-warning">
            <span className="rfm-summary-value">{rfmDistribution.AT_RISK}</span>
            <span className="rfm-summary-label">At Risk</span>
          </div>
          <div className="rfm-summary-item">
            <span className="rfm-summary-value">{rfmScores.length}</span>
            <span className="rfm-summary-label">Total Scored</span>
          </div>
        </div>
      </div>

      {/* Quick Actions based on role */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          {can(currentUser, 'search_customer') && (
            <a href="/customers" className="quick-action-btn">
              <Users size={20} />
              <span>Search Customers</span>
            </a>
          )}
          {can(currentUser, 'view_case') && (
            <a href="/cases" className="quick-action-btn">
              <FileText size={20} />
              <span>View Cases</span>
            </a>
          )}
          {can(currentUser, 'view_lead') && (
            <a href="/sales" className="quick-action-btn">
              <TrendingUp size={20} />
              <span>Manage Leads</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
