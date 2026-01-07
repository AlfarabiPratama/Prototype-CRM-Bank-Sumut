// ==========================================
// Seed Data for CRM Bank Sumut Demo
// ==========================================

import type { 
  User, 
  Branch, 
  Customer, 
  Case, 
  Segment, 
  Campaign,
  CampaignEligibility,
  Lead,
  RMActivity,
  CustomerAssignment,
  AuditLog 
} from '../types';
import type { RFMScore } from '../lib/rfm';
import type { NBARecommendation } from '../lib/nba';

// === BRANCHES (Real Bank Sumut Data) ===
// Source: https://www.banksumut.co.id/jaringan-kantor-atm/
// Total: 1 HQ + 3 Coordinator + 34 Conventional + 6 Syariah = 44 branches
export const seedBranches: Branch[] = [
  // Kantor Pusat
  { id: 'branch-ho', name: 'Kantor Pusat Medan', code: 'HO-MEDAN', city: 'MEDAN', type: 'HEAD_OFFICE' },
  
  // Kantor Cabang Koordinator (3)
  { id: 'branch-kck-medan', name: 'KC Koordinator Medan', code: 'KCK-MEDAN', city: 'MEDAN', type: 'COORDINATOR' },
  { id: 'branch-kck-siantar', name: 'KC Koordinator Pematang Siantar', code: 'KCK-SIANTAR', city: 'PEMATANG_SIANTAR', type: 'COORDINATOR' },
  { id: 'branch-kck-padsid', name: 'KC Koordinator Padang Sidempuan', code: 'KCK-PADSID', city: 'PADANG_SIDEMPUAN', type: 'COORDINATOR' },
  
  // Kantor Cabang Konvensional (34)
  { id: 'branch-medan', name: 'KC Medan', code: 'KC-MEDAN', city: 'MEDAN', type: 'BRANCH' },
  { id: 'branch-siantar', name: 'KC Pematang Siantar', code: 'KC-SIANTAR', city: 'PEMATANG_SIANTAR', type: 'BRANCH' },
  { id: 'branch-padsid', name: 'KC Padang Sidempuan', code: 'KC-PADSID', city: 'PADANG_SIDEMPUAN', type: 'BRANCH' },
  { id: 'branch-rantaup', name: 'KC Rantau Prapat', code: 'KC-RANTAUP', city: 'RANTAU_PRAPAT', type: 'BRANCH' },
  { id: 'branch-balige', name: 'KC Balige', code: 'KC-BALIGE', city: 'BALIGE', type: 'BRANCH' },
  { id: 'branch-kabanjahe', name: 'KC Kabanjahe', code: 'KC-KABANJAHE', city: 'KABANJAHE', type: 'BRANCH' },
  { id: 'branch-tbtinggi', name: 'KC Tebing Tinggi', code: 'KC-TBTINGGI', city: 'TEBING_TINGGI', type: 'BRANCH' },
  { id: 'branch-lubpak', name: 'KC Lubuk Pakam', code: 'KC-LUBPAK', city: 'LUBUK_PAKAM', type: 'BRANCH' },
  { id: 'branch-binjai', name: 'KC Binjai', code: 'KC-BINJAI', city: 'BINJAI', type: 'BRANCH' },
  { id: 'branch-tjbalai', name: 'KC Tanjung Balai', code: 'KC-TJBALAI', city: 'TANJUNG_BALAI', type: 'BRANCH' },
  { id: 'branch-kisaran', name: 'KC Kisaran', code: 'KC-KISARAN', city: 'KISARAN', type: 'BRANCH' },
  { id: 'branch-sidikalang', name: 'KC Sidikalang', code: 'KC-SIDIKALANG', city: 'SIDIKALANG', type: 'BRANCH' },
  { id: 'branch-salak', name: 'KC Salak', code: 'KC-SALAK', city: 'SALAK', type: 'BRANCH' },
  { id: 'branch-sibolga', name: 'KC Sibolga', code: 'KC-SIBOLGA', city: 'SIBOLGA', type: 'BRANCH' },
  { id: 'branch-tarutung', name: 'KC Tarutung', code: 'KC-TARUTUNG', city: 'TARUTUNG', type: 'BRANCH' },
  { id: 'branch-stabat', name: 'KC Stabat', code: 'KC-STABAT', city: 'STABAT', type: 'BRANCH' },
  { id: 'branch-panyab', name: 'KC Panyabungan', code: 'KC-PANYAB', city: 'PANYABUNGAN', type: 'BRANCH' },
  { id: 'branch-gsitoli', name: 'KC Gunung Sitoli', code: 'KC-GSITOLI', city: 'GUNUNG_SITOLI', type: 'BRANCH' },
  { id: 'branch-pandan', name: 'KC Pandan', code: 'KC-PANDAN', city: 'PANDAN', type: 'BRANCH' },
  { id: 'branch-limapuluh', name: 'KC Lima Puluh', code: 'KC-LIMAPULUH', city: 'LIMA_PULUH', type: 'BRANCH' },
  { id: 'branch-seirampah', name: 'KC Sei Rampah', code: 'KC-SEIRAMPAH', city: 'SEI_RAMPAH', type: 'BRANCH' },
  { id: 'branch-sipirok', name: 'KC Sipirok', code: 'KC-SIPIROK', city: 'SIPIROK', type: 'BRANCH' },
  { id: 'branch-aekkanopan', name: 'KC Aek Kanopan', code: 'KC-AEKKANOPAN', city: 'AEK_KANOPAN', type: 'BRANCH' },
  { id: 'branch-kotapinang', name: 'KC Kota Pinang', code: 'KC-KOTAPINANG', city: 'KOTA_PINANG', type: 'BRANCH' },
  { id: 'branch-gtua', name: 'KC Gunung Tua', code: 'KC-GTUA', city: 'GUNUNG_TUA', type: 'BRANCH' },
  { id: 'branch-sibuhuan', name: 'KC Sibuhuan', code: 'KC-SIBUHUAN', city: 'SIBUHUAN', type: 'BRANCH' },
  { id: 'branch-samosir', name: 'KC Samosir', code: 'KC-SAMOSIR', city: 'PANGURURAN', type: 'BRANCH' },
  { id: 'branch-sunggal', name: 'KC Sunggal', code: 'KC-SUNGGAL', city: 'SUNGGAL', type: 'BRANCH' },
  { id: 'branch-tjmorawa', name: 'KC Tanjung Morawa', code: 'KC-TJMORAWA', city: 'TANJUNG_MORAWA', type: 'BRANCH' },
  { id: 'branch-perdagangan', name: 'KC Perdagangan', code: 'KC-PERDAGANGAN', city: 'PERDAGANGAN', type: 'BRANCH' },
  { id: 'branch-doloksanggul', name: 'KC Dolok Sanggul', code: 'KC-DOLOKSANGGUL', city: 'DOLOK_SANGGUL', type: 'BRANCH' },
  
  // Kantor Cabang Luar Sumatera Utara (3)
  { id: 'branch-jaksel', name: 'KC Jakarta Selatan', code: 'KC-JAKSEL', city: 'JAKARTA_SELATAN', type: 'BRANCH' },
  { id: 'branch-batam', name: 'KC Batam', code: 'KC-BATAM', city: 'BATAM', type: 'BRANCH' },
  { id: 'branch-pekanbaru', name: 'KC Pekanbaru', code: 'KC-PEKANBARU', city: 'PEKANBARU', type: 'BRANCH' },
  
  // Kantor Cabang Syariah (6)
  { id: 'branch-kcs-medan', name: 'KCS Medan', code: 'KCS-MEDAN', city: 'MEDAN', type: 'BRANCH_SYARIAH' },
  { id: 'branch-kcs-siantar', name: 'KCS Pematang Siantar', code: 'KCS-SIANTAR', city: 'PEMATANG_SIANTAR', type: 'BRANCH_SYARIAH' },
  { id: 'branch-kcs-padsid', name: 'KCS Padang Sidempuan', code: 'KCS-PADSID', city: 'PADANG_SIDEMPUAN', type: 'BRANCH_SYARIAH' },
  { id: 'branch-kcs-stabat', name: 'KCS Stabat', code: 'KCS-STABAT', city: 'STABAT', type: 'BRANCH_SYARIAH' },
  { id: 'branch-kcs-sibolga', name: 'KCS Sibolga', code: 'KCS-SIBOLGA', city: 'SIBOLGA', type: 'BRANCH_SYARIAH' },
  { id: 'branch-kcs-rantaup', name: 'KCS Rantau Prapat', code: 'KCS-RANTAUP', city: 'RANTAU_PRAPAT', type: 'BRANCH_SYARIAH' },
];

