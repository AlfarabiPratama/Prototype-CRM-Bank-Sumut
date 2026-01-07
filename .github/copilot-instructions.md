# .github/copilot-instructions.md — Custom Instructions (CRM Bank Sumut PoC)

## Tujuan
Bantu menghasilkan perubahan kode yang konsisten untuk prototype CRM Bank Sumut:
Customer 360 + Case/Complaint + Consent-aware Marketing + Sales handoff + Audit + RBAC/Scope.

## Aturan Keras
- Jangan membuat project baru atau refactor global besar-besaran.
- Semua data mock (in-memory/seed). Tidak ada backend sungguhan.
- RBAC + scope enforcement wajib via policy layer (bukan hanya hide UI).
- Masking default data sensitif (NIK/ACCOUNT/phone/email) berdasarkan role.
- Audit log wajib untuk event minimum:
  SEARCH_CUSTOMER, VIEW_PROFILE, CREATE_CASE, UPDATE_CASE, ASSIGN_CASE,
  FINAL_RESPONSE, CLOSE_CASE, CHANGE_CONSENT, EXPORT_DATA, CHANGE_RBAC, CHANGE_WORKFLOW
- Guardrail wajib:
  (1) Case tidak boleh CLOSED jika final_response kosong
  (2) Consent MARKETING=WITHDRAWN => ineligible campaign (reason=CONSENT)

## Routing Wajib
/  /customers  /customers/:id  /cases  /cases/:id  /marketing  /sales  /audit  /admin

## Role & Scope Ringkas
DIRECTOR (aggregate only), SUPERVISOR/AGENT (branch-scope), RM (portfolio-scope),
MARKETING (campaign context only, no consent change), COMPLIANCE (audit-centric),
ADMIN (config + audit).

## Output yang Diminta Saat Menjawab
1) Plan singkat
2) File yang diubah/ditambah
3) Kode per file siap tempel
4) How to verify di UI
