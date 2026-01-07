---
description: Context dan instruksi untuk melanjutkan development CRM Bank Sumut
---

# CRM Bank Sumut - Project Context

## 📋 Tentang Proyek

**Nama**: CRM Bank Sumut Prototype
**Stack**: Vite + React + TypeScript
**Tujuan**: Proof of Concept CRM untuk Bank Sumut dengan fitur Customer 360, Case Management, Marketing, dan Sales

## 📁 Struktur Penting

```
e:\Prototype CRM Bank Sumut\
├── src/
│   ├── data/seed.ts          # Seed data (44 branches, customers, cases, dll)
│   ├── types/index.ts        # Type definitions
│   ├── components/           # UI components
│   ├── pages/                # Page components
│   └── App.tsx               # Main app
├── implementation-roadmap.md # Roadmap & backlog fitur
├── pedoman crm.md            # Pedoman/guidelines CRM
├── data-jaringan-bank-sumut.md # Data real jaringan Bank Sumut
└── crm itu dibagi..._.md     # Framework teori CRM
```

## ✅ Fitur yang Sudah Diimplementasi

1. **Customer 360 Lite** - Search, Profile, Timeline, Tabs
2. **Case Management** - Create, Assign, SLA tracking, Final Response
3. **Marketing Campaigns** - Segment rule-based, Eligibility check, Consent gating
4. **Sales** - Lead board kanban, RM Activity logging
5. **RBAC** - 7 roles (DIRECTOR, SUPERVISOR, AGENT, RM, MARKETING, COMPLIANCE, ADMIN)
6. **Data Masking** - NIK, Phone, Email masked by role
7. **Audit Log** - Event tracking, Filter, CSV export
8. **44 Real Branches** - Data dari website Bank Sumut

## 📌 Backlog Prioritas (dari implementation-roadmap.md)

### HIGH Priority
1. RFM Analysis + CLV Proxy
2. Hyperlocal Merchant Recommendation
3. Service Recovery Automation
4. NBA (Next Best Action)
5. Consent Change by CS/Agent
6. Marketing Automation (Visual)

### MEDIUM Priority
7. Rule-Based Alerts
8. Lead Scoring
9. NPS/CSAT Survey
10. Opportunity Pipeline

### LOW Priority
11. Root Cause Tag + Dashboard
12. RM Copilot 30 Detik
13. Knowledge Base / FAQ

## 🎯 Urutan Implementasi yang Disarankan

1. **Rule-Based Alerts** (2-3 jam) - Paling mudah, UI badges
2. **Consent Change** (4-6 jam) - Modal form + audit
3. **RFM Analysis** (4-6 jam) - Scoring + badges
4. **Lead Scoring** (3-4 jam) - Rule-based
5. **NBA Basic** (1 hari) - Rule engine + panel

## 📚 Dokumen Referensi

- **`implementation-roadmap.md`** - Roadmap lengkap dengan data models dan UI specs
- **`pedoman crm.md`** - Guidelines, user stories, RBAC, database schema
- **`data-jaringan-bank-sumut.md`** - Data 44 cabang Bank Sumut

## 🔧 Cara Menjalankan

```bash
cd "e:\Prototype CRM Bank Sumut"
npm run dev
```

Dev server berjalan di http://localhost:5173

## 📝 Catatan Penting

1. **Branch IDs** menggunakan format: `branch-medan`, `branch-binjai`, `branch-kabanjahe`, dll
2. **Branch types**: HEAD_OFFICE, COORDINATOR, BRANCH, BRANCH_SYARIAH
3. **Customer segments**: MASS, EMERGING, PRIORITY, PRIVATE
4. **Case categories**: TRX_FAIL, CARD_ATM, DIGITAL_ACCESS, FRAUD_SCAM, FEE_ADMIN, LOAN_CREDIT, OTHER

## 💡 Contoh Prompt untuk Melanjutkan

- "Implementasikan fitur Rule-Based Alerts sesuai implementation-roadmap.md"
- "Tambahkan RFM Analysis dengan badge di Customer 360"
- "Buat modal Consent Change untuk CS/Agent"
- "Lihat backlog priority HIGH di implementation-roadmap.md"

## 🏦 Data Bank Sumut

- **Kantor Pusat**: 1 (Medan)
- **KC Koordinator**: 3 (Medan, P. Siantar, P. Sidempuan)
- **KC Konvensional**: 34
- **KC Syariah**: 6
- **ATM**: 354 unit + 40,000+ ATM Bersama
- **Cakupan**: 33 Kabupaten/Kota Sumut + Jakarta, Batam, Pekanbaru
