// =============================================================================
// Horizon Member Portal - Centralized Constants & Configuration
// =============================================================================

// -----------------------------------------------------------------------------
// Application Branding
// -----------------------------------------------------------------------------
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Horizon Member Portal'

export const BRANDING = {
  logoUrl: 'https://www.horizonblue.com/themes/custom/bootstrap_business/plancomparison/images/logo.png',
  logoAltText: 'Horizon Healthcare',
  logoSmallUrl: 'https://www.horizonblue.com/themes/custom/bootstrap_business/plancomparison/images/logo.png',
  bannerUrl: 'https://www.horizonblue.com/securecms-documents/3649/hb-home-banner.png',
  faviconUrl: '/vite.svg',
  companyName: 'Horizon Healthcare',
  portalName: 'Member Portal',
  tagline: 'Your health, simplified.',
  copyrightYear: new Date().getFullYear(),
}

// -----------------------------------------------------------------------------
// Session Management
// -----------------------------------------------------------------------------
export const SESSION = {
  timeoutMs: Number(import.meta.env.VITE_SESSION_TIMEOUT_MS) || 900000,
  warningMs: Number(import.meta.env.VITE_SESSION_WARNING_MS) || 120000,
  storageKey: 'hb_session',
  lastActivityKey: 'hb_last_activity',
  tokenKey: 'hb_auth_token',
  refreshTokenKey: 'hb_refresh_token',
}

// -----------------------------------------------------------------------------
// Support Contact Configuration
// -----------------------------------------------------------------------------
export const SUPPORT = {
  email: import.meta.env.VITE_SUPPORT_EMAIL || 'support@horizonhealthcare.com',
  phone: import.meta.env.VITE_SUPPORT_PHONE || '1-800-555-0199',
  phoneDisplay: '1-800-555-0199',
  chatUrl: import.meta.env.VITE_SUPPORT_CHAT_URL || 'https://support.horizonhealthcare.com/chat',
  hoursOfOperation: 'Monday – Friday, 8:00 AM – 8:00 PM ET',
  emergencyNumber: '911',
  nurseLinePhone: '1-800-555-0100',
  nurseLineHours: '24/7',
}

// -----------------------------------------------------------------------------
// External Service URLs
// -----------------------------------------------------------------------------
export const EXTERNAL_URLS = {
  doctorFinder: import.meta.env.VITE_DOCTOR_FINDER_URL || 'https://www.horizonhealthcare.com/find-a-doctor',
  pharmacyFinder: 'https://www.horizonhealthcare.com/find-a-pharmacy',
  urgentCareFinder: 'https://www.horizonhealthcare.com/find-urgent-care',
  telehealth: 'https://www.horizonhealthcare.com/telehealth',
  privacyPolicy: 'https://www.horizonhealthcare.com/privacy',
  termsOfService: 'https://www.horizonhealthcare.com/terms',
  accessibilityStatement: 'https://www.horizonhealthcare.com/accessibility',
  memberRights: 'https://www.horizonhealthcare.com/member-rights',
}

// -----------------------------------------------------------------------------
// Navigation Menu Items
// -----------------------------------------------------------------------------
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/',
    icon: 'home',
    description: 'Overview of your benefits and activity',
  },
  {
    id: 'benefits',
    label: 'Benefits',
    route: '/benefits',
    icon: 'shield',
    description: 'View your plan benefits and coverage',
  },
  {
    id: 'claims',
    label: 'Claims',
    route: '/claims',
    icon: 'file-text',
    description: 'Track and manage your claims',
  },
  {
    id: 'coverage',
    label: 'Coverage',
    route: '/coverage',
    icon: 'heart',
    description: 'Your coverage details and ID cards',
  },
  {
    id: 'spending',
    label: 'Spending',
    route: '/spending',
    icon: 'dollar-sign',
    description: 'Deductibles, out-of-pocket, and spending accounts',
  },
  {
    id: 'documents',
    label: 'Documents',
    route: '/documents',
    icon: 'folder',
    description: 'EOBs, letters, and plan documents',
  },
  {
    id: 'messages',
    label: 'Messages',
    route: '/messages',
    icon: 'mail',
    description: 'Secure messages and notifications',
  },
  {
    id: 'support',
    label: 'Support',
    route: '/support',
    icon: 'help-circle',
    description: 'Get help and contact us',
  },
]

