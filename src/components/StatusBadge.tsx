// ==========================================
// StatusBadge Component
// ==========================================
// Consistent status/priority badges for bank-grade look

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'sla';
  size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Case Status
  OPEN: { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e' },
  WAITING_CUSTOMER: { bg: '#f3e8ff', text: '#7c3aed' },
  CLOSED: { bg: '#dcfce7', text: '#166534' },
  
  // Priority
  LOW: { bg: '#e2e8f0', text: '#475569' },
  MEDIUM: { bg: '#fef3c7', text: '#92400e' },
  HIGH: { bg: '#fee2e2', text: '#991b1b' },
  
  // SLA
  OK: { bg: '#dcfce7', text: '#166534' },
  WARNING: { bg: '#fef3c7', text: '#92400e' },
  BREACHED: { bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_CUSTOMER: 'Menunggu Nasabah',
  CLOSED: 'Closed',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  OK: 'On Track',
  WARNING: '≤4 jam',
  BREACHED: 'Terlambat',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: '#e2e8f0', text: '#475569' };
  const label = STATUS_LABELS[status] || status;
  
  return (
    <span 
      className={`status-badge status-badge-${size}`}
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text,
      }}
    >
      {label}
    </span>
  );
}

// SLA Badge with countdown
interface SLABadgeProps {
  dueAt: string;
  size?: 'sm' | 'md';
}

export function SLABadge({ dueAt, size = 'sm' }: SLABadgeProps) {
  const now = new Date();
  const due = new Date(dueAt);
  const hoursRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let status: 'OK' | 'WARNING' | 'BREACHED';
  let timeText: string;
  
  if (hoursRemaining < 0) {
    status = 'BREACHED';
    const hoursOverdue = Math.abs(hoursRemaining);
    timeText = hoursOverdue < 24 
      ? `${Math.floor(hoursOverdue)} jam terlambat`
      : `${Math.floor(hoursOverdue / 24)} hari terlambat`;
  } else if (hoursRemaining <= 4) {
    status = 'WARNING';
    timeText = hoursRemaining < 1 
      ? `${Math.floor(hoursRemaining * 60)} menit`
      : `${Math.floor(hoursRemaining)} jam lagi`;
  } else {
    status = 'OK';
    timeText = due.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  const colors = STATUS_COLORS[status];
  
  return (
    <span 
      className={`sla-badge-compact sla-badge-${size}`}
      style={{ 
        backgroundColor: colors.bg, 
        color: colors.text,
      }}
      title={`Due: ${due.toLocaleString('id-ID')}`}
    >
      {timeText}
    </span>
  );
}
