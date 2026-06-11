# OLabo — AI Designer Prompt
## Blood Testing Laboratory Management System — Full UI/UX Design Brief

---

## 1. PROJECT OVERVIEW

**Product name:** OLabo
**Type:** Web application (SaaS)
**Industry:** Healthcare — blood testing / medical diagnostics laboratory

OLabo is a multi-role laboratory management platform for:
- **B2C patients** who book tests online, have samples collected at home, and retrieve results via a secure lookup page
- **B2B medical partners** (clinics, hospitals, pharmacies, companies) who submit batches of patient samples and download results in bulk
- **Lab staff / admins / doctors** who manage operations through an internal admin dashboard

The codebase is **Next.js 14 (App Router)** with **TypeScript**, **TailwindCSS**, and **Firebase** (Auth, Firestore, Storage, Cloud Functions). All design must be implementable with Tailwind utility classes and shadcn/ui components.

---

## 2. BRAND & VISUAL IDENTITY

### 2.1 Tone
- Professional, clean, trustworthy — healthcare context requires clarity over decoration
- Approachable and modern — not cold/clinical like traditional medical software
- Confident and minimal — no clutter; whitespace is essential

### 2.2 Color Palette

**Primary (brand):**
- Primary-600: `#0EA5E9` (sky blue — main CTA, links, active states)
- Primary-700: `#0284C7` (hover states)
- Primary-50: `#F0F9FF` (light backgrounds, selected rows)

**Neutral:**
- Background: `#F8FAFC` (page background)
- Surface: `#FFFFFF` (cards, panels)
- Border: `#E2E8F0`
- Text-primary: `#0F172A`
- Text-secondary: `#64748B`
- Text-muted: `#94A3B8`

**Semantic:**
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#3B82F6`

**Status badge colors:**
| Status | Background | Text |
|---|---|---|
| draft | `#F1F5F9` | `#64748B` |
| submitted | `#DBEAFE` | `#1D4ED8` |
| pickup_scheduled | `#CFFAFE` | `#0E7490` |
| received | `#EDE9FE` | `#7C3AED` |
| processing | `#FEF3C7` | `#D97706` |
| partially_completed | `#FEF9C3` | `#A16207` |
| completed | `#DCFCE7` | `#15803D` |
| cancelled / rejected | `#FEE2E2` | `#DC2626` |
| result_ready | `#D1FAE5` | `#059669` |
| result_released | `#DCFCE7` | `#15803D` |

### 2.3 Typography
- Font: **Inter** (Google Fonts)
- Page title: 24px / font-semibold
- Section heading: 18px / font-semibold
- Table header: 12px / font-medium / uppercase / tracking-wide / text-secondary
- Body: 14px / font-normal
- Small/meta: 12px / text-muted

### 2.4 Iconography
- Use **Lucide React** icons throughout
- Icon size: 16px in tables/badges, 20px in buttons, 24px in page headers

### 2.5 Corner Radius
- Cards/panels: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full`
- Input fields: `rounded-md` (6px)

---

## 3. LAYOUT SYSTEM

### 3.1 Public Pages Layout
```
┌─────────────────────────────────────┐
│  HEADER (logo + nav + lang picker)  │
├─────────────────────────────────────┤
│                                     │
│    PAGE CONTENT (max-w-5xl center)  │
│                                     │
├─────────────────────────────────────┤
│  FOOTER                             │
└─────────────────────────────────────┘
```

### 3.2 Partner Dashboard Layout
```
┌────────────┬────────────────────────┐
│  SIDEBAR   │  TOPBAR                │
│  (240px)   ├────────────────────────┤
│            │                        │
│  Nav items │  PAGE CONTENT          │
│            │  (scrollable)          │
│            │                        │
│  [collapse]│                        │
└────────────┴────────────────────────┘
```
Sidebar collapses to icon-only on small screens. On mobile: sidebar becomes bottom sheet drawer.

### 3.3 Admin Dashboard Layout
Same as Partner Dashboard but with a different sidebar color (`#0F172A` dark navy) and different nav items.

---

## 4. PUBLIC PAGES

### 4.1 Homepage (`/`)

**Hero section:**
- Full-width with gradient background (`sky-50` to white)
- Large headline: "Xét nghiệm tại nhà — Kết quả nhanh, chính xác" (Lao/EN versions)
- Sub-headline: brief description
- Two CTA buttons: "Đặt lịch xét nghiệm" (primary blue) and "Xem bảng giá" (outline)
- Hero image: professional lab/medical illustration (right side)

**Feature highlights row (3 cards):**
- Home collection icon + text
- Fast results icon + text
- Secure access icon + text

**Price preview section:**
- Search bar for test name
- Grid of popular test packages (card: test name, price, "Book now" button)

