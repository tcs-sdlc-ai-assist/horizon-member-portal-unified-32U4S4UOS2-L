# Changelog

All notable changes to the Horizon Member Portal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-20

### Added

#### Authentication & Session Management
- Secure login page with email/password form, validation, and Horizon branding
- Session timeout management with configurable timeout and warning durations via environment variables (`VITE_SESSION_TIMEOUT_MS`, `VITE_SESSION_WARNING_MS`)
- Session warning modal with countdown timer, "Stay Logged In" and "Log Out" actions
- Automatic session extension on user activity (mouse, keyboard, scroll, touch)
- Protected route guard (`ProtectedRoute`) with authentication and admin role enforcement
- Auth context (`AuthContext`) providing `login`, `logout`, `extendSession`, `isAuthenticated`, and `isAdmin` state
- Session token and last activity persistence via localStorage

#### Global Navigation & Layout
- Fixed-position header with Logo, SearchBar, SupportActions, NotificationIcon, and UserMenu
- Left sidebar navigation (`NavigationMenu`) with collapsible icon-only mode persisted to localStorage
- Responsive layout with mobile hamburger menu, overlay backdrop, and Escape key close
- Skip-to-content accessibility link for keyboard navigation
- Breadcrumb navigation on all authenticated pages
- Global search bar with debounced filtering against search index, keyboard navigation, recent searches, and highlighted results

#### Dashboard
- Personalized greeting with member first name and time-of-day message
- Customizable widget grid respecting `WidgetContext` for widget order and visibility
- Widget customizer modal with show/hide toggles, up/down reorder buttons, keyboard support, and reset to defaults
- Widget preferences persisted per user to localStorage
- Dashboard widgets:
  - **Find Care & Cost CTA** — quick-access links to Find a Doctor, Telehealth, Urgent Care, and Cost Estimator with external link disclaimer modal
  - **Recent Claims** — 3 most recent claims sorted by service date with provider, amount, status badge, and claim number
  - **ID Card Summary** — primary medical coverage ID card thumbnail with member info, copays, download PDF action, and link to full Coverage page
  - **Deductible & Out-of-Pocket Summary** — individual and family deductible and OOP maximum progress bars with plan year dates
  - **Learning Center** — up to 3 featured articles with category badges, read time, and external link disclaimer modal

#### Get Care Pages
- Hero section with gradient background and care description
- "Where Should I Go?" care guidance comparison table (Telehealth, PCP, Specialist, Urgent Care, ER) with copay, wait time, and best-for information
- Find Care & Estimate Costs section with external links to Doctor Finder, Pharmacy Finder, Urgent Care Finder, Cost Estimator, and Provider Directory
- Telemedicine & Virtual Visits section with covered services list and tips
- Behavioral Health & Mental Wellness section with crisis resources, emergency contacts (911, 988, Crisis Text Line), and covered services
- 24/7 Nurse Line contact card with features list and call action
- Quick Contacts grid with Member Services, Nurse Line, Behavioral Health Line, Pharmacy Help, Prior Authorization, and Crisis Lifeline
- Frequently Asked Questions accordion with expand/collapse and screen reader announcements
- Leaving-site disclaimer modal (`LeavingSiteModal`) for all external links with destination URL display and continue/cancel actions

#### ID Cards & Coverage
- ID card preview with front/back flip animation using CSS 3D transforms
- Coverage type selector dropdown for Medical, Dental, Vision, Pharmacy, and Behavioral Health
- Enlarge modal with full-size card view and flip controls
- Card side indicator dots (front/back)
- ID card actions: Print (window.print), Download PDF (html2canvas + jsPDF), Request New Card (localStorage persistence with confirmation)
- Active coverages overview list with ID card availability indicators
- Covered dependents list with name, relationship, and member ID
- PDF generation utility (`pdfGenerator`) supporting single-page and front/back two-page ID card PDFs

#### Claims
- Claims list table with desktop table and mobile card responsive views
- Column sorting by service date (ascending/descending) with screen reader announcements
- Filter bar with Claim Type, Status, Patient, and Date Range filters
- Pagination with page numbers, previous/next, item count, and page info
- Claim type icons for Medical, Dental, Vision, Pharmacy, Emergency, Specialist, Behavioral Health, Lab, Imaging, and Hospital
- Claim detail page with:
  - Financial summary (Billed, Allowed, Plan Paid, You Owe) with network discount/adjustment note
  - Provider & patient information with NPI, facility, and network status
  - Service line items table with procedure codes, descriptions, amounts, and adjustment reasons
  - EOB download button with audit logging
  - Back navigation to claims list
- Claim submission form with:
  - Patient Name, Claim Type, Provider, Facility, Date of Service, Billed Amount, and Description fields
  - Client-side validation with error messages and screen reader announcements
  - localStorage persistence of submitted claim records
  - Success confirmation view with claim number, details, and "Submit Another" action
- Summary statistics (total billed, plan paid, you owe) displayed above claims table

