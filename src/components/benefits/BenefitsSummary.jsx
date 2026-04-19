import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import benefits from '@/data/benefits'
import coverages from '@/data/coverages'
import ProgressBar from '@/components/common/ProgressBar'
import StatusBadge from '@/components/common/StatusBadge'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import {
  COVERAGE_TYPE_LABELS,
} from '@/constants/constants'

/**
 * Coverage type icon mapping — inline SVGs for each coverage type.
 */
const COVERAGE_TYPE_ICONS = {
  medical: (
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
  dental: (
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
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  vision: (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  pharmacy: (
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  behavioral_health: (
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
  life: (
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
}

/**
 * Returns the icon element for a given coverage type.
 * @param {string} type - The coverage type key.
 * @returns {React.ReactNode} The icon element.
 */
const getCoverageIcon = (type) => COVERAGE_TYPE_ICONS[type] || COVERAGE_TYPE_ICONS.medical

/**
 * Benefits summary component.
 *
 * Displays plan status/type, deductible progress bars (individual/family),
 * out-of-pocket maximum progress bars, coinsurance info, and plan year dates
 * using the ProgressBar component. Includes a coverage selector dropdown when
 * multiple coverages are available. Financial amounts are wrapped with
 * PrivacyMaskedText for Glassbox session replay masking.
 *
 * @param {object} props - Component props.
 * @param {string} [props.initialCoverageId] - The initial coverage ID to display.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {boolean} [props.showSelector=true] - Whether to show the coverage type selector dropdown.
 * @param {boolean} [props.showPlanDetails=true] - Whether to show plan detail fields (group, member ID, etc.).
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <BenefitsSummary />
 *
 * @example
 * <BenefitsSummary initialCoverageId="cov_med_001" showSelector />
 *
 * @example
 * <BenefitsSummary showPlanDetails={false} className="mt-4" testId="benefits-page-summary" />
 */
function BenefitsSummary({
  initialCoverageId,
  className = '',
  showSelector = true,
  showPlanDetails = true,
  testId,
}) {
  const navigate = useNavigate()
  const { tagBenefitViewed, tagCoverageViewed, tagPageView } = useEventTagger()

  /**
   * Active coverages available for selection.
   */
  const activeCoverages = useMemo(
    () => coverages.filter((cov) => cov.status === 'active'),
    [],
  )

  /**
   * Resolves the initial coverage to display.
   */
  const defaultCoverageId = useMemo(() => {
    if (initialCoverageId) {
      const found = activeCoverages.find((cov) => cov.id === initialCoverageId)
      if (found) {
        return found.id
      }
    }
    // Default to first active medical coverage, or first available
    const activeMedical = activeCoverages.find((cov) => cov.type === 'medical')
    return activeMedical ? activeMedical.id : activeCoverages[0]?.id || ''
  }, [initialCoverageId, activeCoverages])

  const [selectedCoverageId, setSelectedCoverageId] = useState(defaultCoverageId)

  const [ids] = useState(() => ({
    selector: generateAriaId('hb-benefits-selector'),
  }))

  /**
   * The currently selected coverage object.
   */
  const selectedCoverage = useMemo(
    () => activeCoverages.find((cov) => cov.id === selectedCoverageId) || null,
    [selectedCoverageId, activeCoverages],
  )

  /**
   * Benefit summary data from the benefits data source.
   */
  const benefitSummary = useMemo(() => benefits.benefitSummary, [])

  /**
   * Deductible data for the selected coverage.
   */
  const deductible = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.benefits || !selectedCoverage.benefits.deductible) {
      return null
    }

    const ded = selectedCoverage.benefits.deductible

    return {
      individual: ded.individual !== undefined
        ? {
            limit: ded.individual,
            used: ded.individualUsed || 0,
            remaining: ded.individual - (ded.individualUsed || 0),
          }
        : null,
      family: ded.family !== undefined
        ? {
            limit: ded.family,
            used: ded.familyUsed || 0,
            remaining: ded.family - (ded.familyUsed || 0),
          }
        : null,
    }
  }, [selectedCoverage])

  /**
   * Out-of-pocket maximum data for the selected coverage.
   */
  const outOfPocketMax = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.benefits || !selectedCoverage.benefits.outOfPocketMax) {
      return null
    }

    const oop = selectedCoverage.benefits.outOfPocketMax

    return {
      individual: oop.individual !== undefined
        ? {
            limit: oop.individual,
            used: oop.individualUsed || 0,
            remaining: oop.individual - (oop.individualUsed || 0),
          }
        : null,
      family: oop.family !== undefined
        ? {
            limit: oop.family,
            used: oop.familyUsed || 0,
            remaining: oop.family - (oop.familyUsed || 0),
          }
        : null,
    }
  }, [selectedCoverage])

  /**
   * Coinsurance info for the selected coverage.
   */
  const coinsurance = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.benefits || !selectedCoverage.benefits.coinsurance) {
      return null
    }
    return selectedCoverage.benefits.coinsurance
  }, [selectedCoverage])

  /**
   * Annual maximum data (for dental coverage).
   */
  const annualMaximum = useMemo(() => {
    if (!selectedCoverage || !selectedCoverage.benefits || !selectedCoverage.benefits.annualMaximum) {
      return null
    }

    const am = selectedCoverage.benefits.annualMaximum

    return {
      individual: am.individual !== undefined
        ? {
            limit: am.individual,
            used: am.individualUsed || 0,
            remaining: am.individual - (am.individualUsed || 0),
          }
        : null,
    }
  }, [selectedCoverage])

  /**
   * Plan year display string.
   */
  const planYearDisplay = useMemo(() => {
    if (!benefitSummary || !benefitSummary.planYear) {
      return null
    }

    try {
      const start = new Date(benefitSummary.planYear.start)
      const end = new Date(benefitSummary.planYear.end)

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

      return `${startStr} – ${endStr}`
    } catch (_error) {
      return null
    }
  }, [benefitSummary])

  /**
   * Handles coverage selector change.
   */
  const handleCoverageChange = useCallback(
    (event) => {
      const newId = event.target.value
      setSelectedCoverageId(newId)

      const cov = activeCoverages.find((c) => c.id === newId)
      if (cov) {
        tagCoverageViewed({
          coverageType: cov.type,
          coverageId: cov.id,
          source: 'benefits_summary',
        })
        announceToScreenReader(
          `Showing ${COVERAGE_TYPE_LABELS[cov.type] || cov.type} benefits summary`,
          { priority: 'polite' },
        )
      }
    },
    [activeCoverages, tagCoverageViewed],
  )

  /**
   * Handles the "View Full Benefits" footer action.
   */
  const handleViewFullBenefits = useCallback(() => {
    tagPageView({ page: '/benefits', source: 'benefits_summary' })
    navigate('/benefits')
  }, [navigate, tagPageView])

  /**
   * Handles the "View Spending Details" action.
   */
  const handleViewSpending = useCallback(() => {
    tagPageView({ page: '/spending', source: 'benefits_summary' })
    navigate('/spending')
  }, [navigate, tagPageView])

  // No active coverages available
  if (activeCoverages.length === 0) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'benefits-summary'}
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Benefits Summary</h3>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm text-neutral-500">No active coverage found</p>
            <p className="text-xs text-neutral-400 mt-1">
              Your benefits summary will appear here once coverage is active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // No selected coverage
  if (!selectedCoverage) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'benefits-summary'}
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Benefits Summary</h3>
        </div>
        <div className="hb-card-body">
          <div className="hb-empty-state py-8">
            <p className="text-sm text-neutral-500">Select a coverage type to view benefits.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'benefits-summary'}
    >
      {/* Coverage selector and plan info card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-plan-card` : 'benefits-summary-plan-card'}
      >
        {/* Header */}
        <div className="hb-card-header flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
              {getCoverageIcon(selectedCoverage.type)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Benefits Summary</h3>
              {planYearDisplay && (
                <p className="text-2xs text-neutral-500 mt-0.5">
                  Plan Year: {planYearDisplay}
                </p>
              )}
            </div>
          </div>

          <StatusBadge
            status={selectedCoverage.status}
            type="coverage"
            size="md"
            showDot
            testId={testId ? `${testId}-status` : 'benefits-summary-status'}
          />
        </div>

        {/* Body */}
        <div className="hb-card-body">
          <div className="flex flex-col gap-5">
            {/* Coverage selector */}
            {showSelector && activeCoverages.length > 1 && (
              <div className="hb-form-group">
                <label htmlFor={ids.selector} className="hb-label">
                  Coverage Type
                </label>
                <select
                  id={ids.selector}
                  className="hb-select text-sm py-2 px-3"
                  value={selectedCoverageId}
                  onChange={handleCoverageChange}
                  aria-label="Select coverage type to view benefits"
                  data-testid={
                    testId
                      ? `${testId}-selector`
                      : 'benefits-summary-selector'
                  }
                >
                  {activeCoverages.map((cov) => (
                    <option key={cov.id} value={cov.id}>
                      {COVERAGE_TYPE_LABELS[cov.type] || cov.type} — {cov.planName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Single coverage display (when only one) */}
            {showSelector && activeCoverages.length === 1 && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">
                  {getCoverageIcon(selectedCoverage.type)}
                </span>
                <span className="text-sm font-medium text-neutral-800">
                  {COVERAGE_TYPE_LABELS[selectedCoverage.type] || selectedCoverage.type}
                </span>
                <span className="text-xs text-neutral-400">—</span>
                <span className="text-sm text-neutral-600">{selectedCoverage.planName}</span>
              </div>
            )}

            {/* Plan details */}
            {showPlanDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Plan Name
                  </p>
                  <p className="text-sm font-medium text-neutral-800">
                    {selectedCoverage.planName}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Plan Type
                  </p>
                  <span className="hb-badge-sm hb-badge-primary">
                    {selectedCoverage.planType}
                  </span>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Coverage Tier
                  </p>
                  <p className="text-sm text-neutral-700 capitalize">
                    {selectedCoverage.coverageTier?.replace(/_/g, ' ') || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Member ID
                  </p>
                  <PrivacyMaskedText
                    fieldType="memberId"
                    className="text-sm font-mono text-neutral-700 block"
                  >
                    {selectedCoverage.memberId}
                  </PrivacyMaskedText>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Group Number
                  </p>
                  <PrivacyMaskedText
                    fieldType="groupNumber"
                    className="text-sm font-mono text-neutral-700 block"
                  >
                    {selectedCoverage.groupNumber}
                  </PrivacyMaskedText>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Effective Date
                  </p>
                  <p className="text-sm text-neutral-700">
                    {formatDate(selectedCoverage.effectiveDate, { preset: 'short' })}
                  </p>
                </div>
              </div>
            )}

            {/* Coinsurance badge */}
            {coinsurance && typeof coinsurance === 'string' && (
              <div className="flex items-center gap-2">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs text-neutral-500">
                  In-Network Coinsurance:{' '}
                  <span className="font-medium text-neutral-700">{coinsurance}</span>
                </p>
              </div>
            )}

            {/* Network info */}
            {selectedCoverage.network && (
              <div className="flex items-center gap-2">
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
                <p className="text-xs text-neutral-500">
                  Network:{' '}
                  <span className="font-medium text-neutral-700">{selectedCoverage.network}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deductible progress card */}
      {deductible && (deductible.individual || deductible.family) && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-deductible-card` : 'benefits-summary-deductible-card'}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Deductible</h3>
          </div>

          <div className="hb-card-body">
            <div className="flex flex-col gap-4">
              {/* Individual Deductible */}
              {deductible.individual && deductible.individual.limit > 0 && (
                <div
                  data-testid={
                    testId
                      ? `${testId}-deductible-individual`
                      : 'benefits-summary-deductible-individual'
                  }
                >
                  <ProgressBar
                    current={deductible.individual.used}
                    max={deductible.individual.limit}
                    label="Individual"
                    format="currency"
                    variant="primary"
                    size="md"
                    showValues
                    showRemaining
                    currentLabel="Used"
                    remainingLabel="Remaining"
                    animate
                    testId={
                      testId
                        ? `${testId}-deductible-individual-progress`
                        : 'benefits-summary-deductible-individual-progress'
                    }
                  />
                </div>
              )}

              {/* Family Deductible */}
              {deductible.family && deductible.family.limit > 0 && (
                <div
                  data-testid={
                    testId
                      ? `${testId}-deductible-family`
                      : 'benefits-summary-deductible-family'
                  }
                >
                  <ProgressBar
                    current={deductible.family.used}
                    max={deductible.family.limit}
                    label="Family"
                    format="currency"
                    variant="primary"
                    size="md"
                    showValues
                    showRemaining
                    currentLabel="Used"
                    remainingLabel="Remaining"
                    animate
                    testId={
                      testId
                        ? `${testId}-deductible-family-progress`
                        : 'benefits-summary-deductible-family-progress'
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Out-of-Pocket Maximum progress card */}
      {outOfPocketMax && (outOfPocketMax.individual || outOfPocketMax.family) && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-oop-card` : 'benefits-summary-oop-card'}
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Out-of-Pocket Maximum</h3>
          </div>

          <div className="hb-card-body">
            <div className="flex flex-col gap-4">
              {/* Individual OOP */}
              {outOfPocketMax.individual && outOfPocketMax.individual.limit > 0 && (
                <div
                  data-testid={
                    testId
                      ? `${testId}-oop-individual`
                      : 'benefits-summary-oop-individual'
                  }
                >
                  <ProgressBar
                    current={outOfPocketMax.individual.used}
                    max={outOfPocketMax.individual.limit}
                    label="Individual"
                    format="currency"
                    variant="accent"
                    size="md"
                    showValues
                    showRemaining
                    currentLabel="Used"
                    remainingLabel="Remaining"
                    animate
                    testId={
                      testId
                        ? `${testId}-oop-individual-progress`
                        : 'benefits-summary-oop-individual-progress'
                    }
                  />
                </div>
              )}

              {/* Family OOP */}
              {outOfPocketMax.family && outOfPocketMax.family.limit > 0 && (
                <div
                  data-testid={
                    testId
                      ? `${testId}-oop-family`
                      : 'benefits-summary-oop-family'
                  }
                >
                  <ProgressBar
                    current={outOfPocketMax.family.used}
                    max={outOfPocketMax.family.limit}
                    label="Family"
                    format="currency"
                    variant="accent"
                    size="md"
                    showValues
                    showRemaining
                    currentLabel="Used"
                    remainingLabel="Remaining"
                    animate
                    testId={
                      testId
                        ? `${testId}-oop-family-progress`
                        : 'benefits-summary-oop-family-progress'
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Annual Maximum card (dental) */}
      {annualMaximum && annualMaximum.individual && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-annual-max-card` : 'benefits-summary-annual-max-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-secondary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-secondary-dark"
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
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Annual Maximum</h3>
          </div>

          <div className="hb-card-body">
            <ProgressBar
              current={annualMaximum.individual.used}
              max={annualMaximum.individual.limit}
              label="Individual"
              format="currency"
              variant="warning"
              size="md"
              showValues
              showRemaining
              currentLabel="Used"
              remainingLabel="Remaining"
              animate
              testId={
                testId
                  ? `${testId}-annual-max-progress`
                  : 'benefits-summary-annual-max-progress'
              }
            />
          </div>
        </div>
      )}

      {/* Summary stats card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-stats-card` : 'benefits-summary-stats-card'}
      >
        <div className="hb-card-body">
          <div className="bg-surface-secondary rounded-lg px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {deductible && deductible.individual && deductible.individual.limit > 0 && (
                <div className="text-center">
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Deductible Met
                  </p>
                  <PrivacyMaskedText
                    fieldType="financialAmount"
                    className="text-sm font-semibold text-neutral-800 block"
                  >
                    {formatCurrency(deductible.individual.used)}
                  </PrivacyMaskedText>
                  <p className="text-2xs text-neutral-400 mt-0.5">
                    of {formatCurrency(deductible.individual.limit)}
                  </p>
                </div>
              )}
              {outOfPocketMax && outOfPocketMax.individual && outOfPocketMax.individual.limit > 0 && (
                <div className="text-center">
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    OOP Spent
                  </p>
                  <PrivacyMaskedText
                    fieldType="financialAmount"
                    className="text-sm font-semibold text-neutral-800 block"
                  >
                    {formatCurrency(outOfPocketMax.individual.used)}
                  </PrivacyMaskedText>
                  <p className="text-2xs text-neutral-400 mt-0.5">
                    of {formatCurrency(outOfPocketMax.individual.limit)}
                  </p>
                </div>
              )}
              {coinsurance && typeof coinsurance === 'string' && (
                <div className="text-center">
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Coinsurance
                  </p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {coinsurance}
                  </p>
                  <p className="text-2xs text-neutral-400 mt-0.5">In-Network</p>
                </div>
              )}
              {selectedCoverage.dependents && selectedCoverage.dependents.length > 0 && (
                <div className="text-center">
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-0.5">
                    Dependents
                  </p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {selectedCoverage.dependents.length}
                  </p>
                  <p className="text-2xs text-neutral-400 mt-0.5">Covered</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="hb-card-footer">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <button
              type="button"
              className="hb-btn-sm hb-btn-outline w-full sm:w-auto justify-center"
              onClick={handleViewFullBenefits}
              data-testid={
                testId
                  ? `${testId}-view-benefits`
                  : 'benefits-summary-view-benefits'
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              View Full Benefits
            </button>
            <button
              type="button"
              className="hb-btn-sm hb-btn-outline-secondary w-full sm:w-auto justify-center"
              onClick={handleViewSpending}
              data-testid={
                testId
                  ? `${testId}-view-spending`
                  : 'benefits-summary-view-spending'
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
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              View Spending Details
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Showing {COVERAGE_TYPE_LABELS[selectedCoverage.type] || selectedCoverage.type} benefits
        summary for {selectedCoverage.planName}
      </div>
    </div>
  )
}

export default BenefitsSummary

export { BenefitsSummary }