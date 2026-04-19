import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import documents from '@/data/documents'
import FilterBar from '@/components/common/FilterBar'
import Pagination from '@/components/common/Pagination'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { formatDate, formatFileSize } from '@/utils/formatters'
import { announceToScreenReader } from '@/utils/accessibility'
import {
  DOCUMENT_CATEGORY,
  DOCUMENT_CATEGORY_LABELS,
  PAGINATION,
} from '@/constants/constants'

/**
 * Document category filter options derived from DOCUMENT_CATEGORY constants.
 */
const DOCUMENT_CATEGORY_OPTIONS = Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}))

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
  category: '',
  search: '',
  dateRange: { start: '', end: '' },
}

/**
 * Filter configuration for the FilterBar component.
 */
const FILTER_CONFIG = [
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search documents...',
  },
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: DOCUMENT_CATEGORY_OPTIONS,
    placeholder: 'All Categories',
  },
  {
    id: 'dateRange',
    label: 'Date',
    type: 'dateRange',
    dateRange: {
      startLabel: 'From',
      endLabel: 'To',
    },
  },
]

/**
 * Returns the document category icon SVG based on category type.
 * @param {string} category - The document category key.
 * @returns {React.ReactNode} The icon element.
 */
const getDocumentCategoryIcon = (category) => {
  switch (category) {
    case 'eob':
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
    case 'plan_document':
    case 'benefit_summary':
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'letter':
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
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    case 'tax_document':
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
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'form':
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
    case 'id_card':
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
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    case 'prior_auth':
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    case 'appeal':
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
    case 'provider_directory':
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
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      )
  }
}

/**
 * Maps document category to badge color class.
 * @param {string} category - The document category key.
 * @returns {string} Badge CSS class.
 */
const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'eob':
      return 'hb-badge-info'
    case 'plan_document':
    case 'benefit_summary':
      return 'hb-badge-primary'
    case 'letter':
      return 'hb-badge-neutral'
    case 'tax_document':
      return 'hb-badge-warning'
    case 'form':
      return 'hb-badge-accent'
    case 'id_card':
      return 'hb-badge-success'
    case 'prior_auth':
      return 'hb-badge-success'
    case 'appeal':
      return 'hb-badge-error'
    case 'provider_directory':
      return 'hb-badge-secondary'
    default:
      return 'hb-badge-neutral'
  }
}

/**
 * Maps document category to audit action.
 * @param {string} category - The document category key.
 * @returns {string} Audit action string.
 */
const getAuditActionForCategory = (category) => {
  switch (category) {
    case 'eob':
      return 'eob_download'
    case 'tax_document':
      return 'tax_document_download'
    case 'form':
      return 'form_download'
    case 'plan_document':
    case 'benefit_summary':
      return 'plan_document_download'
    case 'appeal':
      return 'appeal_document_download'
    case 'provider_directory':
      return 'provider_directory_download'
    default:
      return 'document_download'
  }
}

/**
 * Document Center list component.
 *
 * Displays categorized documents (EOB, plan docs, letters, tax forms, etc.)
 * in a table/card layout with filtering, sorting, and pagination. Integrates
 * FilterBar for category/date/search filtering and column sorting by date.
 * Download button triggers useAuditLogger and useEventTagger (document_download).
 * Uses PrivacyMaskedText for sensitive fields (patient name, claim number).
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {number} [props.itemsPerPage] - Number of items per page (defaults to PAGINATION.defaultPageSize).
 * @param {string} [props.initialCategory] - Initial category filter value.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <DocumentList />
 *
 * @example
 * <DocumentList itemsPerPage={25} initialCategory="eob" className="mt-4" testId="documents-page-list" />
 */