// === USERS ===
export const seedUsers: User[] = [
  // DIRECTOR - no branch scope
  {
    id: 'user-director',
    name: 'Budi Santoso',
    email: 'budi.santoso@banksumut.co.id',
    role: 'DIRECTOR',
    branch_id: null,
  },
  // SUPERVISOR - Medan branch
  {
    id: 'user-supervisor',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@banksumut.co.id',
    role: 'SUPERVISOR',
    branch_id: 'branch-medan',
  },
  // AGENT - Medan branch
  {
    id: 'user-agent',
    name: 'Ahmad Ridwan',
    email: 'ahmad.ridwan@banksumut.co.id',
    role: 'AGENT',
    branch_id: 'branch-medan',
  },
  // RM - Medan branch with portfolio
  {
    id: 'user-rm',
    name: 'Sari Indah',
    email: 'sari.indah@banksumut.co.id',
    role: 'RM',
    branch_id: 'branch-medan',
    portfolio_customer_ids: ['cust-002'], // Customer B
  },
  // MARKETING - no branch scope
  {
    id: 'user-marketing',
    name: 'Rini Handayani',
    email: 'rini.handayani@banksumut.co.id',
    role: 'MARKETING',
    branch_id: null,
  },
  // COMPLIANCE - no branch scope
  {
    id: 'user-compliance',
    name: 'Hendra Wijaya',
    email: 'hendra.wijaya@banksumut.co.id',
    role: 'COMPLIANCE',
    branch_id: null,
  },
  // ADMIN
  {
    id: 'user-admin',
    name: 'System Admin',
    email: 'admin@banksumut.co.id',
    role: 'ADMIN',
    branch_id: null,
  },
];

