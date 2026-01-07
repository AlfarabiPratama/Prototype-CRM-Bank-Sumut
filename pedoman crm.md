Pedoman Membangun CRM Bank Sumut
Bab 1 — Konsep Inti: Apa yang dimaksud “CRM Bank” di proyek ini
1.1 Definisi “CRM Bank” untuk konteks Bank Sumut
Di proyek ini, CRM Bank adalah platform operasional yang membantu tim bank (service, RM/sales, marketing, compliance) bekerja pada satu “pandangan pelanggan” yang konsisten, dengan kontrol akses dan jejak audit yang kuat.
Customer 360 di sini berarti:
satu profil pelanggan yang menggabungkan data dari banyak sumber agar semua tim punya konteks yang sama saat melayani pelanggan. Salesforce+1


Intinya: Customer 360 bukan layar cantik, tapi hasil dari fondasi data + integrasi + governance.

1.2 Apa saja cakupan CRM Bank (di luar marketing–sales–service)
Agar Customer 360 “kejadian”, CRM bank yang matang mencakup area berikut:
A. Customer Data & Single Source of Truth
Tujuan: satu sumber kebenaran untuk identitas dan konteks nasabah.
Customer master: data dasar nasabah, status, segment, cabang asal, dsb.


Relasi: keluarga / perusahaan / group (untuk kebutuhan “relationship banking”).


Identity & identifier: CIF, NIK, nomor rekening sebagai business identifier (bisa banyak), sementara sistem pakai ID internal stabil.


Unifikasi lintas sistem: core banking, mobile banking, cabang, call center, ticketing.


“Single view” membantu tim memberikan pengalaman konsisten lintas sales, marketing, service. Salesforce
B. Analytics, Reporting, dan Insight
Tujuan: data CRM “bernilai” untuk keputusan operasional.
Dashboard SLA, backlog case, kategori kasus teratas, tren cabang.


Insight “next step” rule-based dulu (AI opsional belakangan).


C. Operations / Process Automation
Tujuan: proses seragam, cepat, dan bisa diaudit.
Routing case, eskalasi, approval, SLA rules, task management.


Data hygiene (dedup, validasi, kontrol kualitas).


D. Omnichannel Experience (Journey end-to-end)
Tujuan: pengalaman nasabah nyambung lintas kanal.
Interaksi dari cabang/call center/mobile → case → tindak lanjut RM/marketing.


Bisa ada triggered follow-up setelah case selesai (etis & consent-aware).


E. Integrations
Tanpa integrasi, Customer 360 cuma “mimpi indah”.
API/event intake, batch sync indikator produk, konektor middleware.


Monitoring integrasi (gagal sync, latency, retry).


F. Field Service (Opsional)
Tidak wajib untuk bank, tapi konsepnya relevan untuk:
kunjungan RM, collector, atau verifikasi lapangan (jika ada proses tersebut).


G. Customer Platform yang melebar (Opsional)
Jika kelak bank ingin enterprise suite: CRM bisa terhubung ke modul lain (finance/ops). Ini roadmap, bukan fokus PoC.
H. CDP (Opsional, “saudara dekat” CRM)
CDP fokus mengumpulkan dan menyatukan data multi-sumber untuk aktivasi (segmentasi real-time, aktivasi kanal). CRM fokus proses kerja tim + relasi. (Kalau butuh, CDP bisa ditambahkan belakangan). Salesforce+1
1.3 Pembeda utama: Governance, Risk, Compliance, Consent, Auditability
Inilah “pembeda CRM bank vs CRM biasa”:
Consent: nasabah berhak menarik kembali persetujuan pemrosesan data pribadi yang pernah diberikan. Ini harus diterjemahkan menjadi rule sistem (mis. campaign eligibility). Peraturan BPK+1


Audit trail: aksi penting harus tercatat (view profile, create/update case, export).


Akses data ketat: branch scope + portfolio RM + masking data sensitif.
Bab 2 — Tujuan Proyek & Prinsip Desain
2.1 Tujuan proyek (realistis untuk PoC)
PoC kamu idealnya “kecil tapi valid”, menunjukkan fondasi dan kontrol.
Tujuan 1 — Customer 360 Lite (yang benar-benar berguna)
Output minimal:
Search customer (nama/telepon/CIF) → hasil scoped


Profile ringkas (segment, status, VIP) + ringkasan interaksi


Timeline event (case, kampanye, aktivitas RM)


Alerts sederhana (mis. open case, consent withdrawn, high priority)


Tujuan 2 — Case/Complaint Management end-to-end
Output minimal:
Intake → SLA set → assignment/escalation → activity log → final response → close


Sistem menolak close jika final response belum ada (guardrail)


Ini sejalan dengan kewajiban pelaku usaha jasa keuangan untuk menjalankan penanganan pengaduan dalam kerangka pelindungan konsumen. OJK+1
Tujuan 3 — Consent-aware Marketing (demo yang “beda”)
Output minimal:
Segment rule-based


Campaign draft → approval (opsional) → execute simulasi


Eligibility check otomatis mengecualikan nasabah tanpa consent dan menyimpan reason


Hak tarik persetujuan harus berdampak nyata pada aktivasi/targeting. Peraturan BPK+1
Tujuan 4 — Audit trail untuk aksi penting
Output minimal audit event:
SEARCH_CUSTOMER, VIEW_PROFILE, CREATE_CASE, UPDATE_CASE, ASSIGN_CASE, FINAL_RESPONSE, CLOSE_CASE, EXPORT_DATA


2.2 Prinsip desain (yang wajib kamu pegang)
A. Trust-first
Akses dibatasi (RBAC + scope) dan data sensitif dimasking.


Setiap akses penting tercatat (audit).


B. Deny-by-default + least privilege
Default: user tidak punya akses apa pun sampai diberikan izin.


Akses hanya sesuai peran dan kebutuhan pekerjaan.


OWASP menegaskan pelanggaran least privilege/deny by default adalah sumber umum masalah access control. owasp.org+1
C. Single Source of Truth
PostgreSQL sebagai sumber utama data CRM.


Integrasi hanya “mengisi” atau “meng-update” secara terkontrol, bukan membuat data ganda.


D. Iteratif
PoC fokus: Customer 360 + Case + Consent + Audit.


Roadmap: integrasi real-time, dedup engine, NBA/AI, warehouse.


E. Selaras pelindungan konsumen & digitalisasi layanan
Rancang modul service/case dan kanal dengan asumsi harus mendukung pelindungan konsumen & penanganan pengaduan, dan memperhatikan aspek sistem informasi serta ketahanan siber yang ditekankan dalam regulasi pelindungan konsumen sektor jasa keuangan. 


2.3 Definisi “Selesai” untuk Bab 1–2 (agar tim sejalan)
Bab 1–2 dianggap selesai kalau semua stakeholder setuju:
CRM di proyek ini = Customer 360 + Case + Consent + Audit + RBAC (bukan sekadar campaign tool)


PoC targetnya jelas (4 tujuan di atas)


Prinsip desain disepakati (trust-first, deny-by-default, single source of truth, iteratif)
Bab 3 — Struktur Modul (BRD/PRD) yang kita gunakan
3.1 Kenapa kita pakai struktur BRD + PRD
Agar tim “orang kantor” dan programmer ngomong dalam bahasa yang sama, kita bedakan:
BRD (Business Requirements Document): menjelaskan kenapa proyek ini ada, masalah bisnisnya, value, scope, proses bisnis, stakeholder, KPI, dan aturan utama. BRD jadi fondasi siklus hidup proyek dan memastikan semua pihak paham “value” yang mau dicapai. ProjectManager+1


PRD (Product Requirements Document): menjelaskan apa yang harus dibangun supaya tujuan tercapai—fitur, user stories, requirement UI/UX, asumsi, metrik sukses, dan detail yang developer butuhkan untuk delivery. PRD jadi “blueprint” untuk tim dev/desain. Atlassian+2Perforce Software+2


Jadi: BRD = business truth, PRD = build truth.

3.2 Cara cepat mengisi BRD untuk CRM Bank Sumut (template isi siap pakai)
Gunakan format berikut (kamu tinggal copy dan isi):
BRD 3.2.1 Ringkasan Eksekutif
Nama program: CRM Bank Sumut – Customer 360 + Case + Consent + Audit (PoC)


Latar belakang singkat: data nasabah tersebar; penanganan case tidak seragam; sulit memonitor SLA; kampanye perlu consent gating.


Outcome: workspace terpadu untuk service + RM + marketing + compliance.


BRD 3.2.2 Problem Statement
Tulis dengan pola: kondisi saat ini → dampak → penyebab akar
 Contoh:
Kondisi: data interaksi nasabah terpisah antar kanal (cabang/call center/mobile).


Dampak: waktu penanganan keluhan lama, risiko miskomunikasi, peluang follow-up hilang.


Akar: belum ada “single view” + belum ada routing/SLA/jejak audit terstandar.


BRD 3.2.3 Tujuan & KPI PoC
Wajib 3 level:
KPI Operasional: SLA compliance, backlog, first response time (indikator).


KPI Experience: case closed with final response, post-case follow-up.


KPI Growth (lite): jumlah lead dari campaign, conversion proxy.


(Di bab 1–2 kita sudah tetapkan tujuan PoC; di BRD cukup dibuat measurable.)
BRD 3.2.4 In-scope vs Out-of-scope
In-scope PoC (wajib)
Customer 360 Lite (search + profile + timeline + alerts)


Case end-to-end (SLA + assignment/escalation + final response + close)


Consent gating untuk campaign (ineligible reason)


Audit log minimum untuk aksi penting


Out-of-scope PoC (disimpan roadmap)
Integrasi core banking real-time penuh


Scoring AI/ML produksi (NBA/segmentation advanced)


CDP enterprise


Data warehouse skala besar


BRD 3.2.5 Stakeholder & RACI ringkas
Sponsor: Direktur/Head Divisi


Owner proses: Supervisor layanan + Compliance


Owner produk: Business Analyst (kamu)


Owner teknis: Lead Engineer/IT


Pengguna utama: Agent/CS, RM, Marketing


BRD 3.2.6 Proses bisnis target (BPMN-lite level)
Masukkan ringkas:
Flow keluhan (intake → SLA → assign → final response → close)


Flow campaign (segment → draft → approve → execute → report)


Flow consent change (verify → update consent → audit)


BRD 3.2.7 Risiko & mitigasi
Risiko data: kualitas data & duplikasi → mitigasi: identifier table + match level + data hygiene.


