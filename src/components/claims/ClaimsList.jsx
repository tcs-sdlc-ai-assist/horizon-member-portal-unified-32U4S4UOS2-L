import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import claims from '@/data/claims'
import FilterBar from '@/components/common/FilterBar'
import Pagination from '@/components/common/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { announceToScreenReader } from '@/utils/accessibility'
import {
  CLAIM_STATUS,
  CLAIM_STATUS_LABELS,
  CLAIM_TYPE,
  CLAIM_TYPE_LABELS,
  PAGINATION,
} from '@/constants/constants'

/**
 * Claim type filter options derived from CLAIM_TYPE constants.
 */
const CLAIM_TYPE_OPTIONS = Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/**
 * Claim status filter options derived from CLAIM_STATUS constants.
 */
const CLAIM_STATUS_OPTIONS = Object.entries(CLAIM_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/**
 * Unique patient names extracted from claims data for the patient filter.
 */
const PATIENT_OPTIONS = (() => {
  const uniquePatients = [...new Set(claims.map((c) => c.patient))].sort()
  return uniquePatients.map((name) => ({ value: name, label: name }))
})()

/**
 * Sort direction constants.
 */
const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
}

/**
 * Default filter values.
 */
const DEFAULT_FILTERS = {
  type: '',
  status: '',
  patient: '',
  dateRange: { start: '', end: '' },
}

/**
 * Filter configuration for the FilterBar component.
 */
const FILTER_CONFIG = [
  {
    id: 'type',
    label: 'Claim Type',
    type: 'select',
    options: CLAIM_TYPE_OPTIONS,
    placeholder: 'All Types',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: CLAIM_STATUS_OPTIONS,
    placeholder: 'All Statuses',
  },
  {
    id: 'patient',
    label: 'Patient',
    type: 'select',
    options: PATIENT_OPTIONS,
    placeholder: 'All Patients',
  },
  {
    id: 'dateRange',
    label: 'Service Date',
    type: 'dateRange',
    dateRange: {
      startLabel: 'From',
      endLabel: 'To',
    },
  },
]

/**
 * Returns the claim type icon SVG based on claim type.
 * @param {string} type - The claim type key.
 * @returns {React.ReactNode} The icon element.
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
    case 'behavioral_health':
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
    case 'lab':
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
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      )
    case 'imaging':
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
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'hospital':
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
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
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

/**
 * Claims list table component with filtering, sorting, and pagination.
 *
 * Displays claim number, type, patient, provider, billed amount, what you owe,
 * status (StatusBadge), and dates. Integrates FilterBar for type/status/date/patient
 * filtering, column sorting by service date, and Pagination. Each row links to
 * claim detail. Uses PrivacyMaskedText for sensitive fields (claim number, patient
 * name, financial amounts).
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {number} [props.itemsPerPage] - Number of items per page (defaults to PAGINATION.defaultPageSize).
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimsList />
 *
 * @example
 * <ClaimsList itemsPerPage={25} className="mt-4" testId="claims-page-list" />
 */