// === CUSTOMERS ===
export const seedCustomers: Customer[] = [
  // Customer A: consent MARKETING=WITHDRAWN, tidak ada open case
  {
    id: 'cust-001',
    cif: 'CIF001234567',
    name: 'Andi Pratama',
    nik: '1271012345670001',
    email: 'andi.pratama@email.com',
    phone: '081234567001',
    account_numbers: ['1234567890', '1234567891'],
    branch_id: 'branch-medan',
    segment: 'MASS',
    consent: {
      marketing: 'WITHDRAWN',
      data_sharing: 'GRANTED',
      updated_at: '2024-06-15T10:30:00Z',
      updated_by: 'user-admin',
    },
    created_at: '2020-03-15T08:00:00Z',
  },
  // Customer B: consent MARKETING=GRANTED, eligible campaign, bisa jadi lead
  {
    id: 'cust-002',
    cif: 'CIF001234568',
    name: 'Budi Setiawan',
    nik: '1271012345670002',
    email: 'budi.setiawan@email.com',
    phone: '081234567002',
    account_numbers: ['2234567890'],
    branch_id: 'branch-medan',
    segment: 'PRIORITY',
    consent: {
      marketing: 'GRANTED',
      data_sharing: 'GRANTED',
      updated_at: '2024-01-10T09:00:00Z',
      updated_by: 'user-admin',
    },
    created_at: '2019-07-20T10:00:00Z',
  },
  // Customer C: punya case FRAUD_SCAM status IN_PROGRESS (sensitif)
  {
    id: 'cust-003',
    cif: 'CIF001234569',
    name: 'Citra Dewi Anggraini',
    nik: '1271012345670003',
    email: 'citra.dewi@email.com',
    phone: '081234567003',
    account_numbers: ['3234567890', '3234567891', '3234567892'],
    branch_id: 'branch-medan',
    segment: 'EMERGING',
    consent: {
      marketing: 'GRANTED',
      data_sharing: 'GRANTED',
      updated_at: '2024-03-05T14:00:00Z',
      updated_by: 'user-admin',
    },
    created_at: '2021-11-10T11:00:00Z',
  },
  // Additional customers for richer demo
  {
    id: 'cust-004',
    cif: 'CIF001234570',
    name: 'Diana Putri',
    nik: '1271012345670004',
    email: 'diana.putri@email.com',
    phone: '081234567004',
    account_numbers: ['4234567890'],
    branch_id: 'branch-binjai', // Different branch (Binjai)
    segment: 'MASS',
    consent: {
      marketing: 'GRANTED',
      data_sharing: 'GRANTED',
      updated_at: '2024-02-20T08:00:00Z',
      updated_by: 'user-admin',
    },
    created_at: '2022-05-18T09:00:00Z',
  },
  {
    id: 'cust-005',
    cif: 'CIF001234571',
    name: 'Eko Prasetyo',
    nik: '1271012345670005',
    email: 'eko.prasetyo@email.com',
    phone: '081234567005',
    account_numbers: ['5234567890'],
    branch_id: 'branch-medan',
    segment: 'PRIVATE',
    consent: {
      marketing: 'GRANTED',
      data_sharing: 'WITHDRAWN',
      updated_at: '2024-04-10T16:00:00Z',
      updated_by: 'user-admin',
    },
    created_at: '2018-02-14T07:00:00Z',
  },
];