Risiko akses: kebocoran data → mitigasi: deny-by-default + scope + audit. (prinsip deny-by-default direkomendasikan untuk keamanan). OWASP Cheat Sheet Series+1


Risiko adopsi: user menolak → mitigasi: UI sederhana + super-user cabang + training.



3.3 Cara cepat mengisi PRD untuk CRM Bank Sumut (template isi siap pakai)
PRD harus menjawab “apa yang dibangun” dan “bagaimana suksesnya”. Banyak panduan PRD menyarankan problem statement, goals, metrics, scope, user stories, desain, constraints. Atlassian+2Plane+2
PRD 3.3.1 Header PRD (metadata)
Nama fitur/epic: Customer 360 + Case Management


Owner: BA


Status: Draft/Review/Approved


Target rilis: PoC Sprint X


Stakeholder: Service lead, RM lead, Marketing lead, Compliance, IT


PRD 3.3.2 Goals & Success Metrics
Contoh (PoC):
Goal: Agent dapat menemukan nasabah < 10 detik


Metric: median waktu search-to-profile


Goal: case tidak bisa closed tanpa final response


Metric: % closed cases with final response = 100%


PRD 3.3.3 Persona & Journey
Agent: “Cari nasabah → buat case → follow-up → close”


Supervisor: “monitor queue → assign/escalate”


RM: “lihat portfolio → follow-up lead”


Marketing: “buat segment → campaign → lihat report (simulasi)”


Compliance: “cek audit log”


PRD 3.3.4 Scope PRD per modul (yang akan dibangun di prototype)
Biar konsisten dengan pembahasan kita, PRD kita dibagi 9 modul (0–8):
Modul 0 — Governance, Risk, Compliance & PDP
RBAC + scope, masking, audit event minimum, consent lifecycle, retention policy.


Modul 1 — Customer Data Foundation
customer master, identifiers (CIF/NIK/ACCOUNT), assignment portfolio, data quality checks.


Modul 2 — Customer 360 Experience
search, customer summary, alerts, timeline, tabs.


Modul 3 — Service: Case Management
create case, SLA, assign/escalate, activity log, final response, close.


Modul 4 — Sales/RM Workspace (lite)
lead pipeline mini, tasks/activities, next step.


Modul 5 — Marketing: Segmentation & Campaign (consent-aware)
segment rules, campaign draft→approve→execute (simulasi), ineligible reason.


Modul 6 — Analytics & Insight
SLA dashboard, backlog, top categories, campaign summary.


Modul 7 — Integrations & CRM Ops
API intake, batch sync, monitoring sync.


Modul 8 — Admin & Config
konfigurasi kategori, SLA rules, routing, role policy.


PRD 3.3.5 User Stories + Acceptance Criteria
Di PRD, user stories adalah inti (kita sudah mulai di Bab 7). PRD harus menautkan epic → story → AC → test. Atlassian
Contoh format yang konsisten:
US-01 Search customer


AC: hanya menampilkan yang sesuai scope; rate limit; match badge.


US-05 Final response & close


AC: close ditolak jika final response kosong; log activity tercatat.


PRD 3.3.6 Non-Functional Requirements (NFR) minimal PoC
Security: deny-by-default authorization; audit log; rate-limit search. OWASP Cheat Sheet Series+2OWASP Cheat Sheet Series+2


Performance: search < X detik untuk data demo.


Reliability: validasi wajib; constraint penting.


Observability: log aksi penting + error integrasi.


(NFR penting supaya modul kamu “bank-ready”, bukan sekadar UI.)
PRD 3.3.7 Design Notes (wireframe rules)
Default masking


Consent badges


SLA countdown


Tombol action mengikuti role (permission gating)


3.4 Mapping BRD/PRD ke Prototype (agar demo tepat sasaran)
Gunakan “mapping cepat” ini:
Customer 360 tab → memenuhi BRD tujuan #1


Case workflow → memenuhi BRD tujuan #2


Marketing consent gating → memenuhi BRD tujuan #3


Audit log screen → memenuhi BRD tujuan #4


Ini memastikan prototype kamu bukan sekadar tampilan, tapi bukti konsep “CRM bank”.
Bab 4 — RFP (Request for Proposal) Kerangka Ringkas (Vendor-neutral)
4.1 Kapan RFP dipakai di modul ini
RFP dipakai kalau Bank Sumut ingin:
memilih platform CRM (Creatio/Salesforce/Zoho/atau vendor lokal)


memilih partner implementasi


atau sekadar benchmark capability vs build internal


RFP adalah dokumen formal yang menjabarkan requirement, kriteria evaluasi, dan aturan submission supaya penawaran vendor bisa dibandingkan secara konsisten. AI21
4.2 Struktur RFP yang kita gunakan (siap copy)
4.2.1 Ringkasan Eksekutif
tujuan transformasi CRM Bank Sumut


scope pilot (3 cabang misalnya)


timeline target


4.2.2 Latar Belakang & Konteks
problem statement


arsitektur high level (kanal, data source)


constraint (kepatuhan, audit, scope cabang)


4.2.3 Ruang Lingkup
In-scope: Customer 360, Case, consent-aware campaign, workflow, audit, RBAC


Out-of-scope: CDP enterprise, AI produksi, DWH produksi


4.2.4 Kebutuhan Fungsional (fit matrix)
Kelompokkan per modul (0–8) supaya vendor jawabnya terstruktur:
Data foundation


Customer 360 UI


Case management + SLA


Marketing segmentation + consent gating


Sales/RM workspace (lite)


Analytics dashboard


Integrations


Admin/config


4.2.5 Kebutuhan Non-Fungsional
Minimal yang wajib kamu tulis:
Security: authorization deny-by-default, audit logging, rate limiting. OWASP Cheat Sheet Series+2OWASP Cheat Sheet Series+2


Auditability: audit trail untuk view/export/change.


Performance: target response time.


Reliability: backup/restore (kalau vendor host).


Compliance: dukungan kebijakan consent & pencabutan consent.


4.2.6 Integrasi
daftar sistem sumber data (core/mobile/call center)


metode (API, batch, event)


monitoring & retry


4.2.7 Implementasi & Change Management
rencana rollout pilot


training plan (super-user)


migrasi data & cleansing


cutover strategy


4.2.8 Format Proposal Vendor
Minta vendor menyertakan:
arsitektur solusi


timeline implementasi


rincian biaya (license, implementasi, support)


asumsi dan risiko


4.2.9 Kriteria Evaluasi & PoC checklist
RFP harus punya matriks penilaian dan PoC checklist.
4.3 Evaluasi Vendor: Scoring Matrix (cara menilai yang “adil”)
Metode umum: RFP evaluation criteria matrix untuk membandingkan vendor secara konsisten. Responsive+1
Kategori skor yang disarankan
Fit fungsional (Customer 360, Case, Consent gating, Workflow)


Security & auditability (logging, access control, audit export)


Integrasi & arsitektur (API-first, monitoring)


Waktu implementasi (time-to-value)


Total cost of ownership (3 tahun)


Kapabilitas change management (training, adoption)


Vendor viability & support


Ada panduan evaluasi RFP yang menekankan pembobotan requirement dan pencatatan skor per area fungsional, termasuk cost sebagai bagian tersulit untuk “apples-to-apples”. ed.gov
4.4 PoC Checklist (yang harus vendor demo-kan)
Agar vendor tidak demo “slide”, minta demo real:
Customer 360
search scoped + masking


timeline event


consent badge


Case
create case + SLA auto


assign/escalate + activity log


final response wajib sebelum close


Marketing
segment rule-based


campaign eligibility check (consent off → ineligible reason)


Audit
bukti audit log untuk VIEW_PROFILE, CREATE_CASE, EXPORT_DATA


Admin
ubah SLA rule


ubah permission role (dengan audit event)


Bab 5 — Persona/Role di Bank dan Kebutuhan Customer 360
5.1 Tujuan Bab Ini
Bab ini memastikan siapa memakai apa (role → kebutuhan → layar/fitur). Ini penting supaya Customer 360 tidak jadi “satu layar untuk semua”, karena di bank akses harus berlapis dan terbatas (least privilege, deny-by-default). OWASP+2CSRC+2

5.2 Daftar Role Utama (yang relevan untuk CRM Bank Sumut)
Role di bawah dibuat agar sesuai dengan realita operasional bank: cabang, call center, RM, marketing, compliance, dan IT/admin.
Direktur / Eksekutif


Tujuan kerja: memantau kesehatan layanan & pertumbuhan (agregat).


Kebutuhan Customer 360: bukan detail per nasabah, tapi dashboard agregat (tren SLA, backlog, volume complaint, conversion proxy).


Catatan: idealnya read-only; akses detail per nasabah dibatasi untuk meminimalkan risiko.


Supervisor Layanan (Cabang/Call Center)


Tujuan kerja: menjaga SLA, antrian, eskalasi, kualitas respons.


Kebutuhan Customer 360: akses melihat profil ringkas nasabah (scoped), queue case, assign/escalate, cek SLA countdown.


Alasan: POJK layanan pengaduan menekankan penerimaan, pencatatan, bukti tanda terima, dan proses layanan pengaduan yang harus tersedia di kantor PUJK. OJK+1


CS/Agent (Cabang/Call Center)


Tujuan kerja: melayani cepat, mendokumentasikan keluhan, memberi final response yang jelas.


Kebutuhan Customer 360: search → profil ringkas → timeline → create/update case → final response → close.


Catatan: akses data sensitif wajib dimasking + audit log untuk view profile. (prinsip kontrol akses & pencatatan penting untuk mencegah broken access control). OWASP+1


Sales / Relationship Manager (RM)


Tujuan kerja: follow-up nasabah portofolio, kelola lead, lakukan next step yang relevan.


Kebutuhan Customer 360: hanya portofolio sendiri, ringkasan (customer summary), riwayat interaksi penting, lead pipeline mini, aktivitas (call/meeting/task).


Rujukan konsep: CRM keuangan menekankan “centralised view” untuk layanan personal dan lead management. Salesforce+1


Marketing


Tujuan kerja: membuat segment/campaign yang relevan dan aman (tidak spam, tidak melanggar consent).


Kebutuhan Customer 360: tab “Marketing” untuk melihat status consent & riwayat campaign event (simulasi), serta segment builder dan campaign builder.


Catatan wajib: consent gating (nasabah tanpa consent → ineligible) dan alasan ineligible harus tersimpan. Hak menarik persetujuan dijamin UU PDP. Peraturan BPK+1


Compliance / Risk


Tujuan kerja: memastikan kepatuhan, auditability, kontrol akses, bukti perubahan.