export const SECONDARY_NAV_ITEMS = [
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
  },
  {
    id: 'profile',
    label: 'Profile',
    route: '/profile',
    icon: 'user',
  },
]

// -----------------------------------------------------------------------------
// Claim Statuses
// -----------------------------------------------------------------------------
export const CLAIM_STATUS = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  PENDING: 'pending',
  APPROVED: 'approved',
  PARTIALLY_APPROVED: 'partially_approved',
  DENIED: 'denied',
  APPEALED: 'appealed',
  PAID: 'paid',
  CLOSED: 'closed',
}

export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.SUBMITTED]: 'Submitted',
  [CLAIM_STATUS.IN_REVIEW]: 'In Review',
  [CLAIM_STATUS.PENDING]: 'Pending',
  [CLAIM_STATUS.APPROVED]: 'Approved',
  [CLAIM_STATUS.PARTIALLY_APPROVED]: 'Partially Approved',
  [CLAIM_STATUS.DENIED]: 'Denied',
  [CLAIM_STATUS.APPEALED]: 'Appealed',
  [CLAIM_STATUS.PAID]: 'Paid',
  [CLAIM_STATUS.CLOSED]: 'Closed',
}

export const CLAIM_STATUS_COLORS = {
  [CLAIM_STATUS.SUBMITTED]: 'info',
  [CLAIM_STATUS.IN_REVIEW]: 'info',
  [CLAIM_STATUS.PENDING]: 'warning',
  [CLAIM_STATUS.APPROVED]: 'success',
  [CLAIM_STATUS.PARTIALLY_APPROVED]: 'warning',
  [CLAIM_STATUS.DENIED]: 'error',
  [CLAIM_STATUS.APPEALED]: 'warning',
  [CLAIM_STATUS.PAID]: 'success',
  [CLAIM_STATUS.CLOSED]: 'neutral',
}

// -----------------------------------------------------------------------------
// Claim Types
// -----------------------------------------------------------------------------
export const CLAIM_TYPE = {
  MEDICAL: 'medical',
  DENTAL: 'dental',
  VISION: 'vision',
  PHARMACY: 'pharmacy',
  BEHAVIORAL_HEALTH: 'behavioral_health',
  LAB: 'lab',
  IMAGING: 'imaging',
  EMERGENCY: 'emergency',
  PREVENTIVE: 'preventive',
  SPECIALIST: 'specialist',
  HOSPITAL: 'hospital',
}

export const CLAIM_TYPE_LABELS = {
  [CLAIM_TYPE.MEDICAL]: 'Medical',
  [CLAIM_TYPE.DENTAL]: 'Dental',
  [CLAIM_TYPE.VISION]: 'Vision',
  [CLAIM_TYPE.PHARMACY]: 'Pharmacy',
  [CLAIM_TYPE.BEHAVIORAL_HEALTH]: 'Behavioral Health',
  [CLAIM_TYPE.LAB]: 'Lab Work',
  [CLAIM_TYPE.IMAGING]: 'Imaging',
  [CLAIM_TYPE.EMERGENCY]: 'Emergency',
  [CLAIM_TYPE.PREVENTIVE]: 'Preventive Care',
  [CLAIM_TYPE.SPECIALIST]: 'Specialist',
  [CLAIM_TYPE.HOSPITAL]: 'Hospital',
}

// -----------------------------------------------------------------------------
// Coverage Types
// -----------------------------------------------------------------------------
export const COVERAGE_TYPE = {
  MEDICAL: 'medical',
  DENTAL: 'dental',
  VISION: 'vision',
  PHARMACY: 'pharmacy',
  BEHAVIORAL_HEALTH: 'behavioral_health',
  LIFE: 'life',
  DISABILITY: 'disability',
}

export const COVERAGE_TYPE_LABELS = {
  [COVERAGE_TYPE.MEDICAL]: 'Medical',
  [COVERAGE_TYPE.DENTAL]: 'Dental',
  [COVERAGE_TYPE.VISION]: 'Vision',
  [COVERAGE_TYPE.PHARMACY]: 'Pharmacy',
  [COVERAGE_TYPE.BEHAVIORAL_HEALTH]: 'Behavioral Health',
  [COVERAGE_TYPE.LIFE]: 'Life Insurance',
  [COVERAGE_TYPE.DISABILITY]: 'Disability',
}

