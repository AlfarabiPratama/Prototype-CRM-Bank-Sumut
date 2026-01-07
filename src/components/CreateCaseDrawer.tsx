// ==========================================
// Create Case Drawer - Slide-in Form
// ==========================================
// Features:
// - Slide-in from right
// - Customer selector with search
// - Category dropdown
// - Auto SLA calculation based on priority + category
// - Indonesian microcopy

import { useState, useMemo } from 'react';
import { X, Search, User, AlertCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { filterCustomersByScope } from '../lib/policy';
import type { CaseCategory, CasePriority } from '../types';

interface CreateCaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

// Category labels in Indonesian
const CATEGORY_LABELS: Record<CaseCategory, string> = {
  TRX_FAIL: 'Transaksi Gagal',
  CARD_ATM: 'Kartu / ATM',
  DIGITAL_ACCESS: 'Akses Digital',
  FRAUD_SCAM: 'Fraud / Penipuan',
  FEE_ADMIN: 'Biaya Admin',
  LOAN_CREDIT: 'Kredit / Pinjaman',
  OTHER: 'Lainnya'
};

// SLA hours by category (for response)
const CATEGORY_SLA_HOURS: Record<CaseCategory, number> = {
  FRAUD_SCAM: 2,     // Urgent - 2 hours
  TRX_FAIL: 4,       // High - 4 hours
  CARD_ATM: 8,       // Medium - 8 hours
  DIGITAL_ACCESS: 8, // Medium - 8 hours
  LOAN_CREDIT: 24,   // Standard - 24 hours
  FEE_ADMIN: 24,     // Standard - 24 hours
  OTHER: 24          // Standard - 24 hours
};

// Priority multiplier for SLA
const PRIORITY_MULTIPLIER: Record<CasePriority, number> = {
  CRITICAL: 0.5,  // Half the time
  HIGH: 0.75,
  MEDIUM: 1,
  LOW: 1.5
};

export function CreateCaseDrawer({ isOpen, onClose, preselectedCustomerId }: CreateCaseDrawerProps) {
  const { currentUser, customers, customerAssignments, createCase } = useAppStore();
  
  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [category, setCategory] = useState<CaseCategory>('OTHER');
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get scoped customers
  const scopedCustomers = useMemo(() => {
    if (!currentUser) return [];
    return filterCustomersByScope(currentUser, customers, customerAssignments);
  }, [currentUser, customers, customerAssignments]);

  // Filter customers by search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return scopedCustomers.slice(0, 10);
    const query = customerSearch.toLowerCase();
    return scopedCustomers
      .filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.cif.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [scopedCustomers, customerSearch]);

  // Selected customer data
  const selectedCustomer = scopedCustomers.find(c => c.id === selectedCustomerId);

  // Calculate SLA based on category and priority
  const calculatedSLA = useMemo(() => {
    const baseHours = CATEGORY_SLA_HOURS[category];
    const multiplier = PRIORITY_MULTIPLIER[priority];
    const responseHours = Math.round(baseHours * multiplier);
    const resolutionHours = responseHours * 2;
    return { responseHours, resolutionHours };
  }, [category, priority]);

  // Handle customer selection
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = scopedCustomers.find(c => c.id === customerId);
    if (customer) {
      setCustomerSearch(customer.name);
    }
    setShowCustomerDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedCustomerId) {
      setError('Pilih nasabah terlebih dahulu');
      return;
    }
    if (!subject.trim()) {
      setError('Subjek harus diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate due date
      const dueAt = new Date();
      dueAt.setHours(dueAt.getHours() + calculatedSLA.responseHours);

      // Create case
      createCase({
        customer_id: selectedCustomerId,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        sla: {
          response_hours: calculatedSLA.responseHours,
          resolution_hours: calculatedSLA.resolutionHours,
          due_at: dueAt.toISOString()
        }
      });

      // Reset form and close
      setSelectedCustomerId('');
      setCustomerSearch('');
      setCategory('OTHER');
      setPriority('MEDIUM');
      setSubject('');
      setDescription('');
      onClose();
    } catch {
      setError('Gagal membuat case. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when closing
  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={handleClose} />
      
      {/* Drawer */}
      <div className="drawer drawer-right">
        {/* Header */}
        <div className="drawer-header">
          <h2>Buat Case Baru</h2>
          <button className="drawer-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="drawer-body">
          {error && (
            <div className="drawer-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Customer Selector */}
          <div className="drawer-field">
            <label>Nasabah *</label>
            <div className="customer-selector">
              <div className="customer-search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Cari nama atau CIF..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                    if (!e.target.value) setSelectedCustomerId('');
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                />
              </div>
              
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="customer-dropdown">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      className={`customer-option ${selectedCustomerId === customer.id ? 'selected' : ''}`}
                      onClick={() => handleSelectCustomer(customer.id)}
                    >
                      <User size={14} />
                      <span className="customer-option-name">{customer.name}</span>
                      <span className="customer-option-cif">{customer.cif}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="selected-customer-badge">
                <User size={14} />
                <span>{selectedCustomer.name}</span>
                <span className="cif">{selectedCustomer.cif}</span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="drawer-field">
            <label>Kategori *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CaseCategory)}
              className="drawer-select"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="drawer-field">
            <label>Prioritas *</label>
            <div className="priority-buttons">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as CasePriority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-btn priority-${p.toLowerCase()} ${priority === p ? 'active' : ''}`}
                  onClick={() => setPriority(p)}
                >
                  {p === 'LOW' && 'Rendah'}
                  {p === 'MEDIUM' && 'Sedang'}
                  {p === 'HIGH' && 'Tinggi'}
                  {p === 'CRITICAL' && 'Kritis'}
                </button>
              ))}
            </div>
          </div>

          {/* Auto SLA Display */}
          <div className="sla-preview">
            <Clock size={14} />
            <span>SLA Otomatis: <strong>{calculatedSLA.responseHours} jam</strong> response, <strong>{calculatedSLA.resolutionHours} jam</strong> resolusi</span>
          </div>

          {/* Subject */}
          <div className="drawer-field">
            <label>Subjek *</label>
            <input
              type="text"
              placeholder="Deskripsi singkat masalah..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="drawer-input"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="drawer-field">
            <label>Deskripsi</label>
            <textarea
              placeholder="Detail masalah nasabah..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="drawer-textarea"
              rows={4}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="drawer-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Batal
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCustomerId || !subject.trim()}
          >
            {isSubmitting ? 'Menyimpan...' : 'Buat Case'}
          </button>
        </div>
      </div>
    </>
  );
}
