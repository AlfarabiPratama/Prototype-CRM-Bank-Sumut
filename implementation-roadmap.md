# Implementation Roadmap - CRM Bank Sumut

Dokumen ini berisi rencana implementasi untuk menyelaraskan prototype dengan:
- **Pedoman CRM Bank Sumut** (Governance, Compliance, Foundation)
- **Modul Implementasi v1.2** (Inovasi Bisnis, Differentiator)
- **Framework CRM** (Tipe, Modul, Komponen)

---

## 🏗️ Framework CRM yang Digunakan

### Tipe CRM untuk Bank Sumut

| Tipe | Prioritas | Status |
|------|-----------|--------|
| **Operational CRM** (Case, Sales, Marketing) | 🔥 PRIMARY | ✅ Implemented |
| **Analytical CRM** (Dashboard, Reporting) | 🔥 PRIMARY | 🟡 Partial |
| **Collaborative CRM** (Shared Timeline, Visibility) | 🟡 SECONDARY | ✅ Implemented |
| **Strategic CRM** (Loyalty, CLV, Lifecycle) | 🟢 PHASE 2+ | ❌ Not Started |

### Modul CRM - Status Mapping

| Modul | Status | Catatan |
|-------|--------|---------|
| Customer 360 | ✅ Done | Profile, Timeline, Tabs |
| Case/Service | ✅ Done | Ticketing, SLA, Final Response |
| Marketing | ✅ Done | Campaign, Eligibility, Consent |
| Sales | ✅ Done | Lead, Activity |
| RBAC & Security | ✅ Done | Role, Scope, Masking, Audit |
| Analytics | 🟡 Partial | Basic dashboard, need enhancement |
| Workflow/BPM | 🟡 Partial | Basic routing, need automation |
| Mobile CRM | ❌ Phase 2+ | - |
| Document Mgmt | ❌ Phase 2+ | - |
| Integration | ❌ Mock Data | API ready for real integration |

---

## 📊 Status Saat Ini vs Requirement

### ✅ Sudah Diimplementasi

| Modul | Fitur | Referensi |
|-------|-------|-----------|
| **Customer 360** | Search scoped, Profile masked, Timeline, Tabs | Pedoman Bab 7 |
| **Case Management** | Create case + SLA auto, Assign/Escalate, Activity log, Final Response guardrail | Pedoman Bab 7 |
| **Marketing** | Segment rule-based, Campaign lifecycle, Eligibility check + ineligible reason | Pedoman Bab 7 |
| **Sales** | Lead board kanban, Status update, RM Activity composer | Pedoman Bab 7 |
| **Audit** | Audit log viewer, Filter by event/entity, CSV export | Pedoman Bab 7 |
| **RBAC** | Role switcher, Permission-based navigation, Scope filtering | Pedoman Bab 6 |
| **Masking** | NIK, Phone, Email, Account Number masked by role | Pedoman Bab 6.5 |
| **Consent Transparency** | "Ineligible reason" di campaign eligibility | Pedoman Bab 11.3.A |

### ❌ Belum Diimplementasi - Prioritized Backlog

| # | Fitur | Sumber | Prioritas |
|---|-------|--------|-----------|
| 1 | RFM Analysis + CLV Proxy | v1.2 + Framework | 🔴 **HIGH** |
| 2 | Hyperlocal Merchant | v1.2 US-D1 | 🔴 **HIGH** |
| 3 | Service Recovery Automation | v1.2 US-D2 | 🔴 **HIGH** |
| 4 | NBA (Next Best Action) | Pedoman US-18 | 🔴 **HIGH** |
| 5 | Consent Change by CS/Agent | Pedoman US-10 | 🔴 **HIGH** |
| 6 | Marketing Automation (Visual) | Framework | 🔴 **HIGH** |
| 7 | Rule-Based Alerts | Pedoman US-04 | 🟡 **MEDIUM** |
| 8 | Lead Scoring (Rule-based) | Framework | 🟡 **MEDIUM** |
| 9 | NPS/CSAT Survey | Framework | 🟡 **MEDIUM** |
| 10 | Opportunity Pipeline | v1.2 US-C2 | 🟡 **MEDIUM** |
| 11 | Root Cause Tag + Dashboard | Pedoman Bab 11.3.E | 🟢 **LOW** |
| 12 | RM Copilot 30 Detik | Pedoman Bab 11.3.C | 🟢 **LOW** |
| 13 | Knowledge Base / FAQ | Framework | 🟢 **LOW** |