export const COVERAGE_TIER = {
  INDIVIDUAL: 'individual',
  INDIVIDUAL_SPOUSE: 'individual_spouse',
  INDIVIDUAL_CHILDREN: 'individual_children',
  FAMILY: 'family',
}

export const COVERAGE_TIER_LABELS = {
  [COVERAGE_TIER.INDIVIDUAL]: 'Individual',
  [COVERAGE_TIER.INDIVIDUAL_SPOUSE]: 'Individual + Spouse',
  [COVERAGE_TIER.INDIVIDUAL_CHILDREN]: 'Individual + Children',
  [COVERAGE_TIER.FAMILY]: 'Family',
}

// -----------------------------------------------------------------------------
// Document Categories
// -----------------------------------------------------------------------------
export const DOCUMENT_CATEGORY = {
  EOB: 'eob',
  ID_CARD: 'id_card',
  PLAN_DOCUMENT: 'plan_document',
  LETTER: 'letter',
  FORM: 'form',
  TAX_DOCUMENT: 'tax_document',
  PRIOR_AUTH: 'prior_auth',
  APPEAL: 'appeal',
  BENEFIT_SUMMARY: 'benefit_summary',
  PROVIDER_DIRECTORY: 'provider_directory',
}

export const DOCUMENT_CATEGORY_LABELS = {
  [DOCUMENT_CATEGORY.EOB]: 'Explanation of Benefits',
  [DOCUMENT_CATEGORY.ID_CARD]: 'ID Card',
  [DOCUMENT_CATEGORY.PLAN_DOCUMENT]: 'Plan Document',
  [DOCUMENT_CATEGORY.LETTER]: 'Letter',
  [DOCUMENT_CATEGORY.FORM]: 'Form',
  [DOCUMENT_CATEGORY.TAX_DOCUMENT]: 'Tax Document',
  [DOCUMENT_CATEGORY.PRIOR_AUTH]: 'Prior Authorization',
  [DOCUMENT_CATEGORY.APPEAL]: 'Appeal',
  [DOCUMENT_CATEGORY.BENEFIT_SUMMARY]: 'Benefit Summary',
  [DOCUMENT_CATEGORY.PROVIDER_DIRECTORY]: 'Provider Directory',
}

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------
export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CLAIM_UPDATE: 'claim_update',
  BENEFIT_CHANGE: 'benefit_change',
  DOCUMENT_AVAILABLE: 'document_available',
  MESSAGE_RECEIVED: 'message_received',
  PAYMENT_DUE: 'payment_due',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  PRIOR_AUTH_UPDATE: 'prior_auth_update',
  SYSTEM: 'system',
}

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPE.INFO]: 'Information',
  [NOTIFICATION_TYPE.SUCCESS]: 'Success',
  [NOTIFICATION_TYPE.WARNING]: 'Warning',
  [NOTIFICATION_TYPE.ERROR]: 'Error',
  [NOTIFICATION_TYPE.CLAIM_UPDATE]: 'Claim Update',
  [NOTIFICATION_TYPE.BENEFIT_CHANGE]: 'Benefit Change',
  [NOTIFICATION_TYPE.DOCUMENT_AVAILABLE]: 'Document Available',
  [NOTIFICATION_TYPE.MESSAGE_RECEIVED]: 'Message Received',
  [NOTIFICATION_TYPE.PAYMENT_DUE]: 'Payment Due',
  [NOTIFICATION_TYPE.APPOINTMENT_REMINDER]: 'Appointment Reminder',
  [NOTIFICATION_TYPE.PRIOR_AUTH_UPDATE]: 'Prior Authorization Update',
  [NOTIFICATION_TYPE.SYSTEM]: 'System',
}

