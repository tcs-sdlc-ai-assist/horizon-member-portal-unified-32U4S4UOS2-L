import { CURRENCY, CLAIM_STATUS_LABELS, CLAIM_STATUS_COLORS } from '@/constants/constants'

// -----------------------------------------------------------------------------
// Currency Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a number as USD currency.
 * @param {number|string} amount - The amount to format.
 * @param {object} [options] - Optional Intl.NumberFormat options overrides.
 * @returns {string} Formatted currency string (e.g., "$1,234.56").
 */
const formatCurrency = (amount, options = {}) => {
  const numericAmount = Number(amount)

  if (Number.isNaN(numericAmount)) {
    return '$0.00'
  }

  try {
    return new Intl.NumberFormat(CURRENCY.locale, {
      style: 'currency',
      currency: CURRENCY.currency,
      minimumFractionDigits: CURRENCY.minimumFractionDigits,
      maximumFractionDigits: CURRENCY.maximumFractionDigits,
      ...options,
    }).format(numericAmount)
  } catch (_error) {
    return `$${numericAmount.toFixed(2)}`
  }
}

// -----------------------------------------------------------------------------
// Date Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a date string or Date object into a display-friendly format.
 * @param {string|Date} date - The date to format.
 * @param {object} [options] - Intl.DateTimeFormat options or a preset string.
 * @param {string} [options.preset] - One of 'short', 'long', 'monthYear', 'time', 'dateTime', 'dateTimeLong'.
 * @returns {string} Formatted date string.
 */
const formatDate = (date, options = {}) => {
  if (!date) {
    return '—'
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date)

    if (Number.isNaN(dateObj.getTime())) {
      return '—'
    }

    const { preset, ...intlOptions } = options

    const presets = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      monthYear: { month: 'long', year: 'numeric' },
      time: { hour: 'numeric', minute: '2-digit', hour12: true },
      dateTime: {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      },
      dateTimeLong: {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      },
    }

    const resolvedOptions = preset && presets[preset]
      ? presets[preset]
      : Object.keys(intlOptions).length > 0
        ? intlOptions
        : { month: '2-digit', day: '2-digit', year: 'numeric' }

    return new Intl.DateTimeFormat('en-US', resolvedOptions).format(dateObj)
  } catch (_error) {
    return '—'
  }
}

// -----------------------------------------------------------------------------
// Claim Status Formatting
// -----------------------------------------------------------------------------

/**
 * Returns the human-readable label for a claim status key.
 * @param {string} status - The claim status key (e.g., 'in_review').
 * @returns {string} Display label (e.g., 'In Review').
 */
const formatClaimStatus = (status) => {
  if (!status) {
    return 'Unknown'
  }

  return CLAIM_STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Returns the color variant for a claim status key.
 * @param {string} status - The claim status key.
 * @returns {string} Color variant string (e.g., 'success', 'error', 'warning').
 */
const getClaimStatusColor = (status) => {
  if (!status) {
    return 'neutral'
  }

  return CLAIM_STATUS_COLORS[status] || 'neutral'
}

// -----------------------------------------------------------------------------
// Phone Number Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a phone number string into a consistent display format.
 * @param {string} phone - The phone number to format.
 * @returns {string} Formatted phone number (e.g., "(555) 867-5309" or "1-800-555-0199").
 */
const formatPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  const cleaned = phone.replace(/[^\d]/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return original if it doesn't match expected patterns
  return phone
}

// -----------------------------------------------------------------------------
// Text Formatting
// -----------------------------------------------------------------------------

/**
 * Truncates text to a specified length and appends an ellipsis.
 * @param {string} text - The text to truncate.
 * @param {number} [maxLength=100] - Maximum character length before truncation.
 * @param {string} [suffix='…'] - The suffix to append when truncated.
 * @returns {string} Truncated text or original if within limit.
 */
const truncateText = (text, maxLength = 100, suffix = '…') => {
  if (!text || typeof text !== 'string') {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  const truncated = text.slice(0, maxLength).trimEnd()
  return `${truncated}${suffix}`
}

// -----------------------------------------------------------------------------
// Percentage Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a number as a percentage string.
 * @param {number} value - The value to format (e.g., 0.75 for 75% or 75 for 75%).
 * @param {object} [options] - Configuration options.
 * @param {boolean} [options.isDecimal=false] - Whether the value is a decimal (0-1) or already a percentage (0-100).
 * @param {number} [options.decimals=0] - Number of decimal places.
 * @returns {string} Formatted percentage string (e.g., "75%").
 */
const formatPercentage = (value, options = {}) => {
  const { isDecimal = false, decimals = 0 } = options
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '0%'
  }

  const percentage = isDecimal ? numericValue * 100 : numericValue
  return `${percentage.toFixed(decimals)}%`
}

// -----------------------------------------------------------------------------
// Number Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a number with locale-appropriate separators.
 * @param {number|string} value - The number to format.
 * @param {object} [options] - Intl.NumberFormat options.
 * @returns {string} Formatted number string.
 */
const formatNumber = (value, options = {}) => {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return '0'
  }

  try {
    return new Intl.NumberFormat(CURRENCY.locale, options).format(numericValue)
  } catch (_error) {
    return String(numericValue)
  }
}

// -----------------------------------------------------------------------------
// File Size Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a file size in bytes to a human-readable string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} Formatted file size (e.g., "2.5 MB").
 */
const formatFileSize = (bytes) => {
  const numericBytes = Number(bytes)

  if (Number.isNaN(numericBytes) || numericBytes < 0) {
    return '0 B'
  }

  if (numericBytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const base = 1024
  const unitIndex = Math.min(
    Math.floor(Math.log(numericBytes) / Math.log(base)),
    units.length - 1,
  )
  const size = numericBytes / Math.pow(base, unitIndex)

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

// -----------------------------------------------------------------------------
// Member ID Formatting
// -----------------------------------------------------------------------------

/**
 * Masks a member ID for partial display.
 * @param {string} memberId - The full member ID (e.g., 'HZN-884729103').
 * @param {number} [visibleChars=4] - Number of trailing characters to show.
 * @returns {string} Masked member ID (e.g., 'HZN-****9103').
 */
const maskMemberId = (memberId, visibleChars = 4) => {
  if (!memberId || typeof memberId !== 'string') {
    return ''
  }

  if (memberId.length <= visibleChars) {
    return memberId
  }

  const visible = memberId.slice(-visibleChars)
  const masked = memberId.slice(0, -visibleChars).replace(/[A-Za-z0-9]/g, '*')
  return `${masked}${visible}`
}

// -----------------------------------------------------------------------------
// Name Formatting
// -----------------------------------------------------------------------------

/**
 * Returns initials from a full name.
 * @param {string} name - The full name (e.g., 'Sarah Mitchell').
 * @returns {string} Initials (e.g., 'SM').
 */
const getInitials = (name) => {
  if (!name || typeof name !== 'string') {
    return ''
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const formatters = {
  formatCurrency,
  formatDate,
  formatClaimStatus,
  getClaimStatusColor,
  formatPhoneNumber,
  truncateText,
  formatPercentage,
  formatNumber,
  formatFileSize,
  maskMemberId,
  getInitials,
}

export default formatters

export {
  formatCurrency,
  formatDate,
  formatClaimStatus,
  getClaimStatusColor,
  formatPhoneNumber,
  truncateText,
  formatPercentage,
  formatNumber,
  formatFileSize,
  maskMemberId,
  getInitials,
}