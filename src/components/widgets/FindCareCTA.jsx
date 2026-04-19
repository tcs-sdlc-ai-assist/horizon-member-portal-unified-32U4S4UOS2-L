import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventTagger } from '@/hooks/useEventTagger'
import LeavingSiteModal from '@/components/common/LeavingSiteModal'
import { EXTERNAL_URLS, SUPPORT } from '@/constants/constants'

/**
 * Dashboard Find Care & Cost call-to-action widget.
 *
 * Displays a prominent card with quick-access links to care-related actions
 * including Find a Doctor (external), Telehealth (external), Urgent Care
 * (external), and the internal Get Care page. External links trigger the
 * LeavingSiteModal disclaimer. Styled with Honeybee CSS card and button
 * classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <FindCareCTA />
 *
 * @example
 * <FindCareCTA className="col-span-2" testId="dashboard-find-care" />
 */
function FindCareCTA({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagExternalLinkClick, tagPageView } = useEventTagger()

  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false)
  const [externalDestination, setExternalDestination] = useState({
    url: '',
    label: '',
  })

  /**
   * Quick care action items displayed in the widget.
   */
  const careActions = [
    {
      id: 'find_doctor',
      label: 'Find a Doctor',
      description: 'Search for in-network providers',
      icon: (
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
      externalUrl: EXTERNAL_URLS.doctorFinder,
      route: null,
    },
    {
      id: 'telehealth',
      label: 'Telehealth Visit',
      description: '$10 copay — available 24/7',
      icon: (
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
      externalUrl: EXTERNAL_URLS.telehealth,
      route: null,
    },
    {
      id: 'urgent_care',
      label: 'Find Urgent Care',
      description: 'Locate nearby urgent care centers',
      icon: (
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
      externalUrl: EXTERNAL_URLS.urgentCareFinder,
      route: null,
    },
    {
      id: 'cost_estimator',
      label: 'Estimate Costs',
      description: 'Know what you may owe',
      icon: (
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
      externalUrl: 'https://www.horizonhealthcare.com/cost-estimator',
      route: null,
    },
  ]

  /**
   * Handles clicking an external care action — opens the leaving site modal.
   */
  const handleExternalAction = useCallback((url, label) => {
    setExternalDestination({ url, label })
    setIsLeavingSiteOpen(true)
  }, [])

  /**
   * Handles clicking an internal care action — navigates to the route.
   */
  const handleInternalAction = useCallback(
    (route) => {
      tagPageView({ page: route, source: 'find_care_cta' })
      navigate(route)
    },
    [navigate, tagPageView],
  )

  /**
   * Handles clicking a care action item.
   */
  const handleActionClick = useCallback(
    (action) => {
      if (action.externalUrl) {
        handleExternalAction(action.externalUrl, action.label)
      } else if (action.route) {
        handleInternalAction(action.route)
      }
    },
    [handleExternalAction, handleInternalAction],
  )

  /**
   * Handles the continue action after the leaving site modal is confirmed.
   */
  const handleExternalContinue = useCallback(() => {
    tagExternalLinkClick({
      destinationUrl: externalDestination.url,
      destinationLabel: externalDestination.label,
      source: 'find_care_cta',
    })
  }, [tagExternalLinkClick, externalDestination])

  /**
   * Handles navigating to the full Get Care page.
   */
  const handleViewGetCare = useCallback(() => {
    tagPageView({ page: '/support', source: 'find_care_cta' })
    navigate('/support')
  }, [navigate, tagPageView])

  /**
   * Handles the nurse line call action.
   */
  const handleNurseLineCall = useCallback(() => {
    try {
      window.location.href = `tel:${SUPPORT.nurseLinePhone.replace(/[^\d]/g, '')}`
    } catch (_error) {
      // Silently fail if tel is not supported
    }
  }, [])

  return (
    <>
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'find-care-cta'}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-primary px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
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
              <h3 className="text-lg font-semibold text-white">Find Care & Estimate Costs</h3>
              <p className="text-sm text-white/80 mt-0.5">
                Find the right care at the right cost
              </p>
            </div>
          </div>
        </div>

        {/* Care action items */}
        <div className="hb-card-body p-0">
          <div className="divide-y divide-neutral-100">
            {careActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="flex items-center gap-3 w-full px-6 py-3.5 text-left transition-colors duration-150 hover:bg-neutral-50 group"
                onClick={() => handleActionClick(action)}
                aria-label={`${action.label} — ${action.description}`}
                data-testid={
                  testId
                    ? `${testId}-action-${action.id}`
                    : `find-care-cta-action-${action.id}`
                }
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary group-hover:bg-hb-primary/15 transition-colors duration-150">
                  {action.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 group-hover:text-hb-primary transition-colors duration-150">
                    {action.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 hb-text-truncate">
                    {action.description}
                  </p>
                </div>

                {/* Arrow / external indicator */}
                {action.externalUrl ? (
                  <svg
                    className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 transition-colors duration-150"
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
                    className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 transition-colors duration-150"
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
        </div>

        {/* Nurse line quick contact */}
        <div className="px-6 py-3 bg-info-light/50 border-t border-neutral-100">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-4 h-4 text-info flex-shrink-0"
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
            <p className="text-xs text-neutral-600">
              Not sure where to go?{' '}
              <button
                type="button"
                className="font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-150 underline"
                onClick={handleNurseLineCall}
                aria-label={`Call 24/7 Nurse Line at ${SUPPORT.nurseLinePhone}`}
                data-testid={
                  testId
                    ? `${testId}-nurse-line`
                    : 'find-care-cta-nurse-line'
                }
              >
                Call our 24/7 Nurse Line
              </button>
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="hb-card-footer flex items-center justify-center">
          <button
            type="button"
            className="hb-btn-sm hb-btn-outline w-full justify-center"
            onClick={handleViewGetCare}
            data-testid={
              testId
                ? `${testId}-view-all`
                : 'find-care-cta-view-all'
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
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            View All Care Options
          </button>
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
            : 'find-care-cta-leaving-site-modal'
        }
      />
    </>
  )
}

export default FindCareCTA

export { FindCareCTA }