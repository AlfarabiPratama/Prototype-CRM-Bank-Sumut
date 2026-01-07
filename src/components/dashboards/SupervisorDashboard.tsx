// ==========================================
// Supervisor Dashboard - Queue & SLA Control Tower
// ==========================================

import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { filterCasesByScope } from '../../lib/policy';
import { getSLAStatus } from '../../lib/sla';
import { analyzeRecoveryStatus } from '../../lib/recovery';

export function SupervisorDashboard() {
  const { currentUser, cases, users, nbaRecommendations } = useAppStore();

  if (!currentUser) return null;

  // Filter cases by branch scope
  const branchCases = filterCasesByScope(currentUser, cases);
  const openCases = branchCases.filter(c => c.status !== 'CLOSED');
  
  // SLA Analysis
  const slaBreached = openCases.filter(c => getSLAStatus(c.sla) === 'BREACHED');
  const slaAtRisk = openCases.filter(c => getSLAStatus(c.sla) === 'WARNING');
  const slaOnTrack = openCases.filter(c => getSLAStatus(c.sla) === 'OK');

  // Backlog Aging
  const now = new Date();
  const getAgeDays = (createdAt: string) => {
    const created = new Date(createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const aging = {
    day0to1: openCases.filter(c => getAgeDays(c.created_at) <= 1).length,
    day2to3: openCases.filter(c => {
      const age = getAgeDays(c.created_at);
      return age >= 2 && age <= 3;
    }).length,
    dayOver3: openCases.filter(c => getAgeDays(c.created_at) > 3).length,
  };

  // Workload per Agent
  const branchAgents = users.filter(u => 
    (u.role === 'AGENT' || u.role === 'SUPERVISOR') && 
    u.branch_id === currentUser.branch_id
  );

  const agentWorkload = branchAgents.map(agent => {
    const agentCases = openCases.filter(c => c.assigned_to === agent.id);
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      open: agentCases.length,
      atRisk: agentCases.filter(c => getSLAStatus(c.sla) === 'WARNING').length,
      breached: agentCases.filter(c => getSLAStatus(c.sla) === 'BREACHED').length,
    };
  });

  // Top Issues by Category
  const categoryCount: Record<string, number> = {};
  openCases.forEach(c => {
    categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Auto-escalation count
  const autoEscalated = openCases.filter(c => {
    const status = analyzeRecoveryStatus(c);
    return status.auto_escalated;
  }).length;

  // NBA Pending
  const pendingNBA = nbaRecommendations.filter(n => n.status === 'PENDING').length;

  return (
    <div className="role-dashboard supervisor-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Queue & SLA Control Tower</h1>
          <p className="page-subtitle">
            Branch: {currentUser.branch_id} • Real-time SLA monitoring
          </p>
        </div>
      </header>

      {/* SLA Status Cards */}
      <div className="dashboard-section">
        <h2>SLA Status</h2>
        <div className="kpi-grid kpi-grid-4">
          <Link to="/cases?sla=breached" className="kpi-card kpi-danger">
            <div className="kpi-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{slaBreached.length}</span>
              <span className="kpi-label">SLA Breached</span>
            </div>
            <ArrowUpRight size={16} className="kpi-arrow" />
          </Link>

          <Link to="/cases?sla=warning" className="kpi-card kpi-warning">
            <div className="kpi-icon">
              <Clock size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{slaAtRisk.length}</span>
              <span className="kpi-label">At Risk (≤25%)</span>
            </div>
            <ArrowUpRight size={16} className="kpi-arrow" />
          </Link>

          <Link to="/cases?sla=ok" className="kpi-card kpi-success">
            <div className="kpi-icon">
              <CheckCircle size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{slaOnTrack.length}</span>
              <span className="kpi-label">On Track</span>
            </div>
            <ArrowUpRight size={16} className="kpi-arrow" />
          </Link>

          <div className="kpi-card kpi-info">
            <div className="kpi-icon">
              <Zap size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{autoEscalated}</span>
              <span className="kpi-label">Auto-Escalated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backlog Aging */}
      <div className="dashboard-section">
        <h2>Backlog Aging</h2>
        <div className="kpi-grid kpi-grid-3">
          <div className="kpi-card">
            <div className="kpi-content">
              <span className="kpi-value">{aging.day0to1}</span>
              <span className="kpi-label">0-1 Days</span>
            </div>
            <div className="aging-bar aging-fresh" style={{ width: `${(aging.day0to1 / openCases.length) * 100 || 0}%` }} />
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <span className="kpi-value">{aging.day2to3}</span>
              <span className="kpi-label">2-3 Days</span>
            </div>
            <div className="aging-bar aging-moderate" style={{ width: `${(aging.day2to3 / openCases.length) * 100 || 0}%` }} />
          </div>
          <div className="kpi-card">
            <div className="kpi-content">
              <span className="kpi-value">{aging.dayOver3}</span>
              <span className="kpi-label">&gt;3 Days</span>
            </div>
            <div className="aging-bar aging-stale" style={{ width: `${(aging.dayOver3 / openCases.length) * 100 || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Workload per Agent */}
        <div className="dashboard-section">
          <h2>
            <Users size={18} />
            Agent Workload
          </h2>
          <div className="workload-table">
            <div className="workload-header">
              <span>Agent</span>
              <span>Open</span>
              <span>At Risk</span>
              <span>Breached</span>
            </div>
            {agentWorkload.map(agent => (
              <div key={agent.id} className="workload-row">
                <span className="agent-name">
                  {agent.name}
                  <span className="agent-role-badge">{agent.role}</span>
                </span>
                <span className="workload-count">{agent.open}</span>
                <span className="workload-count workload-warning">{agent.atRisk}</span>
                <span className="workload-count workload-danger">{agent.breached}</span>
              </div>
            ))}
            {agentWorkload.length === 0 && (
              <div className="workload-empty">No agents in this branch</div>
            )}
          </div>
        </div>

        {/* Top Issues */}
        <div className="dashboard-section">
          <h2>
            <TrendingUp size={18} />
            Top Issues
          </h2>
          <div className="issues-list">
            {topCategories.map(([category, count], index) => (
              <Link 
                key={category} 
                to={`/cases?category=${category}`}
                className="issue-item"
              >
                <span className="issue-rank">#{index + 1}</span>
                <span className="issue-category">{category.replace('_', ' ')}</span>
                <span className="issue-count">{count} cases</span>
              </Link>
            ))}
            {topCategories.length === 0 && (
              <div className="issues-empty">No open cases</div>
            )}
          </div>
        </div>
      </div>

      {/* NBA Pending */}
      {pendingNBA > 0 && (
        <div className="dashboard-section">
          <div className="nba-pending-alert">
            <Zap size={20} />
            <span>{pendingNBA} NBA recommendations pending review</span>
            <Link to="/customers" className="btn btn-sm btn-primary">
              Review
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
