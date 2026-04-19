import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ClaimsList from '@/components/claims/ClaimsList'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Claims page component.
 *
 * Renders the ClaimsList component with full filtering, sorting, and
 * pagination. Includes a page title, breadcrumb navigation, summary
 * description, and a link to the ClaimSubmission form. Tags a page_view
 * event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimsPage />
 *
 * @example
 * <ClaimsPage className="mt-4" testId="claims-page" />
 */
function ClaimsPage({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/claims', source: 'claims_page' })
    announceToScreenReader('Claims page loaded', { priority: 'polite' })
  }, [tagPageView])

  /**
   * Handles navigating to the claim submission form.
   */
  const handleSubmitClaim = useCallback(() => {
    tagPageView({ page: '/claims/submit', source: 'claims_page' })
    navigate('/claims/submit')
  }, [navigate, tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'claims-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'claims-page-breadcrumb'}
      >
        <ol className="hb-breadcrumb">
          <li>
            <a href="/" className="hb-breadcrumb-item">
              Dashboard
            </a>
          </li>
          <li>
            <svg
              className="w-3.5 h-3.5 hb-breadcrumb-separator"
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
          </li>
          <li>
            <span className="hb-breadcrumb-item-active" aria-current="page">
              Claims
            </span>
          </li>
        </ol>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-hb-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Claims</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Track, manage, and submit your healthcare claims
            </p>
          </div>
        </div>

        {/* Submit a Claim button */}
        <button
          type="button"
          className="hb-btn-md hb-btn-primary"
          onClick={handleSubmitClaim}
          aria-label="Submit a new claim"
          data-testid={
            testId
              ? `${testId}-submit-claim-btn`
              : 'claims-page-submit-claim-btn'
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Submit a Claim
        </button>
      </div>

      {/* Claims list with filtering, sorting, and pagination */}
      <ClaimsList
        testId={testId ? `${testId}-list` : 'claims-page-list'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Claims page loaded
      </div>
    </div>
  )
}

export default ClaimsPage

export { ClaimsPage }