export const NOTIFICATION_TYPE_ICONS = {
  [NOTIFICATION_TYPE.INFO]: 'info',
  [NOTIFICATION_TYPE.SUCCESS]: 'check-circle',
  [NOTIFICATION_TYPE.WARNING]: 'alert-triangle',
  [NOTIFICATION_TYPE.ERROR]: 'alert-circle',
  [NOTIFICATION_TYPE.CLAIM_UPDATE]: 'file-text',
  [NOTIFICATION_TYPE.BENEFIT_CHANGE]: 'shield',
  [NOTIFICATION_TYPE.DOCUMENT_AVAILABLE]: 'folder',
  [NOTIFICATION_TYPE.MESSAGE_RECEIVED]: 'mail',
  [NOTIFICATION_TYPE.PAYMENT_DUE]: 'dollar-sign',
  [NOTIFICATION_TYPE.APPOINTMENT_REMINDER]: 'calendar',
  [NOTIFICATION_TYPE.PRIOR_AUTH_UPDATE]: 'clipboard',
  [NOTIFICATION_TYPE.SYSTEM]: 'settings',
}

// -----------------------------------------------------------------------------
// Dashboard Widget Types
// -----------------------------------------------------------------------------
export const WIDGET_TYPE = {
  BENEFITS_SUMMARY: 'benefits_summary',
  CLAIMS_OVERVIEW: 'claims_overview',
  SPENDING_TRACKER: 'spending_tracker',
  ID_CARD: 'id_card',
  QUICK_ACTIONS: 'quick_actions',
  RECENT_CLAIMS: 'recent_claims',
  NOTIFICATIONS: 'notifications',
  DEDUCTIBLE_PROGRESS: 'deductible_progress',
  UPCOMING_APPOINTMENTS: 'upcoming_appointments',
  COST_ESTIMATOR: 'cost_estimator',
  PLAN_HIGHLIGHTS: 'plan_highlights',
}

export const WIDGET_TYPE_LABELS = {
  [WIDGET_TYPE.BENEFITS_SUMMARY]: 'Benefits Summary',
  [WIDGET_TYPE.CLAIMS_OVERVIEW]: 'Claims Overview',
  [WIDGET_TYPE.SPENDING_TRACKER]: 'Spending Tracker',
  [WIDGET_TYPE.ID_CARD]: 'ID Card',
  [WIDGET_TYPE.QUICK_ACTIONS]: 'Quick Actions',
  [WIDGET_TYPE.RECENT_CLAIMS]: 'Recent Claims',
  [WIDGET_TYPE.NOTIFICATIONS]: 'Notifications',
  [WIDGET_TYPE.DEDUCTIBLE_PROGRESS]: 'Deductible Progress',
  [WIDGET_TYPE.UPCOMING_APPOINTMENTS]: 'Upcoming Appointments',
  [WIDGET_TYPE.COST_ESTIMATOR]: 'Cost Estimator',
  [WIDGET_TYPE.PLAN_HIGHLIGHTS]: 'Plan Highlights',
}

// -----------------------------------------------------------------------------
// Quick Actions (Dashboard)
// -----------------------------------------------------------------------------
export const QUICK_ACTIONS = [
  {
    id: 'find_doctor',
    label: 'Find a Doctor',
    icon: 'search',
    route: null,
    externalUrl: EXTERNAL_URLS.doctorFinder,
    description: 'Search for in-network providers',
  },
  {
    id: 'view_id_card',
    label: 'View ID Card',
    icon: 'credit-card',
    route: '/coverage',
    externalUrl: null,
    description: 'Access your digital ID card',
  },
  {
    id: 'check_claims',
    label: 'Check Claims',
    icon: 'file-text',
    route: '/claims',
    externalUrl: null,
    description: 'View claim status and history',
  },
  {
    id: 'view_benefits',
    label: 'View Benefits',
    icon: 'shield',
    route: '/benefits',
    externalUrl: null,
    description: 'Review your plan benefits',
  },
  {
    id: 'find_pharmacy',
    label: 'Find a Pharmacy',
    icon: 'map-pin',
    route: null,
    externalUrl: EXTERNAL_URLS.pharmacyFinder,
    description: 'Locate nearby pharmacies',
  },
  {
    id: 'contact_support',
    label: 'Contact Support',
    icon: 'phone',
    route: '/support',
    externalUrl: null,
    description: 'Get help from our team',
  },
  {
    id: 'telehealth',
    label: 'Telehealth Visit',
    icon: 'video',
    route: null,
    externalUrl: EXTERNAL_URLS.telehealth,
    description: 'Start a virtual visit',
  },
  {
    id: 'view_documents',
    label: 'Documents',
    icon: 'folder',
    route: '/documents',
    externalUrl: null,
    description: 'Access your plan documents',
  },
]

