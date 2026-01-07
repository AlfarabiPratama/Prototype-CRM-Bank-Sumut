// ==========================================
// Agent Dashboard - Workbench Style
// ==========================================
// Bank-grade professional workbench with:
// - Compact KPI row
// - Main queue table with search/filter/sort
// - Quick actions sidebar

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Plus,
  FileText,
  Users,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { filterCasesByScope } from '../../lib/policy';
import { getSLAStatus, formatSLARemaining } from '../../lib/sla';
import { StatusBadge, SLABadge } from '../StatusBadge';

type SortField = 'sla' | 'priority' | 'created';
type SortOrder = 'asc' | 'desc';
type ShiftFilter = 'today' | 'week' | 'all';

export function AgentDashboard() {
  const navigate = useNavigate();
  const { currentUser, cases, customers } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<ShiftFilter>('today');
  const [sortField, setSortField] = useState<SortField>('sla');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  if (!currentUser) return null;

  // Filter my cases
  const branchCases = filterCasesByScope(currentUser, cases);
  const myCases = branchCases.filter(c => c.assigned_to === currentUser.id && c.status !== 'CLOSED');
  
  // Queue breakdown
  const myBreached = myCases.filter(c => getSLAStatus(c.sla) === 'BREACHED');
  const myDueSoon = myCases.filter(c => getSLAStatus(c.sla) === 'WARNING');
  const waitingCustomer = myCases.filter(c => c.status === 'WAITING_CUSTOMER' || c.status === 'IN_PROGRESS');
  
  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closedToday = branchCases.filter(c => 
    c.assigned_to === currentUser.id && 
    c.status === 'CLOSED' && 
    c.closed_at && 
    new Date(c.closed_at) >= today
  ).length;

  // Date filter bounds
  const getDateBound = (filter: ShiftFilter) => {
    const now = new Date();
    if (filter === 'today') {
      now.setHours(0, 0, 0, 0);
      return now;
    } else if (filter === 'week') {
      now.setDate(now.getDate() - 7);
      return now;
    }
    return new Date(0); // all time
  };

  // Filtered and sorted queue
  const filteredQueue = useMemo(() => {
    const dateBound = getDateBound(shiftFilter);
    
    return myCases
      .filter(c => {
        // Date filter
        if (new Date(c.created_at) < dateBound) return false;
        
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const customer = customers.find(cust => cust.id === c.customer_id);
          return (
            c.case_number.toLowerCase().includes(query) ||
            c.subject.toLowerCase().includes(query) ||
            customer?.name.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'sla') {
          const aTime = a.sla?.due_at ? new Date(a.sla.due_at).getTime() : Infinity;
          const bTime = b.sla?.due_at ? new Date(b.sla.due_at).getTime() : Infinity;
          comparison = aTime - bTime;
        } else if (sortField === 'priority') {
          const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (sortField === 'created') {
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [myCases, shiftFilter, searchQuery, sortField, sortOrder, customers]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown';
  };

  return (
    <div className="agent-workbench">
      {/* Header */}
      <header className="workbench-header">
        <div>
          <h1>Selamat {getGreeting()}, {currentUser.name.split(' ')[0]}!</h1>
          <p className="workbench-subtitle">
            Anda memiliki <strong>{myCases.length}</strong> case aktif
          </p>
        </div>
        <div className="shift-filters">
          <button 
            className={`shift-btn ${shiftFilter === 'today' ? 'active' : ''}`}
            onClick={() => setShiftFilter('today')}
          >
            Hari Ini
          </button>
          <button 
            className={`shift-btn ${shiftFilter === 'week' ? 'active' : ''}`}
            onClick={() => setShiftFilter('week')}
          >
            7 Hari
          </button>
          <button 
            className={`shift-btn ${shiftFilter === 'all' ? 'active' : ''}`}
            onClick={() => setShiftFilter('all')}
          >
            Semua
          </button>
        </div>
      </header>

      {/* Compact KPI Row */}
      <div className="kpi-row">
        <div className="kpi-compact kpi-danger">
          <span className="kpi-compact-value">{myBreached.length}</span>
          <span className="kpi-compact-label">Terlambat</span>
        </div>
        <div className="kpi-compact kpi-warning">
          <span className="kpi-compact-value">{myDueSoon.length}</span>
          <span className="kpi-compact-label">≤4 Jam</span>
        </div>
        <div className="kpi-compact kpi-info">
          <span className="kpi-compact-value">{waitingCustomer.length}</span>
          <span className="kpi-compact-label">Menunggu</span>
        </div>
        <div className="kpi-compact kpi-success">
          <span className="kpi-compact-value">{closedToday}</span>
          <span className="kpi-compact-label">Selesai Hari Ini</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="workbench-grid">
        {/* Queue Table */}
        <div className="workbench-main">
          <div className="queue-header">
            <h2><FileText size={16} /> Antrian Saya</h2>
            <div className="queue-controls">
              <div className="queue-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Cari case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="queue-empty">
              <CheckCircle size={40} />
              <h3>Tidak ada case</h3>
              <p>{searchQuery ? 'Coba kata kunci lain' : 'Belum ada case di antrian Anda'}</p>
            </div>
          ) : (
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Nasabah</th>
                  <th>Kategori</th>
                  <th className="sortable" onClick={() => handleSort('priority')}>
                    Prioritas <ArrowUpDown size={12} />
                  </th>
                  <th className="sortable" onClick={() => handleSort('sla')}>
                    SLA <ArrowUpDown size={12} />
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className={getSLAStatus(c.sla) === 'BREACHED' ? 'row-danger' : ''}
                  >
                    <td>
                      <span className="case-number-link">{c.case_number}</span>
                      <span className="case-subject-text">{c.subject}</span>
                    </td>
                    <td>{getCustomerName(c.customer_id)}</td>
                    <td className="category-cell">{c.category.replace(/_/g, ' ')}</td>
                    <td><StatusBadge status={c.priority} /></td>
                    <td>
                      {c.sla?.due_at && <SLABadge dueAt={c.sla.due_at} />}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <aside className="workbench-sidebar">
          <div className="sidebar-section">
            <h3>Aksi Cepat</h3>
            <div className="quick-action-list">
              <Link to="/customers" className="quick-action-item">
                <Search size={18} />
                <span>Cari Nasabah</span>
              </Link>
              <Link to="/cases/new" className="quick-action-item">
                <Plus size={18} />
                <span>Buat Case Baru</span>
              </Link>
              <Link to="/cases" className="quick-action-item">
                <FileText size={18} />
                <span>Lihat Semua Case</span>
              </Link>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Catatan Shift</h3>
            <textarea 
              className="shift-notes"
              placeholder="Tulis catatan shift Anda di sini..."
              rows={4}
            />
          </div>

          <div className="sidebar-section sidebar-tip">
            <AlertTriangle size={14} />
            <p>Case tidak dapat ditutup tanpa mengisi <strong>Tanggapan Akhir</strong></p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Pagi';
  if (hour < 15) return 'Siang';
  if (hour < 18) return 'Sore';
  return 'Malam';
}