// === CASES ===
export const seedCases: Case[] = [
  // Customer C active FRAUD_SCAM case
  {
    id: 'case-001',
    case_number: 'CS-2024-0001',
    customer_id: 'cust-003',
    category: 'FRAUD_SCAM',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    subject: 'Transaksi mencurigakan pada rekening',
    description: 'Nasabah melaporkan adanya transaksi yang tidak dikenali senilai Rp 5.000.000 pada tanggal 20 Desember 2024.',
    assigned_to: 'user-agent',
    branch_id: 'branch-medan',
    sla: {
      response_hours: 1,
      resolution_hours: 8,
      due_at: '2024-12-24T08:00:00Z',
    },
    final_response: null,
    created_by: 'user-agent',
    created_at: '2024-12-23T00:00:00Z',
    updated_at: '2024-12-23T02:00:00Z',
    closed_at: null,
  },
  // Closed case for history
  {
    id: 'case-002',
    case_number: 'CS-2024-0002',
    customer_id: 'cust-002',
    category: 'CARD_ATM',
    priority: 'MEDIUM',
    status: 'CLOSED',
    subject: 'Kartu ATM tertelan mesin',
    description: 'Kartu ATM nasabah tertelan di mesin ATM cabang Medan pada tanggal 15 Desember 2024.',
    assigned_to: 'user-agent',
    branch_id: 'branch-medan',
    sla: {
      response_hours: 8,
      resolution_hours: 48,
      due_at: '2024-12-17T10:00:00Z',
    },
    final_response: 'Kartu ATM telah ditemukan dan dikembalikan ke nasabah. Kartu dalam kondisi baik.',
    created_by: 'user-agent',
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-16T14:00:00Z',
    closed_at: '2024-12-16T14:00:00Z',
  },
  // Open case waiting assignment
  {
    id: 'case-003',
    case_number: 'CS-2024-0003',
    customer_id: 'cust-005',
    category: 'DIGITAL_ACCESS',
    priority: 'MEDIUM',
    status: 'OPEN',
    subject: 'Tidak bisa login Mobile Banking',
    description: 'Nasabah tidak dapat login ke aplikasi Mobile Banking sejak update terakhir.',
    assigned_to: null,
    branch_id: 'branch-medan',
    sla: {
      response_hours: 8,
      resolution_hours: 48,
      due_at: '2024-12-25T10:00:00Z',
    },
    final_response: null,
    created_by: 'user-supervisor',
    created_at: '2024-12-23T10:00:00Z',
    updated_at: '2024-12-23T10:00:00Z',
    closed_at: null,
  },
];