---

## 🔴 Backlog Prioritas HIGH

### 1. RFM Analysis + CLV Proxy

**Referensi**: Modul v1.2 + Framework (Financial Analytics)

**Status**: ✅ **IMPLEMENTED** (Dec 2024)

**Konsep RFM**:
| Dimensi | Deskripsi | Score 1-5 |
|---------|-----------|-----------|
| **R**ecency | Kapan terakhir transaksi/interaksi | 5 = Baru, 1 = Lama |
| **F**requency | Seberapa sering transaksi | 5 = Sering, 1 = Jarang |
| **M**onetary | Nilai transaksi/saldo rata-rata | 5 = Tinggi, 1 = Rendah |

**Data Window**:
- **PoC**: Static seed data (mock)
- **Production**: 12 bulan rolling window dari Postgres/DWH

**Scoring Thresholds (Threshold-Based)**:

> Dipilih threshold tetap (bukan percentile) karena PoC hanya 5 customers.

| Score | Recency (days) | Frequency (count) | Monetary (IDR) |
|-------|----------------|-------------------|----------------|
| **5** | ≤ 7 | ≥ 50 | ≥ 100M |
| **4** | 8–30 | 30–49 | 50–100M |
| **3** | 31–90 | 15–29 | 20–50M |
| **2** | 91–180 | 5–14 | 5–20M |
| **1** | > 180 | < 5 | < 5M |

**Segment Mapping Rules**:
| Segment | Rule | CLV Proxy | Aksi Recommended |
|---------|------|-----------|------------------|
| **CHAMPION** | R≥4, F≥4, M≥4 | 💎 Very High | Retain, Exclusive rewards |
| **LOYAL** | F≥4 (any R,M) | 💰 High | Upsell, Cross-sell |
| **POTENTIAL** | R≥4 (F<4) | 📈 Growing | Nurture frequency |
| **AT_RISK** | R≤2, F≤3, total≥6 | ⚠️ Declining | Win-back campaign |
| **HIBERNATING** | R≤2, F≤2 | 😴 Low | Re-engagement |
| **LOST** | R=1, F=1 | 🔻 Minimal | Low-cost reach-out |

**Edge Cases**:
- Zero transactions → Frequency/Monetary = 0 → Score 1
- Missing dates → Skip atau gunakan `customer.created_at`
- Negative monetary → Treated as 0
- Timezone → Semua timestamp UTC (ISO 8601)

**Data Model**:

```typescript
interface RFMScore {
  customer_id: string;
  recency_score: 1 | 2 | 3 | 4 | 5;
  recency_days: number;
  frequency_score: 1 | 2 | 3 | 4 | 5;
  frequency_count: number;
  monetary_score: 1 | 2 | 3 | 4 | 5;
  monetary_value: number;
  total_score: number; // R + F + M (3-15)
  segment: 'CHAMPION' | 'LOYAL' | 'POTENTIAL' | 'AT_RISK' | 'HIBERNATING' | 'LOST';
  clv_proxy: 'VERY_HIGH' | 'HIGH' | 'GROWING' | 'DECLINING' | 'LOW' | 'MINIMAL';
  segment_reason: string; // Explainability: "R=5, F=5, M=4 → High recency & frequency"
  calculated_at: string;
}
```