#### Benefits & Coverage
- Benefits summary card with coverage selector, plan details (name, type, tier, member ID, group number, effective date), coinsurance badge, and network info
- Deductible progress bars (individual and family) with currency formatting and remaining display
- Out-of-pocket maximum progress bars (individual and family) with accent color variant
- Annual maximum progress bar for dental coverage
- Summary stats card with deductible met, OOP spent, coinsurance, and dependents count
- Coverage categories grid with 13 categories (Preventive, Office Visits, Specialist, Urgent Care, Emergency, Hospital, Outpatient Surgery, Lab, Imaging, Behavioral Health, Telehealth, Physical Therapy, DME)
- In-network vs. out-of-network comparison panels with copay, coinsurance, deductible, and prior auth details
- Covered services lists per category
- Disclaimer alert about Summary Plan Description and prior authorization requirements

#### Document Center
- Document list table with desktop table and mobile card responsive views
- Filter bar with Search text, Category select, and Date Range filters
- Column sorting by date (ascending/descending)
- Pagination with item count and page info
- Document category icons and color-coded badges for EOB, Plan Document, Benefit Summary, Letter, Tax Document, Form, ID Card, Prior Auth, Appeal, and Provider Directory
- Download button with loading spinner state
- Audit logging for all document downloads via `useAuditLogger` with category-specific audit actions (EOB, tax document, form, plan document, appeal, provider directory)
- Unread document indicator (blue background highlight)
- Related claim number display with link to claims page

#### Notifications
- Notification bell icon in header with unread count badge (supports 99+ overflow)
- Dropdown panel with up to 8 recent notifications sorted by timestamp
- Mark all as read button
- View All Notifications link to full notifications page
- Full notifications page with:
  - Filter select (All, Unread, Read)
  - Mark all read button
  - Individual read/unread toggle on hover
  - Notification type badges (Claim Update, Document Available, Benefit Change, Message Received, Payment Due, Appointment Reminder, Prior Authorization Update, System)
  - Relative timestamp formatting (Just now, Xm ago, Xh ago, Xd ago, short date)
  - Action labels and navigation URLs
- Notification context (`NotificationContext`) with read state persistence to localStorage

#### Glassbox Instrumentation & Privacy Masking
- `InstrumentationProvider` context with Glassbox SDK stub initialization, event tagging, and audit logging
- PHI/PII detection and sanitization for all analytics payloads
- Rate limiting (10 events/second) with circuit breaker (5 consecutive failures triggers 60-second cooldown)
- Exponential backoff retry (3 attempts) for audit log events
- `useEventTagger` hook with predefined event types: `claim_opened`, `id_card_downloaded`, `id_card_printed`, `external_link_click`, `document_download`, `page_view`, `search_performed`, `notification_opened`, `benefit_viewed`, `coverage_viewed`, `support_contact`, `telehealth_launched`
- `useAuditLogger` hook with predefined audit actions: `document_download`, `id_card_download`, `id_card_print`, `eob_download`, `tax_document_download`, `form_download`, `plan_document_download`, `appeal_document_download`, `provider_directory_download`
- `PrivacyMaskedText` inline component applying `data-glassbox-mask="true"` and PHI data attributes to sensitive text (member ID, member name, claim number, group number, patient name, PCP name, financial amounts, DOB, SSN, email, phone, address)
- `withPrivacyMask` higher-order component for DOM-level privacy masking with MutationObserver for dynamic content
- Audit log persistence to localStorage (rolling window of 500 entries) as MVP fallback

#### Honeybee CSS Framework
- Complete design token system via CSS custom properties (colors, typography, spacing, shadows, borders, transitions, z-index layers, layout dimensions)
- Tailwind CSS integration with extended theme configuration matching design tokens
- Component class library:
  - Layout: `.fluid-wrapper`, `.page-section`, `.page-sidebar`, `.page-content`
  - Cards: `.hb-card`, `.hb-card-header`, `.hb-card-body`, `.hb-card-footer`, `.hb-card-interactive`
  - Buttons: `.hb-btn-xs` through `.hb-btn-xl`, variants (primary, secondary, accent, outline, outline-secondary, ghost, danger, success, link), icon buttons
  - Alerts: `.hb-alert-info`, `.hb-alert-success`, `.hb-alert-warning`, `.hb-alert-error`, `.hb-alert-neutral`
  - Badges: `.hb-badge-sm`, `.hb-badge-md`, `.hb-badge-lg`, color variants (primary, secondary, accent, success, warning, error, info, neutral), solid variants
  - Avatars: `.hb-avatar-xs` through `.hb-avatar-2xl`
  - Forms: `.hb-form-group`, `.hb-label`, `.hb-input`, `.hb-textarea`, `.hb-select`, `.hb-checkbox`, `.hb-radio`, error/success states, hints
  - Modals: `.hb-modal-overlay`, `.hb-modal-sm` through `.hb-modal-full`, header/body/footer
  - Dropdowns: `.hb-dropdown`, `.hb-dropdown-item`, `.hb-dropdown-divider`
  - Tables: `.hb-table`, `.hb-table-striped`
  - Tabs: `.hb-tabs`, `.hb-tab`, `.hb-tab-active`
  - Progress: `.hb-progress`, `.hb-progress-bar`, color variants
  - Pagination: `.hb-pagination`, `.hb-pagination-item`, active/disabled states
  - Spinners: `.hb-spinner-sm` through `.hb-spinner-xl`
  - Skeletons: `.hb-skeleton`, `.hb-skeleton-text`, `.hb-skeleton-circle`
  - Toasts: `.hb-toast-container`, `.hb-toast-info`, `.hb-toast-success`, `.hb-toast-warning`, `.hb-toast-error`
  - Chips: `.hb-chip`, `.hb-chip-active`, `.hb-chip-removable`
  - Breadcrumbs: `.hb-breadcrumb`, `.hb-breadcrumb-item`, `.hb-breadcrumb-separator`
  - Steps: `.hb-steps`, `.hb-step-circle`, active/completed/pending states
  - Banners: `.hb-banner-info`, `.hb-banner-success`, `.hb-banner-warning`, `.hb-banner-error`, `.hb-banner-primary`
  - Empty states: `.hb-empty-state`
  - Stat cards: `.hb-stat`, `.hb-stat-label`, `.hb-stat-value`
  - Accordions: `.hb-accordion`, `.hb-accordion-header`, `.hb-accordion-body`
  - Dividers: `.hb-divider`, `.hb-divider-thick`, `.hb-divider-vertical`
  - Toggles: `.hb-toggle`, `.hb-toggle-active`, `.hb-toggle-knob`
