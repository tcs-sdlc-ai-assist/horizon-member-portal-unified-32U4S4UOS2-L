# Horizon Member Portal

> Manage your healthcare benefits, view claims, access your ID cards, and find care — all in one place.

## Overview

The Horizon Member Portal is a modern, accessible healthcare member portal built with React 18 and Vite. It provides Horizon Healthcare plan members with a comprehensive self-service experience for managing benefits, tracking claims, viewing ID cards, accessing documents, and finding care resources.

This is an MVP (Minimum Viable Product) release featuring client-side rendering with dummy data, Glassbox session replay instrumentation with PHI/PII privacy masking, and full WCAG 2.1 AA accessibility compliance patterns.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI component library |
| **Vite** | 5.4 | Build tool and dev server |
| **React Router** | 6.26 | Client-side routing |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **PostCSS** | 8.4 | CSS processing with Autoprefixer |
| **html2canvas** | 1.4 | DOM-to-canvas capture for PDF generation |
| **jsPDF** | 2.5 | PDF document generation |
| **ESLint** | 8.57 | JavaScript/React linting |
| **Prettier** | 3.3 | Code formatting |

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/horizon-healthcare/member-portal.git
cd member-portal

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

#### Environment Variables

All variables prefixed with `VITE_` are exposed to the client-side bundle.

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Horizon Member Portal` | Application title displayed in the browser tab |
| `VITE_SESSION_TIMEOUT_MS` | `900000` | Session timeout in milliseconds (default: 15 minutes) |
| `VITE_SESSION_WARNING_MS` | `120000` | Warning prompt duration before timeout (default: 2 minutes) |
| `VITE_GLASSBOX_ENABLED` | `false` | Enable Glassbox session replay instrumentation |
| `VITE_SUPPORT_EMAIL` | `support@horizonhealthcare.com` | Support contact email address |
| `VITE_SUPPORT_PHONE` | `1-800-555-0199` | Support contact phone number |
| `VITE_SUPPORT_CHAT_URL` | `https://support.horizonhealthcare.com/chat` | Live chat support URL |
| `VITE_DOCTOR_FINDER_URL` | `https://www.horizonhealthcare.com/find-a-doctor` | External doctor finder URL |

### Development

```bash
# Start the development server (opens http://localhost:5173)
npm run dev
```

### Build

```bash
# Create a production build
npm run build
```

The production build output is written to the `dist/` directory.

### Preview

```bash
# Preview the production build locally
npm run preview
```

### Linting

```bash
# Run ESLint across the project
npm run lint
```

## Project Structure