**How it works (3 steps):**
- Numbered steps with icons: Book → Sample collection → Get results

**Footer:**
- Logo, contact info, language switcher (EN/VI/LO)

### 4.2 Booking Page (`/booking`)

Multi-step form:
1. **Select tests/packages** — searchable checklist with prices
2. **Patient info** — name, phone, DOB, gender, address
3. **Schedule** — date picker, time slot selector
4. **Confirm** — summary card + "Confirm booking" button

Progress bar at top showing current step (1/4, 2/4, etc.).

On success: confirmation card with booking code, estimated date.

### 4.3 Result Lookup (`/results`)

Centered card (max-w-md):
- Title: "Tra cứu kết quả xét nghiệm"
- Phone number input
- Result code input
- "Lookup" button (primary)

On success: result detail card showing:
- Patient name, test name, date
- Result status badge
- "Download PDF" button (if ready)

### 4.4 Price List (`/prices`)

- Search input at top
- Category tabs (All / Hematology / Biochemistry / Immunology / etc.)
- Table: Test code | Test name | Sample type | Turnaround | Price
- Responsive: on mobile, stack into cards

---

## 5. PARTNER DASHBOARD

### 5.1 Sidebar Navigation

```
Logo (OLabo)
────────────────
Dashboard (home icon)
My Batches (layers icon)
  └── New Batch
Results (file-text icon)
────────────────
Settings
Support
────────────────
[Avatar] Partner Name
Logout
```

Active state: left border accent (`primary-600`) + `bg-primary-50` + `text-primary-600`
Inactive: `text-slate-600` hover `bg-slate-50`

### 5.2 Partner Home (`/partner`)

Stats row (4 cards):
- Total batches
- Processing batches
- Completed this month
- Results ready for download

Recent batches table (last 5 rows with "View all" link).

Quick action buttons: "New Batch", "View Results".

### 5.3 Batch List (`/partner/batches`)

**Filters row:**
- Date range picker (from/to)
- Status dropdown (multi-select chips)
- Search input (batch code / partner reference)
- "New Batch" button (top right)

**Table:**
| Col | Notes |
|---|---|
| Batch Code | bold, monospace font, clickable link |
| Partner Ref | muted if empty |
| Submitted | relative date ("2 days ago") + tooltip with exact date |
| Total / Done | "8 / 10" format with mini progress bar |
| Status | colored badge |
| Pickup | truck icon if required |
| Action | "View" button |

Table row hover: light blue highlight.
Pagination: bottom, "Showing 1–20 of 48" with prev/next.

### 5.4 New Batch (`/partner/batches/new`)

Two-column layout on desktop. Single column on mobile.

**Left panel — Batch Info:**
Card with form fields:
- Partner Reference Code (text, optional)
- Submitted By Name (text, required)
- Submitted By Phone (text, required)
- Pickup Required? (toggle switch)
  - If yes: Pickup Address (textarea), Pickup Date (date picker), Pickup Time (time picker)
- Note (textarea, optional)

**Right panel — Add Samples:**
Tabs: "Manual Entry" | "CSV Import"

**Manual Entry tab:**
- "+ Add Sample" button adds a new row/card
- Each sample card:
  - Patient Name (required)
  - Patient Code
  - Phone (optional)
  - Date of Birth (optional)
  - Gender (select)
  - Sample Type (select)
  - Requested Tests (multi-select with search)
  - Requested Packages (multi-select with search)
  - Partner Sample Reference
  - Note
  - [Delete] button (red trash icon)
- Samples are shown as stacked cards, collapsible once filled

**CSV Import tab:**
- Large dashed upload zone with file icon
- "Download Template" link (CSV)
- After file selected: show preview table
  - Valid rows: white background
  - Error rows: red-tinted background with error message in tooltip/inline
- Summary: "X valid rows, Y errors"
- "Upload valid rows only" button (disabled if 0 valid)

**Bottom action bar (sticky):**
- Left: sample count "3 samples added"
- Right: "Save as Draft" (outline) | "Submit Batch" (primary)

### 5.5 Batch Detail (`/partner/batches/[batchId]`)

**Batch header card:**
- Batch code (large, monospace, copyable)
- Organization name
- Status badge
- Progress: "Completed 8 of 10 samples" with progress bar
- Pickup info (if applicable)
- Submitted date

**Action toolbar:**
- "Export CSV" (download icon)
- "Download Ready Results" (download-cloud icon, shows count of ready PDFs)
- "Print Summary" (printer icon)
- "Contact Support" (message icon)

**Samples table:**
Filters: Sample Status | Result Status | Search by name/code/barcode