- Utility classes: `.hb-text-truncate`, `.hb-text-clamp-2`, `.hb-text-clamp-3`, `.hb-scrollable`, `.hb-sr-only`, `.hb-focus-ring`, `.hb-glass`, `.hb-gradient-text`, `.hb-no-print`, `.hb-print-only`, `.hb-interactive`, `.hb-overlay`, `.hb-sticky-header`
- Animations: `fadeIn`, `scaleIn`, `slideInRight`, `slideOutRight`, `shimmer`, `pulseSoft`
- Responsive breakpoints: `xs` (475px), `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px), `3xl` (1920px)
- Print styles with `.hb-no-print` and `.hb-print-only` utilities
- Custom scrollbar styling for WebKit browsers
- Focus-visible outline with accent color ring

#### Accessibility
- WCAG 2.1 AA compliance patterns throughout all components
- Focus trap utility for modals and dialogs with Escape key close
- Screen reader live region announcements via `announceToScreenReader` utility
- Keyboard navigation utility for dropdown menus and list navigation
- ARIA ID generation utility (`generateAriaId`) for unique, deterministic IDs
- Dialog focus management (`setupDialogFocus`) with `aria-modal`, `aria-labelledby`, `aria-describedby`
- Dropdown focus management (`setupDropdownFocus`) with `role="menu"` and `role="menuitem"`
- Skip-to-content navigation link
- Reduced motion detection (`prefersReducedMotion`) with animation duration override
- All interactive elements have visible focus indicators, aria-labels, and keyboard activation support
- All form fields have associated labels, error messages linked via `aria-describedby`, and `aria-invalid` states
- All status badges use `role="status"` with `aria-label`
- All tables use proper `scope="col"` headers
- All images and icons use `aria-hidden="true"` or descriptive alt text

#### Utility Functions
- `formatters.js` — currency, date, claim status, phone number, text truncation, percentage, number, file size, member ID masking, and initials formatting
- `searchUtils.js` — search index filtering with relevance scoring, text highlighting, and debounce utility
- `storage.js` — localStorage wrapper with key prefixing, JSON serialization, session management, theme, sidebar, recent searches, dismissed banners, notification preferences, and dashboard layout persistence
- `accessibility.js` — focus management, focus trapping, screen reader announcements, keyboard navigation, ARIA ID generation, dialog/dropdown focus setup, skip navigation, and reduced motion detection
- `pdfGenerator.js` — DOM-to-canvas capture via html2canvas and PDF generation via jsPDF for ID card download

#### Configuration & Build
- Vite 5 build configuration with React plugin, path aliases (`@/` → `src/`), and vendor chunk splitting
- Tailwind CSS 3 with PostCSS and Autoprefixer
- ESLint configuration with React, React Hooks, and React Refresh plugins
- Prettier configuration for consistent code formatting
- Environment variable configuration via `.env.example`
- Vercel deployment configuration with SPA rewrites, security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), and cache control

#### Placeholder Pages
- Wellness page — "Coming Soon" placeholder with informational alert
- Prescriptions page — "Coming Soon" placeholder with informational alert
- Settings page — "Available in a Future Release" placeholder with informational alert
- Admin Panel page — "Available in a Future Release" placeholder with admin role guard
- Profile page — reuses Settings page component

#### Error Handling
- Global `ErrorBoundary` component catching JavaScript errors with user-friendly fallback UI, retry button, dashboard navigation, and support contact information
- Development-only error details display
- 404 Not Found page with illustration, navigation buttons, and support contact

[1.0.0]: https://github.com/horizon-healthcare/member-portal/releases/tag/v1.0.0