Kebutuhan Customer 360: akses audit log (full/lebih luas), laporan kepatuhan consent, akses terbatas ke data detail (berbasis justifikasi).


Catatan: akses compliance sebaiknya “break-glass” untuk detail sensitif (dengan approval + audit).


Admin IT / System Admin


Tujuan kerja: konfigurasi RBAC, scope cabang, master data kategori case, SLA rules, workflow/routing, integrasi.


Kebutuhan Customer 360: menu Admin & Ops (monitoring integrasi, konfigurasi), bukan akses bebas ke data nasabah.


Data Steward / Ops CRM (Opsional tapi sangat membantu)


Tujuan kerja: menjaga kualitas data (dedup ringan, konsistensi identifier, perbaikan data).


Kebutuhan: tools untuk merge kandidat duplikat (PoC cukup “flag duplicate”), data quality dashboard.



5.3 Customer 360 Workspace: Apa yang berbeda per role (ringkas tapi operasional)
Agar demo dan implementasi “realistis”, kita bedakan tampilan Customer 360 berdasarkan role:
Direktur: Dashboard agregat → SLA, backlog, tren kasus, ringkasan campaign/lead (tanpa detail nasabah).


Supervisor: Queue + SLA + tombol assign/escalate + ringkasan profil & timeline.


Agent/CS: Search → 360 → create/update case + final response.


RM: Portfolio list → 360 ringkas (scoped) → lead/tasks → next step.


Marketing: Segment/Campaign → eligibility check → campaign reporting + tab marketing di 360.


Compliance: Audit log explorer + laporan consent + sampling akses data detail via prosedur.


Admin IT: konfigurasi & monitoring, tanpa akses bebas ke semua profil.


Prinsipnya: lebih mudah menambah akses daripada “mencabut” akses yang terlanjur terlalu luas. OWASP Cheat Sheet Series

5.4 Dimensi Scope (aturan yang nanti dipakai di RBAC)
Agar “role” tidak terlalu kasar, kita pakai scope (ABAC-lite) yang sederhana tapi efektif:
Branch Scope: user_branch_scopes (user hanya lihat data cabang A/B).


Portfolio Scope (RM): RM hanya lihat customer yang assigned_to = rm_user_id.


Case Ownership/Assignment: agent hanya bisa update case yang dia buat/ditugaskan.


Sensitivity Tier:


Tier-1: data umum (nama, segment, status)


Tier-2: identifier (CIF, NIK mask), kontak (mask)


Tier-3: catatan sensitif (fraud/scam) → akses lebih ketat + audit


Action Scope: export, bulk action, atau view audit log butuh izin khusus.



Bab 6 — Role–Permission Matrix (RBAC + Scope) untuk Customer 360, Case, Marketing, Sales
6.1 Prinsip Keamanan Akses (wajib untuk aplikasi CRM bank)
Aplikasi CRM bank harus menerapkan:
Deny-by-default & least privilege: akses hanya diberikan sesuai tugas. OWASP memasukkan pelanggaran prinsip ini sebagai penyebab umum “Broken Access Control”. OWASP+1


Server-side enforcement: jangan andalkan UI/FE untuk membatasi akses; validasi harus di backend. PortSwigger+1


Audit access control events: akses ke profil, export, perubahan role/workflow harus terekam. top10proactive.owasp.org



6.2 Notasi Permission yang dipakai
R = Read/Lihat


C = Create/Buat


U = Update/Ubah


A = Assign/Approve/Escalate (aksi supervisor)


X = Export (izin khusus)


M = Manage/Config (admin)


Untuk PoC, kita cukup gunakan notasi ini + scope rules.

6.3 Permission Matrix — Customer 360 & Case Management
Di bawah ini versi “tidak melebar” (mudah dicopy). Kamu bisa tempel di Word sebagai sub-bab.
6.3.1 Direktur / Eksekutif
Dashboard agregat (SLA/backlog/tren) → R


Lihat profil nasabah detail → Tidak (default)


Export agregat (tanpa PII) → X (opsional, dengan kontrol)


6.3.2 Supervisor Layanan
Search customer (dalam scope unit/cabang) → R


View Customer 360 (ringkas + timeline) → R


Create/Update Case (jika dibutuhkan saat override) → C/U


Assign/Escalate Case → A


Close case (tertentu) → U (dengan aturan final response wajib)


Export daftar case (scoped) → X (opsional)


6.3.3 CS/Agent
Search customer (scoped) → R


View Customer 360 → R


Create case → C


Update case (yang dibuat/ditugaskan) → U


Final response → U


Close case → U (hanya jika final response terisi)


Export data nasabah → Tidak (default)


Ini selaras arah regulasi layanan pengaduan: pengaduan harus diterima, dicatat, ada bukti tanda terima, dan mekanisme layanan pengaduan tersedia. OJK+1
6.3.4 Sales / RM
Lihat daftar customer portofolio → R (portfolio scope)


View Customer 360 ringkas → R (portfolio scope)


Create/Update lead & aktivitas → C/U


Create task follow-up → C


Akses case → R terbatas (mis. hanya status ringkas: ada open case / tidak)


Export → Tidak (default)


6.3.5 Compliance/Risk
View audit logs (penuh) → R


View consent report → R


View profile detail → R terbatas (break-glass + audit + alasan)


Export audit & laporan kepatuhan → X


Ubah data nasabah → Tidak (default)


6.3.6 Admin IT
Kelola role, scope, konfigurasi workflow, SLA rules → M


Monitoring integrasi, retry job → M


View data nasabah → R sangat terbatas (hanya untuk troubleshooting, wajib audit)



6.4 Permission Matrix — Marketing, Consent, Campaign, dan Handoff ke Sales
Bagian ini mengikat pembahasan kita tentang CRM → Marketing dan CRM → Sales.
6.4.1 Marketing
Buat/ubah segment rules → C/U


Buat campaign draft → C


Submit campaign untuk approval → U


Execute campaign → U (hanya jika status APPROVED + consent gating lulus)


View campaign report → R


Akses profil nasabah detail → Tidak (default); cukup agregat + beberapa field non-sensitif


6.4.2 Consent Change (siapa boleh ubah consent?)
CS/Agent: boleh input perubahan consent berdasarkan request nasabah → U


Supervisor: approve perubahan consent tertentu (opsional) → A


Marketing: tidak boleh mengubah consent (conflict of interest)


Sistem wajib membuat audit event saat consent berubah.


Hak subjek data untuk menarik kembali persetujuan dijamin UU PDP, dan pengendali data wajib menghentikan pemrosesan ketika consent ditarik. Peraturan BPK+1
6.4.3 Handoff Marketing → Sales (Lead)
Jika campaign menghasilkan lead (simulasi di PoC):


Marketing dapat “create lead” tanpa detail sensitif → C


Lead otomatis assigned ke RM berdasarkan branch/portfolio rule → (sistem)


RM mengelola status lead dan aktivitas → U


Lifecycle stage dipakai untuk “bahasa bersama” marketing dan sales dalam handoff. knowledge.hubspot.com+1



6.5 Aturan Khusus (Guardrails) yang wajib ada
Ini bagian penting agar permission matrix tidak hanya “di dokumen”, tapi benar-benar mengikat sistem:
Masking default


NIK, nomor rekening, kontak → masked untuk role non-privileged.


Close Case Guardrail


Case tidak boleh CLOSED jika final_response kosong (aturan bisnis + constraint DB).


Export Guardrail


Export hanya untuk role tertentu (Compliance, Supervisor tertentu) dan harus terekam audit.


Server-side authorization


Semua endpoint harus cek role + scope di backend, bukan di frontend.

Bab 7 — Backlog: User Stories + Acceptance Criteria (lengkap untuk Sprint PoC)
7.1 Tujuan Bab Ini
Bab ini mengubah konsep (BRD/PRD) menjadi backlog yang bisa langsung dikerjakan. Format user story yang kita pakai adalah “persona + kebutuhan + tujuan”, karena bentuk ini umum dipakai di agile untuk mendefinisikan requirement dari sudut pandang pengguna. Atlassian
 Agar story berkualitas, kita pakai checklist INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable). agilealliance.org+1
 Acceptance Criteria (AC) kita tulis spesifik, terukur, dan bisa dites, karena AC berfungsi menerjemahkan story menjadi kondisi sukses yang jelas. Atlassian+1

7.2 Konvensi Penulisan (biar konsisten untuk Word + backlog dev)
Template User Story
US-XX: Judul


Sebagai …


Saya ingin …


Sehingga …


Template Acceptance Criteria
AC-1 … (testable)


AC-2 …


AC-3 …


Tips: kalau story terlalu besar, pecah supaya tetap “Small & Testable” (INVEST). agilealliance.org+1

7.3 Epic A — Customer 360 (Search + Profile + Timeline + Alerts)
US-01 — Search Customer (scoped)
Sebagai CS/Agent


Saya ingin mencari nasabah dengan nama/telepon/CIF


Sehingga saya bisa menemukan profil yang benar dengan cepat


AC


AC-1: Sistem mendukung query: nama, phone_e164, CIF (identifier).


AC-2: Hasil hanya menampilkan nasabah sesuai scope user (branch/portfolio RM).


AC-3: Hasil menampilkan match badge: Exact / Partial / Possible Duplicate.


AC-4: Ada rate limit pencarian (untuk mencegah abuse).


AC-5: Aksi SEARCH_CUSTOMER tercatat di audit log (minimal: actor, waktu, query hash).


US-02 — View Customer 360 Lite
Sebagai CS/Agent


Saya ingin melihat ringkasan Customer 360


Sehingga saya paham konteks sebelum melayani


AC


AC-1: Tampilan memuat: header profil, cards ringkasan, alerts, consent badge, tab timeline & cases.


AC-2: Data sensitif masked by default sesuai role.


AC-3: Aksi VIEW_PROFILE tercatat di audit log.


US-03 — Customer Timeline (unified)
Sebagai Supervisor


Saya ingin melihat timeline event (case, aktivitas, campaign event)


Sehingga investigasi jadi lebih cepat


AC


AC-1: Timeline menampilkan minimal 3 jenis event: CaseEvent, ActivityEvent, CampaignEvent.


AC-2: Bisa filter (Case / Activity / Marketing) dan rentang waktu.


AC-3: Event yang bersifat sensitif hanya muncul untuk role yang diizinkan.


US-04 — Alerts (rule-based)
Sebagai CS/Agent


Saya ingin melihat alert otomatis


Sehingga saya tahu risiko/kondisi penting sejak awal


AC