// === SEGMENTS ===
export const seedSegments: Segment[] = [
  {
    id: 'segment-001',
    name: 'Priority Customers',
    description: 'Nasabah dengan segmen Priority dan Private',
    rules: [
      { field: 'segment', operator: 'in', value: ['PRIORITY', 'PRIVATE'] },
    ],
    created_by: 'user-marketing',
    created_at: '2024-12-01T09:00:00Z',
  },
  {
    id: 'segment-002',
    name: 'Active Mass Segment',
    description: 'Nasabah Mass dengan aktivitas transaksi',
    rules: [
      { field: 'segment', operator: 'eq', value: 'MASS' },
    ],
    created_by: 'user-marketing',
    created_at: '2024-12-10T10:00:00Z',
  },
];

// === CAMPAIGNS ===
export const seedCampaigns: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'Promo Deposito Akhir Tahun',
    description: 'Penawaran suku bunga spesial deposito untuk nasabah prioritas',
    segment_id: 'segment-001',
    status: 'APPROVED',
    channel: 'EMAIL',
    scheduled_at: '2024-12-25T08:00:00Z',
    executed_at: null,
    created_by: 'user-marketing',
    created_at: '2024-12-15T09:00:00Z',
  },
  {
    id: 'campaign-002',
    name: 'Upgrade Kartu Kredit',
    description: 'Penawaran upgrade kartu kredit dengan limit lebih tinggi',
    segment_id: 'segment-001',
    status: 'DRAFT',
    channel: 'WHATSAPP',
    scheduled_at: null,
    executed_at: null,
    created_by: 'user-marketing',
    created_at: '2024-12-20T11:00:00Z',
  },
];

// === CAMPAIGN ELIGIBILITIES (pre-calculated for demo) ===
export const seedCampaignEligibilities: CampaignEligibility[] = [
  // Customer A - ineligible due to CONSENT
  {
    customer_id: 'cust-001',
    campaign_id: 'campaign-001',
    eligible: false,
    ineligible_reason: 'CONSENT',
    evaluated_at: '2024-12-23T00:00:00Z',
  },
  // Customer B - eligible
  {
    customer_id: 'cust-002',
    campaign_id: 'campaign-001',
    eligible: true,
    ineligible_reason: null,
    evaluated_at: '2024-12-23T00:00:00Z',
  },
  // Customer C - ineligible due to CASE_ACTIVE
  {
    customer_id: 'cust-003',
    campaign_id: 'campaign-001',
    eligible: false,
    ineligible_reason: 'CASE_ACTIVE',
    evaluated_at: '2024-12-23T00:00:00Z',
  },
  // Customer E - eligible (PRIVATE segment, consent OK, no active case)
  {
    customer_id: 'cust-005',
    campaign_id: 'campaign-001',
    eligible: true,
    ineligible_reason: null,
    evaluated_at: '2024-12-23T00:00:00Z',
  },
];