function ClaimsList({ className = '', itemsPerPage = PAGINATION.defaultPageSize, testId }) {
  const navigate = useNavigate()
  const { tagClaimOpened } = useEventTagger()

  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.DESC)
  const [currentPage, setCurrentPage] = useState(1)

  /**
   * Handles a filter value change from the FilterBar.
   */
  const handleFilterChange = useCallback((filterId, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
    setCurrentPage(1)
  }, [])

  /**
   * Handles the reset/clear all filters action.
   */
  const handleFilterReset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
    setCurrentPage(1)
  }, [])

  /**
   * Toggles the sort direction for the service date column.
   */
  const handleSortToggle = useCallback(() => {
    setSortDirection((prev) => {
      const next = prev === SORT_DIRECTION.DESC ? SORT_DIRECTION.ASC : SORT_DIRECTION.DESC
      announceToScreenReader(
        `Claims sorted by service date ${next === SORT_DIRECTION.ASC ? 'oldest first' : 'newest first'}`,
        { priority: 'polite' },
      )
      return next
    })
    setCurrentPage(1)
  }, [])

  /**
   * Handles clicking a claim row — navigates to the claims page (detail view).
   */
  const handleClaimClick = useCallback(
    (claim) => {
      tagClaimOpened({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimType: claim.type,
        claimStatus: claim.status,
        source: 'claims_list',
      })
      navigate('/claims')
    },
    [navigate, tagClaimOpened],
  )

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
   * Handles page change from the Pagination component.
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  /**
   * Filtered claims based on current filter values.
   */
  const filteredClaims = useMemo(() => {
    let result = [...claims]

    // Filter by type
    if (filters.type) {
      result = result.filter((claim) => claim.type === filters.type)
    }

    // Filter by status
    if (filters.status) {
      result = result.filter((claim) => claim.status === filters.status)
    }

    // Filter by patient
    if (filters.patient) {
      result = result.filter((claim) => claim.patient === filters.patient)
    }

    // Filter by date range
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const { start, end } = filters.dateRange

      if (start) {
        const startDate = new Date(start)
        result = result.filter((claim) => new Date(claim.serviceDate) >= startDate)
      }

      if (end) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        result = result.filter((claim) => new Date(claim.serviceDate) <= endDate)
      }
    }

    return result
  }, [filters])

  /**
   * Sorted claims based on current sort direction.
   */
  const sortedClaims = useMemo(() => {
    const sorted = [...filteredClaims]

    sorted.sort((a, b) => {
      const dateA = new Date(a.serviceDate)
      const dateB = new Date(b.serviceDate)

      if (sortDirection === SORT_DIRECTION.ASC) {
        return dateA - dateB
      }
      return dateB - dateA
    })

    return sorted
  }, [filteredClaims, sortDirection])

  /**
   * Total number of filtered claims.
   */
  const totalItems = sortedClaims.length

  /**
   * Paginated claims for the current page.
   */
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedClaims.slice(startIndex, endIndex)
  }, [sortedClaims, currentPage, itemsPerPage])

  /**
   * Summary statistics for the filtered claims.
   */
  const summaryStats = useMemo(() => {
    const totalBilled = filteredClaims.reduce((sum, claim) => sum + (claim.billedAmount || 0), 0)
    const totalOwed = filteredClaims.reduce((sum, claim) => sum + (claim.whatYouOwe || 0), 0)
    const totalPlanPaid = filteredClaims.reduce((sum, claim) => sum + (claim.planPaid || 0), 0)

    return {
      totalBilled,
      totalOwed,
      totalPlanPaid,
      count: filteredClaims.length,
    }
  }, [filteredClaims])

  return (
    <div
      className={`flex flex-col gap-4 ${className}`.trim()}
      data-testid={testId || 'claims-list'}
    >
      {/* Filter Bar */}
      <FilterBar
        filters={FILTER_CONFIG}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
        showReset
        resetLabel="Clear Filters"
        layout="grid"
        size="md"
        collapsible
        ariaLabel="Filter claims"
        testId={testId ? `${testId}-filters` : 'claims-list-filters'}
      />

      {/* Summary stats */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {summaryStats.count} {summaryStats.count === 1 ? 'claim' : 'claims'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 ml-auto">
          <div className="text-xs text-neutral-400">
            Total Billed:{' '}
            <PrivacyMaskedText fieldType="financialAmount" className="font-medium text-neutral-600">
              {formatCurrency(summaryStats.totalBilled)}
            </PrivacyMaskedText>
          </div>
          <div className="text-xs text-neutral-400">
            Plan Paid:{' '}
            <PrivacyMaskedText fieldType="financialAmount" className="font-medium text-success-dark">
              {formatCurrency(summaryStats.totalPlanPaid)}
            </PrivacyMaskedText>
          </div>
          <div className="text-xs text-neutral-400">
            You Owe:{' '}
            <PrivacyMaskedText fieldType="financialAmount" className="font-medium text-neutral-800">
              {formatCurrency(summaryStats.totalOwed)}
            </PrivacyMaskedText>
          </div>
        </div>
      </div>

      {/* Claims table */}
      {paginatedClaims.length === 0 ? (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-empty` : 'claims-list-empty'}
        >
          <div className="hb-card-body">
            <div className="hb-empty-state py-12">
              <svg
                className="w-12 h-12 text-neutral-300 mb-4"
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
              <p className="text-sm font-medium text-neutral-600 mb-1">No claims found</p>
              <p className="text-xs text-neutral-400">
                Try adjusting your filters to see more results.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-table-card` : 'claims-list-table-card'}
        >
          {/* Desktop table view */}
          <div className="hidden lg:block overflow-x-auto">
            <table
              className="hb-table"
              aria-label="Claims list"
              data-testid={testId ? `${testId}-table` : 'claims-list-table'}
            >
              <thead>
                <tr>
                  <th scope="col" className="w-10" />
                  <th scope="col">Claim #</th>
                  <th scope="col">Type</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Provider</th>
                  <th scope="col" className="text-right">Billed</th>
                  <th scope="col" className="text-right">You Owe</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-hb-primary transition-colors duration-150 cursor-pointer"
                      onClick={handleSortToggle}
                      aria-label={`Sort by service date, currently ${sortDirection === SORT_DIRECTION.DESC ? 'newest first' : 'oldest first'}`}
                      data-testid={
                        testId
                          ? `${testId}-sort-date`
                          : 'claims-list-sort-date'
                      }
                    >
                      Service Date
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${sortDirection === SORT_DIRECTION.ASC ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="cursor-pointer hover:bg-neutral-50 transition-colors duration-150 group"
                    onClick={() => handleClaimClick(claim)}
                    onKeyDown={(event) => handleClaimKeyDown(event, claim)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Claim ${claim.claimNumber} for ${claim.provider}, ${formatCurrency(claim.whatYouOwe)} owed, status ${claim.status}`}
                    data-testid={
                      testId
                        ? `${testId}-row-${claim.id}`
                        : `claims-list-row-${claim.id}`
                    }
                  >
                    {/* Type icon */}
                    <td className="w-10">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary transition-colors duration-150">
                        {getClaimTypeIcon(claim.type)}
                      </div>
                    </td>

                    {/* Claim number */}
                    <td>
                      <PrivacyMaskedText
                        fieldType="claimNumber"
                        className="text-sm font-medium text-hb-primary font-mono"
                      >
                        {claim.claimNumber}
                      </PrivacyMaskedText>
                    </td>

                    {/* Type */}
                    <td>
                      <span className="text-sm text-neutral-700">
                        {CLAIM_TYPE_LABELS[claim.type] ||
                          claim.type
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </td>

                    {/* Patient */}
                    <td>
                      <PrivacyMaskedText
                        fieldType="patientName"
                        className="text-sm text-neutral-700"
                      >
                        {claim.patient}
                      </PrivacyMaskedText>
                    </td>

                    {/* Provider */}
                    <td>
                      <span className="text-sm text-neutral-700 hb-text-truncate block max-w-[12rem]">
                        {claim.provider}
                      </span>
                    </td>

                    {/* Billed amount */}
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm text-neutral-600 font-mono"
                      >
                        {formatCurrency(claim.billedAmount)}
                      </PrivacyMaskedText>
                    </td>

                    {/* What you owe */}
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm font-semibold text-neutral-900 font-mono"
                      >
                        {formatCurrency(claim.whatYouOwe)}
                      </PrivacyMaskedText>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge
                        status={claim.status}
                        type="claim"
                        size="sm"
                        showDot
                        testId={
                          testId
                            ? `${testId}-status-${claim.id}`
                            : `claims-list-status-${claim.id}`
                        }
                      />
                    </td>

                    {/* Service date */}
                    <td>
                      <span className="text-sm text-neutral-500">
                        {formatDate(claim.serviceDate, { preset: 'short' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden divide-y divide-neutral-100">
            {paginatedClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-start gap-3 px-4 sm:px-6 py-3.5 transition-colors duration-150 hover:bg-neutral-50 cursor-pointer group"
                onClick={() => handleClaimClick(claim)}
                onKeyDown={(event) => handleClaimKeyDown(event, claim)}
                tabIndex={0}
                role="button"
                aria-label={`Claim ${claim.claimNumber} for ${claim.provider}, ${formatCurrency(claim.whatYouOwe)} owed, status ${claim.status}`}
                data-testid={
                  testId
                    ? `${testId}-mobile-row-${claim.id}`
                    : `claims-list-mobile-row-${claim.id}`
                }
              >
                {/* Type icon */}
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary transition-colors duration-150 mt-0.5">
                  {getClaimTypeIcon(claim.type)}
                </div>

                {/* Content */}
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
                        <span className="text-neutral-300" aria-hidden="true">
                          ·
                        </span>
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
                      <span className="text-2xs text-neutral-400 mt-0.5">You owe</span>
                    </div>
                  </div>

                  {/* Status and date row */}
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={claim.status}
                        type="claim"
                        size="sm"
                        showDot
                        testId={
                          testId
                            ? `${testId}-mobile-status-${claim.id}`
                            : `claims-list-mobile-status-${claim.id}`
                        }
                      />
                      <span className="hb-badge-sm hb-badge-neutral">
                        {CLAIM_TYPE_LABELS[claim.type] ||
                          claim.type
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-2xs text-neutral-400">
                      {formatDate(claim.serviceDate, { preset: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        showItemCount
        showPageInfo
        size="md"
        testId={testId ? `${testId}-pagination` : 'claims-list-pagination'}
      />

      {/* Screen reader live region for filter results */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {totalItems} {totalItems === 1 ? 'claim' : 'claims'} found
      </div>
    </div>
  )
}

export default ClaimsList

export { ClaimsList }