AC-1: Alert minimal: “Open Case”, “Consent Withdrawn”, “VIP”, “Overdue SLA (jika ada case)”.


AC-2: Alert muncul berdasarkan rule sederhana (tanpa AI).


AC-3: Alert “Consent Withdrawn” selalu override untuk mencegah campaign targeting.



7.4 Epic B — Case/Complaint Management (end-to-end + SLA + Final Response)
Untuk sektor jasa keuangan, “pengaduan” harus punya pencatatan, registrasi, dan bukti/konfirmasi penerimaan; ini memandu kenapa di case module kita wajib punya nomor registrasi dan tanda terima/konfirmasi. OJK+1
US-05 — Create Case (Intake)
Sebagai CS/Agent


Saya ingin membuat case dari keluhan nasabah


Sehingga pengaduan tercatat dan bisa diproses


AC


AC-1: Field wajib: channel, kategori, kronologi, priority.


AC-2: Sistem membuat case_no/nomor registrasi otomatis.


AC-3: Sistem mengisi SLA due otomatis berdasarkan kategori/priority.


AC-4: Sistem membuat konfirmasi/tanda terima (minimal nomor registrasi + tanggal). OJK+1


AC-5: Audit event CREATE_CASE tercatat.


US-06 — Assign / Escalate Case
Sebagai Supervisor


Saya ingin assign atau escalate case


Sehingga case ditangani unit yang tepat


AC


AC-1: Supervisor dapat mengubah assignee dan/atau level eskalasi.


AC-2: Setiap perubahan assignee masuk ke case activity log (who/when/from-to).


AC-3: Audit event ASSIGN_CASE tercatat.


US-07 — Case Activity Log (investigasi)
Sebagai Agent/Supervisor


Saya ingin menambahkan catatan investigasi dan lampiran


Sehingga histori penanganan jelas


AC


AC-1: Agent bisa add note, add attachment metadata.


AC-2: Semua aktivitas memiliki timestamp + actor.


US-08 — Final Response & Close Guardrail
Sebagai Agent/Supervisor


Saya ingin menutup case setelah final response diberikan


Sehingga penutupan case valid dan bisa diaudit


AC


AC-1: Sistem menolak close jika final_response kosong.


AC-2: Close menyimpan closed_at, closed_by, resolution_code.


AC-3: Audit event FINAL_RESPONSE dan CLOSE_CASE tercatat.


US-09 — SLA Monitoring (queue view)
Sebagai Supervisor


Saya ingin melihat queue case dengan SLA countdown


Sehingga saya bisa mencegah overdue


AC


AC-1: Queue menampilkan status, priority, SLA due, dan indikator overdue.


AC-2: Filter by branch, category, status.



7.5 Epic C — Consent (PDP) + Auditability (pembeda CRM bank)
Hak tarik persetujuan (consent) harus berdampak nyata pada pemrosesan berikutnya (mis. targeting), dan perubahan consent harus tercatat. OJK+1
US-10 — Update Consent (by request)
Sebagai CS/Agent


Saya ingin mengubah consent (grant/withdraw) berdasarkan request nasabah


Sehingga bank patuh dan nasabah punya kontrol


AC


AC-1: Perubahan consent wajib menyimpan: consent_type, status, effective_at, channel, captured_by.


AC-2: Perubahan consent membuat audit event CHANGE_CONSENT.


AC-3: Jika consent MARKETING = WITHDRAWN, maka customer otomatis masuk “ineligible marketing”.


US-11 — Audit Log Viewer (Compliance)
Sebagai Compliance


Saya ingin menelusuri audit log


Sehingga saya bisa melakukan pemeriksaan kepatuhan


AC


AC-1: Bisa filter action (VIEW_PROFILE, EXPORT_DATA, CHANGE_RBAC, dsb).


AC-2: Menampilkan actor, timestamp, object_id, meta ringkas.


AC-3: Export audit log hanya untuk role tertentu dan tercatat sebagai EXPORT_AUDIT.


US-12 — Export Data Guardrail
Sebagai Compliance/Supervisor tertentu


Saya ingin export data terbatas


Sehingga kebutuhan laporan terpenuhi tanpa kebocoran


AC


AC-1: Export hanya untuk dataset yang diizinkan (case list / audit).


AC-2: Export wajib audit event EXPORT_DATA.


AC-3: Export profil per-nasabah default blocked kecuali break-glass.



7.6 Epic D — CRM → Marketing (Segment/Campaign Consent-aware)
Acceptance criteria yang kuat penting supaya campaign tidak “asal blast” dan selalu patuh consent gating. AC membantu menjadikan story testable. Atlassian+1
US-13 — Segment Builder (rule-based)
Sebagai Marketing


Saya ingin membuat segment dengan rule sederhana


Sehingga target lebih relevan dan aman


AC


AC-1: Rule minimal: segment_code, VIP, open_case flag, consent MARKETING.


AC-2: Segment menampilkan preview eligible_count.


AC-3: Segment tersimpan dengan versioning (created_by/created_at).


US-14 — Campaign Lifecycle (draft → approve → execute)
Sebagai Marketing


Saya ingin membuat campaign yang perlu approval


Sehingga kampanye terkendali dan bisa diaudit


AC


AC-1: Status: DRAFT → SUBMITTED → APPROVED/REJECTED → RUNNING → DONE.


AC-2: APPROVED menyimpan approved_by & approved_at.


AC-3: Audit event untuk SUBMIT/APPROVE/REJECT tercatat.


US-15 — Eligibility Check + Ineligible Reason
Sebagai Marketing


Saya ingin sistem mengecualikan nasabah tanpa consent


Sehingga targeting patuh dan transparan


AC


AC-1: Jika consent MARKETING ≠ GRANTED → ineligible (reason=CONSENT).


AC-2: Jika customer punya case status OPEN pada kategori sensitif → ineligible (reason=CASE_ACTIVE).


AC-3: Ineligible reason tersimpan per customer per campaign.



7.7 Epic E — CRM → Sales (Lead + Activity + RM Cockpit)
US-16 — Create Lead from Campaign/Trigger
Sebagai RM


Saya ingin menerima lead dari campaign/trigger


Sehingga saya bisa follow-up tepat waktu


AC


AC-1: Lead tercatat dengan source_type dan source_id.


AC-2: Lead otomatis assigned berdasarkan branch/portfolio rule.


AC-3: RM hanya melihat lead yang assigned ke dirinya.


US-17 — RM Activity Log
Sebagai RM


Saya ingin mencatat call/meeting/note


Sehingga histori follow-up jelas


AC


AC-1: Aktivitas minimal: type, note, created_at, created_by.


AC-2: Aktivitas muncul di timeline Customer 360.


US-18 — Next Best Action (rule-based)
Sebagai RM


Saya ingin melihat rekomendasi aksi berikutnya


Sehingga follow-up konsisten


AC


AC-1: Rekomendasi menyertakan reason_text (“kenapa muncul”).


AC-2: RM bisa Accept/Reject dan outcome tersimpan untuk evaluasi.



Bab 8 — Process Flow (BPMN-lite) untuk PoC
8.1 Aturan BPMN-lite yang kita pakai
Kita tidak menggambar BPMN full dulu; untuk PoC cukup “BPMN-lite” dengan blok dasar:
Start Event (lingkaran) memulai proses. signavio.com+1


Task/Activity (persegi rounded) sebagai langkah kerja. Camunda+1


Gateway (diamond) untuk keputusan (mis. XOR: ya/tidak). Camunda+1


End Event (lingkaran tebal) mengakhiri proses. gbtec.com+1


Sequence flow (panah) urutan langkah. Visual Paradigm+1


Swimlane sederhana yang kita pakai:
Nasabah / Kanal


CS/Agent


Supervisor


Unit terkait (opsional)


Compliance (opsional)


Sistem CRM



8.2 Flow 1 — Alur Keluhan/Case (end-to-end + SLA + Final Response)
Start: Nasabah menyampaikan keluhan lewat cabang/call center/mobile
(CS/Agent) Intake Pengaduan


buat case dari kanal + kronologi + kategori + priority


sistem generate case_no (registrasi)


(Sistem) Set SLA


SLA due otomatis dari rule kategori/priority


(Supervisor) Assignment


assign ke agent/unit, atau escalate jika perlu


(CS/Agent/Unit) Investigasi


tambah aktivitas (note/attachment)


update status: IN_PROGRESS / WAITING_INFO


(Gateway) Info cukup?


jika belum: minta info tambahan → kembali ke investigasi


jika cukup: lanjut final response


(CS/Agent) Final Response


isi final_response (wajib)


(Gateway) Final response ada?


jika kosong → block close


jika ada → proceed


(CS/Agent/Supervisor) Close Case


status CLOSED + closed_at


(Opsional) Post-case follow-up


survey / edukasi / service-to-sell etis


Regulasi layanan pengaduan menekankan adanya konfirmasi/tanda terima dengan nomor registrasi dan tanggal penerimaan; ini sebabnya di intake kita wajib case_no dan timestamp. OJK+1

8.3 Flow 2 — Alur Kampanye (Segment → Draft → Approve → Execute → Reporting)
Start: Marketing ingin membuat campaign (mis. edukasi fitur)
(Marketing) Buat Segment


definisikan rule segment (termasuk consent gating)


(Marketing) Draft Campaign


isi objective, channel, jadwal


(Supervisor/Compliance opsional) Approval


approve/reject


(Sistem) Eligibility Check (hard gate)


cek consent marketing


cek suppression/case aktif (jika kebijakan demikian)


simpan ineligible_reason per customer


(Marketing/Sistem) Execute (Simulasi)


generate campaign_events: SENT (dan optional OPEN/CLICK sebagai simulasi demo)


(Marketing) Reporting


eligible_count, sent_count, engagement proxy


catat outcome lead jika ada (closed-loop)



8.4 Flow 3 — Alur Verifikasi untuk Perubahan Consent (opsional tapi “bank-ready”)
Start: Nasabah minta ubah consent (withdraw/grant)
(CS/Agent) Verifikasi Identitas (lite)


cek minimal data (mis. nomor + DOB) / SOP internal


(CS/Agent) Update Consent


ubah status + simpan captured_channel & actor


(Sistem) Propagate Rule


jika consent marketing withdrawn → otomatis ineligible untuk campaign


(Sistem) Audit Event


CHANGE_CONSENT tercatat


End: Consent tersimpan + efeknya aktif

8.5 Flow 4 — Closed-loop: Campaign → Lead → RM Follow-up → Feedback
Start: Campaign menghasilkan lead (rule-based)
(Sistem) Create Lead


