// ==========================================
// Cases Page - Split View with Views Panel
// ==========================================
// Redesigned following Zendesk/Salesforce console patterns
// - Left: Views + filtered case list
// - Right: Case preview panel

import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search,
  FileText,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  User,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterCasesByScope, can } from '../lib/policy';
import { getSLAStatus, formatSLARemaining } from '../lib/sla';
import { SplitView } from '../components/SplitView';
import { StatusBadge, SLABadge } from '../components/StatusBadge';
import { CreateCaseDrawer } from '../components/CreateCaseDrawer';
import type { CaseStatus, CasePriority, Case } from '../types';

// View definitions for the Views panel
type ViewType = 'my_queue' | 'due_today' | 'sla_warning' | 'breached' | 'escalation' | 'all';

interface ViewDefinition {
  id: ViewType;
  label: string;
  icon: typeof FileText;
  filter: (c: Case, currentUserId: string) => boolean;
}

const VIEWS: ViewDefinition[] = [
  { 
    id: 'my_queue', 
    label: 'Antrian Saya', 
    icon: FileText,
    filter: (c, userId) => c.assigned_to === userId && c.status !== 'CLOSED'
  },
  { 
    id: 'due_today', 
    label: 'Jatuh Tempo Hari Ini', 
    icon: Clock,
    filter: (c) => {
      if (c.status === 'CLOSED' || !c.sla?.due_at) return false;
      const due = new Date(c.sla.due_at);
      const today = new Date();
      return due.toDateString() === today.toDateString();
    }
  },
  { 
    id: 'sla_warning', 
    label: 'SLA ≤ 4 jam', 
    icon: AlertTriangle,
    filter: (c) => {
      if (c.status === 'CLOSED' || !c.sla?.due_at) return false;
      const hoursRemaining = (new Date(c.sla.due_at).getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursRemaining > 0 && hoursRemaining <= 4;
    }
  },
  { 
    id: 'breached', 
    label: 'Terlambat', 
    icon: AlertCircle,
    filter: (c) => {
      if (c.status === 'CLOSED' || !c.sla?.due_at) return false;
      return new Date(c.sla.due_at) < new Date();
    }
  },
  { 
    id: 'escalation', 
    label: 'Butuh Eskalasi', 
    icon: ArrowUpRight,
    filter: (c) => c.status === 'ESCALATED'
  },
  { 
    id: 'all', 
    label: 'Semua Case', 
    icon: FileText,
    filter: () => true
  },
];

export function CasesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, cases, customers, users } = useAppStore();
  
  // Persist view selection in URL
  const activeView = (searchParams.get('view') as ViewType) || 'my_queue';
  const selectedCaseId = searchParams.get('selected');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'ALL'>('ALL');
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Filter cases by scope
  const scopedCases = useMemo(() => {
    if (!currentUser) return [];
    return filterCasesByScope(currentUser, cases);
  }, [currentUser, cases]);

  // Calculate view counts
  const viewCounts = useMemo(() => {
    const counts: Record<ViewType, number> = {
      my_queue: 0,
      due_today: 0,
      sla_warning: 0,
      breached: 0,
      escalation: 0,
      all: scopedCases.length,
    };
    if (!currentUser) return counts;
    
    scopedCases.forEach(c => {
      VIEWS.forEach(view => {
        if (view.id !== 'all' && view.filter(c, currentUser.id)) {
          counts[view.id]++;
        }
      });
    });
    return counts;
  }, [scopedCases, currentUser]);

  // Apply view filter + additional filters
  const filteredCases = useMemo(() => {
    if (!currentUser) return [];
    
    const viewDef = VIEWS.find(v => v.id === activeView);
    
    return scopedCases.filter(c => {
      // View filter
      if (viewDef && !viewDef.filter(c, currentUser.id)) return false;
      
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customer = customers.find(cust => cust.id === c.customer_id);
        const matchesNumber = c.case_number.toLowerCase().includes(query);
        const matchesSubject = c.subject.toLowerCase().includes(query);
        const matchesCustomer = customer?.name.toLowerCase().includes(query);
        if (!matchesNumber && !matchesSubject && !matchesCustomer) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by SLA urgency
      if (a.sla?.due_at && b.sla?.due_at) {
        return new Date(a.sla.due_at).getTime() - new Date(b.sla.due_at).getTime();
      }
      return 0;
    });
  }, [scopedCases, activeView, statusFilter, priorityFilter, searchQuery, currentUser, customers]);

  const selectedCase = selectedCaseId ? cases.find(c => c.id === selectedCaseId) : null;
  const selectedCustomer = selectedCase ? customers.find(c => c.id === selectedCase.customer_id) : null;

  if (!currentUser || !can(currentUser, 'view_case')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk melihat case.</p>
        </div>
      </div>
    );
  }

  const handleViewChange = (viewId: ViewType) => {
    setSearchParams({ view: viewId });
  };

  const handleSelectCase = (caseId: string) => {
    setSearchParams({ view: activeView, selected: caseId });
  };

  const handleOpenDetail = () => {
    if (selectedCase) {
      navigate(`/cases/${selectedCase.id}?from=${activeView}`);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  const getAssigneeName = (userId: string | null) => {
    if (!userId) return 'Belum ditugaskan';
    return users.find(u => u.id === userId)?.name || 'Unknown';
  };

  // Left panel: Views + Case List
  const listPanel = (
    <div className="case-list-container">
      {/* Views Panel */}
      <div className="views-panel">
        <div className="views-header">
          <h3>Views</h3>
          {can(currentUser, 'create_case') && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setIsCreateDrawerOpen(true)}
            >
              <Plus size={14} /> Baru
            </button>
          )}
        </div>
        <div className="views-list">
          {VIEWS.map(view => {
            const Icon = view.icon;
            return (
              <div
                key={view.id}
                className={`view-item ${activeView === view.id ? 'active' : ''}`}
                onClick={() => handleViewChange(view.id)}
              >
                <Icon size={16} />
                <span>{view.label}</span>
                <span className="view-count">{viewCounts[view.id]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="case-list-header">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Cari case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="case-list-search"
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className="case-list-filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'ALL')}
          >
            <option value="ALL">Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as CasePriority | 'ALL')}
          >
            <option value="ALL">Prioritas</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Case List */}
      <div className="case-list-body">
        {filteredCases.length === 0 ? (
          <div className="preview-panel-empty" style={{ padding: 'var(--spacing-xl)' }}>
            <FileText size={32} />
            <p style={{ marginTop: 'var(--spacing-md)' }}>
              {searchQuery 
                ? 'Tidak ditemukan. Coba kata kunci lain.' 
                : 'Belum ada case di view ini.'
              }
            </p>
          </div>
        ) : (
          filteredCases.map(c => (
            <div
              key={c.id}
              className={`case-list-item ${selectedCaseId === c.id ? 'selected' : ''}`}
              onClick={() => handleSelectCase(c.id)}
            >
              <div className="case-list-item-header">
                <span className="case-list-item-number">{c.case_number}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="case-list-item-customer">
                {getCustomerName(c.customer_id)}
              </div>
              <div className="case-list-item-subject">{c.subject}</div>
              <div className="case-list-item-meta">
                <StatusBadge status={c.priority} variant="priority" />
                {c.sla?.due_at && c.status !== 'CLOSED' && (
                  <SLABadge dueAt={c.sla.due_at} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Right panel: Case Preview
  const detailPanel = selectedCase ? (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-title">
          <h2>{selectedCase.case_number}</h2>
          <div className="preview-badges">
            <StatusBadge status={selectedCase.status} size="md" />
            <StatusBadge status={selectedCase.priority} variant="priority" size="md" />
          </div>
        </div>
        {selectedCase.sla?.due_at && selectedCase.status !== 'CLOSED' && (
          <SLABadge dueAt={selectedCase.sla.due_at} size="md" />
        )}
      </div>

      <div className="preview-section">
        <h4>Informasi Case</h4>
        <div className="preview-info-grid">
          <div className="preview-info-item">
            <div className="preview-info-label">Nasabah</div>
            <div>{selectedCustomer?.name}</div>
          </div>
          <div className="preview-info-item">
            <div className="preview-info-label">Kategori</div>
            <div>{selectedCase.category.replace(/_/g, ' ')}</div>
          </div>
          <div className="preview-info-item">
            <div className="preview-info-label">Ditugaskan ke</div>
            <div>{getAssigneeName(selectedCase.assigned_to)}</div>
          </div>
          <div className="preview-info-item">
            <div className="preview-info-label">Dibuat</div>
            <div>{new Date(selectedCase.created_at).toLocaleDateString('id-ID')}</div>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h4>Kronologi</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {selectedCase.subject}
        </p>
      </div>

      <div className="quick-actions-bar">
        {!selectedCase.assigned_to && currentUser.role === 'AGENT' && (
          <button className="btn btn-secondary">
            <User size={16} /> Ambil Case
          </button>
        )}
        <button className="btn btn-secondary">
          <MessageSquare size={16} /> Tambah Catatan
        </button>
        <button className="btn btn-primary" onClick={handleOpenDetail}>
          Buka Detail <ChevronRight size={16} />
        </button>
      </div>
    </div>
  ) : (
    <div className="preview-panel-empty">
      <FileText size={48} />
      <h3>Pilih Case</h3>
      <p>Klik case dari daftar untuk melihat detail</p>
    </div>
  );

  return (
    <>
      <SplitView listPanel={listPanel} detailPanel={detailPanel} />
      <CreateCaseDrawer 
        isOpen={isCreateDrawerOpen} 
        onClose={() => setIsCreateDrawerOpen(false)} 
      />
    </>
  );
}