**UI (Implemented)**:
- ✅ RFM Segment badge di Customer 360 header
- ✅ CLV indicator (💎💰📈⚠️😴🔻) 
- ✅ Card "Customer Value" dengan breakdown R, F, M scores + explainability
- ✅ Filter segment di Customer Search
- ✅ RFM Distribution chart di Dashboard
- ⏳ Segment-based campaign targeting (roadmap)

---

### 2. Hyperlocal Merchant Recommendation

**Referensi**: Modul v1.2 US-D1

**User Story**:
> Sebagai RM/Sistem, saya ingin merekomendasikan merchant QRIS Bank Sumut terdekat dari lokasi nasabah.

**Alur "Hyperlocal Loop"**:
```
1. Analisa: Nasabah A (Domisili: Medan, Sering belanja FnB)
2. Matching: Cari Merchant QRIS Bank Sumut (FnB) di Medan yang promo aktif
3. Action: RM kirim WA: "Pak, makan siang di RM 'Soto Kesawan', diskon 10% pakai Qren"
4. Impact: 
   - Nasabah senang (personal & relevant)
   - Merchant dapat omzet
   - Bank dapat fee transaksi QRIS
```

**Data Model**:

```typescript
interface MerchantPartner {
  id: string;
  name: string;
  category: 'FnB' | 'FASHION' | 'OLEH_OLEH' | 'GROCERY' | 'OTHER';
  city_code: string; // MEDAN, PEMATANGSIANTAR, BINJAI, KARO
  address: string;
  is_promo_active: boolean;
  promo_details?: string;
  promo_end_date?: string;
  created_at: string;
}

interface MerchantRecommendation {
  id: string;
  customer_id: string;
  merchant_id: string;
  recommended_by: string; // RM user_id atau 'SYSTEM'
  recommendation_reason: string;
  status: 'PENDING' | 'SENT' | 'CLICKED' | 'CONVERTED';
  sent_at?: string;
  converted_at?: string;
  created_at: string;
}
```

**UI**:
- Tab "Merchant Promo" di Customer 360
- Panel "Nearby Merchants" dengan filter kategori/city
- Tombol "Kirim Rekomendasi" (WA template)
- Dashboard: Conversion rate per merchant/city

---

### 3. Service Recovery Automation

**Referensi**: Modul v1.2 US-D2

**User Story**:
> Sebagai Sistem, saya otomatis membuat task recovery jika case ditutup melebihi SLA.

**Trigger Rules**:
| Kategori Case | Kondisi | Recovery Action |
|---------------|---------|-----------------|
| TRX_FAIL | SLA Breach | Voucher 50K / Free Admin 3 bulan |
| CARD_ATM | SLA Breach | Souvenir Send + Apology Letter |
| FRAUD_SCAM | Any Close | Apology Call (mandatory) |
| Any | > 2x SLA | Escalate + Free Admin |
| High Value Customer (RFM Champion) | Any SLA Breach | Priority recovery + Personal call |

**Data Model**:

```typescript
interface ServiceRecovery {
  id: string;
  case_id: string;
  customer_id: string;
  trigger_reason: 'SLA_BREACHED' | 'SYSTEM_ERROR_REPEAT' | 'HIGH_VALUE_CUSTOMER' | 'FRAUD_CASE';
  offered_action: 'FREE_ADMIN_FEE' | 'VOUCHER_50K' | 'SOUVENIR_SEND' | 'APOLOGY_CALL' | 'PRIORITY_CALLBACK';
  estimated_value: number; // Nilai recovery dalam IDR
  status: 'PENDING' | 'APPROVED' | 'SENT' | 'CLAIMED' | 'EXPIRED';
  approved_by?: string;
  sent_at?: string;
  claimed_at?: string;
  created_at: string;
}
```

**UI**:
- Auto-notification ke Supervisor saat trigger terpenuhi
- Approval workflow untuk recovery > threshold
- Recovery task di RM/Agent workspace
- Dashboard: Recovery rate, Redemption rate, Cost of recovery

