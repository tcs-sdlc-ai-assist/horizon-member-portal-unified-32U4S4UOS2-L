import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import getCareContent from '@/data/getCareContent'
import LeavingSiteModal from '@/components/common/LeavingSiteModal'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'

/**
 * Icon mapping for Get Care section icons.
 */
const SECTION_ICON_MAP = {
  search: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  video: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  heart: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

/**
 * Icon mapping for link icons within sections.
 */
const LINK_ICON_MAP = {
  user: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  'map-pin': (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  'dollar-sign': (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  folder: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  video: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  search: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  heart: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  'alert-circle': (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  shield: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  users: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clipboard: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  phone: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
}

/**
 * Returns the icon element for a given icon name.
 * @param {string} iconName - The icon name.
 * @returns {React.ReactNode} The icon element.
 */
const getSectionIcon = (iconName) => SECTION_ICON_MAP[iconName] || SECTION_ICON_MAP.search

/**
 * Returns the icon element for a given link icon name.
 * @param {string} iconName - The icon name.
 * @returns {React.ReactNode} The icon element.
 */
const getLinkIcon = (iconName) => LINK_ICON_MAP[iconName] || LINK_ICON_MAP.search

/**
 * Care guidance option icon mapping.
 */
const CARE_GUIDANCE_ICON_MAP = {
  video: LINK_ICON_MAP.video,
  user: LINK_ICON_MAP.user,
  activity: (
    <svg
      className="w-5 h-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clock: LINK_ICON_MAP.clock,
  'alert-circle': LINK_ICON_MAP['alert-circle'],
}

/**
 * Get Care page sections component.
 *
 * Renders Find Care & Cost (with external link to National Doctor & Hospital
 * Finder via LeavingSiteModal), Telemedicine guidance/FAQs, and Behavioral
 * Health guidance/FAQs. Uses getCareContent dummy data. Tags
 * external_link_click via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <GetCareSections />
 *
 * @example
 * <GetCareSections className="mt-4" testId="get-care-sections" />
 */
function GetCareSections({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagExternalLinkClick, tagPageView } = useEventTagger()

  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false)
  const [externalDestination, setExternalDestination] = useState({
    url: '',
    label: '',
  })
  const [expandedFaqId, setExpandedFaqId] = useState(null)

  const [ids] = useState(() => ({
    sections: generateAriaId('hb-getcare-sections'),
    faqs: generateAriaId('hb-getcare-faqs'),
    careGuide: generateAriaId('hb-getcare-guide'),
  }))

  /**
   * Content sections from getCareContent data.
   */
  const sections = useMemo(() => getCareContent.sections || [], [])

  /**
   * FAQs from getCareContent data.
   */
  const faqs = useMemo(() => getCareContent.faqs || [], [])

  /**
   * Care guidance options from getCareContent data.
   */
  const careGuidance = useMemo(() => getCareContent.careGuidance || null, [])

  /**
   * Nurse line info from getCareContent data.
   */
  const nurseLineInfo = useMemo(() => getCareContent.nurseLineInfo || null, [])

  /**
   * Quick contacts from getCareContent data.
   */
  const quickContacts = useMemo(() => getCareContent.quickContacts || [], [])

  /**
   * Handles clicking an external link — opens the leaving site modal.
   */
  const handleExternalLinkClick = useCallback((url, label) => {
    setExternalDestination({ url, label })
    setIsLeavingSiteOpen(true)
  }, [])

  /**
   * Handles clicking an internal link — navigates to the route.
   */
  const handleInternalLinkClick = useCallback(
    (route) => {
      tagPageView({ page: route, source: 'get_care_sections' })
      navigate(route)
    },
    [navigate, tagPageView],
  )

  /**
   * Handles clicking a section link.
   */
  const handleLinkClick = useCallback(
    (link) => {
      if (link.isExternal && link.url) {
        handleExternalLinkClick(link.url, link.label)
      } else if (link.route) {
        handleInternalLinkClick(link.route)
      }
    },
    [handleExternalLinkClick, handleInternalLinkClick],
  )

  /**
   * Handles the continue action after the leaving site modal is confirmed.
   */
  const handleExternalContinue = useCallback(() => {
    tagExternalLinkClick({
      destinationUrl: externalDestination.url,
      destinationLabel: externalDestination.label,
      source: 'get_care_sections',
    })
  }, [tagExternalLinkClick, externalDestination])

  /**
   * Handles toggling a FAQ item.
   */
  const handleToggleFaq = useCallback(
    (faqId) => {
      setExpandedFaqId((prev) => {
        const next = prev === faqId ? null : faqId

        if (next) {
          const faq = faqs.find((f) => f.id === faqId)
          if (faq) {
            announceToScreenReader(`${faq.question} — expanded`, { priority: 'polite' })
          }
        } else {
          announceToScreenReader('FAQ collapsed', { priority: 'polite' })
        }

        return next
      })
    },
    [faqs],
  )

  /**
   * Handles keyboard activation on a FAQ item.
   */
  const handleFaqKeyDown = useCallback(
    (event, faqId) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggleFaq(faqId)
      }
    },
    [handleToggleFaq],
  )

  /**
   * Handles calling a phone number.
   */
  const handleCallPhone = useCallback((phone) => {
    try {
      window.location.href = `tel:${phone.replace(/[^\d]/g, '')}`
    } catch (_error) {
      // Silently fail if tel is not supported
    }
  }, [])

  if (!sections || sections.length === 0) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'get-care-sections'}
      >
        <div className="hb-card-body">
          <div className="hb-empty-state py-12">
            <svg
              className="w-12 h-12 text-neutral-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="text-sm font-medium text-neutral-600 mb-1">No care information available</p>
            <p className="text-xs text-neutral-400">
              Care resources will appear here once available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`flex flex-col gap-8 ${className}`.trim()}
        data-testid={testId || 'get-care-sections'}
      >
        {/* Hero section */}
        {getCareContent.hero && (
          <div
            className="bg-gradient-primary rounded-xl px-6 sm:px-8 py-8 text-white"
            data-testid={testId ? `${testId}-hero` : 'get-care-sections-hero'}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{getCareContent.hero.title}</h1>
                <p className="text-base text-white/90 mt-1">{getCareContent.hero.subtitle}</p>
                <p className="text-sm text-white/70 mt-3 leading-relaxed max-w-2xl">
                  {getCareContent.hero.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Care Guidance — Where Should I Go? */}
        {careGuidance && (
          <div
            className="hb-card overflow-hidden"
            data-testid={testId ? `${testId}-care-guidance` : 'get-care-sections-care-guidance'}
          >
            <div className="hb-card-header flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hb-accent/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-hb-accent"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">{careGuidance.title}</h2>
                <p className="text-2xs text-neutral-500 mt-0.5">{careGuidance.description}</p>
              </div>
            </div>

            <div className="hb-card-body p-0">
              {/* Desktop table view */}
              <div className="hidden lg:block overflow-x-auto">
                <table
                  className="hb-table"
                  aria-label="Care guidance comparison"
                  data-testid={
                    testId
                      ? `${testId}-care-guidance-table`
                      : 'get-care-sections-care-guidance-table'
                  }
                >
                  <thead>
                    <tr>
                      <th scope="col">Care Setting</th>
                      <th scope="col">Copay</th>
                      <th scope="col">Wait Time</th>
                      <th scope="col">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careGuidance.options.map((option) => (
                      <tr key={option.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
                              {CARE_GUIDANCE_ICON_MAP[option.icon] || LINK_ICON_MAP.search}
                            </div>
                            <span className="text-sm font-medium text-neutral-800">
                              {option.setting}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="hb-badge-sm hb-badge-success">{option.copay}</span>
                        </td>
                        <td>
                          <span className="text-sm text-neutral-600">{option.waitTime}</span>
                        </td>
                        <td>
                          <span className="text-sm text-neutral-600 block max-w-[20rem]">
                            {option.bestFor}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="lg:hidden divide-y divide-neutral-100">
                {careGuidance.options.map((option) => (
                  <div key={option.id} className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
                        {CARE_GUIDANCE_ICON_MAP[option.icon] || LINK_ICON_MAP.search}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{option.setting}</p>
                        <span className="hb-badge-sm hb-badge-success">{option.copay}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{option.bestFor}</p>
                    <p className="text-2xs text-neutral-400 mt-1 italic">
                      {option.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Sections */}
        {sections.map((section) => (
          <div
            key={section.id}
            className="hb-card overflow-hidden"
            data-testid={
              testId
                ? `${testId}-section-${section.id}`
                : `get-care-sections-section-${section.id}`
            }
          >
            {/* Section header */}
            <div className="hb-card-header flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
                {getSectionIcon(section.icon)}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">{section.title}</h2>
                <p className="text-2xs text-neutral-500 mt-0.5 hb-text-clamp-2">
                  {section.description}
                </p>
              </div>
            </div>

            {/* Section body */}
            <div className="hb-card-body">
              <div className="flex flex-col gap-5">
                {/* Guidance text */}
                {section.guidance && (
                  <div className="hb-alert-info">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p className="text-xs leading-relaxed">{section.guidance}</p>
                  </div>
                )}

                {/* Links grid */}
                {section.links && section.links.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.links.map((link) => (
                      <button
                        key={link.id}
                        type="button"
                        className="flex items-start gap-3 px-4 py-3 rounded-lg border border-neutral-200 text-left transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-50 group"
                        onClick={() => handleLinkClick(link)}
                        aria-label={`${link.label} — ${link.description}`}
                        data-testid={
                          testId
                            ? `${testId}-link-${link.id}`
                            : `get-care-sections-link-${link.id}`
                        }
                      >
                        <div className="w-9 h-9 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary group-hover:bg-hb-primary/15 transition-colors duration-150">
                          {getLinkIcon(link.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 group-hover:text-hb-primary transition-colors duration-150">
                            {link.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5 hb-text-clamp-2">
                            {link.description}
                          </p>
                        </div>
                        {link.isExternal ? (
                          <svg
                            className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 mt-0.5 transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 mt-0.5 transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Covered services */}
                {section.coveredServices && section.coveredServices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg
                        className="w-4 h-4 text-success flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                        Covered Services
                      </h3>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {section.coveredServices.map((service, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs text-neutral-600"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {section.tips && section.tips.length > 0 && (
                  <div className="bg-surface-secondary rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-hb-accent flex-shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                        Tips
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {section.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs text-neutral-600"
                        >
                          <span className="text-hb-accent font-bold flex-shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emergency info (behavioral health section) */}
                {section.emergencyInfo && (
                  <div className="hb-alert-error">
                    <svg
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold mb-1">{section.emergencyInfo.title}</p>
                      <p className="text-xs leading-relaxed mb-3">
                        {section.emergencyInfo.message}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.emergencyInfo.contacts.map((contact, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white/50 rounded-md px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-error-dark">
                                {contact.label}
                              </p>
                              <button
                                type="button"
                                className="text-xs font-medium text-error-dark underline hover:no-underline"
                                onClick={() => handleCallPhone(contact.phone)}
                                aria-label={`Call ${contact.label} at ${contact.phone}`}
                              >
                                {contact.phone}
                              </button>
                              <p className="text-2xs text-error-dark/70 mt-0.5">
                                {contact.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 24/7 Nurse Line */}
        {nurseLineInfo && (
          <div
            className="hb-card overflow-hidden"
            data-testid={testId ? `${testId}-nurse-line` : 'get-care-sections-nurse-line'}
          >
            <div className="px-6 py-5 bg-info-light/50 border-b border-info/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-info"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-neutral-900">{nurseLineInfo.title}</h2>
                  <p className="text-sm text-neutral-600 mt-0.5">{nurseLineInfo.description}</p>
                </div>
                <button
                  type="button"
                  className="hb-btn-md hb-btn-primary flex-shrink-0"
                  onClick={() => handleCallPhone(nurseLineInfo.phone)}
                  aria-label={`Call ${nurseLineInfo.title} at ${nurseLineInfo.phoneDisplay}`}
                  data-testid={
                    testId
                      ? `${testId}-nurse-line-call`
                      : 'get-care-sections-nurse-line-call'
                  }
                >
                  <svg
                    className="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {nurseLineInfo.phoneDisplay}
                </button>
              </div>
            </div>

            <div className="hb-card-body">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  What You Can Expect
                </h3>
              </div>
              <ul className="flex flex-col gap-1.5">
                {nurseLineInfo.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-xs text-neutral-600"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-2xs text-neutral-400 mt-3">
                Available {nurseLineInfo.hours}
              </p>
            </div>
          </div>
        )}

        {/* Quick Contacts */}
        {quickContacts.length > 0 && (
          <div
            className="hb-card overflow-hidden"
            data-testid={testId ? `${testId}-quick-contacts` : 'get-care-sections-quick-contacts'}
          >
            <div className="hb-card-header flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-hb-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-neutral-900">Quick Contacts</h2>
            </div>

            <div className="hb-card-body p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100">
                {quickContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="px-4 sm:px-5 py-3.5 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500">
                      {getLinkIcon(contact.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-neutral-700">{contact.label}</p>
                      <button
                        type="button"
                        className="text-sm font-semibold text-hb-primary hover:text-hb-primary-light transition-colors duration-150"
                        onClick={() => handleCallPhone(contact.phone)}
                        aria-label={`Call ${contact.label} at ${contact.phone}`}
                        data-testid={
                          testId
                            ? `${testId}-contact-${contact.id}`
                            : `get-care-sections-contact-${contact.id}`
                        }
                      >
                        {contact.phone}
                      </button>
                      <p className="text-2xs text-neutral-400">{contact.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <div
            className="hb-card overflow-hidden"
            data-testid={testId ? `${testId}-faqs` : 'get-care-sections-faqs'}
          >
            <div className="hb-card-header flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-hb-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">
                  Frequently Asked Questions
                </h2>
                <p className="text-2xs text-neutral-500 mt-0.5">
                  {faqs.length} {faqs.length === 1 ? 'question' : 'questions'} — click to expand
                </p>
              </div>
            </div>

            <div
              id={ids.faqs}
              className="divide-y divide-neutral-100"
              role="list"
              aria-label="Frequently asked questions"
              data-testid={
                testId ? `${testId}-faqs-list` : 'get-care-sections-faqs-list'
              }
            >
              {faqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id

                return (
                  <div
                    key={faq.id}
                    role="listitem"
                    data-testid={
                      testId
                        ? `${testId}-faq-${faq.id}`
                        : `get-care-sections-faq-${faq.id}`
                    }
                  >
                    {/* FAQ question — clickable */}
                    <div
                      className="px-4 sm:px-6 py-4 cursor-pointer transition-colors duration-150 hover:bg-neutral-50 group"
                      onClick={() => handleToggleFaq(faq.id)}
                      onKeyDown={(event) => handleFaqKeyDown(event, faq.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={isExpanded ? `${ids.faqs}-answer-${faq.id}` : undefined}
                      aria-label={`${faq.question}. Click to ${isExpanded ? 'collapse' : 'expand'} answer.`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-neutral-800 group-hover:text-hb-primary transition-colors duration-150">
                          {faq.question}
                        </p>
                        <svg
                          className={`w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>

                    {/* FAQ answer — expanded */}
                    {isExpanded && (
                      <div
                        id={`${ids.faqs}-answer-${faq.id}`}
                        className="px-4 sm:px-6 pb-4"
                      >
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Screen reader live region */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          {expandedFaqId
            ? `Showing answer for ${faqs.find((f) => f.id === expandedFaqId)?.question || 'selected question'}`
            : ''}
        </div>
      </div>

      {/* Leaving Site Modal for external links */}
      <LeavingSiteModal
        isOpen={isLeavingSiteOpen}
        onClose={() => setIsLeavingSiteOpen(false)}
        destinationUrl={externalDestination.url}
        destinationLabel={externalDestination.label}
        onContinue={handleExternalContinue}
        testId={
          testId
            ? `${testId}-leaving-site-modal`
            : 'get-care-sections-leaving-site-modal'
        }
      />
    </>
  )
}

export default GetCareSections

export { GetCareSections }