```
horizon-member-portal/
├── public/                          # Static assets served at root
│   └── vite.svg                     # Favicon
├── src/
│   ├── App.jsx                      # Root application component
│   ├── AppRouter.jsx                # Route definitions and provider hierarchy
│   ├── main.jsx                     # Application entry point
│   ├── index.css                    # Honeybee CSS framework (design tokens, components, utilities)
│   │
│   ├── components/
│   │   ├── benefits/
│   │   │   ├── BenefitsSummary.jsx  # Plan info, deductible/OOP progress bars, coverage selector
│   │   │   └── CoverageCategories.jsx # Coverage category grid with in/out-of-network details
│   │   │
│   │   ├── claims/
│   │   │   ├── ClaimDetail.jsx      # Full claim detail view with financial summary and line items
│   │   │   ├── ClaimsList.jsx       # Claims table with filtering, sorting, and pagination
│   │   │   └── ClaimSubmission.jsx  # Claim submission form with validation
│   │   │
│   │   ├── common/
│   │   │   ├── ErrorBoundary.jsx    # Global error boundary with fallback UI
│   │   │   ├── FilterBar.jsx        # Reusable filter bar (select, text, date range)
│   │   │   ├── LeavingSiteModal.jsx # External link disclaimer modal
│   │   │   ├── Logo.jsx             # Horizon branding logo component
│   │   │   ├── Modal.jsx            # Accessible modal with focus trap
│   │   │   ├── Pagination.jsx       # Pagination with page numbers and navigation
│   │   │   ├── PrivacyMaskedText.jsx # Inline PHI/PII privacy masking wrapper
│   │   │   ├── ProgressBar.jsx      # Accessible progress bar for deductible/OOP
│   │   │   ├── ProtectedRoute.jsx   # Auth guard with admin role enforcement
│   │   │   ├── SessionWarningModal.jsx # Session timeout warning with countdown
│   │   │   └── StatusBadge.jsx      # Claim/coverage status badge component
│   │   │
│   │   ├── documents/
│   │   │   └── DocumentList.jsx     # Document center with filtering and audit-logged downloads
│   │   │
│   │   ├── getcare/
│   │   │   └── GetCareSections.jsx  # Get Care page sections (find care, telehealth, behavioral health)
│   │   │
│   │   ├── idcards/
│   │   │   ├── IdCardActions.jsx    # Print, download PDF, and request new card actions
│   │   │   └── IdCardPreview.jsx    # ID card with front/back flip animation and enlarge modal
│   │   │
│   │   ├── instrumentation/
│   │   │   └── withPrivacyMask.jsx  # HOC for DOM-level Glassbox privacy masking
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        # Authenticated layout shell (header, sidebar, session management)
│   │   │   ├── Header.jsx           # Fixed header with search, support, notifications, user menu
│   │   │   ├── NavigationMenu.jsx   # Collapsible sidebar navigation with mobile support
│   │   │   ├── NotificationIcon.jsx # Bell icon with unread badge and dropdown panel
│   │   │   ├── SearchBar.jsx        # Global search with debounced filtering and keyboard navigation
│   │   │   ├── SupportActions.jsx   # Email, chat, and call support action buttons
│   │   │   └── UserMenu.jsx         # User profile dropdown with settings and logout
│   │   │
│   │   ├── notifications/
│   │   │   └── NotificationList.jsx # Full notifications page with read/unread management
│   │   │
│   │   └── widgets/
│   │       ├── DeductibleOopSummary.jsx  # Dashboard deductible & OOP progress widget
│   │       ├── FindCareCTA.jsx           # Dashboard find care call-to-action widget
│   │       ├── IdCardSummary.jsx         # Dashboard ID card thumbnail widget
│   │       ├── LearningCenterWidget.jsx  # Dashboard featured articles widget
│   │       ├── RecentClaims.jsx          # Dashboard recent claims widget
│   │       └── WidgetCustomizer.jsx      # Widget show/hide and reorder modal
│   │
│   ├── constants/
│   │   └── constants.js             # Centralized constants (branding, session, nav, statuses, etc.)
│   │
│   ├── context/
│   │   ├── AuthContext.jsx           # Authentication state, login/logout, session management
│   │   ├── InstrumentationProvider.jsx # Glassbox SDK, event tagging, audit logging, PHI sanitization
│   │   ├── NotificationContext.jsx   # Notification state with read/unread persistence
│   │   └── WidgetContext.jsx         # Dashboard widget order and visibility preferences
│   │
│   ├── data/
│   │   ├── benefits.js              # Benefits, coverage categories, Rx, dental, vision data
│   │   ├── claims.js                # 20 claim records with line items and EOB references
│   │   ├── coverages.js             # Medical, dental, vision, pharmacy, behavioral health coverages
│   │   ├── documents.js             # EOBs, plan docs, letters, tax forms, ID cards, forms
│   │   ├── getCareContent.js        # Get Care page content (sections, FAQs, contacts, guidance)
│   │   ├── learningCenter.js        # Learning center articles and resources
│   │   ├── memberProfile.js         # Member profile (Sarah Mitchell) with dependents
│   │   ├── notifications.js         # 15 notification records across all types
│   │   └── searchIndex.js           # Search index entries for pages, documents, and benefits
│   │
│   ├── hooks/
│   │   ├── useAuditLogger.js        # Audit logging with localStorage persistence and retry
│   │   ├── useEventTagger.js        # Glassbox event tagging with predefined event types
│   │   ├── useSearch.js             # Debounced search with recent searches and highlighting
│   │   └── useSessionTimeout.js     # Session timeout with warning countdown and activity tracking
│   │
│   ├── pages/
│   │   ├── AdminPanelPage.jsx       # Admin panel placeholder (admin role required)
│   │   ├── BenefitsPage.jsx         # Benefits & Coverage page
│   │   ├── ClaimDetailPage.jsx      # Claim detail page (route param: claimId)
│   │   ├── ClaimSubmissionPage.jsx  # Claim submission form page
│   │   ├── ClaimsPage.jsx           # Claims list page with submit button
│   │   ├── DashboardPage.jsx        # Dashboard with customizable widget grid
│   │   ├── DocumentCenterPage.jsx   # Document Center page
│   │   ├── GetCarePage.jsx          # Get Care / Support page
│   │   ├── IdCardsPage.jsx          # ID Cards & Coverage page
│   │   ├── LoginPage.jsx            # Login page with email/password form
│   │   ├── NotFoundPage.jsx         # 404 Not Found page
│   │   ├── NotificationsPage.jsx    # Notifications / Messages page
│   │   ├── PrescriptionsPage.jsx    # Prescriptions placeholder page
│   │   ├── SettingsPage.jsx         # Settings placeholder page
│   │   └── WellnessPage.jsx         # Wellness placeholder page
│   │
│   └── utils/
│       ├── accessibility.js         # Focus management, screen reader, keyboard navigation, ARIA
│       ├── formatters.js            # Currency, date, phone, percentage, file size formatting
│       ├── pdfGenerator.js          # ID card PDF generation (html2canvas + jsPDF)
│       ├── searchUtils.js           # Search index filtering, highlighting, debounce
│       └── storage.js               # localStorage wrapper with key prefixing and session management
│
├── .env.example                     # Environment variable template
├── .eslintrc.cjs                    # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── CHANGELOG.md                     # Release changelog
├── index.html                       # HTML entry point
├── package.json                     # Dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS configuration with Honeybee design tokens
├── vercel.json                      # Vercel deployment configuration with security headers
└── vite.config.js                   # Vite build configuration with path aliases
```