function DocumentList({
  className = '',
  itemsPerPage = PAGINATION.defaultPageSize,
  initialCategory = '',
  testId,
}) {
  const navigate = useNavigate()
  const { tagDocumentDownload } = useEventTagger()
  const {
    logDocumentDownload,
    logEobDownload,
    logTaxDocumentDownload,
    logFormDownload,
    logPlanDocumentDownload,
    logAppealDocumentDownload,
    logProviderDirectoryDownload,
  } = useAuditLogger()

  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  })
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTION.DESC)
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingDocId, setDownloadingDocId] = useState(null)

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
   * Toggles the sort direction for the date column.
   */
  const handleSortToggle = useCallback(() => {
    setSortDirection((prev) => {
      const next = prev === SORT_DIRECTION.DESC ? SORT_DIRECTION.ASC : SORT_DIRECTION.DESC
      announceToScreenReader(
        `Documents sorted by date ${next === SORT_DIRECTION.ASC ? 'oldest first' : 'newest first'}`,
        { priority: 'polite' },
      )
      return next
    })
    setCurrentPage(1)
  }, [])

  /**
   * Handles page change from the Pagination component.
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  /**
   * Handles downloading a document.
   */
  const handleDownload = useCallback(
    async (doc, event) => {
      if (event) {
        event.stopPropagation()
      }

      if (downloadingDocId === doc.id) {
        return
      }

      setDownloadingDocId(doc.id)

      try {
        tagDocumentDownload({
          documentId: doc.id,
          documentType: doc.category,
          documentTitle: doc.title,
          source: 'document_list',
        })

        const auditDetails = {
          documentId: doc.id,
          documentType: doc.category,
          source: 'document_list',
        }

        switch (doc.category) {
          case 'eob':
            await logEobDownload(auditDetails)
            break
          case 'tax_document':
            await logTaxDocumentDownload(auditDetails)
            break
          case 'form':
            await logFormDownload(auditDetails)
            break
          case 'plan_document':
          case 'benefit_summary':
            await logPlanDocumentDownload(auditDetails)
            break
          case 'appeal':
            await logAppealDocumentDownload(auditDetails)
            break
          case 'provider_directory':
            await logProviderDirectoryDownload(auditDetails)
            break
          default:
            await logDocumentDownload(auditDetails)
            break
        }

        announceToScreenReader(`Downloading ${doc.title}`, { priority: 'polite' })
      } catch (_error) {
        announceToScreenReader('Failed to download document. Please try again.', {
          priority: 'assertive',
        })
      } finally {
        setDownloadingDocId(null)
      }
    },
    [
      downloadingDocId,
      tagDocumentDownload,
      logDocumentDownload,
      logEobDownload,
      logTaxDocumentDownload,
      logFormDownload,
      logPlanDocumentDownload,
      logAppealDocumentDownload,
      logProviderDirectoryDownload,
    ],
  )

  /**
   * Handles clicking a document row — navigates to related claim if applicable.
   */
  const handleDocumentClick = useCallback(
    (doc) => {
      if (doc.relatedClaimId) {
        navigate('/claims')
      }
    },
    [navigate],
  )

  /**
   * Handles keyboard activation on a document row.
   */
  const handleDocumentKeyDown = useCallback(
    (event, doc) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleDocumentClick(doc)
      }
    },
    [handleDocumentClick],
  )

  /**
   * Filtered documents based on current filter values.
   */
  const filteredDocuments = useMemo(() => {
    let result = [...documents]

    // Filter by category
    if (filters.category) {
      result = result.filter((doc) => doc.category === filters.category)
    }

    // Filter by search text
    if (filters.search && filters.search.trim().length > 0) {
      const searchLower = filters.search.trim().toLowerCase()
      result = result.filter((doc) => {
        const titleMatch = doc.title?.toLowerCase().includes(searchLower)
        const descMatch = doc.description?.toLowerCase().includes(searchLower)
        const nameMatch = doc.name?.toLowerCase().includes(searchLower)
        const patientMatch = doc.patient?.toLowerCase().includes(searchLower)
        const providerMatch = doc.provider?.toLowerCase().includes(searchLower)
        const claimMatch = doc.relatedClaimNumber?.toLowerCase().includes(searchLower)
        return titleMatch || descMatch || nameMatch || patientMatch || providerMatch || claimMatch
      })
    }

    // Filter by date range
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const { start, end } = filters.dateRange

      if (start) {
        const startDate = new Date(start)
        result = result.filter((doc) => new Date(doc.date) >= startDate)
      }

      if (end) {
        const endDate = new Date(end)
        endDate.setHours(23, 59, 59, 999)
        result = result.filter((doc) => new Date(doc.date) <= endDate)
      }
    }

    return result
  }, [filters])

  /**
   * Sorted documents based on current sort direction.
   */
  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments]

    sorted.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)

      if (sortDirection === SORT_DIRECTION.ASC) {
        return dateA - dateB
      }
      return dateB - dateA
    })

    return sorted
  }, [filteredDocuments, sortDirection])

  /**
   * Total number of filtered documents.
   */
  const totalItems = sortedDocuments.length

  /**
   * Paginated documents for the current page.
   */
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedDocuments.slice(startIndex, endIndex)
  }, [sortedDocuments, currentPage, itemsPerPage])

  /**
   * Summary statistics for the filtered documents.
   */
  const summaryStats = useMemo(() => {
    const categoryCounts = {}
    filteredDocuments.forEach((doc) => {
      categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1
    })

    const unreadCount = filteredDocuments.filter((doc) => !doc.isRead).length

    return {
      count: filteredDocuments.length,
      unreadCount,
      categoryCounts,
    }
  }, [filteredDocuments])

  return (
    <div
      className={`flex flex-col gap-4 ${className}`.trim()}
      data-testid={testId || 'document-list'}
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
        ariaLabel="Filter documents"
        testId={testId ? `${testId}-filters` : 'document-list-filters'}
      />

      {/* Summary stats */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {summaryStats.count} {summaryStats.count === 1 ? 'document' : 'documents'}
          </span>
          {summaryStats.unreadCount > 0 && (
            <span className="hb-badge-sm hb-badge-primary">
              {summaryStats.unreadCount} new
            </span>
          )}
        </div>
      </div>

      {/* Documents table */}
      {paginatedDocuments.length === 0 ? (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-empty` : 'document-list-empty'}
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
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm font-medium text-neutral-600 mb-1">No documents found</p>
              <p className="text-xs text-neutral-400">
                Try adjusting your filters to see more results.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-table-card` : 'document-list-table-card'}
        >
          {/* Desktop table view */}
          <div className="hidden lg:block overflow-x-auto">
            <table
              className="hb-table"
              aria-label="Documents list"
              data-testid={testId ? `${testId}-table` : 'document-list-table'}
            >
              <thead>
                <tr>
                  <th scope="col" className="w-10" />
                  <th scope="col">Document</th>
                  <th scope="col">Category</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Size</th>
                  <th scope="col">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-hb-primary transition-colors duration-150 cursor-pointer"
                      onClick={handleSortToggle}
                      aria-label={`Sort by date, currently ${sortDirection === SORT_DIRECTION.DESC ? 'newest first' : 'oldest first'}`}
                      data-testid={
                        testId
                          ? `${testId}-sort-date`
                          : 'document-list-sort-date'
                      }
                    >
                      Date
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
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors duration-150 group ${
                      doc.relatedClaimId
                        ? 'cursor-pointer hover:bg-neutral-50'
                        : ''
                    } ${!doc.isRead ? 'bg-info-light/20' : ''}`}
                    onClick={doc.relatedClaimId ? () => handleDocumentClick(doc) : undefined}
                    onKeyDown={
                      doc.relatedClaimId
                        ? (event) => handleDocumentKeyDown(event, doc)
                        : undefined
                    }
                    tabIndex={doc.relatedClaimId ? 0 : undefined}
                    role={doc.relatedClaimId ? 'button' : undefined}
                    aria-label={
                      doc.relatedClaimId
                        ? `${doc.title}, ${DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}, ${formatDate(doc.date, { preset: 'short' })}. Click to view related claim.`
                        : undefined
                    }
                    data-testid={
                      testId
                        ? `${testId}-row-${doc.id}`
                        : `document-list-row-${doc.id}`
                    }
                  >
                    {/* Category icon */}
                    <td className="w-10">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary transition-colors duration-150">
                        {getDocumentCategoryIcon(doc.category)}
                      </div>
                    </td>

                    {/* Document title and description */}
                    <td>
                      <div className="min-w-0">
                        <p className={`text-sm text-neutral-800 hb-text-truncate block max-w-[20rem] ${!doc.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {doc.title}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-neutral-500 mt-0.5 hb-text-truncate block max-w-[20rem]">
                            {doc.description}
                          </p>
                        )}
                        {doc.relatedClaimNumber && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <PrivacyMaskedText
                              fieldType="claimNumber"
                              className="text-2xs text-neutral-400 font-mono"
                            >
                              {doc.relatedClaimNumber}
                            </PrivacyMaskedText>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className={`hb-badge-sm ${getCategoryBadgeClass(doc.category)}`}>
                        {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                      </span>
                    </td>

                    {/* Patient */}
                    <td>
                      {doc.patient ? (
                        <PrivacyMaskedText
                          fieldType="patientName"
                          className="text-sm text-neutral-700"
                        >
                          {doc.patient}
                        </PrivacyMaskedText>
                      ) : (
                        <span className="text-sm text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Size */}
                    <td>
                      <span className="text-sm text-neutral-500">
                        {doc.sizeDisplay || formatFileSize(doc.size)}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="text-sm text-neutral-500">
                        {formatDate(doc.date, { preset: 'short' })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <button
                        type="button"
                        className="hb-btn-sm hb-btn-primary"
                        onClick={(e) => handleDownload(doc, e)}
                        disabled={downloadingDocId === doc.id}
                        aria-label={`Download ${doc.title}`}
                        data-testid={
                          testId
                            ? `${testId}-download-${doc.id}`
                            : `document-list-download-${doc.id}`
                        }
                      >
                        {downloadingDocId === doc.id ? (
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
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden divide-y divide-neutral-100">
            {paginatedDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-start gap-3 px-4 sm:px-6 py-3.5 transition-colors duration-150 group ${
                  doc.relatedClaimId
                    ? 'cursor-pointer hover:bg-neutral-50'
                    : ''
                } ${!doc.isRead ? 'bg-info-light/20' : ''}`}
                onClick={doc.relatedClaimId ? () => handleDocumentClick(doc) : undefined}
                onKeyDown={
                  doc.relatedClaimId
                    ? (event) => handleDocumentKeyDown(event, doc)
                    : undefined
                }
                tabIndex={doc.relatedClaimId ? 0 : undefined}
                role={doc.relatedClaimId ? 'button' : undefined}
                aria-label={`${doc.title}, ${DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}, ${formatDate(doc.date, { preset: 'short' })}`}
                data-testid={
                  testId
                    ? `${testId}-mobile-row-${doc.id}`
                    : `document-list-mobile-row-${doc.id}`
                }
              >
                {/* Category icon */}
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary transition-colors duration-150 mt-0.5">
                  {getDocumentCategoryIcon(doc.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm text-neutral-800 hb-text-clamp-2 ${!doc.isRead ? 'font-semibold' : 'font-medium'}`}>
                        {doc.title}
                      </p>
                      {doc.relatedClaimNumber && (
                        <PrivacyMaskedText
                          fieldType="claimNumber"
                          className="text-2xs text-neutral-400 font-mono mt-0.5 block"
                        >
                          {doc.relatedClaimNumber}
                        </PrivacyMaskedText>
                      )}
                    </div>

                    {/* Download button */}
                    <button
                      type="button"
                      className="hb-btn-icon hb-btn-ghost text-neutral-400 hover:text-hb-primary flex-shrink-0"
                      onClick={(e) => handleDownload(doc, e)}
                      disabled={downloadingDocId === doc.id}
                      aria-label={`Download ${doc.title}`}
                      data-testid={
                        testId
                          ? `${testId}-mobile-download-${doc.id}`
                          : `document-list-mobile-download-${doc.id}`
                      }
                    >
                      {downloadingDocId === doc.id ? (
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

                  {/* Meta row */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`hb-badge-sm ${getCategoryBadgeClass(doc.category)}`}>
                      {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                    {doc.patient && (
                      <>
                        <span className="text-neutral-300" aria-hidden="true">·</span>
                        <PrivacyMaskedText
                          fieldType="patientName"
                          className="text-2xs text-neutral-400"
                        >
                          {doc.patient}
                        </PrivacyMaskedText>
                      </>
                    )}
                    <span className="text-neutral-300" aria-hidden="true">·</span>
                    <span className="text-2xs text-neutral-400">
                      {doc.sizeDisplay || formatFileSize(doc.size)}
                    </span>
                    <span className="text-neutral-300" aria-hidden="true">·</span>
                    <span className="text-2xs text-neutral-400">
                      {formatDate(doc.date, { preset: 'short' })}
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
        testId={testId ? `${testId}-pagination` : 'document-list-pagination'}
      />

      {/* Screen reader live region for filter results */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {totalItems} {totalItems === 1 ? 'document' : 'documents'} found
      </div>
    </div>
  )
}

export default DocumentList

export { DocumentList }