---

### 4. NBA (Next Best Action) - Rule-Based

**Referensi**: Pedoman Bab 7 US-18, Bab 11.3.D

**NBA Rules Engine**:

```
PRIORITY HIGH:
- IF case.sla_status = OVERDUE 
  → "Prioritaskan penyelesaian case" (PRIORITIZE_CASE)
  
- IF rfm.segment = AT_RISK AND no_contact_30_days
  → "Hubungi untuk retention" (CALL)

PRIORITY MEDIUM:
- IF consent.marketing = GRANTED AND no_open_case 
  → "Ajak aktivasi fitur baru" (OFFER_PRODUCT)
  
- IF lead.status = NEW AND days_since_created > 3 
  → "Follow up lead segera" (CALL)

- IF customer.city = merchant.city AND merchant.promo_active 
  → "Rekomendasikan merchant lokal" (MERCHANT_PROMO)

PRIORITY LOW:
- IF case.category = FRAUD_SCAM (ever) 
  → "Kirim edukasi anti-scam" (EDUCATE)
  
- IF rfm.segment = CHAMPION AND birthday_soon
  → "Kirim ucapan ulang tahun" (GREET)
```

**Data Model**:

```typescript
interface NBARecommendation {
  id: string;
  customer_id: string;
  action_type: 'CALL' | 'EMAIL' | 'OFFER_PRODUCT' | 'EDUCATE' | 'PRIORITIZE_CASE' | 'MERCHANT_PROMO' | 'GREET';
  title: string;
  reason_text: string; // "Muncul karena: RFM segment AT_RISK + tidak ada kontak 30 hari"
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  related_entity_type?: 'CASE' | 'LEAD' | 'CAMPAIGN' | 'MERCHANT';
  related_entity_id?: string;
  decision?: 'ACCEPTED' | 'REJECTED' | 'SNOOZED';
  decision_reason?: string;
  decided_at?: string;
  decided_by?: string;
  outcome?: 'SUCCESS' | 'FAILED' | 'PENDING';
  created_at: string;
}
```

**UI**:
- Panel NBA di Customer 360 (collapsible sidebar)
- Badge count di navigation
- Tombol Accept/Reject/Snooze dengan optional reason
- Dashboard: Acceptance rate, Success rate per action type

---

### 5. Consent Change by CS/Agent

**Referensi**: Pedoman Bab 7 US-10, Bab 6.4.2

**Data Model**:

```typescript
interface ConsentHistory {
  id: string;
  customer_id: string;
  consent_type: 'MARKETING' | 'PROFILING' | 'THIRDPARTY_SHARE';
  old_status: 'GRANTED' | 'WITHDRAWN';
  new_status: 'GRANTED' | 'WITHDRAWN';
  effective_at: string;
  captured_channel: 'BRANCH' | 'CALL_CENTER' | 'MOBILE' | 'EMAIL';
  captured_by: string;
  verification_method: 'PHONE_OTP' | 'IN_PERSON' | 'DIGITAL_SIGNATURE';
  reason?: string;
  created_at: string;
}
```

**Guardrails**:

- ✅ Marketing role TIDAK BOLEH mengubah consent (conflict of interest)
- ✅ Perubahan wajib verification method
- ✅ Audit event CHANGE_CONSENT tercatat
- ✅ Jika MARKETING = WITHDRAWN → auto update eligibility

---

### 6. Marketing Automation (Visual Campaign Builder)

**Referensi**: Framework CRM - Marketing Module

**Konsep**: Platform untuk merancang, menjalankan, dan menganalisis kampanye pemasaran di berbagai saluran secara visual.

**Komponen Utama**:

#### A. Visual Journey Builder