source_type = CAMPAIGN, source_id = campaign_id


(Sistem) Assign Lead


berdasarkan branch/portfolio


(RM) Follow-up


activity log + update status


(RM) Outcome


Qualified / Closed Won / Closed Lost + reason


(Sistem/Marketing) Feedback ke reporting


campaign report menampilkan conversion proxy


Closed-loop marketing menekankan feedback outcome dari sales agar marketing bisa mengevaluasi kualitas lead dan ROI, bukan berhenti di metrik “open/click” saja. 


Bab 10 — Wireframe (Teks) + Aturan Validasi (Customer 360 & Case + tab Marketing/Sales)
10.1 Tujuan Bab Ini
Bab ini memastikan UI/UX yang kamu demo selaras dengan aturan bank:
akses & masking (RBAC/scope)


proses case sesuai SLA + final response


consent gating untuk marketing


auditability untuk aksi penting



10.2 Wireframe 1 — Customer Search (Global Search)
10.2.1 Layout (teks)
Header: “Cari Nasabah”
 Search bar: [Nama / Phone / CIF]
 Filter (opsional): [Cabang] [Segment]
 Result list (cards):
Nama + badge (VIP/Segment)


Identifier ringkas (CIF masked)


Match badge: Exact / Partial


CTA: “Buka Customer 360”


10.2.2 Validasi & aturan
Scope check (server-side): hasil hanya untuk branch/portfolio user.


Rate limit: mis. 10 pencarian/menit/user.


Logging: audit event SEARCH_CUSTOMER (meta: query_hash, result_count).


Masking: phone/email masked untuk role tertentu.



10.3 Wireframe 2 — Customer 360 (Workspace Utama)
10.3.1 Layout (teks)
A. Header Profile
Nama + VIP badge + Segment + Status


Cabang asal (home_branch)


Consent badge ringkas: Marketing (Granted/Withdrawn)


B. Summary Cards
Ringkasan


info basic (masked sesuai role)


Alerts


Open case, overdue SLA, consent withdrawn, fraud flag (jika ada)


Produk indikator (demo)


“Memiliki rekening tabungan (Y/N)”, “Aktif mobile banking (Y/N)” (cukup indikator)


Quick Actions (role-based)


Agent: Create Case


Supervisor: Open Case Queue


RM: Create Activity / Update Lead


Marketing: View eligibility (read-only) + create lead (opsional)


C. Tabs
Timeline


Cases


Marketing (campaign events + eligibility)


Sales (lead + activity)


10.3.2 Validasi & aturan
Audit: VIEW_PROFILE harus tercatat setiap kali membuka 360.


Masking default: NIK/Account/phone/email.


Sensitive case category: jika ada FRAUD_SCAM, tampilkan hanya ringkasan ke role non-privileged.


Export: tombol export tidak muncul kecuali role punya izin X; tetap dicek server-side. OWASP Cheat Sheet Series+1



10.4 Wireframe 3 — Case Queue (Supervisor View)
10.4.1 Layout
Filter bar: Branch | Status | Priority | Category | SLA (Overdue only)
 Table/List:
case_no, customer_name (masked jika perlu), status, priority


SLA due + countdown


Assigned to


CTA: Assign / Escalate / Open


10.4.2 Validasi
Hanya menampilkan case dalam user_branch_scopes.


Sorting default: overdue dulu, lalu due soon.


Aksi Assign/Escalate wajib masuk case_activities + audit event ASSIGN_CASE.



10.5 Wireframe 4 — Create Case (Form Intake)
10.5.1 Layout
Field wajib:
Channel (dropdown)


Category (dropdown)


Priority (dropdown)


Kronologi/Deskripsi (textarea)
 Field opsional:


Attachment (metadata)


Contact preference (opsional)


Auto-fill:
case_no (generated)


sla_due_at (generated dari rule)


10.5.2 Validasi
Required fields tidak boleh kosong.


sla_due_at tidak boleh null (kalau rule belum ada → blok submit).


Setelah submit:


tampilkan nomor registrasi + timestamp (tanda terima/konfirmasi).


Audit event CREATE_CASE.


Praktik incident/ticket menekankan form yang efektif untuk pengumpulan informasi, kategorisasi, dan penetapan prioritas + SLA. manageengine.com+1

10.6 Wireframe 5 — Case Detail (End-to-end)
10.6.1 Layout
Header: case_no + status + priority + SLA countdown
 Section: customer mini-card (klik ke 360)
 Timeline/Activity log: list notes/status change/assign
 Action buttons (role-based):
Add Note


Assign/Escalate (Supervisor)


Final Response (Agent/Supervisor)


Close Case


10.6.2 Validasi (guardrails)
Close case ditolak jika final_response kosong.


Final response wajib:


minimal 20 karakter (contoh)


mencatat resolved_at


Semua aksi penting → case_activities + audit event.



10.7 Wireframe 6 — Marketing Tab (Consent-aware Eligibility + Campaign Events)
10.7.1 Layout
Eligibility card:
Marketing Consent: Granted/Withdrawn


Suppression flag (jika ada)


Open sensitive case flag


“Eligible for campaign?” Yes/No + reason


Campaign events list (simulasi):
SENT/OPEN/CLICK/REPLY + timestamp


10.7.2 Validasi
Jika consent marketing withdrawn → eligible No (reason=CONSENT).


Jika ada case sensitif OPEN → eligible No (reason=CASE_ACTIVE) sesuai policy PoC.


Marketing tidak bisa edit consent (conflict of interest).



10.8 Wireframe 7 — Sales Tab (RM View: Lead + Activity + Next Step)
10.8.1 Layout
Lead mini-pipeline:
New → Contacted → Qualified → Closed


Activity composer:
Call / Meeting / Note + isi note


Next Best Action (rule-based) panel:
Rekomendasi + alasan


Tombol Accept/Reject


10.8.2 Validasi
RM hanya lihat customer yang di-assign.


Status lead harus salah satu dari enum; Closed wajib closed_reason.


Accept/Reject menyimpan decision untuk evaluasi.
Bab 11 — Ide Fitur “Signature” (jarang dipakai bank regional) untuk Demo yang “beda”
11.1 Tujuan Bab Ini
Bab ini berisi ide fitur yang bisa kamu demo di prototype untuk memberi kesan CRM Bank Sumut “matang” (Customer 360 beneran), tanpa perlu integrasi kompleks. Fokusnya tetap aman: consent, transparansi, audit, dan closed-loop marketing–sales–service.

11.2 Prinsip Memilih “Signature Feature”
Pilih fitur yang:
Nyambung ke Customer 360 (muncul di layar 360, bukan modul terpisah)


Bisa berjalan rule-based dulu (AI opsional)


Ada “alasan”/explainability (bank-friendly)


Meningkatkan trust (bukan sekadar “keren”)



11.3 Opsi Signature Feature (pilih 1–2 untuk PoC)
A) Consent Cockpit + “Kenapa saya dapat ini?” (Why am I seeing this?)
Masalah yang diselesaikan: marketing sering dianggap “spam/creepy” kalau tidak transparan.
 Banyak platform besar memakai konsep “Why am I seeing this?” untuk transparansi iklan/targeting. Tentang Facebook+2OUP Academic+2
Apa yang kamu buat di CRM Bank Sumut (PoC)
Di tab Marketing pada Customer 360, tampilkan:


Status Consent: Marketing (Granted/Withdrawn)


Eligibility: Eligible / Ineligible


Reason (wajib): contoh


CONSENT_WITHDRAWN


ACTIVE_CASE_SENSITIVE


NOT_IN_SEGMENT_RULE


Di modul Campaign, setiap customer yang “tidak ikut” wajib punya ineligible_reason (tersimpan).


Kenapa ini “beda”?
Mayoritas bank regional biasanya hanya punya campaign list + segment kasar, tapi tidak punya explainability yang bisa dilihat user internal (Marketing/RM/CS).


Penelitian di Journal of Consumer Research membahas efek “ad transparency / why am I seeing this ad” terhadap persepsi pengguna. OUP Academic+1


Regulator Eropa (EDPB) juga menyinggung konteks transparansi “why am I seeing this ad” dalam targeting. edpb.europa.eu


Demo 30 detik
Buka Customer 360 → tab Marketing


Tunjukkan consent withdrawn → langsung “Ineligible: CONSENT”


Buka campaign preview → eligible_count turun otomatis + ada alasan



B) Service-to-Sell Journey yang Etis (bukan “jualan brutal”)
Masalah: setelah case selesai, bank sering “lepas”. Padahal momen pasca-penyelesaian keluhan adalah momen trust.
Apa yang kamu buat (PoC)
Setelah case CLOSED, sistem membuat Follow-up Task (opsional) dengan template:


“Edukasi fitur pencegahan (mis. keamanan transaksi / tips anti-scam)”


“Tawarkan aktivasi layanan yang relevan (mis. notifikasi transaksi)”


Task hanya dibuat jika:


consent marketing GRANTED


kategori tidak sensitif tertentu (policy kamu)


Kenapa ini bagus untuk bank
Ini menghubungkan service → retention → cross-sell secara aman dan tidak agresif.


Bisa diukur: completion rate follow-up + penurunan repeat complaint.


Demo 20 detik
Close case → otomatis muncul task “Follow-up edukasi” di RM/Agent workspace


Klik task → catat outcome (Done/Skipped + reason)



C) RM Copilot 30 Detik (ringkasan rule-based, bukan AI dulu)
Masalah: RM/CS butuh konteks cepat, tapi data tercecer.
Apa yang kamu buat (PoC)
Panel “Ringkasan 30 detik” di Customer 360:


Identitas ringkas (masked)


Top 3 event terbaru (timeline)


Open case? due kapan?


Consent marketing status


“Rekomendasi tindakan” (lihat opsi D)


Kenapa ini “bank-ready”
Tidak mengandalkan AI dulu—cukup rule-based dan deterministic.


Tetap explainable (kenapa ringkasan menampilkan itu).



D) Next Best Action (NBA) yang Explainable (rule-based dulu)
“Next Best Action” adalah pendekatan untuk merekomendasikan tindakan paling relevan untuk customer berdasarkan data/konteks, bisa lintas channel dan bisa AI di masa depan. Pega+2Bain+2
Apa yang kamu buat (PoC)
NBA sederhana (rule engine) misalnya:


Jika MARKETING=GRANTED dan tidak ada open case → “Ajak aktivasi fitur X”


Jika FRAUD_SCAM pernah terjadi → “Kirim edukasi anti-scam (service content)”


