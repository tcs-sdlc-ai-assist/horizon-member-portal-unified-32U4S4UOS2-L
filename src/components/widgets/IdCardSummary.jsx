import { useMemo, useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import coverages from '@/data/coverages'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import StatusBadge from '@/components/common/StatusBadge'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { generateIdCardPdf } from '@/utils/pdfGenerator'
import { BRANDING } from '@/constants/constants'

/**
 * Dashboard ID Card summary widget.
 *
 * Displays the primary (medical) coverage ID card thumbnail with member
 * name, member ID, group number, plan name, PCP info, and copay details.
 * Sensitive fields (member name, member ID, group number) are wrapped with
 * PrivacyMaskedText for Glassbox session replay masking. Provides quick
 * actions to download the ID card as PDF or navigate to the full Coverage
 * page. Links to the full ID Cards / Coverage page via a footer CTA button.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <IdCardSummary />
 *
 * @example
 * <IdCardSummary className="col-span-2" testId="dashboard-id-card" />
 */
function IdCardSummary({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagCoverageViewed, tagIdCardDownloaded, tagPageView } = useEventTagger()
  const { logIdCardDownload } = useAuditLogger()

  const cardRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  /**
   * Primary medical coverage — the first active medical coverage entry.
   */
  const primaryCoverage = useMemo(() => {
    const medical = coverages.find(
      (cov) => cov.type === 'medical' && cov.status === 'active',
    )
    return medical || null
  }, [])

  /**
   * ID card front data from the primary coverage.
   */
  const idCardFront = useMemo(() => {
    if (!primaryCoverage || !primaryCoverage.idCard) {
      return null
    }
    return primaryCoverage.idCard.front
  }, [primaryCoverage])

  /**
   * Count of all active coverages for display.
   */
  const activeCoverageCount = useMemo(
    () => coverages.filter((cov) => cov.status === 'active').length,
    [],
  )

  /**
   * Handles clicking the "View All ID Cards" footer action.
   */
  const handleViewAllCards = useCallback(() => {
    tagPageView({ page: '/coverage', source: 'id_card_summary_widget' })
    navigate('/coverage')
  }, [navigate, tagPageView])

  /**
   * Handles clicking the card thumbnail to navigate to coverage.
   */
  const handleCardClick = useCallback(() => {
    tagCoverageViewed({
      coverageType: 'medical',
      source: 'id_card_summary_widget',
    })
    navigate('/coverage')
  }, [navigate, tagCoverageViewed])

  /**
   * Handles keyboard activation on the card thumbnail.
   */
  const handleCardKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleCardClick()
      }
    },
    [handleCardClick],
  )

  /**
   * Handles downloading the ID card as a PDF.
   */
  const handleDownload = useCallback(
    async (event) => {
      event.stopPropagation()

      if (!cardRef.current || isDownloading) {
        return
      }

      setIsDownloading(true)

      try {
        await generateIdCardPdf(cardRef.current, {
          fileName: `ID_Card_Medical_${primaryCoverage?.subscriberName?.replace(/\s+/g, '_') || 'Member'}.pdf`,
          onLoadingChange: setIsDownloading,
        })

        tagIdCardDownloaded({
          coverageType: 'medical',
          source: 'id_card_summary_widget',
        })

        await logIdCardDownload({
          coverageType: 'medical',
          coverageId: primaryCoverage?.id,
          source: 'id_card_summary_widget',
        })
      } catch (_error) {
        // PDF generation failed — loading state is reset in finally of generateIdCardPdf
        setIsDownloading(false)
      }
    },
    [primaryCoverage, isDownloading, tagIdCardDownloaded, logIdCardDownload],
  )

  if (!primaryCoverage || !idCardFront) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'id-card-summary'}
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
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">ID Card</h3>
        </div>
        <div className="hb-card-body">
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
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <p className="text-sm text-neutral-500">No active coverage found</p>
            <p className="text-xs text-neutral-400 mt-1">
              Your ID card will appear here once coverage is active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`hb-card overflow-hidden ${className}`.trim()}
      data-testid={testId || 'id-card-summary'}
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
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">ID Card</h3>
            <p className="text-2xs text-neutral-500 mt-0.5">
              {activeCoverageCount} active {activeCoverageCount === 1 ? 'plan' : 'plans'}
            </p>
          </div>
        </div>

        {/* Download button */}
        <button
          type="button"
          className="hb-btn-icon hb-btn-ghost text-neutral-400 hover:text-hb-primary transition-colors duration-150"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download ID card as PDF"
          data-testid={
            testId
              ? `${testId}-download`
              : 'id-card-summary-download'
          }
        >
          {isDownloading ? (
            <span className="hb-spinner-sm" aria-hidden="true" />
          ) : (
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
        </button>
      </div>

      {/* ID Card Thumbnail */}
      <div className="hb-card-body p-0">
        <div
          ref={cardRef}
          className="mx-6 my-4 rounded-lg border border-neutral-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md group"
          onClick={handleCardClick}
          onKeyDown={handleCardKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`View ${idCardFront.planName} ID card for ${idCardFront.memberName}`}
          data-testid={
            testId
              ? `${testId}-card-thumbnail`
              : 'id-card-summary-card-thumbnail'
          }
        >
          {/* Card header bar */}
          <div className="bg-gradient-primary px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
                <img src={BRANDING.logoSmallUrl} alt={BRANDING.logoAltText} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-xs font-semibold text-white">
                {idCardFront.planName}
              </span>
            </div>
            <StatusBadge
              status={primaryCoverage.status}
              type="coverage"
              size="sm"
              testId={
                testId
                  ? `${testId}-status`
                  : 'id-card-summary-status'
              }
            />
          </div>

          {/* Card body */}
          <div className="bg-surface-primary px-4 py-3">
            {/* Member info */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                  Member
                </p>
                <PrivacyMaskedText
                  fieldType="memberName"
                  className="text-sm font-semibold text-neutral-900 block hb-text-truncate"
                >
                  {idCardFront.memberName}
                </PrivacyMaskedText>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                  Member ID
                </p>
                <PrivacyMaskedText
                  fieldType="memberId"
                  className="text-xs font-mono font-medium text-neutral-700 block"
                >
                  {idCardFront.memberId}
                </PrivacyMaskedText>
              </div>
            </div>

            {/* Group and effective date */}
            <div className="flex items-center gap-4 mt-2.5">
              <div className="min-w-0">
                <p className="text-2xs text-neutral-400">Group</p>
                <PrivacyMaskedText
                  fieldType="groupNumber"
                  className="text-2xs font-mono text-neutral-600 block"
                >
                  {idCardFront.groupNumber}
                </PrivacyMaskedText>
              </div>
              <div className="min-w-0">
                <p className="text-2xs text-neutral-400">Effective</p>
                <span className="text-2xs text-neutral-600">
                  {idCardFront.effectiveDate}
                </span>
              </div>
              {idCardFront.pcpName && (
                <div className="min-w-0 flex-1">
                  <p className="text-2xs text-neutral-400">PCP</p>
                  <PrivacyMaskedText
                    fieldType="pcpName"
                    className="text-2xs text-neutral-600 block hb-text-truncate"
                  >
                    {idCardFront.pcpName}
                  </PrivacyMaskedText>
                </div>
              )}
            </div>

            {/* Copay summary */}
            {idCardFront.copays && (
              <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-neutral-100">
                {idCardFront.copays.office && (
                  <div className="text-center flex-1">
                    <p className="text-2xs text-neutral-400">Office</p>
                    <p className="text-xs font-semibold text-neutral-700">
                      {idCardFront.copays.office}
                    </p>
                  </div>
                )}
                {idCardFront.copays.specialist && (
                  <div className="text-center flex-1">
                    <p className="text-2xs text-neutral-400">Specialist</p>
                    <p className="text-xs font-semibold text-neutral-700">
                      {idCardFront.copays.specialist}
                    </p>
                  </div>
                )}
                {idCardFront.copays.urgentCare && (
                  <div className="text-center flex-1">
                    <p className="text-2xs text-neutral-400">Urgent</p>
                    <p className="text-xs font-semibold text-neutral-700">
                      {idCardFront.copays.urgentCare}
                    </p>
                  </div>
                )}
                {idCardFront.copays.emergency && (
                  <div className="text-center flex-1">
                    <p className="text-2xs text-neutral-400">ER</p>
                    <p className="text-xs font-semibold text-neutral-700">
                      {idCardFront.copays.emergency}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hover indicator */}
          <div className="bg-surface-secondary px-4 py-1.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-2xs text-hb-primary font-medium flex items-center gap-1">
              View full card
              <svg
                className="w-3 h-3"
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
            </span>
          </div>
        </div>

        {/* Additional coverage types */}
        {activeCoverageCount > 1 && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {coverages
                .filter((cov) => cov.status === 'active' && cov.type !== 'medical')
                .slice(0, 4)
                .map((cov) => (
                  <span
                    key={cov.id}
                    className="hb-badge-sm hb-badge-neutral"
                  >
                    {cov.type === 'dental' && 'Dental'}
                    {cov.type === 'vision' && 'Vision'}
                    {cov.type === 'pharmacy' && 'Rx'}
                    {cov.type === 'behavioral_health' && 'Behavioral'}
                    {cov.type === 'life' && 'Life'}
                    {cov.type === 'disability' && 'Disability'}
                  </span>
                ))}
              {activeCoverageCount > 5 && (
                <span className="text-2xs text-neutral-400">
                  +{activeCoverageCount - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="hb-card-footer flex items-center justify-center">
        <button
          type="button"
          className="hb-btn-sm hb-btn-outline w-full justify-center"
          onClick={handleViewAllCards}
          data-testid={
            testId
              ? `${testId}-view-all`
              : 'id-card-summary-view-all'
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
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          View All ID Cards
        </button>
      </div>
    </div>
  )
}

export default IdCardSummary

export { IdCardSummary }