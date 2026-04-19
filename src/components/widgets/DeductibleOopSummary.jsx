import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import benefits from '@/data/benefits'
import ProgressBar from '@/components/common/ProgressBar'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { formatCurrency } from '@/utils/formatters'

/**
 * Dashboard Deductible and Out-of-Pocket summary widget.
 *
 * Displays progress bars for individual and family deductible and
 * out-of-pocket maximum usage using the ProgressBar component. Financial
 * amounts are wrapped with PrivacyMaskedText for Glassbox session replay
 * masking. Shows plan year dates and links to the full Spending page via
 * a footer CTA button.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <DeductibleOopSummary />
 *
 * @example
 * <DeductibleOopSummary className="col-span-2" testId="dashboard-deductible-oop" />
 */
function DeductibleOopSummary({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagPageView } = useEventTagger()

  /**
   * Benefit summary data from the benefits data source.
   */
  const summary = useMemo(() => benefits.benefitSummary, [])

  /**
   * Deductible data for individual and family.
   */
  const deductible = useMemo(() => {
    if (!summary || !summary.deductible) {
      return null
    }
    return summary.deductible
  }, [summary])

  /**
   * Out-of-pocket maximum data for individual and family.
   */
  const outOfPocketMax = useMemo(() => {
    if (!summary || !summary.outOfPocketMax) {
      return null
    }
    return summary.outOfPocketMax
  }, [summary])

  /**
   * Plan year display string.
   */
  const planYearDisplay = useMemo(() => {
    if (!summary || !summary.planYear) {
      return null
    }

    try {
      const start = new Date(summary.planYear.start)
      const end = new Date(summary.planYear.end)

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

      return `${startStr} – ${endStr}`
    } catch (_error) {
      return null
    }
  }, [summary])

  /**
   * Handles the "View Spending Details" footer action.
   */
  const handleViewSpending = useCallback(() => {
    tagPageView({ page: '/spending', source: 'deductible_oop_summary_widget' })
    navigate('/spending')
  }, [navigate, tagPageView])

  if (!summary || (!deductible && !outOfPocketMax)) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'deductible-oop-summary'}
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
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Deductible & Out-of-Pocket</h3>
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
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="text-sm text-neutral-500">No spending data available</p>
            <p className="text-xs text-neutral-400 mt-1">
              Your deductible and out-of-pocket information will appear here once available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`hb-card overflow-hidden ${className}`.trim()}
      data-testid={testId || 'deductible-oop-summary'}
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
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Deductible & Out-of-Pocket</h3>
            {planYearDisplay && (
              <p className="text-2xs text-neutral-500 mt-0.5">
                Plan Year: {planYearDisplay}
              </p>
            )}
          </div>
        </div>

        {/* Coinsurance badge */}
        {summary.coinsurance && (
          <span className="hb-badge-sm hb-badge-neutral">
            {summary.coinsurance.inNetwork} In-Network
          </span>
        )}
      </div>

      {/* Body */}
      <div className="hb-card-body">
        <div className="flex flex-col gap-6">
          {/* Deductible Section */}
          {deductible && (
            <div
              data-testid={
                testId
                  ? `${testId}-deductible-section`
                  : 'deductible-oop-summary-deductible-section'
              }
            >
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-hb-primary flex-shrink-0"
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
                <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Deductible
                </h4>
              </div>

              <div className="flex flex-col gap-4">
                {/* Individual Deductible */}
                {deductible.individual && (
                  <div
                    data-testid={
                      testId
                        ? `${testId}-deductible-individual`
                        : 'deductible-oop-summary-deductible-individual'
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
                          : 'deductible-oop-summary-deductible-individual-progress'
                      }
                    />
                  </div>
                )}

                {/* Family Deductible */}
                {deductible.family && (
                  <div
                    data-testid={
                      testId
                        ? `${testId}-deductible-family`
                        : 'deductible-oop-summary-deductible-family'
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
                          : 'deductible-oop-summary-deductible-family-progress'
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          {deductible && outOfPocketMax && (
            <div className="border-t border-neutral-100" aria-hidden="true" />
          )}

          {/* Out-of-Pocket Maximum Section */}
          {outOfPocketMax && (
            <div
              data-testid={
                testId
                  ? `${testId}-oop-section`
                  : 'deductible-oop-summary-oop-section'
              }
            >
              <div className="flex items-center gap-2 mb-3">
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
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Out-of-Pocket Maximum
                </h4>
              </div>

              <div className="flex flex-col gap-4">
                {/* Individual OOP */}
                {outOfPocketMax.individual && (
                  <div
                    data-testid={
                      testId
                        ? `${testId}-oop-individual`
                        : 'deductible-oop-summary-oop-individual'
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
                          : 'deductible-oop-summary-oop-individual-progress'
                      }
                    />
                  </div>
                )}

                {/* Family OOP */}
                {outOfPocketMax.family && (
                  <div
                    data-testid={
                      testId
                        ? `${testId}-oop-family`
                        : 'deductible-oop-summary-oop-family'
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
                          : 'deductible-oop-summary-oop-family-progress'
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary stats */}
          <div className="bg-surface-secondary rounded-lg px-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              {deductible && deductible.individual && (
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
              {outOfPocketMax && outOfPocketMax.individual && (
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="hb-card-footer flex items-center justify-center">
        <button
          type="button"
          className="hb-btn-sm hb-btn-outline w-full justify-center"
          onClick={handleViewSpending}
          data-testid={
            testId
              ? `${testId}-view-all`
              : 'deductible-oop-summary-view-all'
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
  )
}

export default DeductibleOopSummary

export { DeductibleOopSummary }