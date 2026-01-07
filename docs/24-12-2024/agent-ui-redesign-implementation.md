# Agent UI Redesign - Bank-Grade Workspace

## Ringkasan Perubahan

Proyek ini melakukan redesign menyeluruh pada Agent UI untuk CRM Bank Sumut, mengubah tampilan dari gaya "AI tool" menjadi "bank-grade workspace" yang profesional. Perubahan mengadopsi pola desain dari Zendesk Agent Workspace dan Salesforce Service Console, dengan fokus pada efisiensi kerja agent dalam menangani case nasabah.

Implementasi mencakup 7 fase: komponen reusable (SplitView, StatusBadge), Cases split-view dengan 6 views, Case Detail 2-kolom dengan Response Composer, Customer 360 3-kolom dengan tabs, Agent Dashboard workbench dengan queue table, Customers directory dengan table dan filter chips, serta Create Case Drawer untuk pembuatan case tanpa pindah halaman.

---

## Daftar File yang Diubah

### Komponen Baru
| File | Deskripsi |
|------|-----------|
| `src/components/SplitView.tsx` | Layout list + detail panel |
| `src/components/StatusBadge.tsx` | Badge untuk status dan SLA countdown |
| `src/components/ResponseComposer.tsx` | Composer dengan toggle Public/Internal + templates |
| `src/components/CreateCaseDrawer.tsx` | Slide-in drawer untuk buat case baru |

### Halaman Diubah
| File | Perubahan |
|------|-----------|
| `src/pages/CasesPage.tsx` | Split-view layout, 6 Views panel, preview panel |
| `src/pages/CaseDetailPage.tsx` | 2-kolom layout, guardrail modal |
| `src/pages/CustomerDetailPage.tsx` | 3-kolom layout dengan tabs (Overview/Timeline/Cases) |
| `src/pages/CustomersPage.tsx` | Table-based dengan filter chips |
| `src/components/dashboards/AgentDashboard.tsx` | Workbench dengan queue table + shift filters |

### Styling
| File | Perubahan |
|------|-----------|
| `src/styles/features/agent-workspace.css` | ~2,160 baris CSS baru |
| `src/styles/index.css` | Import agent-workspace.css |

---

## Dampak ke Fitur / User

### Agent
- **Cases Page**: Split-view dengan 6 preset views (Antrian Saya, Jatuh Tempo, SLA Warning, dll)
- **Case Detail**: Response Composer dengan toggle Public Reply / Internal Note
- **Dashboard**: Workbench dengan queue table, shift filters, dan quick actions
- **Create Case**: Drawer slide-in dengan auto SLA calculation

### Customer 360
- Layout 3-kolom: profile ringkas (kiri), tabbed content (tengah), alerts (kanan)
- Tabs: Overview (RFM + stats), Timeline, Cases
- Alert otomatis untuk case aktif dan SLA mendekati batas

### UX Improvements
- Indonesian microcopy di seluruh UI
- Guardrail: Case tidak bisa ditutup tanpa "Tanggapan Akhir"
- URL state: View dan selected case tersimpan di query string

---

## Catatan Verifikasi

### Cases Split-View
1. Buka `http://localhost:5173/cases`
2. Pastikan Views panel muncul dengan 6 opsi dan badge count
3. Klik case → Preview panel muncul di kanan
4. Klik "Buka Detail" → Navigasi ke case detail
5. Klik tombol "+ Baru" → Drawer muncul dari kanan

### Case Detail + Response Composer
1. Buka case detail (klik dari split-view)
2. Lihat layout 2-kolom (info kiri, activity kanan)
3. Toggle "Tanggapan Nasabah" ↔ "Catatan Internal"
4. Pilih template dari dropdown
5. Coba tutup case tanpa final response → Modal warning muncul

### Customer 360
1. Buka `http://localhost:5173/customers`
2. Gunakan search dan filter chips
3. Klik nama nasabah → Customer 360 page
4. Cek 3 tabs: Overview, Timeline, Cases
5. Perhatikan alert panel di kanan jika ada case aktif

### Agent Dashboard
1. Buka `http://localhost:5173/` sebagai role AGENT
2. Lihat KPI row (4 cards compact)
3. Gunakan shift filter: Hari Ini / 7 Hari / Semua
4. Queue table dengan sorting dan search
5. Sidebar: Quick actions + Catatan Shift

### Create Case Drawer
1. Di Cases page, klik "+ Baru"
2. Search dan pilih nasabah
3. Pilih kategori → Perhatikan SLA otomatis berubah
4. Pilih prioritas → SLA berubah lagi
5. Isi subjek dan deskripsi → Klik "Buat Case"

---

## Test Status

```
Test Files: 5 passed (5)
Tests:      109 passed (109)
```

Semua unit test library (mask, rfm, policy, sla, nba) tetap passing setelah perubahan UI.
