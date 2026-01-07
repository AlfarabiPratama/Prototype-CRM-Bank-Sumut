// ==========================================
// Customer Directory Page - Table View
// ==========================================
// Bank-grade customer directory with:
// - Large search bar
// - Filter chips (Branch, RFM, VIP, Consent)
// - Table-based list (not cards)

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Phone, AlertCircle, FileText, Star, Shield } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterCustomersByScope, can } from '../lib/policy';
import { maskPhone } from '../lib/mask';
import { getCLVIcon, getSegmentLabel, getSegmentColor, type RFMSegment } from '../lib/rfm';

type FilterChip = 'all' | 'vip' | 'no_consent' | RFMSegment;

export function CustomersPage() {
  const navigate = useNavigate();
  const { currentUser, customers, customerAssignments, rfmScores, cases, addAuditLog } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');

  // Filter customers by scope
  const scopedCustomers = useMemo(() => {
    if (!currentUser) return [];
    return filterCustomersByScope(currentUser, customers, customerAssignments);
  }, [currentUser, customers, customerAssignments]);

  // Get open cases count for each customer
  const getOpenCasesCount = (customerId: string) => {
    return cases.filter(c => c.customer_id === customerId && c.status !== 'CLOSED').length;
  };

  // Helper to get RFM for a customer
  const getRFM = (customerId: string) => rfmScores.find(r => r.customer_id === customerId);

  // Filter and search
  const filteredCustomers = useMemo(() => {
    let results = scopedCustomers;

    // Apply chip filter
    if (activeFilter === 'vip') {
      results = results.filter(c => c.segment === 'PRIORITY' || c.segment === 'PRIVATE');
    } else if (activeFilter === 'no_consent') {
      results = results.filter(c => c.consent.marketing !== 'GRANTED');
    } else if (activeFilter !== 'all') {
      // RFM segment filter
      results = results.filter(c => {
        const rfm = getRFM(c.id);
        return rfm?.segment === activeFilter;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.cif.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    return results;
  }, [scopedCustomers, activeFilter, searchQuery, rfmScores]);

  // Handle search submission for audit
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    addAuditLog('SEARCH_CUSTOMER', 'CUSTOMER', null, { 
      query: searchQuery,
      results_count: filteredCustomers.length 
    });
  };

  if (!currentUser || !can(currentUser, 'search_customer')) {
    return (
      <div className="page">
        <div className="access-denied">
          <AlertCircle size={48} />
          <h2>Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mencari nasabah.</p>
        </div>
      </div>
    );
  }

  const filterChips: { id: FilterChip; label: string; count?: number }[] = [
    { id: 'all', label: 'Semua', count: scopedCustomers.length },
    { id: 'vip', label: 'VIP', count: scopedCustomers.filter(c => c.segment === 'PRIORITY' || c.segment === 'PRIVATE').length },
    { id: 'CHAMPION', label: '💎 Champion' },
    { id: 'LOYAL', label: '💰 Loyal' },
    { id: 'AT_RISK', label: '⚠️ At Risk' },
    { id: 'no_consent', label: '🚫 No Consent', count: scopedCustomers.filter(c => c.consent.marketing !== 'GRANTED').length },
  ];

  return (
    <div className="page customers-directory">
      {/* Header */}
      <header className="directory-header">
        <div>
          <h1>Direktori Nasabah</h1>
          <p className="directory-subtitle">
            {scopedCustomers.length} nasabah dalam jangkauan Anda
          </p>
        </div>
      </header>

      {/* Large Search Bar */}
      <div className="directory-search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Cari nama, CIF, atau nomor telepon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery('')}>
            ×
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="filter-chips">
        {filterChips.map(chip => (
          <button
            key={chip.id}
            className={`filter-chip ${activeFilter === chip.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(chip.id)}
          >
            {chip.label}
            {chip.count !== undefined && <span className="chip-count">{chip.count}</span>}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="directory-table-container">
        {filteredCustomers.length === 0 ? (
          <div className="directory-empty">
            <User size={40} />
            <h3>Tidak ditemukan</h3>
            <p>{searchQuery ? 'Coba kata kunci lain' : 'Tidak ada nasabah sesuai filter'}</p>
          </div>
        ) : (
          <table className="directory-table">
            <thead>
              <tr>
                <th>Nasabah</th>
                <th>Telepon</th>
                <th>Segment</th>
                <th>RFM</th>
                <th>Consent</th>
                <th>Case Aktif</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.slice(0, 50).map(customer => {
                const rfm = getRFM(customer.id);
                const openCases = getOpenCasesCount(customer.id);
                return (
                  <tr 
                    key={customer.id} 
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <td>
                      <div className="customer-cell">
                        <div className="customer-cell-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <span className="customer-cell-name">{customer.name}</span>
                          <span className="customer-cell-cif">{customer.cif}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="phone-cell">
                        <Phone size={12} />
                        {maskPhone(customer.phone, currentUser.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`segment-badge segment-${customer.segment.toLowerCase()}`}>
                        {customer.segment}
                      </span>
                    </td>
                    <td>
                      {rfm ? (
                        <span 
                          className="rfm-cell"
                          style={{ color: getSegmentColor(rfm.segment) }}
                          title={rfm.segment_reason}
                        >
                          {getCLVIcon(rfm.clv_proxy)} {getSegmentLabel(rfm.segment)}
                        </span>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`consent-indicator ${customer.consent.marketing === 'GRANTED' ? 'yes' : 'no'}`}>
                        <Shield size={12} />
                        {customer.consent.marketing === 'GRANTED' ? 'Ya' : 'Tidak'}
                      </span>
                    </td>
                    <td>
                      {openCases > 0 ? (
                        <span className="cases-badge">
                          <FileText size={12} />
                          {openCases}
                        </span>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filteredCustomers.length > 50 && (
          <div className="table-footer">
            Menampilkan 50 dari {filteredCustomers.length} nasabah. Gunakan filter untuk mempersempit hasil.
          </div>
        )}
      </div>
    </div>
  );
}
