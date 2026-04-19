import { useEffect } from 'react'
import ClaimSubmission from '@/components/claims/ClaimSubmission'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Claim submission page component.
 *
 * Renders the ClaimSubmission form component within the standard page layout.
 * Includes a page title, breadcrumb navigation back to the claims list, and
 * tags a page_view event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimSubmissionPage />
 *
 * @example
 * <ClaimSubmissionPage className="mt-4" testId="claim-submission-page" />
 */
function ClaimSubmissionPage({ className = '', testId }) {
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/claims/submit', source: 'claim_submission_page' })
    announceToScreenReader('Claim submission page loaded', { priority: 'polite' })
  }, [tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'claim-submission-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'claim-submission-page-breadcrumb'}
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
            <a href="/claims" className="hb-breadcrumb-item">
              Claims
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
              Submit a Claim
            </span>
          </li>
        </ol>
      </nav>

      {/* Claim Submission form component */}
      <ClaimSubmission
        testId={testId ? `${testId}-form` : 'claim-submission-page-form'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Claim submission page loaded
      </div>
    </div>
  )
}

export default ClaimSubmissionPage

export { ClaimSubmissionPage }