// ==========================================
// Audit Log Page
// ==========================================

import { useState, useMemo } from 'react';
import { 
  Download, 
  Filter, 
  ClipboardList,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterAuditLogsByScope, can } from '../lib/policy';
import { formatAuditEvent, formatEntityType, auditLogsToCSV } from '../lib/audit';
import type { AuditEvent } from '../types';

const AUDIT_EVENTS: AuditEvent[] = [
  'SEARCH_CUSTOMER',
  'VIEW_PROFILE',
  'CREATE_CASE',
  'UPDATE_CASE',
  'ASSIGN_CASE',
  'FINAL_RESPONSE',
  'CLOSE_CASE',
  'CHANGE_CONSENT',
  'EXPORT_DATA',
  'CHANGE_RBAC',
  'CHANGE_WORKFLOW',
  'CREATE_SEGMENT',
  'CREATE_CAMPAIGN',
  'EXECUTE_CAMPAIGN',
  'CREATE_LEAD',
  'UPDATE_LEAD',
  'CREATE_RM_ACTIVITY',
  'LOGIN',
  'ROLE_SWITCH',
];

export function AuditPage() {
  const { currentUser, auditLogs, addAuditLog } = useAppStore();
  const [eventFilter, setEventFilter] = useState<AuditEvent | 'ALL'>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [success, setSuccess] = useState<string | null>(null);

  // Filter logs by scope
  const scopedLogs = useMemo(() => {
    if (!currentUser) return [];
    return filterAuditLogsByScope(currentUser, auditLogs);
  }, [currentUser, auditLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    return scopedLogs.filter(log => {
      if (eventFilter !== 'ALL' && log.event !== eventFilter) return false;
      if (entityFilter !== 'ALL' && log.entity_type !== entityFilter) return false;
      return true;
    });
  }, [scopedLogs, eventFilter, entityFilter]);

  if (!currentUser || !can(currentUser, 'view_audit')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    // Create CSV and download
    const csv = auditLogsToCSV(filteredLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    // Log the export action
    addAuditLog('EXPORT_DATA', 'SYSTEM', null, {
      export_type: 'AUDIT_LOG',
      record_count: filteredLogs.length,
      filters: { event: eventFilter, entity: entityFilter }
    });

    setSuccess('Audit log exported successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const entityTypes = ['ALL', 'CUSTOMER', 'CASE', 'CAMPAIGN', 'SEGMENT', 'LEAD', 'USER', 'SYSTEM'];

  return (
    <div className="page audit-page">
      <header className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="page-subtitle">
            {filteredLogs.length} of {scopedLogs.length} records
          </p>
        </div>
        {can(currentUser, 'export_audit') && (
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
        )}
      </header>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <Filter size={16} />
          <select 
            value={eventFilter} 
            onChange={(e) => setEventFilter(e.target.value as AuditEvent | 'ALL')}
            className="filter-select"
          >
            <option value="ALL">All Events</option>
            {AUDIT_EVENTS.map(event => (
              <option key={event} value={event}>{formatAuditEvent(event)}</option>
            ))}
          </select>
          <select 
            value={entityFilter} 
            onChange={(e) => setEntityFilter(e.target.value)}
            className="filter-select"
          >
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'All Entities' : formatEntityType(type as 'CUSTOMER' | 'CASE' | 'CAMPAIGN' | 'SEGMENT' | 'LEAD' | 'USER' | 'SYSTEM')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      {filteredLogs.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No audit logs found</h3>
          <p>No logs match your current filters.</p>
        </div>
      ) : (
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Role</th>
                <th>Event</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="audit-timestamp">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td>
                    <div className="audit-user">
                      <span className="audit-user-name">{log.user_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`audit-role role-${log.user_role.toLowerCase()}`}>
                      {log.user_role}
                    </span>
                  </td>
                  <td>
                    <span className="audit-event">{formatAuditEvent(log.event)}</span>
                  </td>
                  <td>
                    <div className="audit-entity">
                      <span className="audit-entity-type">{formatEntityType(log.entity_type)}</span>
                      {log.entity_id && (
                        <span className="audit-entity-id">{log.entity_id.slice(0, 8)}...</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="audit-details" title={JSON.stringify(log.details, null, 2)}>
                      {Object.keys(log.details).length > 0 
                        ? JSON.stringify(log.details).slice(0, 50) + '...'
                        : '-'
                      }
                    </span>
                  </td>
                  <td className="audit-ip">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