Drag-and-drop canvas untuk membuat customer journey:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   TRIGGER   │ →  │    WAIT      │ →  │   ACTION    │ →  │   BRANCH     │
│ (Entry)     │    │ (Delay)      │    │ (Send)      │    │ (Condition)  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
     │                   │                   │                   │
  ┌──┴──┐            ┌──┴──┐            ┌──┴──┐            ┌──┴───┴──┐
  │Event│            │1 Day│            │Email│            │Yes │ No │
  │Form │            │1 Week│           │SMS  │            └────┴────┘
  │Time │            │Custom│           │WA   │
  └─────┘            └─────┘            │Push │
                                        └─────┘
```

**Node Types**:

| Node Type | Deskripsi | Contoh |
|-----------|-----------|--------|
| **TRIGGER** | Entry point journey | Segment entered, Event fired, Schedule |
| **WAIT** | Delay before next step | Wait 1 day, Wait until date |
| **ACTION** | Kirim komunikasi | Send Email, Send SMS, Send WA, Push Notification |
| **BRANCH** | Kondisi IF/ELSE | Has opened email? RFM = Champion? |
| **SPLIT** | A/B Testing | 50% Variant A, 50% Variant B |
| **UPDATE** | Update data customer | Add tag, Update field |
| **END** | Exit journey | Goal reached, Unsubscribed |

#### B. Multi-Channel Orchestration

| Channel | Capability | Use Case |
|---------|------------|----------|
| **Email** | Rich HTML, Personalization, Tracking | Newsletter, Promo, Edukasi |
| **SMS** | Short text, OTP, Alert | Reminder, Urgent |
| **WhatsApp** | Template message, Media | Personal outreach, Promo |
| **Push Notification** | Mobile app alert | Transaction, Promo flash |
| **In-App Message** | Banner/Modal dalam app | Onboarding, Feature announcement |

#### C. Campaign Analytics (Real-time)

**Metrics per Channel**:

| Metric | Email | SMS | WA | Push |
|--------|-------|-----|-----|------|
| Sent | ✅ | ✅ | ✅ | ✅ |
| Delivered | ✅ | ✅ | ✅ | ✅ |
| Opened | ✅ | ❌ | ✅ | ✅ |
| Clicked | ✅ | ❌ | ✅ | ✅ |
| Converted | ✅ | ✅ | ✅ | ✅ |
| Unsubscribed | ✅ | ✅ | ✅ | ✅ |

**Data Model**:

```typescript
// Journey Definition
interface MarketingJourney {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  trigger_type: 'SEGMENT' | 'EVENT' | 'SCHEDULE' | 'API';
  trigger_config: Record<string, any>;
  nodes: JourneyNode[];
  edges: JourneyEdge[];
  created_by: string;
  approved_by?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface JourneyNode {
  id: string;
  type: 'TRIGGER' | 'WAIT' | 'ACTION' | 'BRANCH' | 'SPLIT' | 'UPDATE' | 'END';
  position: { x: number; y: number };
  config: {
    // For ACTION node
    channel?: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
    template_id?: string;
    // For WAIT node
    delay_type?: 'DURATION' | 'UNTIL_DATE' | 'UNTIL_EVENT';
    delay_value?: number;
    delay_unit?: 'MINUTES' | 'HOURS' | 'DAYS';
    // For BRANCH node
    condition?: string; // Expression
    // For SPLIT node
    variants?: { name: string; percentage: number }[];
  };
}

interface JourneyEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string; // "Yes", "No", "Variant A"
}

// Journey Enrollment (per customer)
interface JourneyEnrollment {
  id: string;
  journey_id: string;
  customer_id: string;
  current_node_id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXITED' | 'ERROR';
  entered_at: string;
  completed_at?: string;
  exit_reason?: string;
}

// Campaign Message
interface CampaignMessage {
  id: string;
  journey_id: string;
  enrollment_id: string;
  customer_id: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH' | 'IN_APP';
  template_id: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failed_reason?: string;
  created_at: string;
}

