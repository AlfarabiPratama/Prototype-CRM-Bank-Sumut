// ==========================================
// Customer 360 Detail Page - 3-Column Layout
// ==========================================
// Redesigned following Salesforce record page patterns:
// - Left: Profile summary (compact)
// - Center: Tabbed content (Overview, Timeline, Cases)
// - Right: Alerts & Next Steps

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Star,
  Plus,
  Copy,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterCustomersByScope, can } from '../lib/policy';
import { maskNIK, maskPhone, maskEmail, maskAccount } from '../lib/mask';
import { getCLVIcon, getSegmentLabel, getSegmentColor } from '../lib/rfm';
import { getActionIcon, getPriorityColor, getPriorityLabel } from '../lib/nba';
import { StatusBadge, SLABadge } from '../components/StatusBadge';
import { RFMCard } from '../components/RFMCard';
import { RFMRecommendations } from '../components/RFMRecommendations';
import type { TimelineItem } from '../types';

type Tab = 'overview' | 'timeline' | 'cases';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedCIF, setCopiedCIF] = useState(false);

  const { 
    currentUser, 
    customers, 
    customerAssignments,
    cases,
    leads,
    rmActivities,
    users,
    branches,
    addAuditLog,
    getRFMByCustomer,
    getNBAByCustomer,
    updateNBADecision
  } = useAppStore();

  // Check access
  const scopedCustomers = useMemo(() => {
    if (!currentUser) return [];
    return filterCustomersByScope(currentUser, customers, customerAssignments);
  }, [currentUser, customers, customerAssignments]);

  const customer = scopedCustomers.find(c => c.id === id);
  const branch = customer ? branches.find(b => b.id === customer.branch_id) : null;

  // Audit VIEW_PROFILE on mount
  useEffect(() => {
    if (customer && currentUser) {
      addAuditLog('VIEW_PROFILE', 'CUSTOMER', customer.id, { 
        customer_name: customer.name,
        customer_cif: customer.cif
      });
    }
  }, [customer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get related data
  const customerCases = cases.filter(c => c.customer_id === id);
  const customerLeads = leads.filter(l => l.customer_id === id);
  const customerActivities = rmActivities.filter(a => a.customer_id === id);
  
  // Counts
  const openCases = customerCases.filter(c => c.status !== 'CLOSED');
  
  // Get RFM score for customer
  const rfmScore = id ? getRFMByCustomer(id) : undefined;
  
  // Get NBA recommendations for customer
  const nbaRecommendations = id ? getNBAByCustomer(id) : [];

  // Build timeline
  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    customerCases.forEach(c => {
      items.push({
        id: `case-${c.id}`,
        type: 'CASE',
        timestamp: c.created_at,
        title: `Case: ${c.subject}`,
        description: `${c.category} - ${c.status}`,
        actor_name: users.find(u => u.id === c.created_by)?.name || 'Unknown',
        metadata: { case_id: c.id, status: c.status, priority: c.priority }
      });
    });

    customerActivities.forEach(a => {
      items.push({
        id: `activity-${a.id}`,
        type: 'RM_ACTIVITY',
        timestamp: a.created_at,
        title: `${a.type}: ${a.subject}`,
        description: a.notes,
        actor_name: users.find(u => u.id === a.rm_id)?.name || 'Unknown',
        metadata: { activity_type: a.type }
      });
    });

    customerLeads.forEach(l => {
      items.push({
        id: `lead-${l.id}`,
        type: 'LEAD',
        timestamp: l.created_at,
        title: `Lead: ${l.product_interest}`,
        description: `Status: ${l.status}`,
        actor_name: users.find(u => u.id === l.assigned_to)?.name || 'Unknown',
        metadata: { lead_id: l.id, status: l.status }
      });
    });

    return items.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [customerCases, customerActivities, customerLeads, users]);

  // Copy CIF to clipboard
  const handleCopyCIF = () => {
    navigator.clipboard.writeText(customer?.cif || '');
    setCopiedCIF(true);
    setTimeout(() => setCopiedCIF(false), 2000);
  };

  if (!currentUser) {
    return <div className="page-empty">Silakan login terlebih dahulu</div>;
  }

  if (!customer) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Nasabah Tidak Ditemukan</h2>
          <p>Nasabah ini tidak ada atau Anda tidak memiliki akses.</p>
          <Link to="/customers" className="btn btn-primary">
            <ArrowLeft size={18} />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page customer-360-page">
      {/* Header */}
      <header className="c360-header">
        <div className="c360-header-left">
          <button className="back-btn" onClick={() => navigate('/customers')}>
            <ArrowLeft size={20} />
          </button>
          <div className="c360-title">
            <h1>{customer.name}</h1>
            <div className="c360-meta">
              <span className="c360-cif" onClick={handleCopyCIF} title="Klik untuk salin">
                {customer.cif}
                <Copy size={12} />
                {copiedCIF && <span className="copied-toast">Disalin!</span>}
              </span>
              <span className={`customer-segment segment-${customer.segment.toLowerCase()}`}>
                {customer.segment}
              </span>
              {rfmScore && (
                <span 
                  className="rfm-badge-mini"
                  style={{ backgroundColor: `${getSegmentColor(rfmScore.segment)}20`, color: getSegmentColor(rfmScore.segment) }}
                >
                  {getCLVIcon(rfmScore.clv_proxy)} {getSegmentLabel(rfmScore.segment)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="c360-header-right">
          {can(currentUser, 'create_case') && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/cases/new', { state: { customerId: customer.id } })}
            >
              <Plus size={16} /> Buat Case
            </button>
          )}
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="c360-grid">
        {/* Left Column - Profile Summary */}
        <aside className="c360-left">
          {/* Identity Card */}
          <div className="c360-card">
            <div className="c360-card-header">
              <User size={14} /> Identitas
            </div>
            <div className="c360-card-body">
              <div className="c360-info-row">
                <span className="c360-label">NIK</span>
                <span className="c360-value">{maskNIK(customer.nik, currentUser.role)}</span>
              </div>
              <div className="c360-info-row">
                <span className="c360-label"><Phone size={12} /> Telepon</span>
                <span className="c360-value">{maskPhone(customer.phone, currentUser.role)}</span>
              </div>
              <div className="c360-info-row">
                <span className="c360-label"><Mail size={12} /> Email</span>
                <span className="c360-value">{maskEmail(customer.email, currentUser.role)}</span>
              </div>
              <div className="c360-info-row">
                <span className="c360-label">Cabang</span>
                <span className="c360-value">{branch?.name || '-'}</span>
              </div>
            </div>
          </div>

          {/* Accounts Card */}
          <div className="c360-card">
            <div className="c360-card-header">
              <CreditCard size={14} /> Rekening
            </div>
            <div className="c360-card-body">
              {customer.account_numbers.map((acc, i) => (
                <div key={i} className="c360-account">
                  {maskAccount(acc, currentUser.role)}
                </div>
              ))}
            </div>
          </div>

          {/* Consent Card */}
          <div className="c360-card">
            <div className="c360-card-header">
              <Shield size={14} /> Consent
            </div>
            <div className="c360-card-body">
              <div className="c360-consent-row">
                <span>Marketing</span>
                <span className={`consent-pill ${customer.consent.marketing === 'GRANTED' ? 'granted' : 'withdrawn'}`}>
                  {customer.consent.marketing === 'GRANTED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {customer.consent.marketing === 'GRANTED' ? 'Ya' : 'Tidak'}
                </span>
              </div>
              <div className="c360-consent-row">
                <span>Data Sharing</span>
                <span className={`consent-pill ${customer.consent.data_sharing === 'GRANTED' ? 'granted' : 'withdrawn'}`}>
                  {customer.consent.data_sharing === 'GRANTED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {customer.consent.data_sharing === 'GRANTED' ? 'Ya' : 'Tidak'}
                </span>
              </div>
              {customer.consent.marketing !== 'GRANTED' && (
                <p className="consent-note">
                  Nasabah tidak menyetujui pemasaran. Akan dikecualikan dari campaign.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Center Column - Tabbed Content */}
        <main className="c360-center">
          {/* Tabs */}
          <div className="c360-tabs">
            <button 
              className={`c360-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`c360-tab ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline ({timeline.length})
            </button>
            <button 
              className={`c360-tab ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              Cases ({customerCases.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="c360-tab-content">
            {activeTab === 'overview' && (
              <div className="c360-overview">
                {/* RFM Score - Enhanced with RFMCard */}
                {rfmScore && (
                  <div className="c360-section">
                    <h3><Star size={14} /> Customer Value (RFM)</h3>
                    <RFMCard rfm={rfmScore} />
                  </div>
                )}

                {/* RFM Recommendations - Segment-specific actions */}
                {rfmScore && (
                  <div className="c360-section">
                    <RFMRecommendations segment={rfmScore.segment} />
                  </div>
                )}

                {/* Quick Stats */}
                <div className="c360-section">
                  <h3><TrendingUp size={14} /> Ringkasan</h3>
                  <div className="c360-stats">
                    <div className="c360-stat">
                      <span className="c360-stat-value">{customerCases.length}</span>
                      <span className="c360-stat-label">Total Case</span>
                    </div>
                    <div className="c360-stat">
                      <span className="c360-stat-value">{openCases.length}</span>
                      <span className="c360-stat-label">Case Aktif</span>
                    </div>
                    <div className="c360-stat">
                      <span className="c360-stat-value">{customerLeads.length}</span>
                      <span className="c360-stat-label">Lead</span>
                    </div>
                    <div className="c360-stat">
                      <span className="c360-stat-value">{customerActivities.length}</span>
                      <span className="c360-stat-label">Aktivitas RM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="c360-timeline">
                {timeline.length === 0 ? (
                  <div className="empty-timeline">
                    <Clock size={32} />
                    <p>Belum ada aktivitas tercatat</p>
                  </div>
                ) : (
                  timeline.map(item => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-icon">
                        {item.type === 'CASE' && <FileText size={14} />}
                        {item.type === 'RM_ACTIVITY' && <Phone size={14} />}
                        {item.type === 'LEAD' && <TrendingUp size={14} />}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="timeline-title">{item.title}</span>
                          <span className="timeline-time">
                            {new Date(item.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="timeline-desc">{item.description}</p>
                        <span className="timeline-actor">{item.actor_name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="c360-cases">
                {customerCases.length === 0 ? (
                  <div className="empty-cases">
                    <FileText size={32} />
                    <p>Tidak ada case</p>
                    {can(currentUser, 'create_case') && (
                      <button className="btn btn-secondary" onClick={() => navigate('/cases/new')}>
                        <Plus size={14} /> Buat Case Baru
                      </button>
                    )}
                  </div>
                ) : (
                  customerCases.map(c => (
                    <Link key={c.id} to={`/cases/${c.id}`} className="case-list-link">
                      <div className="case-row">
                        <div className="case-row-left">
                          <span className="case-row-number">{c.case_number}</span>
                          <span className="case-row-subject">{c.subject}</span>
                        </div>
                        <div className="case-row-right">
                          <StatusBadge status={c.status} />
                          {c.sla?.due_at && c.status !== 'CLOSED' && (
                            <SLABadge dueAt={c.sla.due_at} />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Column - Alerts & Next Steps */}
        <aside className="c360-right">
          {/* Alerts */}
          {openCases.length > 0 && (
            <div className="c360-alert-card warning">
              <AlertTriangle size={16} />
              <div>
                <strong>{openCases.length} case aktif</strong>
                <p>Nasabah memiliki case yang belum selesai</p>
              </div>
            </div>
          )}

          {/* SLA Warning */}
          {openCases.some(c => {
            if (!c.sla?.due_at) return false;
            const hoursRemaining = (new Date(c.sla.due_at).getTime() - Date.now()) / (1000 * 60 * 60);
            return hoursRemaining <= 4 && hoursRemaining > 0;
          }) && (
            <div className="c360-alert-card danger">
              <Clock size={16} />
              <div>
                <strong>SLA mendekati batas</strong>
                <p>Ada case dengan SLA &lt; 4 jam</p>
              </div>
            </div>
          )}

          {/* NBA Recommendations */}
          {nbaRecommendations.length > 0 && (
            <div className="c360-card">
              <div className="c360-card-header">
                <AlertCircle size={14} /> Next Best Action
                <span className="nba-count">{nbaRecommendations.length}</span>
              </div>
              <div className="c360-card-body">
                {nbaRecommendations.slice(0, 3).map(nba => (
                  <div key={nba.id} className="nba-mini">
                    <div className="nba-mini-header">
                      <span className="nba-mini-icon">{getActionIcon(nba.action_type)}</span>
                      <span 
                        className="nba-mini-priority"
                        style={{ backgroundColor: getPriorityColor(nba.priority) }}
                      >
                        {getPriorityLabel(nba.priority)}
                      </span>
                    </div>
                    <h4 className="nba-mini-title">{nba.title}</h4>
                    <p className="nba-mini-reason">{nba.reason_text}</p>
                    <div className="nba-mini-actions">
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => updateNBADecision(nba.id, 'ACCEPTED')}
                      >
                        ✓
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateNBADecision(nba.id, 'SNOOZED')}
                      >
                        ⏸
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Masking Note */}
          <div className="c360-note">
            <Shield size={12} />
            <span>Beberapa data disamarkan untuk keamanan</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
