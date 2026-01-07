// ==========================================
// Admin Dashboard - System & Data Ops Dashboard
// ==========================================

import { Link } from 'react-router-dom';
import { 
  Settings,
  Database,
  Users,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
  Server
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function AdminDashboard() {
  const { 
    users, 
    customers, 
    cases, 
    branches,
    auditLogs
  } = useAppStore();

  // System Stats (Mock - using static date for demo)
  const syncStatus = {
    lastSync: '2025-12-24T11:30:00Z', // Static for demo
    status: 'success' as 'success' | 'warning' | 'error',
    errorCount: 0,
  };

  // Data Quality Indicators (Mock/Simple)
  const customersWithEmail = customers.filter(c => c.email && c.email.includes('@')).length;
  const customersWithPhone = customers.filter(c => c.phone && c.phone.length >= 10).length;
  const dataQuality = {
    emailCoverage: Math.round((customersWithEmail / customers.length) * 100) || 0,
    phoneCoverage: Math.round((customersWithPhone / customers.length) * 100) || 0,
    duplicateCandidates: 0, // Mock
  };

  // RBAC Summary
  const roleDistribution = {
    DIRECTOR: users.filter(u => u.role === 'DIRECTOR').length,
    SUPERVISOR: users.filter(u => u.role === 'SUPERVISOR').length,
    AGENT: users.filter(u => u.role === 'AGENT').length,
    RM: users.filter(u => u.role === 'RM').length,
    MARKETING: users.filter(u => u.role === 'MARKETING').length,
    COMPLIANCE: users.filter(u => u.role === 'COMPLIANCE').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
  };

  // Recent config changes
  const configChanges = auditLogs.filter(l => 
    l.event === 'CHANGE_RBAC' || l.event === 'CHANGE_WORKFLOW'
  );

  // System Health (Mock)
  const systemHealth = {
    apiStatus: 'healthy' as 'healthy' | 'degraded' | 'down',
    dbStatus: 'healthy' as 'healthy' | 'degraded' | 'down',
    cacheStatus: 'healthy' as 'healthy' | 'degraded' | 'down',
  };

  return (
    <div className="role-dashboard admin-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>System & Data Operations</h1>
          <p className="page-subtitle">
            System health & data management
          </p>
        </div>
      </header>

      {/* System Health */}
      <div className="dashboard-section">
        <h2><Server size={18} /> System Health</h2>
        <div className="kpi-grid kpi-grid-4">
          <div className={`kpi-card kpi-${syncStatus.status === 'success' ? 'success' : 'danger'}`}>
            <div className="kpi-icon">
              <RefreshCw size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">
                {syncStatus.status === 'success' ? 'OK' : 'ERROR'}
              </span>
              <span className="kpi-label">Sync Status</span>
            </div>
          </div>

          <div className="kpi-card kpi-success">
            <div className="kpi-icon">
              <Activity size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{systemHealth.apiStatus}</span>
              <span className="kpi-label">API Status</span>
            </div>
          </div>

          <div className="kpi-card kpi-success">
            <div className="kpi-icon">
              <Database size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{systemHealth.dbStatus}</span>
              <span className="kpi-label">Database</span>
            </div>
          </div>

          <div className="kpi-card kpi-info">
            <div className="kpi-icon">
              <Settings size={24} />
            </div>
            <div className="kpi-content">
              <span className="kpi-value">{configChanges.length}</span>
              <span className="kpi-label">Config Changes</span>
            </div>
          </div>
        </div>

        <div className="sync-info">
          <span>Last sync: {new Date(syncStatus.lastSync).toLocaleString('id-ID')}</span>
          {syncStatus.errorCount > 0 && (
            <span className="sync-errors">{syncStatus.errorCount} errors</span>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Data Quality */}
        <div className="dashboard-section">
          <h2><Database size={18} /> Data Quality</h2>
          <div className="data-quality-metrics">
            <div className="quality-metric">
              <div className="quality-metric-header">
                <span>Email Coverage</span>
                <span className={dataQuality.emailCoverage >= 90 ? 'success' : 'warning'}>
                  {dataQuality.emailCoverage}%
                </span>
              </div>
              <div className="quality-bar-container">
                <div 
                  className="quality-bar"
                  style={{ width: `${dataQuality.emailCoverage}%` }}
                />
              </div>
            </div>
            <div className="quality-metric">
              <div className="quality-metric-header">
                <span>Phone Coverage</span>
                <span className={dataQuality.phoneCoverage >= 90 ? 'success' : 'warning'}>
                  {dataQuality.phoneCoverage}%
                </span>
              </div>
              <div className="quality-bar-container">
                <div 
                  className="quality-bar"
                  style={{ width: `${dataQuality.phoneCoverage}%` }}
                />
              </div>
            </div>
            <div className="quality-stat">
              <AlertTriangle size={16} />
              <span>{dataQuality.duplicateCandidates} potential duplicates</span>
            </div>
          </div>
        </div>

        {/* User/Role Distribution */}
        <div className="dashboard-section">
          <h2><Users size={18} /> User Distribution</h2>
          <div className="role-distribution">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="role-row">
                <span className="role-name">{role}</span>
                <div className="role-bar-container">
                  <div 
                    className="role-bar"
                    style={{ width: `${(count / users.length) * 100}%` }}
                  />
                </div>
                <span className="role-count">{count}</span>
              </div>
            ))}
          </div>
          <div className="total-users">
            Total: {users.length} users
          </div>
        </div>
      </div>

      {/* Entity Counts */}
      <div className="dashboard-section">
        <h2><Shield size={18} /> Data Overview</h2>
        <div className="entity-grid">
          <div className="entity-card">
            <Users size={20} />
            <span className="entity-value">{customers.length}</span>
            <span className="entity-label">Customers</span>
          </div>
          <div className="entity-card">
            <Database size={20} />
            <span className="entity-value">{cases.length}</span>
            <span className="entity-label">Cases</span>
          </div>
          <div className="entity-card">
            <Settings size={20} />
            <span className="entity-value">{branches.length}</span>
            <span className="entity-label">Branches</span>
          </div>
          <div className="entity-card">
            <Activity size={20} />
            <span className="entity-value">{auditLogs.length}</span>
            <span className="entity-label">Audit Logs</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="admin-actions">
          <Link to="/admin" className="btn btn-primary">
            <Settings size={16} />
            System Settings
          </Link>
          <Link to="/audit" className="btn btn-secondary">
            <Activity size={16} />
            View Audit Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