// Email/Message Template
interface MessageTemplate {
  id: string;
  name: string;
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
  subject?: string; // For email
  body: string;
  html_body?: string; // For email
  variables: string[]; // {{customer_name}}, {{promo_code}}
  thumbnail_url?: string;
  created_by: string;
  created_at: string;
}
```

#### D. A/B Testing

**Test Types**:

| Type | What to Test | Metric |
|------|--------------|--------|
| Subject Line | Email subject variants | Open Rate |
| Content | Message body variants | Click Rate |
| Send Time | Morning vs Evening | Open Rate |
| Channel | Email vs WA | Conversion |

**A/B Test Flow**:

```
1. Create 2+ Variants
2. Set Split (50/50, 70/30, etc)
3. Define Test Duration (min 24 hours)
4. Define Winner Metric (Open, Click, Convert)
5. Auto-select Winner OR Manual select
6. Roll out Winner to remaining audience
```

#### E. Template Designer

**Email Template Builder**:

- Drag-and-drop blocks (Header, Text, Image, Button, Footer)
- Mobile responsive preview
- Personalization tokens: `{{customer.name}}`, `{{promo.code}}`
- Save as template library

**WhatsApp Template**:

- Pre-approved message templates
- Variable placeholders
- Media attachment (image, document)

**UI Components**:

- **Journey Canvas**: Visual drag-drop editor
- **Template Library**: Reusable templates per channel
- **Audience Preview**: See eligible count before send
- **Schedule Calendar**: View all scheduled campaigns
- **Analytics Dashboard**: Real-time metrics

**Implementation Phases**:

| Phase | Scope | Priority |
|-------|-------|----------|
| **Phase 1** | Multi-channel send (Email, WA) + Basic analytics | 🔴 HIGH |
| **Phase 2** | Visual Journey Builder + A/B Testing | 🟡 MEDIUM |
| **Phase 3** | Template Designer + Advanced Analytics | 🟢 LOW |

---

## 🟡 Backlog Prioritas MEDIUM

### 7. Rule-Based Alerts

**Alert Types**:
| Type | Severity | Trigger |
|------|----------|---------|
| CONSENT_WITHDRAWN | 🔴 CRITICAL | consent.marketing = WITHDRAWN |
| OVERDUE_SLA | 🔴 CRITICAL | case.sla_due_at < now() |
| FRAUD_FLAG | 🔴 CRITICAL | case.category = FRAUD_SCAM |
| OPEN_CASE | 🟡 WARNING | case.status IN (NEW, IN_PROGRESS) |
| HIGH_PRIORITY_CASE | 🟡 WARNING | case.priority = HIGH/CRITICAL |
| VIP_CUSTOMER | 🔵 INFO | customer.is_vip = true |
| AT_RISK_SEGMENT | 🔵 INFO | rfm.segment = AT_RISK |

**UI**: Alert badges di Customer 360 header + Alert summary panel

---

### 8. Lead Scoring (Rule-Based)

**Referensi**: Framework CRM - Sales Module

**Scoring Rules**:
| Faktor | Score | Weight |
|--------|-------|--------|
| RFM Segment = CHAMPION | +30 | High |
| RFM Segment = LOYAL | +20 | High |
| Has marketing consent | +15 | Medium |
| Recent engagement (< 7 days) | +10 | Medium |
| Downloaded brochure | +10 | Medium |
| Visited branch | +5 | Low |
| Email opened | +5 | Low |

**Lead Priority**:
| Total Score | Priority | Action |
|-------------|----------|--------|
| 60+ | 🔥 HOT | Immediate follow-up |
| 40-59 | 🟡 WARM | Follow-up within 3 days |
| 20-39 | 🔵 COOL | Nurture campaign |
| < 20 | ⚪ COLD | Monitor only |

**Data Model**:

```typescript
interface LeadScore {
  lead_id: string;
  customer_id: string;
  total_score: number;
  priority: 'HOT' | 'WARM' | 'COOL' | 'COLD';
  score_breakdown: {
    factor: string;
    score: number;
    reason: string;
  }[];
  calculated_at: string;
}
```

---

### 9. NPS/CSAT Survey (Post-Case)

**Referensi**: Framework CRM - Customer Service Module

**Survey Types**:
| Type | When | Question |
|------|------|----------|
| **CSAT** (Customer Satisfaction) | After case closed | "Seberapa puas dengan penyelesaian? (1-5 ⭐)" |
| **NPS** (Net Promoter Score) | Monthly / Quarterly | "Seberapa mungkin Anda merekomendasikan? (0-10)" |
| **CES** (Customer Effort Score) | After complex case | "Seberapa mudah masalah Anda diselesaikan? (1-5)" |

**Data Model**:

```typescript
interface CustomerSurvey {
  id: string;
  customer_id: string;
  case_id?: string;
  survey_type: 'CSAT' | 'NPS' | 'CES';
  score: number;
  feedback_text?: string;
  channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'CALL';
  sent_at: string;
  responded_at?: string;
  created_at: string;
}
```

**Metrics**:
- CSAT: % score 4-5
- NPS: (% Promoters 9-10) - (% Detractors 0-6)
- Response Rate: % yang merespond dari yang dikirim

---

### 10. Opportunity Pipeline

**Referensi**: Modul v1.2 US-C2

**Pipeline Stages**:
```
NEW → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED_WON / CLOSED_LOST
```

**Data Model**:

```typescript
interface Opportunity {
  id: string;
  customer_id: string;
  lead_id?: string;
  product_interest: string;
  estimated_value: number;
  stage: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number; // 0-100 based on stage
  expected_close_date: string;
  assigned_to: string;
  lost_reason?: string;
  won_product_id?: string;
  created_at: string;
  updated_at: string;
}
```

**Stage Probability**:
| Stage | Default Probability |
|-------|---------------------|
| NEW | 10% |
| QUALIFIED | 25% |
| PROPOSAL | 50% |
| NEGOTIATION | 75% |
| CLOSED_WON | 100% |
| CLOSED_LOST | 0% |

---

## 🟢 Backlog Prioritas LOW

### 10. Root Cause Tag + Dashboard
- Supervisor tag case sebagai "Kandidat RCA"
- Root cause categories (SYSTEM_BUG, PROCESS_GAP, HUMAN_ERROR, EXTERNAL)
- Dashboard: Top root causes, Trend over time

### 11. RM Copilot 30 Detik
- Panel ringkasan: Identitas masked, Top 3 events, Open case status, Consent, RFM, NBA

### 12. Knowledge Base / FAQ
- Self-service articles
- Agent quick-reference
- Search functionality

---

## 📋 Checklist "Done" untuk PoC

### ✅ Foundation Layer
- [x] RBAC (7 roles)
- [x] Branch/Portfolio Scope
- [x] Data Masking
- [x] Audit Log
- [ ] Rate Limit

### ✅ Operational CRM
- [x] Customer 360 Lite
- [x] Case Management + SLA
- [x] Campaign + Eligibility
- [x] Lead + Activity

### 🟡 Analytical CRM
- [x] Basic Dashboard
- [ ] RFM Segmentation
- [ ] Lead Scoring
- [ ] Survey/NPS

### ❌ Strategic CRM (Phase 2+)
- [ ] CLV Calculation
- [ ] Churn Prediction
- [ ] Loyalty Program

---

## 🎯 KPI Target PoC

| Metrik | Target | Pengukuran |
|--------|--------|------------|
| Time-to-Context | < 30 Detik | Search → Profile → Understand |
| First Response Time | < 1 Jam | Case created → First update |
| SLA Compliance | > 85% | Cases closed within SLA |
| Sales Activity Log | > 5/Hari | Activities per RM |
| Local Promo Conversion | > 2% | Merchant recommendation → Transaction |
| Survey Response Rate | > 30% | Surveys sent → Responded |

---

## 🗄️ Database Schema (Additions)

```sql
-- 1. RFM Scores
CREATE TABLE IF NOT EXISTS crm.rfm_scores (
  rfm_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  recency_score   int CHECK (recency_score BETWEEN 1 AND 5),
  recency_days    int,
  frequency_score int CHECK (frequency_score BETWEEN 1 AND 5),
  frequency_count int,
  monetary_score  int CHECK (monetary_score BETWEEN 1 AND 5),
  monetary_value  numeric(15,2),
  total_score     int GENERATED ALWAYS AS (recency_score + frequency_score + monetary_score) STORED,
  segment         text,
  clv_proxy       text,
  calculated_at   timestamptz DEFAULT now()
);

