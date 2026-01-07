---
description: Frontend instructions untuk CRM Bank Sumut PoC
applyTo: "src/**"
---

# Frontend Rules (src/**)

## Jangan rusak wiring app
- Pertahankan entry point yang sudah bekerja (biasanya src/main.tsx).
- Routing terpusat di src/app/router.tsx dan layout di src/app/layout/AppShell.tsx (jika ada).

## Policy-first
- Setiap akses data customer/case/lead harus melewati `can()` + scope check.
- Jangan hanya mengandalkan kondisi render tombol.

## Masking & Audit
- Masking default untuk field sensitif.
- Catat audit event untuk aksi penting (lihat daftar event minimum di AGENTS.md).

## Guardrail
- Close case ditolak jika final_response kosong.
- Eligibility campaign menolak consent withdrawn dan menyimpan ineligible_reason.