| Column | Notes |
|---|---|
| # | row number |
| Patient Name | |
| Patient Code | monospace |
| Sample Barcode | monospace, muted if not assigned |
| Tests/Packages | chips (max 2 visible + "+N more" |
| Sample Status | badge |
| Result Status | badge |
| Action | "View" link + "Download PDF" button (disabled/hidden if not ready) |

### 5.6 Sample Detail (`/partner/samples/[sampleId]`)

Two-column layout:

**Left column — Patient & Sample Info:**
Card with labeled fields:
- Patient Name, Code, Gender, DOB
- Sample Type, Barcode
- Requested Tests (list)
- Requested Packages (list)
- Partner Sample Reference
- Note

**Right column — Status & Result:**
**Status timeline card:**
```
● Registered  [date]
● Received    [date]
○ Processing  (pending)
○ Result Ready
○ Released
```
Filled circle = completed, empty = pending, current = pulsing blue dot.

**Result card:**
- Result Status badge
- "Download Result PDF" button (primary, only enabled when ready/released)
- Download history (small table: who/when)

### 5.7 Results List (`/partner/results`)

Similar layout to batch list but filters on: date range, batchCode, patientName, patientCode, resultStatus.

Table columns: Date | Batch Code | Patient Name | Patient Code | Tests | Status | Download

---

## 6. ADMIN DASHBOARD

### 6.1 Sidebar (dark theme)

Background: `#0F172A` (slate-900)
Active item: `#1E293B` bg + `#38BDF8` left border + white text
Inactive: `#94A3B8` text

Navigation:
```
OLabo Admin
────────────────
Overview
Bookings (B2C)
B2B Batches (layers icon)
B2B Samples
Results
────────────────
Users & Roles
Organizations
Audit Logs
Settings
────────────────
[Avatar] Admin Name
```

### 6.2 B2B Batch List (`/admin/b2b-batches`)

All batches from all organizations.

Filters: Organization select | Date range | Status | Batch code | Partner ref

Table same as partner view but adds Organization column. Clicking batch row → batch detail.

### 6.3 Batch Management (`/admin/b2b-batches/[batchId]`)

**Batch header card** (same as partner view) + **Admin action panel** (right side, card):
- Status updater: current status dropdown → "Update" button
- Pickup schedule editor: edit date/time/address
- Internal note: textarea (not visible to partner)
- "Mark as Received" shortcut button (if status = submitted/pickup_scheduled)

**Sample table** — same columns as partner view + Edit button.

**Footer actions:** "Export CSV" | "Print Batch Receipt"

### 6.4 Sample Management (`/admin/b2b-samples/[sampleId]`)

Three-column layout on large screen, stacked on mobile:

**Col 1 — Patient & Sample:**
Same as partner view but read-only display.

**Col 2 — Lab Operations:**
Card: "Lab Management"
- Barcode assignment input + "Assign" button
- Sample status selector + rejection reason textarea (shown if status = rejected)
- "Update Status" button

Card: "Upload Result PDF"
- File drop zone (PDF only)
- Match info (sampleBarcode / patientCode shown)
- "Upload & Link Result" button
- Upload progress bar

**Col 3 — Result Control:**
Card: "Result Status"
- Current status badge (large)
- Status selector: pending → ready → review_required → released
- If "released": shows releasedAt, releasedBy
- "Release to Partner" button (prominent, primary) — triggers status = released
- "Require Review" button (secondary)

Card: "Download History"
Table: who downloaded | role | type | when

---

## 7. COMPONENT SPECIFICATIONS

### 7.1 Status Badge Component
```
<StatusBadge status="processing" />
```
Renders: colored pill with dot indicator + label
Variants: all BatchStatus and SampleStatus values

### 7.2 Data Table Component
- Sticky header
- Row hover highlight
- Sortable column headers (click to toggle asc/desc, arrow icon)
- Empty state: illustration + "No data" message
- Loading state: skeleton rows (3–5 shimmer rows)
- Error state: error card with retry button

### 7.3 Multi-select Chips Input
For test/package selection:
- Search input with dropdown
- Selected items shown as removable chips inside input
- Keyboard navigable

### 7.4 CSV Preview Table
- Shows all rows with line numbers
- Error rows: red left border + red background + error column (last col)
- Valid rows: normal
- Sticky header
- Max height with scroll (prevents enormous tables)

### 7.5 PDF Download Button
States:
- `disabled` — gray, lock icon, "Not ready"
- `ready` — blue, download icon, "Download PDF"
- `loading` — spinner + "Preparing..."
- `error` — red, retry icon, "Failed — Retry"

### 7.6 Status Timeline
Vertical stepper component showing sample lifecycle:
- Completed steps: filled circle, checkmark, bold text, date
- Current step: pulsing blue circle
- Pending steps: empty gray circle, muted text

### 7.7 Batch Progress Bar
```
Completed 6 of 10 samples
[████████░░░░░░░░] 60%
```
Colors based on percentage: <50% orange, 50–99% blue, 100% green.

---

## 8. RESPONSIVE BREAKPOINTS

| Breakpoint | Layout behavior |
|---|---|
| < 640px (mobile) | Single column; sidebar → drawer; tables → horizontal scroll or card view |
| 640–1024px (tablet) | 2-column grid; sidebar collapsed to icons |
| > 1024px (desktop) | Full layout as designed above |

**Tables on mobile:** wrap into cards. Each row becomes a card:
```
┌──────────────────────┐
│ Batch Code: B-240601 │
│ Status: [Processing] │
│ Samples: 8/10        │
│ [View Details]       │
└──────────────────────┘
```

---

## 9. FORMS & VALIDATION

- Required fields: red asterisk label
- Error state: red border input + red error text below
- Success state: green border on blur (optional, subtle)
- Disabled state: grayed out, cursor-not-allowed
- All form inputs use consistent height: `h-10` (40px)
- Form group spacing: `gap-4` (16px between fields)

---

## 10. EMPTY & LOADING STATES

Every list/table page must have designed states for:

**Loading:** Skeleton shimmer — matching the table column widths (use animated gradient)

**Empty:** 
- Medical/lab illustration (SVG, simple, light)
- Short message (e.g., "No batches yet")
- CTA if applicable (e.g., "Create your first batch")

**Error:**
- Warning triangle icon
- Error message
- "Try again" button

---

## 11. NOTIFICATIONS & FEEDBACK

- **Toast notifications** (top-right): success (green), error (red), info (blue) — auto-dismiss after 4s
- **Confirmation modal** for destructive actions (cancel batch, reject sample): shows what will happen, requires typed confirmation or checkbox for irreversible actions
- **Loading overlays**: show on form submit, use spinner over the form card (not full screen)
- **File upload progress**: progress bar (0–100%) + filename + size

---

## 12. LANGUAGE / i18n

The app supports three languages:
- **English (en)** — default
- **Vietnamese (vi)**
- **Lao (lo)**

Language switcher: dropdown in topbar (globe icon + current lang code). Switches all UI text instantly.

Design must accommodate:
- Longer text strings in Lao/Vietnamese (allow text wrapping in buttons and badges)
- RTL consideration: not needed (all three languages are LTR)

---

## 13. PAGE LIST SUMMARY

### Public
- `/` — Homepage
- `/booking` — Book a test
- `/results` — B2C result lookup
- `/prices` — Price list

### Partner Dashboard (requires auth, role=partner)
- `/partner` — Dashboard home
- `/partner/batches` — Batch list
- `/partner/batches/new` — Create batch
- `/partner/batches/[batchId]` — Batch detail
- `/partner/samples/[sampleId]` — Sample detail
- `/partner/results` — Results list

### Admin Dashboard (requires auth, role=admin/staff/doctor)
- `/admin` — Dashboard home
- `/admin/b2b-batches` — All batches
- `/admin/b2b-batches/[batchId]` — Batch management
- `/admin/b2b-samples/[sampleId]` — Sample management
- `/admin/bookings` — B2C bookings
- `/admin/results` — All results
- `/admin/users` — User & role management
- `/admin/organizations` — Partner organizations

### Auth
- `/login` — Login page (email/password + Firebase Auth)
- `/login/partner` — Partner login (separate branded page)

---

## 14. DESIGN DELIVERABLES REQUESTED

Please provide:

1. **Design system / component library page** — showing all components: buttons, badges, inputs, tables, cards, modals, toasts, timeline, progress bars
2. **Public pages** — Homepage, Booking (all 4 steps), Result Lookup, Price List
3. **Partner dashboard** — all 6 pages above
4. **Admin dashboard** — key pages: B2B batch list, batch detail, sample management
5. **Mobile versions** — homepage, batch list (card view), batch detail

**Preferred format:** Figma or compatible design file with:
- Components on a dedicated page
- Each page on its own frame
- Auto-layout used throughout
- Design tokens matching the Tailwind colors/spacing above

---

## 15. TECHNICAL CONSTRAINTS FOR DESIGNER

- All colors must map to Tailwind CSS classes (use the palette above)
- Components must be implementable with **shadcn/ui** primitives (Dialog, Sheet, Table, Form, Select, Badge, Button, Card, Tabs, Toast, Popover, Calendar)
- Do NOT use gradients on data-heavy screens (tables, forms)
- Do NOT use glassmorphism — clean flat surfaces only
- Minimum touch target: 44×44px on mobile
- All interactive elements must have visible focus states (blue ring)
- Contrast ratio: minimum AA (4.5:1 for normal text, 3:1 for large text)