// === LEADS ===
export const seedLeads: Lead[] = [
  {
    id: 'lead-001',
    customer_id: 'cust-002',
    campaign_id: 'campaign-001',
    assigned_to: 'user-rm',
    status: 'NEW',
    product_interest: 'Deposito Berjangka',
    notes: 'Nasabah menunjukkan minat pada deposito 12 bulan.',
    created_at: '2024-12-22T10:00:00Z',
    updated_at: '2024-12-22T10:00:00Z',
  },
  {
    id: 'lead-002',
    customer_id: 'cust-005',
    campaign_id: null,
    assigned_to: 'user-rm',
    status: 'CONTACTED',
    product_interest: 'Kredit Usaha Mikro',
    notes: 'Walk-in customer, butuh modal kerja untuk UMKM.',
    created_at: '2024-12-20T09:00:00Z',
    updated_at: '2024-12-21T14:00:00Z',
  },
  {
    id: 'lead-003',
    customer_id: 'cust-004',
    campaign_id: 'campaign-001',
    assigned_to: 'user-rm',
    status: 'QUALIFIED',
    product_interest: 'KPR Griya Sumut',
    notes: 'Sudah verifikasi dokumen. Penghasilan memenuhi syarat.',
    created_at: '2024-12-15T11:00:00Z',
    updated_at: '2024-12-20T15:00:00Z',
  },
  {
    id: 'lead-004',
    customer_id: 'cust-002',
    campaign_id: 'campaign-001',
    assigned_to: 'user-rm',
    status: 'PROPOSAL',
    product_interest: 'Tabungan Martabe',
    notes: 'Sedang review proposal, menunggu keputusan.',
    created_at: '2024-12-10T09:00:00Z',
    updated_at: '2024-12-22T10:00:00Z',
  },
  {
    id: 'lead-005',
    customer_id: 'cust-001',
    campaign_id: null,
    assigned_to: 'user-rm',
    status: 'LOST',
    product_interest: 'Kartu Kredit',
    notes: 'Nasabah tidak tertarik, sudah punya kartu kredit lain.',
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-05T11:00:00Z',
  },
];

// === RM ACTIVITIES ===
export const seedRMActivities: RMActivity[] = [
  {
    id: 'rmact-001',
    customer_id: 'cust-002',
    lead_id: 'lead-001',
    rm_id: 'user-rm',
    type: 'CALL',
    subject: 'Follow-up Deposito',
    notes: 'Menghubungi nasabah untuk menjelaskan promo deposito. Nasabah meminta waktu untuk berpikir.',
    created_at: '2024-12-22T14:00:00Z',
  },
  {
    id: 'rmact-002',
    customer_id: 'cust-005',
    lead_id: 'lead-002',
    rm_id: 'user-rm',
    type: 'MEETING',
    subject: 'Diskusi KUM',
    notes: 'Meeting untuk membahas kebutuhan modal kerja, nasabah minta proposal.',
    created_at: '2024-12-21T10:00:00Z',
  },
  {
    id: 'rmact-003',
    customer_id: 'cust-005',
    lead_id: 'lead-002',
    rm_id: 'user-rm',
    type: 'CALL',
    subject: 'Initial Contact',
    notes: 'Telepon pertama untuk follow-up dari walk-in.',
    created_at: '2024-12-20T14:00:00Z',
  },
  {
    id: 'rmact-004',
    customer_id: 'cust-004',
    lead_id: 'lead-003',
    rm_id: 'user-rm',
    type: 'VISIT',
    subject: 'Survey Lokasi KPR',
    notes: 'Kunjungan ke rumah yang akan dibeli untuk verifikasi.',
    created_at: '2024-12-18T09:00:00Z',
  },
  {
    id: 'rmact-005',
    customer_id: 'cust-004',
    lead_id: 'lead-003',
    rm_id: 'user-rm',
    type: 'EMAIL',
    subject: 'Dokumen KPR',
    notes: 'Kirim email daftar dokumen yang dibutuhkan.',
    created_at: '2024-12-16T08:00:00Z',
  },
  {
    id: 'rmact-006',
    customer_id: 'cust-002',
    lead_id: 'lead-004',
    rm_id: 'user-rm',
    type: 'MEETING',
    subject: 'Presentasi Proposal',
    notes: 'Presentasi lengkap produk Tabungan Martabe.',
    created_at: '2024-12-21T15:00:00Z',
  },
];

// === CUSTOMER ASSIGNMENTS (RM Portfolio) ===
export const seedCustomerAssignments: CustomerAssignment[] = [
  {
    id: 'assign-001',
    customer_id: 'cust-002',
    rm_id: 'user-rm',
    assigned_at: '2024-01-15T09:00:00Z',
    is_active: true,
  },
  {
    id: 'assign-002',
    customer_id: 'cust-005',
    rm_id: 'user-rm',
    assigned_at: '2024-03-20T10:00:00Z',
    is_active: true,
  },
];

