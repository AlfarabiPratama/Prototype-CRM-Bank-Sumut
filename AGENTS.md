# AGENTS.md — Aturan Kerja AI untuk Repo CRM Bank Sumut (PoC)

Dokumen ini berisi instruksi permanen untuk *semua* AI agent/chat yang bekerja di repo ini.
Tujuan utamanya: hasil konsisten tanpa perlu mengulang ketentuan di setiap chat.

## 0) Konteks Proyek
Kita membangun **prototype (PoC) CRM Bank Sumut** untuk demo internal.
Fokus utama:
- **Customer 360** (fondasi)
- **Complaint/Case Management end-to-end** (SLA + guardrail final response)
- **Consent-aware Marketing** (segment/campaign) + eligibility reason
- **Sales handoff** (lead untuk RM) + RM activity
- **Audit log** untuk aksi penting
- **RBAC + Scope** (Branch/Portfolio) + masking data sensitif

Semua data **dummy/mock** (in-memory/seed). Tidak ada integrasi core banking nyata.

## 1) Aturan Keras (Non-negotiable)
1. **JANGAN** membuat project baru atau mengubah struktur repo secara drastis.
2. **JANGAN** menambahkan backend sungguhan. Semua simulasi di frontend (mock store).
3. **RBAC + scope enforcement wajib di policy layer**, bukan hanya menyembunyikan tombol.
4. **Masking default** untuk data sensitif (NIK/ACCOUNT/phone/email) berdasarkan role.
5. **Audit log wajib** untuk event minimum:
   - SEARCH_CUSTOMER
   - VIEW_PROFILE
   - CREATE_CASE
   - UPDATE_CASE
   - ASSIGN_CASE
   - FINAL_RESPONSE
   - CLOSE_CASE
   - CHANGE_CONSENT
   - EXPORT_DATA
   - CHANGE_RBAC
   - CHANGE_WORKFLOW
6. **Guardrail wajib**:
   - Case **tidak boleh CLOSED** jika `final_response` kosong/null.
   - Campaign eligibility: customer dengan consent MARKETING = WITHDRAWN → **INELIGIBLE** dengan `ineligible_reason = "CONSENT"`.
7. Default policy: **deny-by-default** (jika tidak ada izin eksplisit → tolak).
8. Jangan pernah memasukkan secret/API key ke repo.

## 2) Struktur Folder (Disarankan)
Gunakan struktur feature-based:
- `src/app` (router, layout, providers)
- `src/features/{customers,cases,marketing,sales,audit,admin}`
- `src/shared` (components + lib + types)
- `src/store` (global store)
- `src/data/seed.ts`

## 3) Routing Wajib (Demo 7–10 menit)
- `/` Dashboard ringkas
- `/customers` Customer Search
- `/customers/:id` Customer 360 (tabs: Timeline, Cases, Marketing, Sales)
- `/cases` Case Queue
- `/cases/:id` Case Detail
- `/marketing` Segments & Campaigns (consent-aware eligibility)
- `/sales` Leads board + RM Activities
- `/audit` Audit viewer + export simulasi
- `/admin` Role/scope config sederhana untuk demo

## 4) Role & Scope (Ringkas)
Role minimal: DIRECTOR, SUPERVISOR, AGENT, RM, MARKETING, COMPLIANCE, ADMIN.

Scope:
- Branch-scope: SUPERVISOR/AGENT melihat customer & case hanya pada cabang dalam `branchScopes`.
- Portfolio-scope: RM melihat customer hanya pada `portfolioCustomerIds` dan lead hanya `assigned_to_user_id == userId`.
- DIRECTOR: hanya agregat (tanpa detail nasabah).
- MARKETING: tidak boleh mengubah consent; akses customer hanya konteks eligibility list (masked).
- COMPLIANCE: audit-centric (audit view/export), akses customer sebaiknya masked-by-default.

## 5) Seed Data Minimal (WAJIB ADA)
Customers:
A) Customer A: consent MARKETING = WITHDRAWN, tidak ada open case.
B) Customer B: consent MARKETING = GRANTED, eligible campaign, masuk portfolio RM, bisa jadi lead.
C) Customer C: ada case FRAUD_SCAM status IN_PROGRESS (sensitif).
   Policy demo: ineligible campaign karena CASE_ACTIVE (meski consent GRANTED).

Case categories v1:
TRX_FAIL, CARD_ATM, DIGITAL_ACCESS, FRAUD_SCAM, FEE_ADMIN, LOAN_CREDIT, OTHER

Users minimal:
DIRECTOR, SUPERVISOR (branch tertentu), AGENT (branch sama), RM (portfolio B), MARKETING, COMPLIANCE (+ ADMIN opsional).

## 6) Cara Kerja Saat Kamu Diminta Mengubah Kode
- Kerjakan **incremental** (langkah kecil), jangan sekali besar.
- Setiap jawaban:
  1) Plan singkat (≤ 8 bullet)
  2) Daftar file yang diubah/ditambah
  3) Patch/isi kode siap copy-paste per file
  4) How to verify (langkah klik UI)
- Hindari TODO untuk hal krusial (policy, audit, guardrail, eligibility reason).

## 7) Konvensi Kode
- TypeScript: hindari `any` (pakai union/unknown + narrowing).
- Komponen: kecil & reusable. Logic bisnis di `shared/lib` atau store.
- Naming: `PascalCase` untuk komponen, `camelCase` untuk fungsi.
- UI: tetap “bank enterprise vibe”, clean, responsif desktop.
