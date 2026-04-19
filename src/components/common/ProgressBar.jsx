import { useMemo } from 'react'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

/**
 * Reusable accessible progress bar component for deductible and out-of-pocket
 * displays. Renders a visual progress indicator with Honeybee CSS classes and
 * full ARIA support for screen readers.
 *
 * @param {object} props - Component props.
 * @param {number} props.current - The current value (amount used).
 * @param {number} props.max - The maximum value (limit).
 * @param {string} [props.label] - Accessible label for the progress bar.
 * @param {string} [props.format='currency'] - Display format: 'currency', 'percentage', 'number', or 'none'.
 * @param {string} [props.variant='primary'] - Color variant: 'primary', 'success', 'warning', 'error', 'accent'.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.showValues=true] - Whether to display the current/max values below the bar.
 * @param {boolean} [props.showPercentage=false] - Whether to display the percentage text.
 * @param {string} [props.currentLabel] - Custom label for the current value (e.g., 'Used').
 * @param {string} [props.maxLabel] - Custom label for the max value (e.g., 'Limit').
 * @param {string} [props.remainingLabel] - Custom label for the remaining value (e.g., 'Remaining').
 * @param {boolean} [props.showRemaining=false] - Whether to display the remaining value.
 * @param {boolean} [props.animate=true] - Whether to animate the progress bar fill.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.barClassName] - Additional CSS class names for the progress bar track.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {Array<{value: number, label: string}>} [props.thresholds] - Threshold markers to display on the bar.
 *
 * @example
 * // Basic deductible progress
 * <ProgressBar
 *   current={875}
 *   max={1500}
 *   label="Individual Deductible"
 *   format="currency"
 * />
 *
 * @example
 * // Out-of-pocket with remaining display
 * <ProgressBar
 *   current={1250}
 *   max={5000}
 *   label="Out-of-Pocket Maximum"
 *   format="currency"
 *   variant="accent"
 *   showRemaining
 *   currentLabel="Used"
 *   remainingLabel="Remaining"
 * />
 *
 * @example
 * // Percentage format with warning variant
 * <ProgressBar
 *   current={85}
 *   max={100}
 *   label="Annual Maximum"
 *   format="percentage"
 *   variant="warning"
 *   showPercentage
 * />
 */
function ProgressBar({
  current,
  max,
  label,
  format = 'currency',
  variant = 'primary',
  size = 'md',
  showValues = true,
  showPercentage = false,
  currentLabel,
  maxLabel,
  remainingLabel,
  showRemaining = false,
  animate = true,
  className = '',
  barClassName = '',
  testId,
  thresholds,
}) {
  const numericCurrent = Number(current) || 0
  const numericMax = Number(max) || 0

  const percentage = useMemo(() => {
    if (numericMax <= 0) {
      return 0
    }
    const pct = (numericCurrent / numericMax) * 100
    return Math.min(Math.max(pct, 0), 100)
  }, [numericCurrent, numericMax])

  const remaining = useMemo(
    () => Math.max(numericMax - numericCurrent, 0),
    [numericCurrent, numericMax],
  )

  /**
   * Determines the effective color variant based on percentage thresholds
   * when no explicit variant override is needed.
   */
  const effectiveVariant = useMemo(() => {
    if (variant !== 'primary') {
      return variant
    }
    if (percentage >= 90) {
      return 'error'
    }
    if (percentage >= 75) {
      return 'warning'
    }
    return 'primary'
  }, [variant, percentage])

  const variantClassMap = {
    primary: 'hb-progress-primary',
    success: 'hb-progress-success',
    warning: 'hb-progress-warning',
    error: 'hb-progress-error',
    accent: 'hb-progress-accent',
  }

  const sizeClassMap = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const progressVariantClass = variantClassMap[effectiveVariant] || variantClassMap.primary
  const sizeClass = sizeClassMap[size] || sizeClassMap.md

  /**
   * Formats a value based on the format prop.
   * @param {number} value - The value to format.
   * @returns {string} Formatted value string.
   */
  const formatValue = (value) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      case 'number':
        return String(value)
      case 'none':
        return ''
      default:
        return formatCurrency(value)
    }
  }

  const formattedCurrent = formatValue(numericCurrent)
  const formattedMax = formatValue(numericMax)
  const formattedRemaining = formatValue(remaining)
  const formattedPercentage = formatPercentage(percentage, { decimals: 0 })

  const ariaLabel = label
    ? `${label}: ${formattedCurrent} of ${formattedMax}`
    : `${formattedCurrent} of ${formattedMax}`

  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`.trim()}
      data-testid={testId || 'progress-bar'}
    >
      {/* Header: Label and optional percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-sm font-medium text-neutral-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-semibold text-neutral-500">
              {formattedPercentage}
            </span>
          )}
        </div>
      )}

      {/* Progress bar track */}
      <div
        className={`hb-progress ${progressVariantClass} ${sizeClass} ${barClassName}`.trim()}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        data-testid={testId ? `${testId}-track` : 'progress-bar-track'}
      >
        <div
          className={`hb-progress-bar ${sizeClass} ${animate ? 'transition-all duration-500 ease-out' : ''}`.trim()}
          style={{ width: `${percentage}%` }}
          data-testid={testId ? `${testId}-fill` : 'progress-bar-fill'}
        />

        {/* Threshold markers */}
        {thresholds &&
          Array.isArray(thresholds) &&
          numericMax > 0 &&
          thresholds.map((threshold) => {
            const thresholdPct = (threshold.value / numericMax) * 100
            if (thresholdPct <= 0 || thresholdPct >= 100) {
              return null
            }
            return (
              <div
                key={`threshold-${threshold.value}`}
                className="absolute top-0 bottom-0 w-px bg-neutral-400 opacity-50"
                style={{ left: `${thresholdPct}%` }}
                title={threshold.label}
                aria-hidden="true"
              />
            )
          })}
      </div>

      {/* Values display */}
      {showValues && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-500">
            {currentLabel ? (
              <>
                <span className="font-medium text-neutral-600">{formattedCurrent}</span>
                {' '}
                {currentLabel}
              </>
            ) : (
              <span className="font-medium text-neutral-600">{formattedCurrent}</span>
            )}
          </span>

          {showRemaining ? (
            <span className="text-xs text-neutral-500">
              <span className="font-medium text-neutral-600">{formattedRemaining}</span>
              {remainingLabel ? ` ${remainingLabel}` : ' remaining'}
            </span>
          ) : (
            <span className="text-xs text-neutral-500">
              {maxLabel ? (
                <>
                  <span className="font-medium text-neutral-600">{formattedMax}</span>
                  {' '}
                  {maxLabel}
                </>
              ) : (
                <>
                  of{' '}
                  <span className="font-medium text-neutral-600">{formattedMax}</span>
                </>
              )}
            </span>
          )}
        </div>
      )}

      {/* Screen reader only: detailed description */}
      <div className="hb-sr-only">
        {label && `${label}: `}
        {formattedCurrent} of {formattedMax} used.
        {showRemaining && ` ${formattedRemaining} remaining.`}
        {` ${formattedPercentage} complete.`}
      </div>
    </div>
  )
}

export default ProgressBar

export { ProgressBar }