## Features

### Authentication & Session Management
- Secure login page with email/password form and validation
- Configurable session timeout with warning countdown modal
- Automatic session extension on user activity (mouse, keyboard, scroll, touch)
- Protected route guard with admin role enforcement
- Session token and last activity persistence via localStorage

### Dashboard
- Personalized greeting with member first name and time-of-day message
- Customizable widget grid with show/hide toggles and drag reorder
- Widget preferences persisted per user to localStorage
- Widgets: Find Care CTA, Recent Claims, ID Card Summary, Deductible & OOP Summary, Learning Center

### Benefits & Coverage
- Coverage selector dropdown for Medical, Dental, Vision, Pharmacy, and Behavioral Health
- Plan details with deductible and out-of-pocket progress bars
- 13 coverage categories with in-network vs. out-of-network comparison panels
- Covered services lists and prior authorization indicators

### Claims
- Claims list table with desktop table and mobile card responsive views
- Column sorting, filtering (type, status, patient, date range), and pagination
- Claim detail page with financial summary, provider info, and service line items
- Claim submission form with client-side validation and localStorage persistence
- EOB download with audit logging

### ID Cards & Coverage
- ID card preview with front/back CSS 3D flip animation
- Coverage type selector and enlarge modal with full-size view
- Print (window.print), Download PDF (html2canvas + jsPDF), and Request New Card actions
- Active coverages overview and covered dependents list

### Document Center
- Document list with search, category filter, date range filter, and sorting
- Category-specific icons and color-coded badges
- Download with loading spinner and category-specific audit logging
- Unread document indicator and related claim number links

### Notifications
- Bell icon with unread count badge (supports 99+ overflow)
- Dropdown panel with recent notifications sorted by timestamp
- Full notifications page with read/unread filter and individual toggle
- Notification type badges and relative timestamp formatting

### Get Care
- Hero section with care guidance comparison table
- Find Care & Estimate Costs section with external links
- Telemedicine & Virtual Visits section with covered services
- Behavioral Health section with crisis resources (911, 988, Crisis Text Line)
- 24/7 Nurse Line contact card and Quick Contacts grid
- FAQ accordion with expand/collapse

