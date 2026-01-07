// ==========================================
// Sales Page - Leads & RM Activities
// ==========================================

import { useState, useMemo } from 'react';
import { 
  Plus,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Flame
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterLeadsByScope, can } from '../lib/policy';
import { 
  scoreLeads, 
  getGradeColor, 
  getGradeIcon, 
  getGradeLabel,
  getScoreFactorLabel,
  type LeadScore 
} from '../lib/leadScoring';
import type { LeadStatus, RMActivityType } from '../types';

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
const ACTIVITY_TYPES: RMActivityType[] = ['CALL', 'VISIT', 'EMAIL', 'MEETING', 'NOTE'];

export function SalesPage() {
  const { 
    currentUser, 
    leads, 
    customers, 
    rmActivities,
    rfmScores,
    updateLeadStatus,
    createRMActivity,
  } = useAppStore();

  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: 'CALL' as RMActivityType,
    subject: '',
    notes: '',
  });
  const [success, setSuccess] = useState<string | null>(null);

  // Filter leads by scope
  const scopedLeads = useMemo(() => {
    if (!currentUser) return [];
    return filterLeadsByScope(currentUser, leads);
  }, [currentUser, leads]);

  // Calculate lead scores
  const leadScores = useMemo(() => {
    return scoreLeads(scopedLeads, rmActivities, customers, rfmScores);
  }, [scopedLeads, rmActivities, customers, rfmScores]);

  // Create a map for quick score lookup
  const scoreMap = useMemo(() => {
    const map = new Map<string, LeadScore>();
    leadScores.forEach(score => map.set(score.lead_id, score));
    return map;
  }, [leadScores]);

  // Group by status for board view (sorted by score within each status)
  const leadsByStatus = useMemo(() => {
    const groups: Record<LeadStatus, typeof scopedLeads> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL: [],
      WON: [],
      LOST: [],
    };
    scopedLeads.forEach(l => {
      groups[l.status].push(l);
    });
    // Sort each group by score descending
    Object.keys(groups).forEach(status => {
      groups[status as LeadStatus].sort((a, b) => {
        const scoreA = scoreMap.get(a.id)?.total_score || 0;
        const scoreB = scoreMap.get(b.id)?.total_score || 0;
        return scoreB - scoreA;
      });
    });
    return groups;
  }, [scopedLeads, scoreMap]);

  const selectedLeadData = selectedLead ? leads.find(l => l.id === selectedLead) : null;
  const selectedCustomer = selectedLeadData ? customers.find(c => c.id === selectedLeadData.customer_id) : null;
  const selectedLeadScore = selectedLead ? scoreMap.get(selectedLead) : null;
  const leadActivities = selectedLead 
    ? rmActivities.filter(a => a.lead_id === selectedLead) 
    : [];

  if (!currentUser || !can(currentUser, 'view_lead')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to view sales leads.</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus(leadId, newStatus);
    setSuccess('Lead status updated successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreateActivity = () => {
    if (!selectedLeadData || !activityForm.subject.trim()) return;

    createRMActivity({
      customer_id: selectedLeadData.customer_id,
      lead_id: selectedLead,
      type: activityForm.type,
      subject: activityForm.subject,
      notes: activityForm.notes,
    });

    setActivityForm({ type: 'CALL', subject: '', notes: '' });
    setShowActivityForm(false);
    setSuccess('Activity created successfully.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const getActivityIcon = (type: RMActivityType) => {
    switch (type) {
      case 'CALL': return Phone;
      case 'EMAIL': return Mail;
      case 'VISIT': case 'MEETING': return Calendar;
      default: return MessageSquare;
    }
  };

  return (
    <div className="page sales-page">
      <header className="page-header">
        <div>
          <h1>Sales</h1>
          <p className="page-subtitle">
            {scopedLeads.length} leads assigned to you
          </p>
        </div>
      </header>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="sales-layout">
        {/* Lead Board */}
        <div className="lead-board">
          {LEAD_STATUSES.filter(s => s !== 'WON' && s !== 'LOST').map(status => (
            <div key={status} className="lead-column">
              <div className="lead-column-header">
                <span className="lead-column-title">{status.replace('_', ' ')}</span>
                <span className="lead-column-count">{leadsByStatus[status].length}</span>
              </div>
              <div className="lead-column-body">
                {leadsByStatus[status].map(lead => {
                  const customer = customers.find(c => c.id === lead.customer_id);
                  const score = scoreMap.get(lead.id);
                  return (
                    <div 
                      key={lead.id} 
                      className={`lead-board-card ${selectedLead === lead.id ? 'selected' : ''}`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="lead-board-card-header">
                        <span className="lead-board-customer">{customer?.name}</span>
                        {score && (
                          <span 
                            className="lead-score-badge"
                            style={{ backgroundColor: getGradeColor(score.grade) }}
                            title={`Score: ${score.total_score}/100`}
                          >
                            {getGradeIcon(score.grade)} {score.total_score}
                          </span>
                        )}
                      </div>
                      <div className="lead-board-product">{lead.product_interest}</div>
                      <div className="lead-board-date">
                        {new Date(lead.updated_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  );
                })}
                {leadsByStatus[status].length === 0 && (
                  <div className="lead-column-empty">No leads</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lead Detail Panel */}
        {selectedLeadData && selectedCustomer && (
          <div className="lead-detail-panel">
            <div className="lead-detail-header">
              <div>
                <h3>{selectedCustomer.name}</h3>
                <span className="lead-detail-cif">{selectedCustomer.cif}</span>
              </div>
              {selectedLeadScore && (
                <div 
                  className="lead-score-display"
                  style={{ borderColor: getGradeColor(selectedLeadScore.grade) }}
                >
                  <span className="lead-score-icon">{getGradeIcon(selectedLeadScore.grade)}</span>
                  <span className="lead-score-value">{selectedLeadScore.total_score}</span>
                  <span 
                    className="lead-score-label"
                    style={{ color: getGradeColor(selectedLeadScore.grade) }}
                  >
                    {getGradeLabel(selectedLeadScore.grade)}
                  </span>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            {selectedLeadScore && (
              <div className="lead-score-breakdown">
                <h4><Flame size={14} /> Score Breakdown</h4>
                <div className="score-factors">
                  {(Object.entries(selectedLeadScore.breakdown) as [keyof typeof selectedLeadScore.breakdown, number][]).map(([factor, value]) => (
                    <div key={factor} className="score-factor">
                      <span className="score-factor-label">{getScoreFactorLabel(factor)}</span>
                      <div className="score-factor-bar">
                        <div 
                          className="score-factor-fill"
                          style={{ 
                            width: `${(value / 25) * 100}%`,
                            backgroundColor: value >= 20 ? '#10b981' : value >= 10 ? '#f59e0b' : '#6b7280'
                          }}
                        />
                      </div>
                      <span className="score-factor-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="lead-detail-section">
              <label>Product Interest</label>
              <p>{selectedLeadData.product_interest}</p>
            </div>

            <div className="lead-detail-section">
              <label>Status</label>
              <select 
                value={selectedLeadData.status}
                onChange={(e) => handleStatusChange(selectedLeadData.id, e.target.value as LeadStatus)}
                className="filter-select"
              >
                {LEAD_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="lead-detail-section">
              <label>Notes</label>
              <p>{selectedLeadData.notes || 'No notes'}</p>
            </div>

            {/* Activities */}
            <div className="lead-activities">
              <div className="lead-activities-header">
                <h4>Activities ({leadActivities.length})</h4>
                {can(currentUser, 'create_rm_activity') && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowActivityForm(!showActivityForm)}
                  >
                    <Plus size={14} />
                    Add Activity
                  </button>
                )}
              </div>

              {showActivityForm && (
                <div className="activity-form">
                  <select 
                    value={activityForm.type}
                    onChange={(e) => setActivityForm({...activityForm, type: e.target.value as RMActivityType})}
                    className="filter-select"
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={activityForm.subject}
                    onChange={(e) => setActivityForm({...activityForm, subject: e.target.value})}
                    className="search-input"
                    style={{ padding: '8px 12px' }}
                  />
                  <textarea
                    placeholder="Notes"
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
                    className="final-response-input"
                    rows={3}
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateActivity}
                    disabled={!activityForm.subject.trim()}
                  >
                    Save Activity
                  </button>
                </div>
              )}

              <div className="activity-list-panel">
                {leadActivities.map(activity => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <Icon size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-item-header">
                          <span className="activity-item-subject">{activity.subject}</span>
                          <span className="activity-item-type">{activity.type}</span>
                        </div>
                        <p className="activity-item-notes">{activity.notes}</p>
                        <span className="activity-item-date">
                          {new Date(activity.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {leadActivities.length === 0 && (
                  <div className="no-activities">No activities yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedLeadData && (
          <div className="lead-detail-panel empty">
            <TrendingUp size={48} />
            <p>Select a lead to view details</p>
          </div>
        )}
      </div>

      {/* Won/Lost Section */}
      {(leadsByStatus.WON.length > 0 || leadsByStatus.LOST.length > 0) && (
        <div className="closed-leads">
          <h3>Closed Leads</h3>
          <div className="closed-leads-grid">
            {leadsByStatus.WON.map(lead => {
              const customer = customers.find(c => c.id === lead.customer_id);
              return (
                <div key={lead.id} className="closed-lead-card won">
                  <CheckCircle size={16} />
                  <span>{customer?.name}</span>
                  <span className="closed-lead-product">{lead.product_interest}</span>
                </div>
              );
            })}
            {leadsByStatus.LOST.map(lead => {
              const customer = customers.find(c => c.id === lead.customer_id);
              return (
                <div key={lead.id} className="closed-lead-card lost">
                  <User size={16} />
                  <span>{customer?.name}</span>
                  <span className="closed-lead-product">{lead.product_interest}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
