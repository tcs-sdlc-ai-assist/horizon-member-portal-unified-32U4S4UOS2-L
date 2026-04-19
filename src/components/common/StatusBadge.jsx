import { useMemo } from 'react'
import {
  CLAIM_STATUS,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_COLORS,
} from '@/constants/constants'

/**
 * Maps semantic color variants to Honeybee badge CSS classes.
 */
const BADGE_VARIANT_CLASS_MAP = {
  success: 'hb-badge-success',
  warning: 'hb-badge-warning',
  error: 'hb-badge-error',
  info: 'hb-badge-info',
  neutral: 'hb-badge-neutral',
  primary: 'hb-badge-primary',
  secondary: 'hb-badge-secondary',
  accent: 'hb-badge-accent',
}

/**
 * Maps semantic color variants to solid Honeybee badge CSS classes.
 */
const BADGE_SOLID_VARIANT_CLASS_MAP = {
  success: 'hb-badge-solid-success',
  warning: 'hb-badge-solid-warning',
  error: 'hb-badge-solid-error',
  primary: 'hb-badge-solid-primary',
}

/**
 * Maps size prop values to Honeybee badge size CSS classes.
 */
const BADGE_SIZE_CLASS_MAP = {
  sm: 'hb-badge-sm',
  md: 'hb-badge-md',
  lg: 'hb-badge-lg',
}

/**
 * Coverage status color mapping.
 */
const COVERAGE_STATUS_COLORS = {
  active: 'success',
  inactive: 'neutral',
  terminated: 'error',
  pending: 'warning',
  suspended: 'warning',
  expired: 'neutral',
}

/**
 * Coverage status label mapping.
 */
const COVERAGE_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  terminated: 'Terminated',
  pending: 'Pending',
  suspended: 'Suspended',
  expired: 'Expired',
}

/**
 * Status indicator dot color mapping.
 */
const DOT_COLOR_MAP = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-neutral-400',
  primary: 'bg-hb-primary',
  secondary: 'bg-hb-secondary',
  accent: 'bg-hb-accent',
}

/**
 * Reusable status badge component for claims and coverage status display.
 * Maps status values to Honeybee CSS badge color classes. Supports claim
 * statuses, coverage statuses, and custom status/color combinations.
 *
 * @param {object} props - Component props.
 * @param {string} props.status - The status value (e.g., 'paid', 'denied', 'active').
 * @param {string} [props.size='md'] - Badge size variant: 'sm', 'md', 'lg'.
 * @param {string} [props.variant] - Explicit color variant override: 'success', 'warning', 'error', 'info', 'neutral', 'primary', 'secondary', 'accent'.
 * @param {string} [props.label] - Custom label text override (defaults to mapped label from status).
 * @param {boolean} [props.solid=false] - Whether to use solid (filled) badge variant.
 * @param {boolean} [props.showDot=false] - Whether to show a colored status indicator dot.
 * @param {string} [props.type='claim'] - Status type context: 'claim', 'coverage', or 'custom'.
 * @param {string} [props.className] - Additional CSS class names.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * // Claim status badge
 * <StatusBadge status="paid" />
 *
 * @example
 * // Coverage status badge
 * <StatusBadge status="active" type="coverage" />
 *
 * @example
 * // Custom status with explicit variant and size
 * <StatusBadge status="custom" label="In Progress" variant="info" size="lg" showDot />
 *
 * @example
 * // Solid badge variant
 * <StatusBadge status="denied" solid />
 */
function StatusBadge({
  status,
  size = 'md',
  variant,
  label,
  solid = false,
  showDot = false,
  type = 'claim',
  className = '',
  testId,
}) {
  /**
   * Resolves the display label for the given status.
   */
  const resolvedLabel = useMemo(() => {
    if (label) {
      return label
    }

    if (!status) {
      return 'Unknown'
    }

    if (type === 'claim') {
      return (
        CLAIM_STATUS_LABELS[status] ||
        status
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
    }

    if (type === 'coverage') {
      return (
        COVERAGE_STATUS_LABELS[status] ||
        status
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
    }

    // Custom type — capitalize the status
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }, [status, label, type])

  /**
   * Resolves the color variant for the given status.
   */
  const resolvedVariant = useMemo(() => {
    if (variant) {
      return variant
    }

    if (!status) {
      return 'neutral'
    }

    if (type === 'claim') {
      return CLAIM_STATUS_COLORS[status] || 'neutral'
    }

    if (type === 'coverage') {
      return COVERAGE_STATUS_COLORS[status] || 'neutral'
    }

    return 'neutral'
  }, [status, variant, type])

  /**
   * Resolves the badge CSS classes based on size, variant, and solid props.
   */
  const badgeClasses = useMemo(() => {
    const sizeClass = BADGE_SIZE_CLASS_MAP[size] || BADGE_SIZE_CLASS_MAP.md

    let variantClass

    if (solid && BADGE_SOLID_VARIANT_CLASS_MAP[resolvedVariant]) {
      variantClass = BADGE_SOLID_VARIANT_CLASS_MAP[resolvedVariant]
    } else {
      variantClass = BADGE_VARIANT_CLASS_MAP[resolvedVariant] || BADGE_VARIANT_CLASS_MAP.neutral
    }

    return `${sizeClass} ${variantClass} ${className}`.trim()
  }, [size, resolvedVariant, solid, className])

  /**
   * Resolves the dot color class.
   */
  const dotColorClass = useMemo(
    () => DOT_COLOR_MAP[resolvedVariant] || DOT_COLOR_MAP.neutral,
    [resolvedVariant],
  )

  if (!status && !label) {
    return null
  }

  return (
    <span
      className={badgeClasses}
      data-testid={testId || 'status-badge'}
      role="status"
      aria-label={`Status: ${resolvedLabel}`}
    >
      {showDot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColorClass}`}
          aria-hidden="true"
        />
      )}
      {resolvedLabel}
    </span>
  )
}

export default StatusBadge

export { StatusBadge }