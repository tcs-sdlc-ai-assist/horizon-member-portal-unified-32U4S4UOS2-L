import { useState, useCallback, useRef, useMemo } from 'react'
import coverages from '@/data/coverages'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import StatusBadge from '@/components/common/StatusBadge'
import Modal from '@/components/common/Modal'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { generateIdCardPdf } from '@/utils/pdfGenerator'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { BRANDING } from '@/constants/constants'

/**
 * Coverage type display label mapping.
 */
const COVERAGE_TYPE_DISPLAY = {
  medical: 'Medical',
  dental: 'Dental',
  vision: 'Vision',
  pharmacy: 'Pharmacy',
  behavioral_health: 'Behavioral Health',
  life: 'Life Insurance',
  disability: 'Disability',
}

/**
 * Coverage type icon mapping — inline SVGs for each coverage type.
 */
const COVERAGE_TYPE_ICONS = {
  medical: (
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
  ),
  dental: (
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
  ),
  vision: (
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
  ),
  pharmacy: (
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
  ),
  behavioral_health: (
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
  ),
  life: (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

/**
 * ID card preview component with front/back flip animation, enlarge button
 * (opens modal with full-size view), and coverage selector dropdown.
 * Renders card fields from coverage dummy data with PrivacyMaskedText wrapping.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialCoverageId] - The initial coverage ID to display.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {boolean} [props.showSelector=true] - Whether to show the coverage type selector dropdown.
 * @param {boolean} [props.showActions=true] - Whether to show the download/enlarge action buttons.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <IdCardPreview />
 *
 * @example
 * <IdCardPreview initialCoverageId="cov_med_001" showSelector />
 *
 * @example
 * <IdCardPreview showActions={false} className="max-w-md" testId="coverage-id-card" />
 */
function IdCardPreview({
  initialCoverageId,
  className = '',
  showSelector = true,
  showActions = true,
  testId,
}) {
  const { tagCoverageViewed, tagIdCardDownloaded } = useEventTagger()
  const { logIdCardDownload } = useAuditLogger()

  /**
   * Coverages that have ID card data.
   */
  const coveragesWithCards = useMemo(
    () => coverages.filter((cov) => cov.idCard && cov.idCard.front),
    [],
  )

  /**
   * Resolves the initial coverage to display.
   */
  const defaultCoverageId = useMemo(() => {
    if (initialCoverageId) {
      const found = coveragesWithCards.find((cov) => cov.id === initialCoverageId)
      if (found) {
        return found.id
      }
    }
    // Default to first active medical coverage, or first available
    const activeMedical = coveragesWithCards.find(
      (cov) => cov.type === 'medical' && cov.status === 'active',
    )
    return activeMedical ? activeMedical.id : coveragesWithCards[0]?.id || ''
  }, [initialCoverageId, coveragesWithCards])

  const [selectedCoverageId, setSelectedCoverageId] = useState(defaultCoverageId)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isEnlargeOpen, setIsEnlargeOpen] = useState(false)
  const [isEnlargeFlipped, setIsEnlargeFlipped] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const cardFrontRef = useRef(null)
  const cardBackRef = useRef(null)
  const enlargeFrontRef = useRef(null)
  const enlargeBackRef = useRef(null)

  const [ids] = useState(() => ({
    selector: generateAriaId('hb-idcard-selector'),
    card: generateAriaId('hb-idcard'),
  }))

  /**
   * The currently selected coverage object.
   */
  const selectedCoverage = useMemo(
    () => coveragesWithCards.find((cov) => cov.id === selectedCoverageId) || null,
    [selectedCoverageId, coveragesWithCards],
  )

  /**
   * Front card data from the selected coverage.
   */
  const cardFront = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.idCard) {
      return null
    }
    return selectedCoverage.idCard.front
  }, [selectedCoverage])

  /**
   * Back card data from the selected coverage.
   */
  const cardBack = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.idCard) {
      return null
    }
    return selectedCoverage.idCard.back
  }, [selectedCoverage])

  /**
   * Handles coverage selector change.
   */
  const handleCoverageChange = useCallback(
    (event) => {
      const newId = event.target.value
      setSelectedCoverageId(newId)
      setIsFlipped(false)

      const cov = coveragesWithCards.find((c) => c.id === newId)
      if (cov) {
        tagCoverageViewed({
          coverageType: cov.type,
          coverageId: cov.id,
          source: 'id_card_preview',
        })
        announceToScreenReader(
          `Showing ${COVERAGE_TYPE_DISPLAY[cov.type] || cov.type} ID card`,
          { priority: 'polite' },
        )
      }
    },
    [coveragesWithCards, tagCoverageViewed],
  )

  /**
   * Toggles the card flip state.
   */
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev
      announceToScreenReader(
        next ? 'Showing back of ID card' : 'Showing front of ID card',
        { priority: 'polite' },
      )
      return next
    })
  }, [])

  /**
   * Handles keyboard activation on the card for flipping.
   */
  const handleCardKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleFlip()
      }
    },
    [handleFlip],
  )

  /**
   * Opens the enlarge modal.
   */
  const handleEnlarge = useCallback(() => {
    setIsEnlargeFlipped(isFlipped)
    setIsEnlargeOpen(true)
    announceToScreenReader('ID card enlarged view opened', { priority: 'polite' })
  }, [isFlipped])

  /**
   * Closes the enlarge modal.
   */
  const handleEnlargeClose = useCallback(() => {
    setIsEnlargeOpen(false)
  }, [])

  /**
   * Toggles the flip state in the enlarge modal.
   */
  const handleEnlargeFlip = useCallback(() => {
    setIsEnlargeFlipped((prev) => {
      const next = !prev
      announceToScreenReader(
        next ? 'Showing back of ID card' : 'Showing front of ID card',
        { priority: 'polite' },
      )
      return next
    })
  }, [])

  /**
   * Handles downloading the ID card as a PDF.
   */
  const handleDownload = useCallback(
    async (event) => {
      if (event) {
        event.stopPropagation()
      }

      if (!cardFrontRef.current || isDownloading) {
        return
      }

      setIsDownloading(true)

      try {
        await generateIdCardPdf(cardFrontRef.current, {
          fileName: `ID_Card_${selectedCoverage?.type || 'Card'}_${selectedCoverage?.subscriberName?.replace(/\s+/g, '_') || 'Member'}.pdf`,
          onLoadingChange: setIsDownloading,
        })

        tagIdCardDownloaded({
          coverageType: selectedCoverage?.type,
          coverageId: selectedCoverage?.id,
          source: 'id_card_preview',
        })

        await logIdCardDownload({
          coverageType: selectedCoverage?.type,
          coverageId: selectedCoverage?.id,
          source: 'id_card_preview',
        })

        announceToScreenReader('ID card PDF downloaded', { priority: 'polite' })
      } catch (_error) {
        setIsDownloading(false)
      }
    },
    [selectedCoverage, isDownloading, tagIdCardDownloaded, logIdCardDownload],
  )

  /**
   * Renders the front of the ID card.
   */
  const renderCardFront = (ref, sizeClass = '') => {
    if (!cardFront || !selectedCoverage) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`bg-surface-primary rounded-lg border border-neutral-200 overflow-hidden ${sizeClass}`.trim()}
        data-testid={testId ? `${testId}-card-front` : 'id-card-preview-card-front'}
      >
        {/* Card header bar */}
        <div className="bg-gradient-primary px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
              <img src={BRANDING.logoSmallUrl} alt={BRANDING.logoAltText} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs font-semibold text-white">
              {cardFront.planName}
            </span>
          </div>
          <StatusBadge
            status={selectedCoverage.status}
            type="coverage"
            size="sm"
            testId={testId ? `${testId}-status` : 'id-card-preview-status'}
          />
        </div>

        {/* Card body */}
        <div className="px-4 py-3">
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
                {cardFront.memberName}
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
                {cardFront.memberId}
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
                {cardFront.groupNumber}
              </PrivacyMaskedText>
            </div>
            {cardFront.groupName && (
              <div className="min-w-0">
                <p className="text-2xs text-neutral-400">Group Name</p>
                <span className="text-2xs text-neutral-600 hb-text-truncate block">
                  {cardFront.groupName}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-2xs text-neutral-400">Effective</p>
              <span className="text-2xs text-neutral-600">
                {cardFront.effectiveDate}
              </span>
            </div>
          </div>

          {/* PCP info (medical only) */}
          {cardFront.pcpName && (
            <div className="flex items-center gap-4 mt-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-2xs text-neutral-400">PCP</p>
                <PrivacyMaskedText
                  fieldType="pcpName"
                  className="text-2xs text-neutral-600 block hb-text-truncate"
                >
                  {cardFront.pcpName}
                </PrivacyMaskedText>
              </div>
              {cardFront.pcpPhone && (
                <div className="min-w-0">
                  <p className="text-2xs text-neutral-400">PCP Phone</p>
                  <PrivacyMaskedText
                    fieldType="phone"
                    className="text-2xs text-neutral-600 block"
                  >
                    {cardFront.pcpPhone}
                  </PrivacyMaskedText>
                </div>
              )}
            </div>
          )}

          {/* Rx info */}
          {cardFront.rxBin && (
            <div className="flex items-center gap-4 mt-2.5">
              <div className="min-w-0">
                <p className="text-2xs text-neutral-400">Rx BIN</p>
                <span className="text-2xs font-mono text-neutral-600">
                  {cardFront.rxBin}
                </span>
              </div>
              {cardFront.rxPcn && (
                <div className="min-w-0">
                  <p className="text-2xs text-neutral-400">Rx PCN</p>
                  <span className="text-2xs font-mono text-neutral-600">
                    {cardFront.rxPcn}
                  </span>
                </div>
              )}
              {cardFront.rxGroup && (
                <div className="min-w-0">
                  <p className="text-2xs text-neutral-400">Rx Group</p>
                  <span className="text-2xs font-mono text-neutral-600">
                    {cardFront.rxGroup}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Copay summary */}
          {cardFront.copays && (
            <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-neutral-100">
              {Object.entries(cardFront.copays).map(([key, value]) => (
                <div key={key} className="text-center flex-1">
                  <p className="text-2xs text-neutral-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs font-semibold text-neutral-700">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  /**
   * Renders the back of the ID card.
   */
  const renderCardBack = (ref, sizeClass = '') => {
    if (!cardBack || !selectedCoverage) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`bg-surface-primary rounded-lg border border-neutral-200 overflow-hidden ${sizeClass}`.trim()}
        data-testid={testId ? `${testId}-card-back` : 'id-card-preview-card-back'}
      >
        {/* Card header bar */}
        <div className="bg-gradient-primary px-4 py-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5">
            <img src={BRANDING.logoSmallUrl} alt={BRANDING.logoAltText} className="max-w-full max-h-full object-contain" />
          </div>
          <span className="text-xs font-semibold text-white">
            {cardFront?.planName || selectedCoverage.planName} — Back
          </span>
        </div>

        {/* Card body */}
        <div className="px-4 py-3 text-2xs text-neutral-600 space-y-2.5">
          {/* Claims address */}
          {cardBack.claimsAddress && (
            <div>
              <p className="font-semibold text-neutral-700 mb-0.5">Claims Address</p>
              <p className="whitespace-pre-line leading-relaxed">{cardBack.claimsAddress}</p>
            </div>
          )}

          {/* Phone numbers */}
          <div className="grid grid-cols-2 gap-2">
            {cardBack.claimsPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Claims</p>
                <p>{cardBack.claimsPhone}</p>
              </div>
            )}
            {cardBack.memberServicesPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Member Services</p>
                <p>{cardBack.memberServicesPhone}</p>
              </div>
            )}
            {cardBack.preAuthPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Prior Auth</p>
                <p>{cardBack.preAuthPhone}</p>
              </div>
            )}
            {cardBack.nurseLinePhone && (
              <div>
                <p className="font-semibold text-neutral-700">24/7 Nurse Line</p>
                <p>{cardBack.nurseLinePhone}</p>
              </div>
            )}
            {cardBack.mentalHealthPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Behavioral Health</p>
                <p>{cardBack.mentalHealthPhone}</p>
              </div>
            )}
            {cardBack.pharmacyHelpPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Pharmacy Help</p>
                <p>{cardBack.pharmacyHelpPhone}</p>
              </div>
            )}
            {cardBack.mailOrderPhone && (
              <div>
                <p className="font-semibold text-neutral-700">Mail Order</p>
                <p>{cardBack.mailOrderPhone}</p>
              </div>
            )}
            {cardBack.crisisLinePhone && (
              <div>
                <p className="font-semibold text-neutral-700">Crisis Line</p>
                <p>{cardBack.crisisLinePhone}</p>
              </div>
            )}
          </div>

          {/* Website */}
          {cardBack.websiteUrl && (
            <div>
              <p className="font-semibold text-neutral-700">Website</p>
              <p className="text-hb-primary">{cardBack.websiteUrl}</p>
            </div>
          )}

          {/* Emergency instructions */}
          {cardBack.emergencyInstructions && (
            <div className="pt-2 border-t border-neutral-100">
              <p className="font-semibold text-neutral-700 mb-0.5">Emergency</p>
              <p className="leading-relaxed text-neutral-500">
                {cardBack.emergencyInstructions}
              </p>
            </div>
          )}

          {/* Mail order info */}
          {cardBack.mailOrderInfo && (
            <div className="pt-2 border-t border-neutral-100">
              <p className="font-semibold text-neutral-700 mb-0.5">Mail Order</p>
              <p className="leading-relaxed text-neutral-500">
                {cardBack.mailOrderInfo}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // No coverages with ID cards available
  if (coveragesWithCards.length === 0) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'id-card-preview'}
      >
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
            <p className="text-sm text-neutral-500">No ID cards available</p>
            <p className="text-xs text-neutral-400 mt-1">
              ID cards will appear here once coverage is active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // No selected coverage or no card data
  if (!selectedCoverage || !cardFront) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'id-card-preview'}
      >
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
            <p className="text-sm text-neutral-500">No ID card data available</p>
            <p className="text-xs text-neutral-400 mt-1">
              Select a coverage type to view the ID card.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`flex flex-col gap-4 ${className}`.trim()}
        data-testid={testId || 'id-card-preview'}
      >
        {/* Coverage selector and actions row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Coverage type selector */}
          {showSelector && coveragesWithCards.length > 1 && (
            <div className="hb-form-group min-w-[12rem]">
              <label htmlFor={ids.selector} className="hb-label">
                Coverage Type
              </label>
              <select
                id={ids.selector}
                className="hb-select text-sm py-2 px-3"
                value={selectedCoverageId}
                onChange={handleCoverageChange}
                aria-label="Select coverage type to view ID card"
                data-testid={
                  testId
                    ? `${testId}-selector`
                    : 'id-card-preview-selector'
                }
              >
                {coveragesWithCards.map((cov) => (
                  <option key={cov.id} value={cov.id}>
                    {COVERAGE_TYPE_DISPLAY[cov.type] || cov.type} — {cov.planName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Single coverage display (when only one) */}
          {showSelector && coveragesWithCards.length === 1 && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">
                {COVERAGE_TYPE_ICONS[selectedCoverage.type] || COVERAGE_TYPE_ICONS.medical}
              </span>
              <span className="text-sm font-medium text-neutral-800">
                {COVERAGE_TYPE_DISPLAY[selectedCoverage.type] || selectedCoverage.type}
              </span>
              <span className="text-xs text-neutral-400">—</span>
              <span className="text-sm text-neutral-600">{selectedCoverage.planName}</span>
            </div>
          )}

          {/* Action buttons */}
          {showActions && (
            <div className="flex items-center gap-2">
              {/* Flip button */}
              <button
                type="button"
                className="hb-btn-sm hb-btn-outline-secondary"
                onClick={handleFlip}
                aria-label={isFlipped ? 'Show front of ID card' : 'Show back of ID card'}
                data-testid={
                  testId
                    ? `${testId}-flip-btn`
                    : 'id-card-preview-flip-btn'
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
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {isFlipped ? 'Show Front' : 'Show Back'}
              </button>

              {/* Enlarge button */}
              <button
                type="button"
                className="hb-btn-sm hb-btn-outline-secondary"
                onClick={handleEnlarge}
                aria-label="Enlarge ID card"
                data-testid={
                  testId
                    ? `${testId}-enlarge-btn`
                    : 'id-card-preview-enlarge-btn'
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
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
                Enlarge
              </button>

              {/* Download button */}
              <button
                type="button"
                className="hb-btn-sm hb-btn-primary"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label="Download ID card as PDF"
                data-testid={
                  testId
                    ? `${testId}-download-btn`
                    : 'id-card-preview-download-btn'
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
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Card preview with flip animation */}
        <div
          className="relative cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={handleFlip}
          onKeyDown={handleCardKeyDown}
          role="button"
          tabIndex={0}
          aria-label={`${selectedCoverage.planName} ID card. ${isFlipped ? 'Showing back.' : 'Showing front.'} Press Enter or Space to flip.`}
          data-testid={
            testId
              ? `${testId}-card-container`
              : 'id-card-preview-card-container'
          }
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front face */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {renderCardFront(cardFrontRef)}
            </div>

            {/* Back face */}
            {cardBack && (
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {renderCardBack(cardBackRef)}
              </div>
            )}
          </div>

          {/* Flip hint overlay */}
          <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-2xs rounded-md">
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
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Click to flip
            </span>
          </div>
        </div>

        {/* Card side indicator */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              !isFlipped ? 'bg-hb-primary' : 'bg-neutral-300'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              if (isFlipped) {
                handleFlip()
              }
            }}
            aria-label="Show front of card"
            data-testid={
              testId
                ? `${testId}-dot-front`
                : 'id-card-preview-dot-front'
            }
          />
          <button
            type="button"
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              isFlipped ? 'bg-hb-primary' : 'bg-neutral-300'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              if (!isFlipped) {
                handleFlip()
              }
            }}
            aria-label="Show back of card"
            data-testid={
              testId
                ? `${testId}-dot-back`
                : 'id-card-preview-dot-back'
            }
          />
          <span className="text-2xs text-neutral-400 ml-1">
            {isFlipped ? 'Back' : 'Front'}
          </span>
        </div>

        {/* Screen reader live region */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          {isFlipped
            ? `Showing back of ${selectedCoverage.planName} ID card`
            : `Showing front of ${selectedCoverage.planName} ID card`}
        </div>
      </div>

      {/* Enlarge Modal */}
      <Modal
        isOpen={isEnlargeOpen}
        onClose={handleEnlargeClose}
        title={`${selectedCoverage?.planName || 'ID Card'} — ${isEnlargeFlipped ? 'Back' : 'Front'}`}
        size="lg"
        closeOnOverlayClick
        closeOnEscape
        description={`Full-size view of your ${COVERAGE_TYPE_DISPLAY[selectedCoverage?.type] || ''} ID card`}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              className="hb-btn-md hb-btn-outline-secondary"
              onClick={handleEnlargeFlip}
              aria-label={isEnlargeFlipped ? 'Show front of ID card' : 'Show back of ID card'}
              data-testid={
                testId
                  ? `${testId}-enlarge-flip-btn`
                  : 'id-card-preview-enlarge-flip-btn'
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
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {isEnlargeFlipped ? 'Show Front' : 'Show Back'}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hb-btn-md hb-btn-primary"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label="Download ID card as PDF"
                data-testid={
                  testId
                    ? `${testId}-enlarge-download-btn`
                    : 'id-card-preview-enlarge-download-btn'
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
                Download PDF
              </button>
              <button
                type="button"
                className="hb-btn-md hb-btn-outline-secondary"
                onClick={handleEnlargeClose}
                data-testid={
                  testId
                    ? `${testId}-enlarge-close-btn`
                    : 'id-card-preview-enlarge-close-btn'
                }
              >
                Close
              </button>
            </div>
          </div>
        }
        testId={testId ? `${testId}-enlarge-modal` : 'id-card-preview-enlarge-modal'}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Enlarged card view */}
          <div
            className="w-full transition-transform duration-500"
            style={{
              perspective: '1000px',
            }}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isEnlargeFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front face (enlarged) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {renderCardFront(enlargeFrontRef)}
              </div>

              {/* Back face (enlarged) */}
              {cardBack && (
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {renderCardBack(enlargeBackRef)}
                </div>
              )}
            </div>
          </div>

          {/* Enlarged card side indicator */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                !isEnlargeFlipped ? 'bg-hb-primary' : 'bg-neutral-300'
              }`}
              onClick={() => {
                if (isEnlargeFlipped) {
                  handleEnlargeFlip()
                }
              }}
              aria-label="Show front of card"
            />
            <button
              type="button"
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                isEnlargeFlipped ? 'bg-hb-primary' : 'bg-neutral-300'
              }`}
              onClick={() => {
                if (!isEnlargeFlipped) {
                  handleEnlargeFlip()
                }
              }}
              aria-label="Show back of card"
            />
            <span className="text-xs text-neutral-400 ml-1">
              {isEnlargeFlipped ? 'Back' : 'Front'}
            </span>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default IdCardPreview

export { IdCardPreview }