// -----------------------------------------------------------------------------
// Pagination Defaults
// -----------------------------------------------------------------------------
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  maxVisiblePages: 5,
}

// -----------------------------------------------------------------------------
// Date & Time Formats
// -----------------------------------------------------------------------------
export const DATE_FORMAT = {
  display: 'MM/DD/YYYY',
  displayLong: 'MMMM D, YYYY',
  displayShort: 'MMM D, YYYY',
  input: 'YYYY-MM-DD',
  monthYear: 'MMMM YYYY',
  time: 'h:mm A',
  dateTime: 'MM/DD/YYYY h:mm A',
  dateTimeLong: 'MMMM D, YYYY at h:mm A',
}

// -----------------------------------------------------------------------------
// Currency & Number Formatting
// -----------------------------------------------------------------------------
export const CURRENCY = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

// -----------------------------------------------------------------------------
// File Upload Constraints
// -----------------------------------------------------------------------------
export const FILE_UPLOAD = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxSizeDisplay: '10 MB',
  acceptedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
  ],
  acceptedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.tiff'],
  maxFiles: 5,
}

// -----------------------------------------------------------------------------
// Accessibility
// -----------------------------------------------------------------------------
export const A11Y = {
  skipNavId: 'main-content',
  skipNavLabel: 'Skip to main content',
  liveRegionId: 'hb-live-region',
  announcerDelay: 100,
}

// -----------------------------------------------------------------------------
// Animation Durations (ms) — mirrors CSS custom properties
// -----------------------------------------------------------------------------
export const ANIMATION = {
  fast: 150,
  base: 200,
  slow: 300,
  modalEntry: 200,
  toastDuration: 5000,
  toastDismiss: 300,
}

// -----------------------------------------------------------------------------
// Local Storage Keys
// -----------------------------------------------------------------------------
export const STORAGE_KEYS = {
  theme: 'hb_theme',
  sidebarCollapsed: 'hb_sidebar_collapsed',
  recentSearches: 'hb_recent_searches',
  dismissedBanners: 'hb_dismissed_banners',
  preferredLanguage: 'hb_language',
  notificationPreferences: 'hb_notification_prefs',
  dashboardLayout: 'hb_dashboard_layout',
}

// -----------------------------------------------------------------------------
// API / Network
// -----------------------------------------------------------------------------
export const API = {
  requestTimeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
}

// -----------------------------------------------------------------------------
// Relationship Types (for dependents)
// -----------------------------------------------------------------------------
export const RELATIONSHIP_TYPE = {
  SELF: 'self',
  SPOUSE: 'spouse',
  CHILD: 'child',
  DOMESTIC_PARTNER: 'domestic_partner',
  DEPENDENT: 'dependent',
}

export const RELATIONSHIP_TYPE_LABELS = {
  [RELATIONSHIP_TYPE.SELF]: 'Self',
  [RELATIONSHIP_TYPE.SPOUSE]: 'Spouse',
  [RELATIONSHIP_TYPE.CHILD]: 'Child',
  [RELATIONSHIP_TYPE.DOMESTIC_PARTNER]: 'Domestic Partner',
  [RELATIONSHIP_TYPE.DEPENDENT]: 'Dependent',
}

// -----------------------------------------------------------------------------
// Network Status
// -----------------------------------------------------------------------------
export const NETWORK_STATUS = {
  IN_NETWORK: 'in_network',
  OUT_OF_NETWORK: 'out_of_network',
  TIER_1: 'tier_1',
  TIER_2: 'tier_2',
}

export const NETWORK_STATUS_LABELS = {
  [NETWORK_STATUS.IN_NETWORK]: 'In-Network',
  [NETWORK_STATUS.OUT_OF_NETWORK]: 'Out-of-Network',
  [NETWORK_STATUS.TIER_1]: 'Tier 1',
  [NETWORK_STATUS.TIER_2]: 'Tier 2',
}

// -----------------------------------------------------------------------------
// Glassbox / Analytics
// -----------------------------------------------------------------------------
export const ANALYTICS = {
  glassboxEnabled: import.meta.env.VITE_GLASSBOX_ENABLED === 'true',
}