// ==========================================
// Admin Page - Demo Configuration
// ==========================================

import { useState } from 'react';
import { 
  Settings, 
  Users, 
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { can } from '../lib/policy';
import type { Role } from '../types';

const ROLES: Role[] = ['DIRECTOR', 'SUPERVISOR', 'AGENT', 'RM', 'MARKETING', 'COMPLIANCE', 'ADMIN'];

export function AdminPage() {
  const { currentUser, users, branches, addAuditLog } = useAppStore();
  const [success, setSuccess] = useState<string | null>(null);

  if (!currentUser || !can(currentUser, 'change_rbac')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to access admin settings.</p>
        </div>
      </div>
    );
  }

  const handleResetDemo = () => {
    // In a real app, this would reset all data to initial state
    addAuditLog('CHANGE_WORKFLOW', 'SYSTEM', null, { action: 'RESET_DEMO' });
    setSuccess('Demo data would be reset (simulated).');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="page admin-page">
      <header className="page-header">
        <div>
          <h1>Admin</h1>
          <p className="page-subtitle">Demo configuration and user management</p>
        </div>
      </header>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="admin-grid">
        {/* Users Overview */}
        <div className="admin-card">
          <div className="admin-card-header">
            <Users size={20} />
            <span>Demo Users</span>
          </div>
          <div className="admin-card-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const branch = branches.find(b => b.id === user.branch_id);
                  return (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>
                        <span className={`admin-role role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{branch?.code || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Permissions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <Shield size={20} />
            <span>Role Permissions</span>
          </div>
          <div className="admin-card-body">
            <div className="role-permissions-list">
              {ROLES.map(role => (
                <div key={role} className="role-permission-item">
                  <span className={`admin-role role-${role.toLowerCase()}`}>{role}</span>
                  <span className="role-description">
                    {role === 'DIRECTOR' && 'Dashboard only, no individual customer access'}
                    {role === 'SUPERVISOR' && 'Full branch access, can assign cases'}
                    {role === 'AGENT' && 'Branch customers & cases, limited case close'}
                    {role === 'RM' && 'Portfolio customers, leads, activities'}
                    {role === 'MARKETING' && 'Segments & campaigns, no consent edit'}
                    {role === 'COMPLIANCE' && 'Audit logs, view customers for investigation'}
                    {role === 'ADMIN' && 'Full access including RBAC changes'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <Settings size={20} />
            <span>Demo Actions</span>
          </div>
          <div className="admin-card-body">
            <p className="admin-hint">
              Use these actions to reset or modify the demo environment.
            </p>
            <div className="admin-actions">
              <button className="btn btn-secondary" onClick={handleResetDemo}>
                <RefreshCw size={16} />
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* Branches */}
        <div className="admin-card admin-card-wide">
          <div className="admin-card-header">
            <Settings size={20} />
            <span>Branches ({branches.length})</span>
          </div>
          <div className="admin-card-body">
            {/* Branch Category Tabs */}
            <div className="branch-categories">
              {/* Head Office & Coordinator */}
              {branches.some(b => b.type === 'HEAD_OFFICE' || b.type === 'COORDINATOR') && (
                <div className="branch-category">
                  <div className="branch-category-header">
                    <span className="branch-type-badge type-hq">Kantor Pusat & Koordinator</span>
                    <span className="branch-count">
                      {branches.filter(b => b.type === 'HEAD_OFFICE' || b.type === 'COORDINATOR').length}
                    </span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => b.type === 'HEAD_OFFICE' || b.type === 'COORDINATOR')
                        .map(branch => (
                          <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.code}</td>
                            <td>{branch.city || '-'}</td>
                            <td>
                              <span className={`branch-type-badge type-${branch.type?.toLowerCase()}`}>
                                {branch.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Kantor Cabang Konvensional */}
              {branches.some(b => b.type === 'BRANCH') && (
                <div className="branch-category">
                  <div className="branch-category-header">
                    <span className="branch-type-badge type-branch">Kantor Cabang Konvensional</span>
                    <span className="branch-count">
                      {branches.filter(b => b.type === 'BRANCH').length}
                    </span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => b.type === 'BRANCH')
                        .map(branch => (
                          <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.code}</td>
                            <td>{branch.city || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Kantor Cabang Syariah */}
              {branches.some(b => b.type === 'BRANCH_SYARIAH') && (
                <div className="branch-category">
                  <div className="branch-category-header">
                    <span className="branch-type-badge type-syariah">Kantor Cabang Syariah</span>
                    <span className="branch-count">
                      {branches.filter(b => b.type === 'BRANCH_SYARIAH').length}
                    </span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => b.type === 'BRANCH_SYARIAH')
                        .map(branch => (
                          <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.code}</td>
                            <td>{branch.city || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Kantor Cabang Pembantu Konvensional (currently none in seed, but ready for future) */}
              {branches.some(b => b.type === 'SUB_BRANCH') && (
                <div className="branch-category">
                  <div className="branch-category-header">
                    <span className="branch-type-badge type-sub">KC Pembantu Konvensional</span>
                    <span className="branch-count">
                      {branches.filter(b => b.type === 'SUB_BRANCH').length}
                    </span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => b.type === 'SUB_BRANCH')
                        .map(branch => (
                          <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.code}</td>
                            <td>{branch.city || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Kantor Cabang Pembantu Syariah (currently none in seed, but ready for future) */}
              {branches.some(b => b.type === 'SUB_BRANCH_SYARIAH') && (
                <div className="branch-category">
                  <div className="branch-category-header">
                    <span className="branch-type-badge type-sub-syariah">KC Pembantu Syariah</span>
                    <span className="branch-count">
                      {branches.filter(b => b.type === 'SUB_BRANCH_SYARIAH').length}
                    </span>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>City</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => b.type === 'SUB_BRANCH_SYARIAH')
                        .map(branch => (
                          <tr key={branch.id}>
                            <td>{branch.name}</td>
                            <td>{branch.code}</td>
                            <td>{branch.city || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
