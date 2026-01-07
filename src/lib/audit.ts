// ==========================================
// Audit Logging Service
// ==========================================

import { v4 as uuidv4 } from 'uuid';
import type { AuditEvent, AuditLog, User } from '../types';

// Simulated IP for demo
const DEMO_IP = '192.168.1.100';

/**
 * Create an audit log entry
 */
export function createAuditLog(
  user: User,
  event: AuditEvent,
  entityType: AuditLog['entity_type'],
  entityId: string | null,
  details: Record<string, unknown> = {}
): AuditLog {
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    event,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: DEMO_IP,
  };
}

/**
 * Format audit event for display
 */
export function formatAuditEvent(event: AuditEvent): string {
  const labels: Record<AuditEvent, string> = {
    SEARCH_CUSTOMER: 'Pencarian Nasabah',
    VIEW_PROFILE: 'Lihat Profil Nasabah',
    CREATE_CASE: 'Buat Case',
    UPDATE_CASE: 'Update Case',
    ASSIGN_CASE: 'Assign Case',
    FINAL_RESPONSE: 'Final Response',
    CLOSE_CASE: 'Tutup Case',
    CHANGE_CONSENT: 'Ubah Consent',
    EXPORT_DATA: 'Export Data',
    CHANGE_RBAC: 'Ubah Role/Permission',
    CHANGE_WORKFLOW: 'Ubah Workflow',
    CREATE_SEGMENT: 'Buat Segment',
    CREATE_CAMPAIGN: 'Buat Campaign',
    EXECUTE_CAMPAIGN: 'Execute Campaign',
    CREATE_LEAD: 'Buat Lead',
    UPDATE_LEAD: 'Update Lead',
    CREATE_RM_ACTIVITY: 'Buat RM Activity',
    LOGIN: 'Login',
    ROLE_SWITCH: 'Ganti Role (Demo)',
  };
  return labels[event] || event;
}

/**
 * Format entity type for display
 */
export function formatEntityType(type: AuditLog['entity_type']): string {
  const labels: Record<AuditLog['entity_type'], string> = {
    CUSTOMER: 'Nasabah',
    CASE: 'Case',
    CAMPAIGN: 'Campaign',
    SEGMENT: 'Segment',
    LEAD: 'Lead',
    USER: 'User',
    SYSTEM: 'System',
  };
  return labels[type] || type;
}

// Export for CSV
export function auditLogsToCSV(logs: AuditLog[]): string {
  const headers = [
    'Timestamp',
    'User ID',
    'User Name',
    'Role',
    'Event',
    'Entity Type',
    'Entity ID',
    'Details',
    'IP Address',
  ];

  const rows = logs.map(log => [
    log.timestamp,
    log.user_id,
    log.user_name,
    log.user_role,
    log.event,
    log.entity_type,
    log.entity_id || '',
    JSON.stringify(log.details),
    log.ip_address,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}