-- 2. Merchant Partners
CREATE TABLE IF NOT EXISTS crm.merchant_partners (
  merchant_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name   text NOT NULL,
  category        text,
  city_code       text,
  address         text,
  is_promo_active boolean DEFAULT false,
  promo_details   text,
  promo_end_date  date,
  created_at      timestamptz DEFAULT now()
);

-- 3. Service Recovery
CREATE TABLE IF NOT EXISTS crm.service_recovery_logs (
  recovery_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid REFERENCES crm.cases(case_id),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  trigger_reason  text,
  offered_action  text,
  estimated_value numeric(15,2),
  status          text DEFAULT 'PENDING',
  approved_by     uuid REFERENCES iam.users(user_id),
  sent_at         timestamptz,
  claimed_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- 4. NBA Recommendations
CREATE TABLE IF NOT EXISTS crm.nba_recommendations (
  nba_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  action_type     text NOT NULL,
  title           text NOT NULL,
  reason_text     text NOT NULL,
  priority        text DEFAULT 'MEDIUM',
  related_entity_type text,
  related_entity_id   uuid,
  decision        text,
  decision_reason text,
  decided_by      uuid REFERENCES iam.users(user_id),
  decided_at      timestamptz,
  outcome         text,
  created_at      timestamptz DEFAULT now()
);

-- 5. Lead Scores
CREATE TABLE IF NOT EXISTS crm.lead_scores (
  score_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         uuid REFERENCES crm.leads(lead_id),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  total_score     int,
  priority        text,
  score_breakdown jsonb,
  calculated_at   timestamptz DEFAULT now()
);

-- 6. Customer Surveys
CREATE TABLE IF NOT EXISTS crm.customer_surveys (
  survey_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  case_id         uuid REFERENCES crm.cases(case_id),
  survey_type     text NOT NULL,
  score           int,
  feedback_text   text,
  channel         text,
  sent_at         timestamptz,
  responded_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- 7. Consent History
CREATE TABLE IF NOT EXISTS crm.consent_history (
  history_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES crm.customers(customer_id),
  consent_type    text NOT NULL,
  old_status      text,
  new_status      text NOT NULL,
  effective_at    timestamptz NOT NULL,
  captured_channel text NOT NULL,
  captured_by     uuid REFERENCES iam.users(user_id),
  verification_method text,
  reason          text,
  created_at      timestamptz DEFAULT now()
);
```

---

## 🚀 Roadmap Timeline

| Phase | Timeline | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **PoC** | Current | Foundation | Customer 360, Case, Campaign, Audit |
| **Phase 1** | +1 Month | Analytics | RFM, Lead Scoring, NBA, Alerts |
| **Phase 2** | +2 Months | Innovation | Hyperlocal, Service Recovery, Survey |
| **Phase 3** | +3 Months | Scale | Real Integration, Mobile, Workflow |
| **Phase 4** | +6 Months | Intelligence | AI NBA, Churn Prediction, CLV |

---

*Dokumen ini menggabungkan Pedoman CRM, Modul v1.2, dan Framework CRM untuk panduan implementasi lengkap.*

*Last Updated: 2025-12-23*