### Global Navigation & Search
- Fixed header with logo, search, support actions, notifications, and user menu
- Collapsible sidebar navigation with icon-only mode persisted to localStorage
- Responsive mobile hamburger menu with overlay backdrop
- Global search with debounced filtering, keyboard navigation, recent searches, and highlighted results
- Skip-to-content accessibility link and breadcrumb navigation on all pages

### Glassbox Instrumentation & Privacy
- PHI/PII detection and sanitization for all analytics payloads
- `PrivacyMaskedText` component applying `data-glassbox-mask="true"` to sensitive text
- `withPrivacyMask` HOC with MutationObserver for dynamic content
- Rate limiting (10 events/second) with circuit breaker (5 consecutive failures → 60s cooldown)
- Exponential backoff retry (3 attempts) for audit log events
- Predefined event types: `claim_opened`, `id_card_downloaded`, `document_download`, `page_view`, `search_performed`, etc.
- Audit log persistence to localStorage (rolling window of 500 entries)

## Honeybee CSS Framework

The portal uses a custom CSS framework ("Honeybee") built on top of Tailwind CSS with a comprehensive design token system via CSS custom properties. Key features include:

- **Design Tokens**: Colors, typography, spacing, shadows, borders, transitions, z-index layers
- **Component Classes**: Cards, buttons (6 sizes × 10 variants), alerts, badges, avatars, forms, modals, dropdowns, tables, tabs, progress bars, pagination, spinners, skeletons, toasts, chips, breadcrumbs, steps, banners, accordions, toggles, stat cards, empty states
- **Utility Classes**: Text truncation/clamping, scrollable containers, screen reader only, focus ring, glass effect, gradient text, print utilities
- **Animations**: `fadeIn`, `scaleIn`, `slideInRight`, `shimmer`, `pulseSoft`
- **Responsive Breakpoints**: `xs` (475px), `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px), `3xl` (1920px)

## Accessibility

The portal follows WCAG 2.1 AA compliance patterns throughout all components:

- **Focus Management**: Focus trap utility for modals and dialogs with Escape key close
- **Screen Reader Support**: Live region announcements via `announceToScreenReader` utility
- **Keyboard Navigation**: Full keyboard support for all interactive elements including dropdown menus, search results, and widget customizer
- **ARIA Attributes**: Proper `role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-current`, `aria-invalid`, `aria-live`, and `aria-modal` attributes
- **Skip Navigation**: Skip-to-content link for keyboard users
- **Reduced Motion**: `prefersReducedMotion` detection with animation duration override
- **Form Accessibility**: All form fields have associated labels, error messages linked via `aria-describedby`, and `aria-invalid` states
- **Status Communication**: All status badges use `role="status"` with `aria-label`
- **Table Headers**: All tables use proper `scope="col"` headers
- **Focus Indicators**: All interactive elements have visible focus indicators via `focus-visible` outline

## Branding

| Property | Value |
|---|---|
| **Company Name** | Horizon Healthcare |
| **Portal Name** | Member Portal |
| **Primary Color** | `#1E3A5F` (Navy) |
| **Secondary Color** | `#F5A623` (Amber) |
| **Accent Color** | `#00B4D8` (Cyan) |
| **Font Family** | Inter (Google Fonts) |
| **Logo Path** | `/assets/images/horizon-logo.svg` |
| **Logo Alt Text** | Horizon Healthcare |

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration with:

- SPA rewrites (all routes → `index.html`)
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Cache control (no-cache for `index.html`, immutable for hashed assets)

```bash
# Deploy to Vercel
npx vercel
```

### Manual Deployment

```bash
# Build the production bundle
npm run build

# The dist/ directory contains the static files to deploy
# Serve with any static file server that supports SPA routing
```

Ensure your hosting provider is configured to:

1. Serve `index.html` for all routes (SPA fallback)
2. Set appropriate security headers (see `vercel.json` for reference)
3. Enable HTTPS with HSTS
4. Set `Cache-Control: no-store` for `index.html`
5. Set `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`

## Demo Mode

The login page accepts any valid-format email address and password (6+ characters) to authenticate with the dummy member profile (Sarah Mitchell, Horizon Blue PPO Plus, Family tier). All data displayed in the portal is static dummy data for demonstration purposes.

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## License

Private — © 2024 Horizon Healthcare. All rights reserved.