// === AUDIT LOGS (seed with some history) ===
export const seedAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2024-12-23T00:00:00Z',
    user_id: 'user-agent',
    user_name: 'Ahmad Ridwan',
    user_role: 'AGENT',
    event: 'CREATE_CASE',
    entity_type: 'CASE',
    entity_id: 'case-001',
    details: { case_number: 'CS-2024-0001', category: 'FRAUD_SCAM' },
    ip_address: '192.168.1.100',
  },
  {
    id: 'audit-002',
    timestamp: '2024-12-22T10:00:00Z',
    user_id: 'user-marketing',
    user_name: 'Rini Handayani',
    user_role: 'MARKETING',
    event: 'CREATE_LEAD',
    entity_type: 'LEAD',
    entity_id: 'lead-001',
    details: { customer_id: 'cust-002', product: 'Deposito Berjangka' },
    ip_address: '192.168.1.101',
  },
  {
    id: 'audit-003',
    timestamp: '2024-12-22T14:00:00Z',
    user_id: 'user-rm',
    user_name: 'Sari Indah',
    user_role: 'RM',
    event: 'CREATE_RM_ACTIVITY',
    entity_type: 'CUSTOMER',
    entity_id: 'cust-002',
    details: { type: 'CALL', subject: 'Follow-up Deposito' },
    ip_address: '192.168.1.102',
  },
];

// === RFM SCORES ===
// Pre-calculated RFM scores for demo
// Ruleset Version: v1-poc | Window: static-seed
// Tahap Lanjut: Integrasi dengan Postgres/DWH untuk agregasi transaksi real
export const seedRFMScores: RFMScore[] = [
  // Customer A (cust-001): Low engagement - HIBERNATING
  {
    customer_id: 'cust-001',
    recency_score: 2,
    recency_days: 120,
    frequency_score: 2,
    frequency_count: 8,
    monetary_score: 2,
    monetary_value: 8_500_000,
    total_score: 6,
    segment: 'HIBERNATING',
    clv_proxy: 'LOW',
    segment_reason: 'Recency rendah (>90 hari), Frequency rendah, Monetary rendah → perlu re-engagement',
    ruleset_version: 'v1-poc',
    window_label: 'static-seed',
    calculated_at: '2024-12-23T00:00:00Z',
  },
  // Customer B (cust-002): High value, frequent - CHAMPION
  {
    customer_id: 'cust-002',
    recency_score: 5,
    recency_days: 3,
    frequency_score: 5,
    frequency_count: 65,
    monetary_score: 5,
    monetary_value: 250_000_000,
    total_score: 15,
    segment: 'CHAMPION',
    clv_proxy: 'VERY_HIGH',
    segment_reason: 'Recency tinggi (<=30 hari), Frequency tinggi (>=30 trx), Monetary tinggi (>=50 juta)',
    ruleset_version: 'v1-poc',
    window_label: 'static-seed',
    calculated_at: '2024-12-23T00:00:00Z',
  },
  // Customer C (cust-003): Recent but at risk - POTENTIAL (was AT_RISK)
  {
    customer_id: 'cust-003',
    recency_score: 4,
    recency_days: 15,
    frequency_score: 3,
    frequency_count: 22,
    monetary_score: 3,
    monetary_value: 35_000_000,
    total_score: 10,
    segment: 'POTENTIAL',
    clv_proxy: 'GROWING',
    segment_reason: 'Recency tinggi (<=30 hari), Frequency belum tinggi → potensi untuk ditingkatkan',
    ruleset_version: 'v1-poc',
    window_label: 'static-seed',
    calculated_at: '2024-12-23T00:00:00Z',
  },
  // Customer D (cust-004): New potential - POTENTIAL
  {
    customer_id: 'cust-004',
    recency_score: 5,
    recency_days: 5,
    frequency_score: 2,
    frequency_count: 10,
    monetary_score: 2,
    monetary_value: 12_000_000,
    total_score: 9,
    segment: 'POTENTIAL',
    clv_proxy: 'GROWING',
    segment_reason: 'Recency tinggi (<=30 hari), Frequency belum tinggi → potensi untuk ditingkatkan',
    ruleset_version: 'v1-poc',
    window_label: 'static-seed',
    calculated_at: '2024-12-23T00:00:00Z',
  },
  // Customer E (cust-005): Private segment, loyal - LOYAL
  {
    customer_id: 'cust-005',
    recency_score: 4,
    recency_days: 20,
    frequency_score: 4,
    frequency_count: 42,
    monetary_score: 5,
    monetary_value: 180_000_000,
    total_score: 13,
    segment: 'LOYAL',
    clv_proxy: 'HIGH',
    segment_reason: 'Frequency tinggi (>=30 trx) → customer loyal dengan aktivitas rutin',
    ruleset_version: 'v1-poc',
    window_label: 'static-seed',
    calculated_at: '2024-12-23T00:00:00Z',
  },
];

