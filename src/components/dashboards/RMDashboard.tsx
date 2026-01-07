// ==========================================
// RM Dashboard - Portfolio & Pipeline
// ==========================================

import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Star,
  Phone,
  Calendar,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { filterCustomersByScope, filterLeadsByScope } from '../../lib/policy';
import { getSegmentLabel, getSegmentColor, type RFMSegment } from '../../lib/rfm';
import { getActionIcon } from '../../lib/nba';

export function RMDashboard() {
  const { 
    currentUser, 
    customers, 
    leads, 
    rmActivities,
    rfmScores,
    customerAssignments,
    nbaRecommendations
  } = useAppStore();

  if (!currentUser) return null;

  // Filter by portfolio
  const myCustomers = filterCustomersByScope(currentUser, customers, customerAssignments);
  const myLeads = filterLeadsByScope(currentUser, leads);
  
  // RFM Distribution for portfolio
  const myRFMScores = rfmScores.filter(r => 
    myCustomers.some(c => c.id === r.customer_id)
  );
  
  const rfmDist: Record<RFMSegment, number> = {
    CHAMPION: myRFMScores.filter(r => r.segment === 'CHAMPION').length,
    LOYAL: myRFMScores.filter(r => r.segment === 'LOYAL').length,
    POTENTIAL: myRFMScores.filter(r => r.segment === 'POTENTIAL').length,
    AT_RISK: myRFMScores.filter(r => r.segment === 'AT_RISK').length,
    HIBERNATING: myRFMScores.filter(r => r.segment === 'HIBERNATING').length,
    LOST: myRFMScores.filter(r => r.segment === 'LOST').length,
  };
  
  const atRiskCustomers = rfmDist.AT_RISK + rfmDist.HIBERNATING + rfmDist.LOST;

  // Lead stats
  const leadStats = {
    new: myLeads.filter(l => l.status === 'NEW').length,
    contacted: myLeads.filter(l => l.status === 'CONTACTED').length,
    qualified: myLeads.filter(l => l.status === 'QUALIFIED').length,
    proposal: myLeads.filter(l => l.status === 'PROPOSAL').length,
  };

  // My activities today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivities = rmActivities.filter(a => 
    a.rm_id === currentUser.id && 
    new Date(a.created_at) >= today
  ).length;

  // Pending NBA for my customers
  const myNBAs = nbaRecommendations.filter(n => 
    myCustomers.some(c => c.id === n.customer_id) && 
    n.status === 'PENDING'
  );

  // Top customers to contact (at-risk with high potential)
  const topToContact = myRFMScores
    .filter(r => r.segment === 'AT_RISK' || r.segment === 'HIBERNATING')
    .slice(0, 5)
    .map(r => ({
      ...r,
      customer: myCustomers.find(c => c.id === r.customer_id),
    }));

  return (
    <div className="role-dashboard rm-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Portfolio & Pipeline</h1>
          <p className="page-subtitle">
            {myCustomers.length} customers in your portfolio
          </p>
        </div>
      </header>

      {/* Portfolio Health */}
      <div className="dashboard-section">
        <h2>Portfolio Health</h2>
        <div className="kpi-grid kpi-grid-4">
          <div className="kpi-card kpi-primary">
            <div className="kpi-icon">
              <Users size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{myCustomers.length}</span>
              <span className="kpi-label">Total Customers</span>
            </div>
          </div>

          <div className="kpi-card kpi-success">
            <div className="kpi-icon">
              <Star size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{rfmDist.CHAMPION + rfmDist.LOYAL}</span>
              <span className="kpi-label">Champions + Loyal</span>
            </div>
          </div>

          <div className="kpi-card kpi-warning">
            <div className="kpi-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{atRiskCustomers}</span>
              <span className="kpi-label">At Risk</span>
            </div>
          </div>

          <div className="kpi-card kpi-info">
            <div className="kpi-icon">
              <Calendar size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{todayActivities}</span>
              <span className="kpi-label">Activities Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* RFM Distribution Mini */}
      <div className="dashboard-section">
        <h2>Customer Segments</h2>
        <div className="rfm-mini-grid">
          {(Object.entries(rfmDist) as [RFMSegment, number][]).map(([segment, count]) => (
            <div 
              key={segment} 
              className="rfm-mini-card"
              style={{ borderLeftColor: getSegmentColor(segment) }}
            >
              <span className="rfm-mini-count" style={{ color: getSegmentColor(segment) }}>
                {count}
              </span>
              <span className="rfm-mini-label">{getSegmentLabel(segment)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Leads Pipeline */}
        <div className="dashboard-section">
          <h2>
            <TrendingUp size={18} />
            Leads Pipeline
          </h2>
          <div className="pipeline-funnel">
            <div className="pipeline-stage">
              <span className="stage-name">New</span>
              <div className="stage-bar stage-new" style={{ width: `${leadStats.new * 20}%` }}>
                {leadStats.new}
              </div>
            </div>
            <div className="pipeline-stage">
              <span className="stage-name">Contacted</span>
              <div className="stage-bar stage-contacted" style={{ width: `${leadStats.contacted * 20}%` }}>
                {leadStats.contacted}
              </div>
            </div>
            <div className="pipeline-stage">
              <span className="stage-name">Qualified</span>
              <div className="stage-bar stage-qualified" style={{ width: `${leadStats.qualified * 20}%` }}>
                {leadStats.qualified}
              </div>
            </div>
            <div className="pipeline-stage">
              <span className="stage-name">Proposal</span>
              <div className="stage-bar stage-proposal" style={{ width: `${leadStats.proposal * 20}%` }}>
                {leadStats.proposal}
              </div>
            </div>
          </div>
          <Link to="/sales" className="btn btn-secondary btn-sm">
            View All Leads
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* NBA Recommendations */}
        <div className="dashboard-section">
          <h2>
            <Zap size={18} />
            Recommended Actions ({myNBAs.length})
          </h2>
          <div className="nba-mini-list">
            {myNBAs.slice(0, 4).map(nba => {
              const customer = myCustomers.find(c => c.id === nba.customer_id);
              return (
                <Link 
                  key={nba.id} 
                  to={`/customers/${nba.customer_id}`}
                  className="nba-mini-item"
                >
                  <span className="nba-mini-icon">{getActionIcon(nba.action_type)}</span>
                  <div className="nba-mini-content">
                    <span className="nba-mini-customer">{customer?.name}</span>
                    <span className="nba-mini-action">{nba.title}</span>
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              );
            })}
            {myNBAs.length === 0 && (
              <div className="empty-nba">No pending recommendations</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Customers to Contact */}
      {topToContact.length > 0 && (
        <div className="dashboard-section">
          <h2>
            <Phone size={18} />
            Priority Contacts (At-Risk Customers)
          </h2>
          <div className="contact-list">
            {topToContact.map(item => (
              <Link 
                key={item.customer_id} 
                to={`/customers/${item.customer_id}`}
                className="contact-item"
              >
                <div className="contact-info">
                  <span className="contact-name">{item.customer?.name}</span>
                  <span 
                    className="contact-segment" 
                    style={{ color: getSegmentColor(item.segment) }}
                  >
                    {getSegmentLabel(item.segment)}
                  </span>
                </div>
                <span className="contact-reason">{item.segment_reason}</span>
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
