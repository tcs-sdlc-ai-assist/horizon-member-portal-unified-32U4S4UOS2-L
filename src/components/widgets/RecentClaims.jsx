import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import claims from '@/data/claims'
import StatusBadge from '@/components/common/StatusBadge'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { formatCurrency, formatDate } from '@/utils/formatters'

/**
 * Maximum number of recent claims to display in the widget.
 */
const MAX_VISIBLE_CLAIMS = 3

/**
 * Dashboard Recent Claims summary widget.
 *
 * Displays the 3 most recent claims sorted by service date (descending),
 * showing claim number, provider, billed amount, status badge, and date.
 * Sensitive fields (claim number, patient name) are wrapped with
 * PrivacyMaskedText for Glassbox session replay masking. Links to the
 * full Claims page via a footer CTA button.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <RecentClaims />
 *
 * @example
 * <RecentClaims className="col-span-2" testId="dashboard-recent-claims" />
 */
function RecentClaims({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagClaimOpened, tagPageView } = useEventTagger()

  /**
   * Sorted and limited claims for display — most recent service date first.
   */
  const recentClaims = useMemo(() => {
    const sorted = [...claims].sort(
      (a, b) => new Date(b.serviceDate) - new Date(a.serviceDate),
    )
    return sorted.slice(0, MAX_VISIBLE_CLAIMS)
  }, [])

  /**
   * Handles clicking a claim row — navigates to the claims page.
   */
  const handleClaimClick = useCallback(
    (claim) => {
      tagClaimOpened({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimType: claim.type,
        claimStatus: claim.status,
        source: 'recent_claims_widget',
      })
      navigate('/claims')
    },
    [navigate, tagClaimOpened],
  )

  /**
   * Handles the "View All Claims" footer action.
   */
  const handleViewAllClaims = useCallback(() => {
    tagPageView({ page: '/claims', source: 'recent_claims_widget' })
    navigate('/claims')
  }, [navigate, tagPageView])

  /**
   * Handles keyboard activation on a claim row.
   */
  const handleClaimKeyDown = useCallback(
    (event, claim) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClaimClick(claim)
      }
    },
    [handleClaimClick],
  )

  /**
   * Returns the claim type icon SVG based on claim type.
   */
  const getClaimTypeIcon = (type) => {
    switch (type) {
      case 'medical':
      case 'preventive':
        return (
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )
      case 'pharmacy':
        return (
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        )
      case 'dental':
        return (
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
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )
      case 'vision':
        return (
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      case 'emergency':
        return (
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
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )
      case 'specialist':
        return (
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )
      default:
        return (
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`hb-card overflow-hidden ${className}`.trim()}
      data-testid={testId || 'recent-claims'}
    >
      {/* Header */}
      <div className="hb-card-header flex items-center justify-between">
        <div className="flex items-center gap-2.5">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Recent Claims</h3>
            <p className="text-2xs text-neutral-500 mt-0.5">
              {claims.length} total claims
            </p>
          </div>
        </div>
      </div>

      {/* Claims list */}
      <div className="hb-card-body p-0">
        {recentClaims.length === 0 ? (
          <div className="hb-empty-state py-8">
            <svg
              className="w-10 h-10 text-neutral-300 mb-3"
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
            <p className="text-sm text-neutral-500">No recent claims</p>
            <p className="text-xs text-neutral-400 mt-1">
              Claims will appear here once processed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-start gap-3 px-6 py-3.5 transition-colors duration-150 hover:bg-neutral-50 cursor-pointer group"
                onClick={() => handleClaimClick(claim)}
                onKeyDown={(event) => handleClaimKeyDown(event, claim)}
                role="button"
                tabIndex={0}
                aria-label={`Claim ${claim.claimNumber} for ${claim.provider}, ${formatCurrency(claim.whatYouOwe)} owed, status ${claim.status}`}
                data-testid={
                  testId
                    ? `${testId}-claim-${claim.id}`
                    : `recent-claims-claim-${claim.id}`
                }
              >
                {/* Claim type icon */}
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary transition-colors duration-150 mt-0.5">
                  {getClaimTypeIcon(claim.type)}
                </div>

                {/* Claim details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-hb-primary transition-colors duration-150 hb-text-truncate">
                        {claim.provider}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <PrivacyMaskedText
                          fieldType="claimNumber"
                          className="text-2xs text-neutral-400 font-mono"
                        >
                          {claim.claimNumber}
                        </PrivacyMaskedText>
                        <span className="text-neutral-300" aria-hidden="true">·</span>
                        <PrivacyMaskedText
                          fieldType="patientName"
                          className="text-2xs text-neutral-400"
                        >
                          {claim.patient}
                        </PrivacyMaskedText>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm font-semibold text-neutral-900"
                      >
                        {formatCurrency(claim.whatYouOwe)}
                      </PrivacyMaskedText>
                      <span className="text-2xs text-neutral-400 mt-0.5">
                        You owe
                      </span>
                    </div>
                  </div>

                  {/* Status and date row */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <StatusBadge
                      status={claim.status}
                      type="claim"
                      size="sm"
                      showDot
                      testId={
                        testId
                          ? `${testId}-status-${claim.id}`
                          : `recent-claims-status-${claim.id}`
                      }
                    />
                    <span className="text-2xs text-neutral-400">
                      {formatDate(claim.serviceDate, { preset: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="hb-card-footer flex items-center justify-center">
        <button
          type="button"
          className="hb-btn-sm hb-btn-outline w-full justify-center"
          onClick={handleViewAllClaims}
          data-testid={
            testId
              ? `${testId}-view-all`
              : 'recent-claims-view-all'
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          View All Claims
        </button>
      </div>
    </div>
  )
}

export default RecentClaims

export { RecentClaims }