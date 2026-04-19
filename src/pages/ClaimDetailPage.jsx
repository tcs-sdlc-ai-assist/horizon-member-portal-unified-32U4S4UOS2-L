import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ClaimDetail from '@/components/claims/ClaimDetail'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Claim detail page component.
 *
 * Extracts the claim ID from route params, finds the claim in dummy data,
 * and renders the ClaimDetail component. Includes breadcrumb navigation
 * back to the claims list. Tags a page_view event on mount via
 * useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimDetailPage />
 *
 * @example
 * <ClaimDetailPage className="mt-4" testId="claim-detail-page" />
 */
function ClaimDetailPage({ className = '', testId }) {
  const { claimId } = useParams()
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/claims/detail', claimId, source: 'claim_detail_page' })
    announceToScreenReader('Claim detail page loaded', { priority: 'polite' })
  }, [tagPageView, claimId])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'claim-detail-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'claim-detail-page-breadcrumb'}
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
              Claim Detail
            </span>
          </li>
        </ol>
      </nav>

      {/* Claim Detail component */}
      <ClaimDetail
        claimId={claimId}
        testId={testId ? `${testId}-detail` : 'claim-detail-page-detail'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Claim detail page loaded
      </div>
    </div>
  )
}

export default ClaimDetailPage

export { ClaimDetailPage }