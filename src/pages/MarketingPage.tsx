// ==========================================
// Marketing Page - Segments & Campaigns
// ==========================================

import { useState, useMemo } from 'react';
import { 
  Plus, 
  Target, 
  Mail, 
  Users, 
  CheckCircle, 
  XCircle,
  Play,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { can } from '../lib/policy';
import type { CampaignStatus } from '../types';

export function MarketingPage() {
  const { 
    currentUser, 
    segments, 
    campaigns, 
    campaignEligibilities,
    customers,
    evaluateCampaignEligibility,
    executeCampaign,
    updateCampaignStatus,
    hasActiveCase,
  } = useAppStore();

  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'segments' | 'campaigns'>('campaigns');

  // Get eligibilities for selected campaign - must be before early return
  const selectedEligibilities = useMemo(() => {
    if (!selectedCampaign) return [];
    return campaignEligibilities.filter(e => e.campaign_id === selectedCampaign);
  }, [selectedCampaign, campaignEligibilities]);

  if (!currentUser || !can(currentUser, 'view_campaign')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You don't have permission to view marketing.</p>
        </div>
      </div>
    );
  }

  const handleEvaluate = (campaignId: string) => {
    evaluateCampaignEligibility(campaignId);
    setSelectedCampaign(campaignId);
  };

  const handleExecute = (campaignId: string) => {
    executeCampaign(campaignId);
  };

  const handleApprove = (campaignId: string) => {
    updateCampaignStatus(campaignId, 'APPROVED');
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'DRAFT': return 'status-draft';
      case 'APPROVED': return 'status-approved';
      case 'EXECUTING': return 'status-executing';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const eligibleCount = selectedEligibilities.filter(e => e.eligible).length;
  const ineligibleCount = selectedEligibilities.filter(e => !e.eligible).length;

  return (
    <div className="page marketing-page">
      <header className="page-header">
        <div>
          <h1>Marketing</h1>
          <p className="page-subtitle">Manage segments and campaigns</p>
        </div>
        {can(currentUser, 'create_campaign') && (
          <button className="btn btn-primary">
            <Plus size={18} />
            New Campaign
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="marketing-tabs">
        <button 
          className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          <Mail size={18} />
          Campaigns ({campaigns.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'segments' ? 'active' : ''}`}
          onClick={() => setActiveTab('segments')}
        >
          <Target size={18} />
          Segments ({segments.length})
        </button>
      </div>

      {activeTab === 'campaigns' && (
        <div className="campaigns-section">
          <div className="campaign-list">
            {campaigns.map(campaign => {
              const segment = segments.find(s => s.id === campaign.segment_id);
              const campEligibilities = campaignEligibilities.filter(e => e.campaign_id === campaign.id);
              
              return (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <div className="campaign-info">
                      <h3>{campaign.name}</h3>
                      <p>{campaign.description}</p>
                    </div>
                    <span className={`campaign-status ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="campaign-meta">
                    <div className="campaign-meta-item">
                      <Target size={14} />
                      <span>Segment: {segment?.name || 'Unknown'}</span>
                    </div>
                    <div className="campaign-meta-item">
                      <Mail size={14} />
                      <span>Channel: {campaign.channel}</span>
                    </div>
                    {campEligibilities.length > 0 && (
                      <div className="campaign-meta-item">
                        <Users size={14} />
                        <span>
                          {campEligibilities.filter(e => e.eligible).length} eligible / 
                          {campEligibilities.length} total
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="campaign-actions">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEvaluate(campaign.id)}
                    >
                      Evaluate Eligibility
                    </button>
                    {campaign.status === 'DRAFT' && (
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleApprove(campaign.id)}
                      >
                        Approve
                      </button>
                    )}
                    {campaign.status === 'APPROVED' && can(currentUser, 'execute_campaign') && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleExecute(campaign.id)}
                      >
                        <Play size={14} />
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Eligibility Table */}
          {selectedCampaign && selectedEligibilities.length > 0 && (
            <div className="eligibility-section">
              <h3>
                Eligibility Results
                <span className="eligibility-summary">
                  <span className="eligible-count">
                    <CheckCircle size={14} /> {eligibleCount} Eligible
                  </span>
                  <span className="ineligible-count">
                    <XCircle size={14} /> {ineligibleCount} Ineligible
                  </span>
                </span>
              </h3>
              
              <table className="eligibility-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Segment</th>
                    <th>Consent</th>
                    <th>Active Case</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEligibilities.map(elig => {
                    const customer = customers.find(c => c.id === elig.customer_id);
                    const hasCase = hasActiveCase(elig.customer_id);
                    
                    return (
                      <tr key={elig.customer_id}>
                        <td>
                          <div className="table-customer">
                            <span className="table-customer-name">{customer?.name}</span>
                            <span className="table-customer-cif">{customer?.cif}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`customer-segment segment-${customer?.segment.toLowerCase()}`}>
                            {customer?.segment}
                          </span>
                        </td>
                        <td>
                          <span className={`consent-status ${customer?.consent.marketing === 'GRANTED' ? 'granted' : 'withdrawn'}`}>
                            {customer?.consent.marketing}
                          </span>
                        </td>
                        <td>
                          {hasCase ? (
                            <span className="has-case">Yes</span>
                          ) : (
                            <span className="no-case">No</span>
                          )}
                        </td>
                        <td>
                          {elig.eligible ? (
                            <span className="eligibility-eligible">
                              <CheckCircle size={14} /> Eligible
                            </span>
                          ) : (
                            <span className="eligibility-ineligible">
                              <XCircle size={14} /> Ineligible
                            </span>
                          )}
                        </td>
                        <td>
                          {elig.ineligible_reason && (
                            <span className={`ineligible-reason reason-${elig.ineligible_reason.toLowerCase()}`}>
                              {elig.ineligible_reason === 'CONSENT' && 'Marketing consent withdrawn'}
                              {elig.ineligible_reason === 'CASE_ACTIVE' && 'Has active case'}
                              {elig.ineligible_reason === 'SEGMENT_MISMATCH' && 'Not in segment'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="segments-section">
          <div className="segment-list">
            {segments.map(segment => (
              <div key={segment.id} className="segment-card">
                <div className="segment-header">
                  <h3>{segment.name}</h3>
                </div>
                <p className="segment-description">{segment.description}</p>
                <div className="segment-rules">
                  <span className="rules-label">Rules:</span>
                  {segment.rules.map((rule, i) => (
                    <span key={i} className="rule-badge">
                      {rule.field} {rule.operator} {Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
