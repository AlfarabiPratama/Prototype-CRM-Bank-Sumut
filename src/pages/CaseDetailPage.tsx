// ==========================================
// Case Detail Page - 2-Column Layout
// ==========================================
// Redesigned following Zendesk/Salesforce patterns:
// - Left: Case info, customer, recovery panel
// - Right: Activity feed + Response Composer

import { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterCasesByScope, can, canCloseCase } from '../lib/policy';
import { getSLAStatus, formatSLARemaining } from '../lib/sla';
import { 
  analyzeRecoveryStatus, 
  getRecoveryActionIcon, 
  getRiskLevelColor, 
  getRiskLevelLabel,
  getNextPriority 
} from '../lib/recovery';
import { ResponseComposer } from '../components/ResponseComposer';
import { StatusBadge } from '../components/StatusBadge';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCloseGuardrail, setShowCloseGuardrail] = useState(false);

  const { 
    currentUser, 
    cases, 
    customers, 
    users,
    branches,
    setFinalResponse: saveFinalResponse,
    closeCase,
    assignCase,
    updateCase,
  } = useAppStore();

  // Find case
  const scopedCases = filterCasesByScope(currentUser, cases);
  const caseData = scopedCases.find(c => c.id === id);
  const customer = caseData ? customers.find(c => c.id === caseData.customer_id) : null;
  const assignee = caseData?.assigned_to ? users.find(u => u.id === caseData.assigned_to) : null;
  const branch = caseData ? branches.find(b => b.id === caseData.branch_id) : null;
  const creator = caseData ? users.find(u => u.id === caseData.created_by) : null;

  // Agents in same branch for assignment
  const branchAgents = users.filter(u => 
    (u.role === 'AGENT' || u.role === 'SUPERVISOR') && 
    u.branch_id === caseData?.branch_id
  );

  // Back navigation - preserve view state
  const fromView = searchParams.get('from') || 'my_queue';

  if (!currentUser) {
    return <div className="page-empty">Silakan login terlebih dahulu</div>;
  }

  if (!caseData) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Case Tidak Ditemukan</h2>
          <p>Case ini tidak ada atau Anda tidak memiliki akses.</p>
          <Link to="/cases" className="btn btn-primary">
            <ArrowLeft size={18} />
            Kembali ke Cases
          </Link>
        </div>
      </div>
    );
  }

  const _slaStatus = getSLAStatus(caseData.sla); // Used for future SLA display
  const canAssign = can(currentUser, 'assign_case') && currentUser.role === 'SUPERVISOR';
  const canProvideFinalResponse = can(currentUser, 'final_response', { priority: caseData.priority });
  const canClose = can(currentUser, 'close_case', { priority: caseData.priority });
  const closeCheck = canCloseCase(caseData);

  // Handlers
  const handleSendPublicResponse = (content: string) => {
    saveFinalResponse(caseData.id, content);
    setSuccess('Tanggapan berhasil disimpan.');
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveInternalNote = (_content: string) => {
    // For PoC, just show success - in real app would save to activity log
    setSuccess('Catatan internal berhasil disimpan.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCloseWithResponse = (finalResponse: string) => {
    if (!finalResponse.trim()) {
      setShowCloseGuardrail(true);
      return;
    }
    saveFinalResponse(caseData.id, finalResponse);
    const result = closeCase(caseData.id);
    if (!result.success) {
      setError(result.error || 'Gagal menutup case.');
    } else {
      setSuccess('Case berhasil ditutup.');
      setError(null);
    }
  };

  const handleCloseCase = () => {
    if (!closeCheck.allowed) {
      setShowCloseGuardrail(true);
      return;
    }
    const result = closeCase(caseData.id);
    if (!result.success) {
      setError(result.error || 'Gagal menutup case.');
    } else {
      setSuccess('Case berhasil ditutup.');
      setError(null);
    }
  };

  const handleAssign = (userId: string) => {
    assignCase(caseData.id, userId);
    setShowAssignModal(false);
    setSuccess('Case berhasil di-assign.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleEscalate = () => {
    updateCase(caseData.id, { status: 'ESCALATED' });
    setSuccess('Case berhasil di-eskalasi ke Supervisor.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleTakeCase = () => {
    assignCase(caseData.id, currentUser.id);
    setSuccess('Case berhasil diambil.');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Recovery status
  const recoveryStatus = caseData.status !== 'CLOSED' ? analyzeRecoveryStatus(caseData) : null;

  return (
    <div className="page case-detail-page-v2">
      {/* Header */}
      <header className="case-detail-header-v2">
        <div className="header-left">
          <button 
            className="back-btn" 
            onClick={() => navigate(`/cases?view=${fromView}`)}
            title="Kembali ke daftar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="case-header-badges">
              <span className="case-number-v2">{caseData.case_number}</span>
              <StatusBadge status={caseData.status} size="md" />
              <StatusBadge status={caseData.priority} size="md" />
            </div>
            <h1 className="case-subject-v2">{caseData.subject}</h1>
          </div>
        </div>
        <div className="header-right">
          {caseData.sla?.due_at && caseData.status !== 'CLOSED' && (
            <div className="sla-countdown">
              <Clock size={16} />
              <span>{formatSLARemaining(caseData.sla)}</span>
            </div>
          )}
          <div className="header-actions">
            {caseData.status !== 'CLOSED' && (
              <>
                {!caseData.assigned_to && currentUser.role === 'AGENT' && (
                  <button className="btn btn-secondary" onClick={handleTakeCase}>
                    <User size={16} /> Ambil Case
                  </button>
                )}
                {canAssign && caseData.status !== 'ESCALATED' && (
                  <button className="btn btn-secondary" onClick={handleEscalate}>
                    <ArrowUpRight size={16} /> Eskalasi
                  </button>
                )}
                {canClose && (
                  <button 
                    className="btn btn-primary"
                    onClick={handleCloseCase}
                    disabled={!closeCheck.allowed}
                    title={closeCheck.reason || ''}
                  >
                    <CheckCircle size={16} /> Tutup Case
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <XCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="case-detail-grid">
        {/* Left Column - Info */}
        <div className="case-detail-left">
          {/* Case Info Card */}
          <div className="case-info-card-v2">
            <div className="info-card-header-v2">Informasi Case</div>
            <div className="info-card-body-v2">
              <div className="info-row-v2">
                <span className="info-label-v2">Kategori</span>
                <span className="info-value-v2">{caseData.category.replace(/_/g, ' ')}</span>
              </div>
              <div className="info-row-v2">
                <span className="info-label-v2">Cabang</span>
                <span className="info-value-v2">{branch?.name || caseData.branch_id}</span>
              </div>
              <div className="info-row-v2">
                <span className="info-label-v2">Dibuat</span>
                <span className="info-value-v2">
                  {new Date(caseData.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="info-row-v2">
                <span className="info-label-v2">Oleh</span>
                <span className="info-value-v2">{creator?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="case-info-card-v2">
            <div className="info-card-header-v2">Nasabah</div>
            <div className="info-card-body-v2">
              {customer ? (
                <Link to={`/customers/${customer.id}`} className="customer-link-v2">
                  <div className="customer-avatar-v2"><User size={24} /></div>
                  <div>
                    <div className="customer-name-v2">{customer.name}</div>
                    <div className="customer-cif-v2">{customer.cif}</div>
                  </div>
                </Link>
              ) : (
                <span>Nasabah tidak ditemukan</span>
              )}
            </div>
          </div>

          {/* Assignment Card */}
          <div className="case-info-card-v2">
            <div className="info-card-header-v2">Penugasan</div>
            <div className="info-card-body-v2">
              {assignee ? (
                <div className="assignee-info-v2">
                  <div className="assignee-avatar-v2"><User size={20} /></div>
                  <div>
                    <div className="assignee-name-v2">{assignee.name}</div>
                    <div className="assignee-role-v2">{assignee.role}</div>
                  </div>
                </div>
              ) : (
                <div className="unassigned-v2">
                  <AlertCircle size={20} />
                  <span>Belum ditugaskan</span>
                </div>
              )}
              {canAssign && caseData.status !== 'CLOSED' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAssignModal(true)}
                  style={{ marginTop: 'var(--spacing-sm)' }}
                >
                  <UserPlus size={16} />
                  {assignee ? 'Reassign' : 'Assign'}
                </button>
              )}
            </div>
          </div>

          {/* Recovery Panel */}
          {recoveryStatus && (recoveryStatus.risk_level !== 'LOW' || recoveryStatus.auto_escalated) && (
            <div className="case-info-card-v2 recovery-card">
              <div className="info-card-header-v2" style={{ color: getRiskLevelColor(recoveryStatus.risk_level) }}>
                <AlertTriangle size={16} /> Service Recovery
                <span 
                  className="risk-badge-v2"
                  style={{ 
                    background: `${getRiskLevelColor(recoveryStatus.risk_level)}15`,
                    color: getRiskLevelColor(recoveryStatus.risk_level) 
                  }}
                >
                  {getRiskLevelLabel(recoveryStatus.risk_level)}
                </span>
              </div>
              <div className="info-card-body-v2">
                {recoveryStatus.auto_escalated && (
                  <div className="recovery-warning">
                    <AlertCircle size={14} />
                    Auto-escalation aktif karena SLA breach
                  </div>
                )}
                {recoveryStatus.suggested_actions.slice(0, 2).map(action => (
                  <div key={action.id} className="recovery-action-mini">
                    <span className="recovery-action-icon-mini">{getRecoveryActionIcon(action.type)}</span>
                    <span className="recovery-action-label-mini">{action.label}</span>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        if (action.type === 'ESCALATE_TO_SUPERVISOR') handleEscalate();
                        else if (action.type === 'INCREASE_PRIORITY') {
                          updateCase(caseData.id, { priority: getNextPriority(caseData.priority) });
                          setSuccess('Prioritas dinaikkan');
                          setTimeout(() => setSuccess(null), 3000);
                        }
                      }}
                    >
                      <TrendingUp size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="case-info-card-v2">
            <div className="info-card-header-v2">Kronologi</div>
            <div className="info-card-body-v2">
              <p className="case-description-v2">{caseData.description}</p>
            </div>
          </div>

          {/* Closed Info */}
          {caseData.status === 'CLOSED' && caseData.closed_at && (
            <div className="case-info-card-v2 closed-card">
              <div className="closed-info-v2">
                <CheckCircle size={24} />
                <div>
                  <span className="closed-label-v2">Case Ditutup</span>
                  <span className="closed-date-v2">
                    {new Date(caseData.closed_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Activity + Composer */}
        <div className="case-detail-right">
          {/* Activity Feed */}
          <div className="activity-section">
            <h3>Aktivitas</h3>
            <div className="activity-feed">
              {/* Show final response if exists */}
              {caseData.final_response && (
                <div className="activity-feed-item">
                  <div className="activity-feed-time">
                    {new Date(caseData.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="activity-feed-content">
                    <div className="activity-feed-author">Tanggapan Final</div>
                    <div className="activity-feed-text">{caseData.final_response}</div>
                  </div>
                </div>
              )}
              {/* Case created activity */}
              <div className="activity-feed-item">
                <div className="activity-feed-time">
                  {new Date(caseData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="activity-feed-content">
                  <div className="activity-feed-author">{creator?.name || 'Sistem'}</div>
                  <div className="activity-feed-text">Case dibuat dengan subjek: {caseData.subject}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Composer */}
          {caseData.status !== 'CLOSED' && canProvideFinalResponse && (
            <ResponseComposer
              onSendPublic={handleSendPublicResponse}
              onSaveInternal={handleSaveInternalNote}
              onClose={handleCloseWithResponse}
              canClose={canClose && closeCheck.allowed}
              existingResponse={caseData.final_response || ''}
              disabled={false}
            />
          )}
        </div>
      </div>

      {/* Close Guardrail Modal */}
      {showCloseGuardrail && (
        <div className="modal-overlay" onClick={() => setShowCloseGuardrail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tidak Dapat Menutup Case</h3>
              <button className="modal-close" onClick={() => setShowCloseGuardrail(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="guardrail-content">
                <AlertCircle size={48} style={{ color: 'var(--color-warning)' }} />
                <p className="guardrail-message">
                  Case belum bisa ditutup. Mohon isi <strong>Tanggapan Akhir</strong> terlebih dahulu di kolom Response Composer.
                </p>
                <p className="guardrail-hint">
                  Tanggapan akhir akan dikirim ke nasabah sebagai resolusi case.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowCloseGuardrail(false)}>
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Case</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Pilih agent untuk case ini:</p>
              <div className="agent-list">
                {branchAgents.map(agent => (
                  <button
                    key={agent.id}
                    className={`agent-item ${agent.id === caseData.assigned_to ? 'current' : ''}`}
                    onClick={() => handleAssign(agent.id)}
                  >
                    <div className="agent-avatar"><User size={16} /></div>
                    <div className="agent-info">
                      <span className="agent-name">{agent.name}</span>
                      <span className="agent-role">{agent.role}</span>
                    </div>
                    {agent.id === caseData.assigned_to && (
                      <span className="current-badge">Saat ini</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