Jika Case overdue → “Prioritaskan penyelesaian case dulu”


Setiap rekomendasi wajib punya:


reason_text (“muncul karena consent granted + segmen X”)


tombol Accept / Reject (menyimpan outcome)


Demo 20 detik
Buka Customer 360 → panel NBA → klik Accept → muncul activity log



E) Root Cause → Product Fix Backlog (keluhan jadi backlog internal)
Ini mengambil konsep ITIL Problem Management: problem/incident bisa dikonversi menjadi “known error” dengan root cause + workaround, lalu jadi perbaikan permanen. Atlassian+2IT Process Wiki - the ITIL® Wiki+2
Apa yang kamu buat (PoC)
Di Case Detail (khusus Supervisor), tombol:


“Tag sebagai kandidat RCA”


Dashboard sederhana:


Top kategori keluhan


Top “root cause tag” (manual dulu)


Buat item “Fix Backlog” (internal) yang link ke kumpulan case


Kenapa ini unik
Banyak CRM bank hanya berhenti di tiket selesai. Fitur ini bikin CRM jadi alat perbaikan produk/operasi.



11.4 Rekomendasi pilihan signature untuk Bank Sumut (paling aman & impactful)
Kalau harus pilih cepat:
Consent Cockpit + Why am I seeing this? (paling “bank & compliance friendly”) Tentang Facebook+2edpb.europa.eu+2


NBA explainable (rule-based) untuk jembatan marketing–sales Pega+2Bain+2


Root Cause → Fix Backlog untuk menunjukkan kedewasaan operasional Atlassian+1



Bab 12 — Stack Teknis yang Dipilih (Final) + Alasan Arsitektur untuk CRM Bank
12.1 Tujuan Bab Ini
Bab ini menetapkan stack yang paling “nyambung” untuk prototype React + TypeScript kamu: backend cepat dibangun, rapi, dan tetap scalable untuk roadmap.

12.2 Stack Final (yang kita sepakati)
Frontend
React + TypeScript (prototype UI Customer 360, Case, Marketing/Sales tab)


Backend
Node.js + NestJS (TypeScript) NestJS Documentation+1
 Alasan: NestJS dirancang untuk aplikasi server-side yang efisien dan scalable, TypeScript-first, arsitektur modular. NestJS Documentation+1


Database
PostgreSQL sebagai system of record (single source of truth)


ORM & Migrasi
Prisma (schema model + Prisma Migrate) Prisma+1


Fitur Postgres yang kita pakai sejak PoC
pg_trgm untuk fuzzy search nama (search nasabah lebih “manusiawi”) PostgreSQL+1


citext untuk email/username case-insensitive (mengurangi bug login/duplikasi) PostgreSQL+1


Opsional bertahap
Redis (cache ringkasan Customer 360)


Search engine terpisah (OpenSearch/Elasticsearch) jika dataset makin besar


Data warehouse jika analitik sudah berat



12.3 Alasan Arsitektur (disesuaikan kebutuhan CRM Bank Sumut)
A) Kenapa NestJS cocok untuk CRM bank prototype → roadmap
TypeScript-first: selaras dengan FE React+TS sehingga tim “satu bahasa”. NestJS Documentation+1


Modular: gampang memisahkan domain iam, crm, audit sebagai module (rapi untuk bank). NestJS - A progressive Node.js framework


Scalable: enak untuk tumbuh dari PoC → pilot cabang.


B) Kenapa Prisma cocok untuk PoC
Prisma Migrate memudahkan workflow migrasi schema saat iterasi requirement cepat. Prisma+1


Cocok untuk tim yang ingin rapi dan cepat tanpa boilerplate SQL berat.


C) Kenapa Postgres + pg_trgm + citext “pas” untuk Customer 360
pg_trgm menyediakan operator/fungsi similarity berbasis trigram dan mendukung indexing untuk pencarian cepat. PostgreSQL+1


citext membuat kolom bersifat case-insensitive tanpa perlu lower() terus-menerus, mengurangi error query & duplikasi. PostgreSQL+1



12.4 Struktur Module Backend (biar nyambung ke BRD/PRD)
Rekomendasi module NestJS (minimal untuk PoC):
IamModule → users, roles, branch_scopes, authz guard


CustomerModule → customers, identifiers, assignments, search


Customer360Module → summary + timeline aggregator (query gabungan)


CaseModule → cases, categories, activities, SLA rules


MarketingModule → segments, campaigns, eligibility check


SalesModule → leads, activities, nba rules


AuditModule → append-only logs + viewer untuk compliance



12.5 Checklist kualitas teknis (untuk “vibe bank”)
Wajib ada sejak PoC:
Server-side authorization (RBAC + scope) di semua endpoint


Audit log append-only untuk aksi penting (VIEW_PROFILE, EXPORT, CHANGE_ROLE, CHANGE_CONSENT)


Masking di response API sesuai role


Constraint: case tidak boleh CLOSED jika final_response null (kita kunci juga di DB)
Bab 13 — Skema PostgreSQL (v1 yang Disepakati) + Constraint & Index (PoC Bank Sumut)
13.1 Ringkasan Desain (sesuai keputusan kita)
Prinsip final yang kita pakai di v1:
UUID sebagai PK internal untuk semua tabel inti (stabil, tidak bergantung sumber data). PostgreSQL punya tipe uuid native untuk menyimpan UUID. PostgreSQL


CIF/NIK/ACCOUNT_NO disimpan di tabel identifiers terpisah, dengan constraint unik (id_type, id_value) agar tidak dobel.


Case category v1 fixed (TRX_FAIL, CARD_ATM, DIGITAL_ACCESS, FRAUD_SCAM, FEE_ADMIN, LOAN_CREDIT, OTHER).


Strict multi-cabang scope: akses data dibatasi oleh user_branch_scopes dan customer_assignments (portfolio RM).


Audit log append-only untuk aksi penting; OWASP menyarankan audit trail transaksi bernilai tinggi dengan kontrol integritas (append-only). OWASP+1



13.2 Extensions yang Dipakai (PoC-friendly)
Kita aktifkan 3 hal utama:
citext untuk username/email case-insensitive (mengurangi bug & duplikasi). citext menghilangkan kebutuhan lower() dan membuat kolom bisa case-insensitive secara transparan. PostgreSQL


pg_trgm untuk fuzzy search nama nasabah (mirip cara manusia mencari). pg_trgm menyediakan operator similarity dan index GiST/GIN untuk pencarian cepat. PostgreSQL


(Opsional) ext lain bisa menyusul di roadmap.


Cara umum mengaktifkan extension: CREATE EXTENSION .... PostgreSQL
-- Extensions
CREATE EXTENSION IF NOT EXISTS citext;   -- case-insensitive text :contentReference[oaicite:5]{index=5}
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- trigram similarity search :contentReference[oaicite:6]{index=6}

-- Schemas
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS audit;