// === NBA RECOMMENDATIONS ===
// Pre-seeded NBA recommendations for demo
// Generated based on customer context and RFM segments
export const seedNBARecommendations: NBARecommendation[] = [
  // Customer A (cust-001): HIBERNATING - needs re-engagement
  {
    id: 'nba-001',
    customer_id: 'cust-001',
    action_type: 'CALL',
    title: 'Hubungi untuk Retention',
    reason_text: 'Customer segment HIBERNATING dan tidak ada kontak 45 hari → perlu win-back call',
    priority: 'HIGH',
    created_at: '2024-12-23T00:00:00Z',
  },
  // Customer B (cust-002): CHAMPION - offer product
  {
    id: 'nba-002',
    customer_id: 'cust-002',
    action_type: 'OFFER_PRODUCT',
    title: 'Tawarkan Produk Premium',
    reason_text: 'Customer segment CHAMPION dengan consent marketing aktif → peluang upsell produk premium',
    priority: 'MEDIUM',
    related_entity_type: 'CAMPAIGN',
    created_at: '2024-12-23T00:00:00Z',
  },
  // Customer C (cust-003): Has fraud case - educate
  {
    id: 'nba-003',
    customer_id: 'cust-003',
    action_type: 'EDUCATE',
    title: 'Kirim Edukasi Anti-Scam',
    reason_text: 'Customer pernah mengalami kasus fraud/scam → kirimkan materi edukasi keamanan',
    priority: 'LOW',
    created_at: '2024-12-23T00:00:00Z',
  },
  // Customer C also has overdue case
  {
    id: 'nba-004',
    customer_id: 'cust-003',
    action_type: 'PRIORITIZE_CASE',
    title: 'Prioritaskan Penyelesaian Case',
    reason_text: 'Customer memiliki case yang melewati SLA → segera selesaikan untuk menjaga kualitas layanan',
    priority: 'HIGH',
    related_entity_type: 'CASE',
    related_entity_id: 'case-003',
    created_at: '2024-12-23T00:00:00Z',
  },
  // Customer D (cust-004): POTENTIAL - follow up lead
  {
    id: 'nba-005',
    customer_id: 'cust-004',
    action_type: 'FOLLOW_UP_LEAD',
    title: 'Follow Up Lead Segera',
    reason_text: 'Lead sudah 5 hari tanpa follow-up → segera hubungi sebelum expired',
    priority: 'MEDIUM',
    related_entity_type: 'LEAD',
    related_entity_id: 'lead-001',
    created_at: '2024-12-23T00:00:00Z',
  },
  // Customer E (cust-005): LOYAL - offer cross-sell
  {
    id: 'nba-006',
    customer_id: 'cust-005',
    action_type: 'OFFER_PRODUCT',
    title: 'Tawarkan Produk/Fitur Baru',
    reason_text: 'Customer segment LOYAL dengan consent marketing aktif → peluang cross-sell',
    priority: 'MEDIUM',
    related_entity_type: 'CAMPAIGN',
    created_at: '2024-12-23T00:00:00Z',
  },
];