13.3 DDL — IAM (Users, Roles, Scope Cabang)
-- iam.users
CREATE TABLE IF NOT EXISTS iam.users (
  user_id     uuid PRIMARY KEY,
  username    citext UNIQUE NOT NULL,          -- case-insensitive :contentReference[oaicite:7]{index=7}
  full_name   text NOT NULL,
  email       citext,
  status      text NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | SUSPENDED
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- iam.roles
CREATE TABLE IF NOT EXISTS iam.roles (
  role_id   uuid PRIMARY KEY,
  role_key  text UNIQUE NOT NULL,  -- DIRECTOR, SUPERVISOR, AGENT, RM, MARKETING, COMPLIANCE, ADMIN
  role_name text NOT NULL
);

-- iam.user_roles
CREATE TABLE IF NOT EXISTS iam.user_roles (
  user_id     uuid NOT NULL REFERENCES iam.users(user_id),
  role_id     uuid NOT NULL REFERENCES iam.roles(role_id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES iam.users(user_id),
  PRIMARY KEY (user_id, role_id)
);

-- iam.user_branch_scopes
CREATE TABLE IF NOT EXISTS iam.user_branch_scopes (
  user_id     uuid NOT NULL REFERENCES iam.users(user_id),
  branch_code text NOT NULL,
  scope_type  text NOT NULL DEFAULT 'BRANCH', -- BRANCH | UNIT
  active_from timestamptz,
  active_to   timestamptz,
  PRIMARY KEY (user_id, branch_code, scope_type)
);


13.4 DDL — CRM Customer Foundation (Customer, Identifiers, Portfolio RM)
-- crm.customers
CREATE TABLE IF NOT EXISTS crm.customers (
  customer_id       uuid PRIMARY KEY,
  full_name         text NOT NULL,
  birth_date        date,
  gender            text,              -- M | F | U
  phone_e164        text,
  email             citext,
  segment_code      text,
  status            text NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | DORMANT | CLOSED
  is_vip            boolean NOT NULL DEFAULT false,
  home_branch_code  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- crm.customer_identifiers
CREATE TABLE IF NOT EXISTS crm.customer_identifiers (
  identifier_id uuid PRIMARY KEY,
  customer_id   uuid NOT NULL REFERENCES crm.customers(customer_id) ON DELETE CASCADE,
  id_type       text NOT NULL,    -- CIF | NIK | ACCOUNT_NO
  id_value      text NOT NULL,
  is_primary    boolean NOT NULL DEFAULT false,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_identifier UNIQUE (id_type, id_value)
);

-- crm.customer_assignments (portfolio RM)
CREATE TABLE IF NOT EXISTS crm.customer_assignments (
  assignment_id uuid PRIMARY KEY,
  customer_id   uuid NOT NULL REFERENCES crm.customers(customer_id) ON DELETE CASCADE,
  rm_user_id    uuid NOT NULL REFERENCES iam.users(user_id),
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  active        boolean NOT NULL DEFAULT true
);

Index untuk Search Customer (fuzzy nama)
 pg_trgm mendukung index GIN/GiST untuk similarity search dan juga mempercepat LIKE/ILIKE. PostgreSQL
-- Fuzzy search nama: GIN trigram index (cepat untuk ILIKE/similarity)
CREATE INDEX IF NOT EXISTS idx_customers_full_name_trgm
ON crm.customers
USING gin (full_name gin_trgm_ops);


13.5 DDL — CRM Case/Complaint Management (Category, Cases, Activities)
-- crm.case_categories
CREATE TABLE IF NOT EXISTS crm.case_categories (
  category_code     text PRIMARY KEY,
  category_name     text NOT NULL,
  default_sla_hours int  NOT NULL DEFAULT 72,
  is_sensitive      boolean NOT NULL DEFAULT false
);

-- crm.cases
CREATE TABLE IF NOT EXISTS crm.cases (
  case_id              uuid PRIMARY KEY,
  case_no              text UNIQUE NOT NULL,   -- nomor registrasi
  customer_id          uuid NOT NULL REFERENCES crm.customers(customer_id),
  branch_code          text NOT NULL,
  channel              text NOT NULL,          -- BRANCH | CALL_CENTER | MOBILE | EMAIL | WHATSAPP
  category_code        text NOT NULL REFERENCES crm.case_categories(category_code),
  priority             text NOT NULL,          -- LOW | MEDIUM | HIGH | CRITICAL
  status               text NOT NULL DEFAULT 'NEW',  -- NEW | IN_PROGRESS | WAITING_INFO | ESCALATED | RESOLVED | CLOSED
  sla_due_at           timestamptz NOT NULL,
  assigned_to_user_id  uuid REFERENCES iam.users(user_id),
  description          text NOT NULL,
  final_response       text,
  resolved_at          timestamptz,
  closed_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  -- Guardrail DB-level: tidak boleh CLOSED kalau final_response NULL
  CONSTRAINT ck_case_close_requires_final_response
    CHECK (status <> 'CLOSED' OR final_response IS NOT NULL)
);

-- crm.case_activities
CREATE TABLE IF NOT EXISTS crm.case_activities (
  activity_id     uuid PRIMARY KEY,
  case_id         uuid NOT NULL REFERENCES crm.cases(case_id) ON DELETE CASCADE,
  activity_type   text NOT NULL,  -- NOTE | ASSIGN | ESCALATE | STATUS_CHANGE | ATTACHMENT | FINAL_RESPONSE
  message         text,
  actor_user_id   uuid NOT NULL REFERENCES iam.users(user_id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Index untuk queue SLA
CREATE INDEX IF NOT EXISTS idx_cases_queue
ON crm.cases (branch_code, status, sla_due_at);

CREATE INDEX IF NOT EXISTS idx_case_activities_case
ON crm.case_activities (case_id, created_at);


13.6 DDL — Consent (PDP) + Marketing Eligibility
-- crm.consents
CREATE TABLE IF NOT EXISTS crm.consents (
  consent_id        uuid PRIMARY KEY,
  customer_id       uuid NOT NULL REFERENCES crm.customers(customer_id) ON DELETE CASCADE,
  consent_type      text NOT NULL,     -- MARKETING | PROFILING | THIRDPARTY_SHARE
  status            text NOT NULL,     -- GRANTED | WITHDRAWN
  effective_at      timestamptz NOT NULL,
  captured_channel  text NOT NULL,     -- BRANCH | MOBILE | CALL_CENTER
  captured_by       uuid NOT NULL REFERENCES iam.users(user_id),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_customer_type
ON crm.consents (customer_id, consent_type, effective_at DESC);

Catatan implementasi PoC (simple tapi kuat)
Gunakan “consent terbaru” per type sebagai state aktif (mis. query ORDER BY effective_at DESC LIMIT 1).


Campaign eligibility check membaca “active consent state” tersebut.



13.7 DDL — Marketing (Segment & Campaign) versi PoC (ringan untuk demo)
-- crm.segments (rule-based)
CREATE TABLE IF NOT EXISTS crm.segments (
  segment_id    uuid PRIMARY KEY,
  name          text NOT NULL,
  rule_json     jsonb NOT NULL,     -- contoh: {"is_vip":true,"marketing_consent":"GRANTED"}
  created_by    uuid NOT NULL REFERENCES iam.users(user_id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- crm.campaigns
CREATE TABLE IF NOT EXISTS crm.campaigns (
  campaign_id    uuid PRIMARY KEY,
  name           text NOT NULL,
  segment_id     uuid NOT NULL REFERENCES crm.segments(segment_id),
  status         text NOT NULL DEFAULT 'DRAFT', -- DRAFT | SUBMITTED | APPROVED | REJECTED | RUNNING | DONE
  channel        text NOT NULL,                 -- EMAIL | WHATSAPP | PUSH (simulasi)
  objective      text,
  created_by     uuid NOT NULL REFERENCES iam.users(user_id),
  approved_by    uuid REFERENCES iam.users(user_id),
  approved_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- eligibility result per customer per campaign (untuk "ineligible reason")
CREATE TABLE IF NOT EXISTS crm.campaign_eligibility (
  campaign_id      uuid NOT NULL REFERENCES crm.campaigns(campaign_id) ON DELETE CASCADE,
  customer_id      uuid NOT NULL REFERENCES crm.customers(customer_id) ON DELETE CASCADE,
  is_eligible      boolean NOT NULL,
  ineligible_reason text,  -- CONSENT | CASE_ACTIVE | NOT_IN_RULE | OTHER
  evaluated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, customer_id)
);


13.8 DDL — Sales (Lead & RM Activity) versi PoC
-- crm.leads
CREATE TABLE IF NOT EXISTS crm.leads (
  lead_id        uuid PRIMARY KEY,
  customer_id    uuid NOT NULL REFERENCES crm.customers(customer_id),
  source_type    text NOT NULL,  -- CAMPAIGN | MANUAL | SERVICE_FOLLOWUP
  source_id      uuid,           -- campaign_id (jika dari campaign)
  assigned_to    uuid NOT NULL REFERENCES iam.users(user_id),  -- RM
  status         text NOT NULL DEFAULT 'NEW', -- NEW | CONTACTED | QUALIFIED | CLOSED_WON | CLOSED_LOST
  closed_reason  text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- crm.rm_activities
CREATE TABLE IF NOT EXISTS crm.rm_activities (
  rm_activity_id uuid PRIMARY KEY,
  customer_id    uuid NOT NULL REFERENCES crm.customers(customer_id),
  rm_user_id     uuid NOT NULL REFERENCES iam.users(user_id),
  activity_type  text NOT NULL,  -- CALL | MEETING | NOTE
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_status
ON crm.leads (assigned_to, status, updated_at DESC);


13.9 DDL — Audit Log (append-only, bank-ready mindset)
OWASP menekankan audit trail transaksi bernilai tinggi dengan kontrol integritas (contoh: append-only tables). OWASP+1
-- audit.audit_logs (append-only)
CREATE TABLE IF NOT EXISTS audit.audit_logs (
  audit_id        uuid PRIMARY KEY,
  action          text NOT NULL,      -- VIEW_PROFILE, CREATE_CASE, EXPORT_DATA, CHANGE_RBAC, CHANGE_CONSENT, ...
  object_type     text NOT NULL,      -- CUSTOMER | CASE | CONSENT | ROLE | EXPORT
  object_id       text NOT NULL,
  actor_user_id   uuid NOT NULL REFERENCES iam.users(user_id),
  actor_role_key  text,
  ip_address      inet,
  user_agent      text,
  meta            jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_action_time
ON audit.audit_logs (action, created_at DESC);

Catatan penting
Jangan masukkan PII sensitif mentah ke meta (pakai masked/hash). (selaras dengan praktik security logging yang aman). OWASP Cheat Sheet Series



Bab 14 — Rencana Demo (7–10 Menit) + Script Narasi (Customer 360 → Case → Consent → Campaign → Audit)
14.1 Tujuan Demo
Demo harus menunjukkan bahwa CRM ini:
Customer 360 benar-benar berguna untuk melayani cepat


Case management end-to-end dengan SLA dan guardrail final response


Marketing–Sales terhubung tapi tetap patuh consent (consent-aware)


Auditability ada (bukan sekadar UI cantik)



14.2 Persiapan Data Demo (wajib biar “ngalir”)
Siapkan minimal 3 nasabah:
Customer A (Consent Withdrawn)
consent MARKETING = WITHDRAWN


tidak punya open case


Customer B (Consent Granted)
consent MARKETING = GRANTED


punya 1 lead atau eligible untuk campaign


Customer C (Open Sensitive Case)
ada case kategori FRAUD_SCAM status IN_PROGRESS


consent boleh GRANTED, tapi policy demo menandai ineligible karena CASE_ACTIVE


Siapkan juga:
1 Supervisor user + 1 Agent user + 1 Marketing user + 1 RM user + 1 Compliance user


scope cabang: Supervisor & Agent hanya cabang tertentu; RM hanya portfolio assignment



14.3 Script Demo — Menit per Menit (siap kamu bacakan)
(0:00–0:45) Opening — framing singkat
“Demo ini menunjukkan CRM Bank Sumut dengan fondasi Customer 360. Fokus demo: melayani pengaduan end-to-end, kampanye yang patuh consent, handoff ke sales, dan audit trail untuk aksi penting.”

(0:45–2:00) Customer 360 — Search & Profile
Masuk sebagai Agent


Buka Search Customer


Cari Customer B (pakai nama/phone/CIF)


Klik hasil → masuk Customer 360


Narasi kunci:
“Di sini ada ringkasan nasabah, timeline interaksi, alert, consent badge, dan tab cases.”


“Data sensitif dimasking, dan setiap view profile tercatat di audit.”



(2:00–4:30) Case Management — Create → SLA → Assign → Final Response → Close
Di Customer 360, klik Create Case


Pilih:


channel: CALL_CENTER


category: DIGITAL_ACCESS


priority: MEDIUM


isi kronologi singkat


Submit → tampil case_no (nomor registrasi) + SLA due auto


Pindah role Supervisor → buka Case Queue


Cari case_no tadi → Assign ke Agent (atau escalate bila perlu)


Kembali ke Agent → buka Case Detail


Tambah note investigasi


Isi Final Response


Klik Close → berhasil


Highlight wajib:
“Sistem menolak close kalau final response kosong.” (kalau mau dramatis: coba close dulu tanpa final response untuk menunjukkan guardrail)



(4:30–6:30) Consent-aware Marketing — Segment/Campaign dengan Ineligible Reason
Masuk sebagai Marketing


Buka Segments → pilih segment demo (atau buat cepat)


Buat campaign DRAFT → submit → approve (opsional cepat)


Jalankan Eligibility Check


Tunjukkan Customer A: Ineligible = CONSENT


Tunjukkan Customer C: Ineligible = CASE_ACTIVE (policy demo)


Execute simulasi → generate event “SENT” untuk eligible


Narasi kunci:
“CRM ini tidak hanya bisa campaign, tapi menjelaskan kenapa seseorang eligible/ineligible (transparansi internal).”


“Consent gating adalah hard rule: tanpa consent marketing, otomatis tidak ikut.”



(6:30–8:00) CRM → Sales Handoff — Lead ke RM
Dari campaign (atau dari Customer 360), create lead untuk Customer B


Masuk sebagai RM


Buka lead list → terlihat lead assigned


Update status: CONTACTED → QUALIFIED


Tambahkan RM activity (call/note) → muncul di timeline Customer 360


Narasi kunci:
“Marketing tidak berhenti di ‘sent’. Ada loop ke RM, dan outcome kembali ke reporting.”



(8:00–9:30) Audit Trail — Compliance View
Masuk sebagai Compliance


Buka Audit Logs


Filter action:


VIEW_PROFILE


CREATE_CASE


ASSIGN_CASE


FINAL_RESPONSE


CLOSE_CASE


CHANGE_CONSENT (kalau sempat demo consent)


Tunjukkan satu record audit untuk “VIEW_PROFILE” dan “CLOSE_CASE”


Narasi kunci:
“Aksi bernilai tinggi punya audit trail yang bisa ditelusuri.”



(9:30–10:00) Closing — roadmap 1 kalimat
“Setelah PoC, tahap berikutnya adalah integrasi data real (batch→near real-time), dedup/match yang lebih matang, dan analytics yang lebih kuat—tanpa mengubah fondasi RBAC+Consent+Audit.”

14.4 Pertanyaan yang biasanya muncul (jawaban cepat)
“Kalau data real dari core/mobile gimana?”
 Jawab: “PoC ini menyiapkan API & model data; integrasi real dilakukan bertahap: batch sync dulu, lalu event/near real-time.”


“AI-nya mana?”
 Jawab: “Di PoC, NBA dan ringkasan dibuat rule-based untuk explainability. AI bisa masuk setelah governance siap.”


“Aman nggak kalau agent bisa search?”
 Jawab: “Search dibatasi scope cabang/portfolio, rate limit, masking, dan audit log view profile.”
Selesai berpikir selama 15s
Bab 15 — Checklist “Done” untuk PoC (Definition of Done + Kriteria Kelulusan Demo)
15.1 Tujuan Bab Ini
Bab ini mendefinisikan kapan PoC dianggap “selesai dan layak demo”. Dalam praktik agile, ini disebut Definition of Done (DoD): deskripsi formal bahwa increment sudah memenuhi standar kualitas yang disepakati. scrumguides.org+1
DoD berbeda dengan Acceptance Criteria: AC spesifik per user story, sedangkan DoD berlaku untuk semua item (kualitas minimum). Atlassian+1

15.2 Definition of Done (DoD) — Berlaku untuk semua fitur PoC
Gunakan DoD ini sebagai “cek akhir sprint” sebelum demo.
A. Kualitas fungsional
Semua user story prioritas PoC (Customer 360 + Case + Consent + Campaign + Audit) lulus Acceptance Criteria.
Tidak ada bug kritikal yang memblokir demo.
B. Kualitas teknis
Endpoint utama memiliki validasi input dan penanganan error yang konsisten.
Ada logging operasional minimal untuk error & event penting.
C. Security & Compliance minimum (bank-ready mindset)
RBAC + scope enforcement dilakukan di backend (bukan cuma hide di UI).
Masking default untuk data sensitif sesuai role.
Audit trail untuk high-value actions (view profile, create/update case, export, change role/consent). OWASP menekankan transaksi bernilai tinggi perlu audit trail dengan kontrol integritas (mis. append-only). OWASP+1
Log tidak menyimpan informasi sensitif yang tidak perlu (mis. password/secret/nomor kartu). OWASP memberi panduan agar tidak melog data sensitif dan mencegah log injection. OWASP Top 10 Proactive Controls+1
D. Dokumentasi minimum
Ada ringkasan modul (1–2 halaman) untuk: cara demo, role demo, dataset demo, dan batasan PoC.

15.3 Checklist Kelulusan PoC (berdasarkan modul inti yang kita bangun)
15.3.1 Akses & Keamanan (Wajib)
RBAC terpasang: DIRECTOR / SUPERVISOR / AGENT / RM / MARKETING / COMPLIANCE / ADMIN
Scope multi-cabang aktif: Agent/Supervisor hanya lihat cabang scope; RM hanya portfolio assignment
Masking aktif: identifier sensitif (NIK/ACCOUNT) dan contact (phone/email) masked by default
Rate limit search customer (anti data scraping)
Audit log append-only aktif + bisa difilter (minimal oleh compliance) OWASP+1
15.3.2 Customer 360 (Wajib)
Search customer (nama/phone/CIF) + match badge
Customer 360 Lite tampil: header + summary cards + alerts + timeline tabs
Event VIEW_PROFILE selalu tercatat saat membuka 360
15.3.3 Case/Complaint Management (Wajib)
Create case: channel/category/priority/description wajib + case_no otomatis
SLA due otomatis terisi
Supervisor bisa assign/escalate + terekam di activity log & audit
Close guardrail: case tidak bisa CLOSED jika final_response kosong (rule backend + constraint DB)
Case detail menampilkan countdown SLA, status, dan activity log
15.3.4 CRM → Marketing (Wajib)
Segment rule-based tersimpan (rule_json) + preview count (boleh simulasi)
Campaign lifecycle minimal: DRAFT → APPROVED → RUNNING/DONE
Eligibility check hard gate: consent marketing = WITHDRAWN → ineligible (reason tersimpan)
“Why am I seeing this?” internal: tampil reason eligible/ineligible (signature yang paling aman)
15.3.5 CRM → Sales (Minimal untuk PoC, tapi sangat dianjurkan)
Create lead dari campaign / follow-up (source_type)
RM melihat lead yang assigned + update status + catat activity
Activity RM muncul di timeline Customer 360 (closed-loop)
15.3.6 Audit & Monitoring (Wajib)
Event minimum terekam:
SEARCH_CUSTOMER, VIEW_PROFILE
CREATE_CASE, UPDATE_CASE, ASSIGN_CASE
FINAL_RESPONSE, CLOSE_CASE
CHANGE_CONSENT, EXPORT_DATA, CHANGE_RBAC/CHANGE_WORKFLOW
Audit log tidak menyimpan PII mentah yang tidak perlu (gunakan masked/hash) OWASP Top 10 Proactive Controls+1

15.4 “PoC Lulus” = Siap Demo
PoC dianggap lulus jika:
Semua checklist “Wajib” terpenuhi
Demo 7–10 menit dapat dilakukan tanpa improvisasi teknis (alur lancar)
Compliance dapat menunjukkan audit log untuk minimal 5 aksi penting

Bab 16 — Roadmap Setelah PoC (Pilot Cabang → Rollout → Intelligence Layer)
16.1 Tujuan Bab Ini
Roadmap ini memandu transisi dari PoC (prototype) ke implementasi nyata: lebih banyak data, lebih banyak user, lebih ketat governance, dan lebih kuat integrasi. Secara praktik implementasi CRM, tahapan umum mencakup: perencanaan kebutuhan, konfigurasi/integrasi, migrasi data, training, lalu rollout bertahap. Salesforce+1

16.2 Prinsip Roadmap (yang menjaga proyek tetap aman dan realistis)
Phased rollout: mulai dari pilot cabang, baru scale (mengurangi risiko adopsi & integrasi).
Data quality first: dedup/match engine ditingkatkan bertahap.
Governance dulu sebelum AI: rule-based + explainable, AI masuk belakangan.

16.3 Tahap 1 — Pilot Cabang (Stabilisasi + Integrasi Dasar)
Target: dari demo menjadi alat kerja terbatas untuk 1–3 cabang/pilot unit.
Deliverables
Integrasi data batch (harian) untuk:
customer master, identifiers (CIF), indikator produk (sekadar flag)
Deduplikasi ringan
match level lebih baik (Exact/Partial/Possible Duplicate) + workflow “merge request” (manual approve)
Case intake omnichannel sederhana
tambah intake dari WhatsApp/email (boleh masih “import”)
Operational dashboards
SLA backlog, overdue, kategori top, aging
Change management
training agent/supervisor + SOP singkat, karena implementasi CRM melibatkan pelatihan & adopsi user, bukan cuma teknis Salesforce+1
Quality gate sebelum lanjut
Audit log stabil dan bisa dipakai compliance
Tidak ada akses data lintas cabang tanpa izin
SLA & close-guardrail berjalan konsisten

16.4 Tahap 2 — Near Real-time & Proses Lebih Matang (Customer 360 “naik kelas”)
Target: Customer 360 menjadi benar-benar “single view” yang lebih hidup.
Deliverables
Event ingestion
timeline event bertambah (mis. login mobile banking, transaksi agregat indikator, interaksi call center)
Workflow & routing lebih kaya
assignment otomatis berdasarkan kategori/branch load (rule-based)
Consent lifecycle lebih lengkap
history consent + source channel + audit yang lebih rinci
Monitoring & alerting
OWASP menekankan monitoring & alerting agar aktivitas mencurigakan cepat terdeteksi/ditangani OWASP+1

16.5 Tahap 3 — Marketing & Sales Makin Nyambung (Closed-loop yang nyata)
Target: bukan cuma “blast campaign”, tapi marketing–sales–service saling memberi feedback.
Deliverables
Segment lebih kaya
aturan segment berbasis perilaku (mis. recency/frequency sederhana dari data ringkas)
Campaign orchestration
approval flow lebih ketat (compliance gate untuk jenis campaign tertentu)
Lead scoring rule-based
skor sederhana + alasan (explainable)
Outcome tracking
RM outcome kembali ke campaign report (konversi proxy)

16.6 Tahap 4 — Intelligence Layer (AI opsional, governance wajib)
Target: AI masuk saat data & governance siap.
Deliverables
RM Copilot ringkasan otomatis + next best action berbasis pola
Guardrail:
hanya gunakan data yang diizinkan
semua rekomendasi punya reason/explainability
audit untuk akses model & hasil (model governance)

16.7 Tahap 5 — Enterprise Rollout (Skala + Operasional)
Target: semua cabang/unit terkait masuk, SLA dan compliance berjalan konsisten.
Deliverables
Multi-tenant policy yang lebih ketat per unit
Data warehouse / lake untuk analitik skala besar
DR, backup, dan prosedur incident response (operasional production)

16.8 KPI Roadmap (agar tiap tahap terukur)
Contoh KPI yang nyambung dengan modul kita:
Service
% case closed within SLA
median time to final response
backlog aging
Marketing
eligible rate (setelah consent gate)
opt-out rate (monitor kualitas campaign)
Sales
lead acceptance rate oleh RM
conversion proxy (Qualified / Closed Won)
Governance
jumlah akses “break-glass”
coverage audit event untuk aksi penting

