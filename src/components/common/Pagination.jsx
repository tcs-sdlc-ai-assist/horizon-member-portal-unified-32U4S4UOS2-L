import { useMemo, useCallback } from 'react'
import { PAGINATION } from '@/constants/constants'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Reusable pagination component with previous/next and page number buttons.
 * Styled with Honeybee CSS classes and includes full ARIA navigation labels
 * for screen reader accessibility.
 *
 * @param {object} props - Component props.
 * @param {number} props.totalItems - Total number of items to paginate.
 * @param {number} [props.itemsPerPage=10] - Number of items per page.
 * @param {number} props.currentPage - The current active page (1-based).
 * @param {function} props.onPageChange - Callback invoked with the new page number when a page is selected.
 * @param {number} [props.maxVisiblePages] - Maximum number of page buttons to display (defaults to PAGINATION.maxVisiblePages).
 * @param {boolean} [props.showFirstLast=false] - Whether to show first/last page buttons.
 * @param {boolean} [props.showPageInfo=false] - Whether to show "Page X of Y" text.
 * @param {boolean} [props.showItemCount=false] - Whether to show item count text (e.g., "1-10 of 100").
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {string} [props.ariaLabel] - Custom aria-label for the nav element.
 *
 * @example
 * <Pagination
 *   totalItems={100}
 *   itemsPerPage={10}
 *   currentPage={1}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 *
 * @example
 * <Pagination
 *   totalItems={250}
 *   itemsPerPage={25}
 *   currentPage={3}
 *   onPageChange={handlePageChange}
 *   showFirstLast
 *   showItemCount
 *   size="sm"
 * />
 */
function Pagination({
  totalItems,
  itemsPerPage = PAGINATION.defaultPageSize,
  currentPage,
  onPageChange,
  maxVisiblePages = PAGINATION.maxVisiblePages,
  showFirstLast = false,
  showPageInfo = false,
  showItemCount = false,
  size = 'md',
  className = '',
  testId,
  ariaLabel,
}) {
  const totalPages = useMemo(() => {
    if (!totalItems || totalItems <= 0 || !itemsPerPage || itemsPerPage <= 0) {
      return 0
    }
    return Math.ceil(totalItems / itemsPerPage)
  }, [totalItems, itemsPerPage])

  const safePage = useMemo(() => {
    if (!currentPage || currentPage < 1) {
      return 1
    }
    if (totalPages > 0 && currentPage > totalPages) {
      return totalPages
    }
    return currentPage
  }, [currentPage, totalPages])

  const isFirstPage = safePage <= 1
  const isLastPage = safePage >= totalPages

  /**
   * Computes the range of visible page numbers to display.
   */
  const visiblePages = useMemo(() => {
    if (totalPages <= 0) {
      return []
    }

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisiblePages / 2)
    let start = safePage - half
    let end = safePage + half

    if (start < 1) {
      start = 1
      end = maxVisiblePages
    }

    if (end > totalPages) {
      end = totalPages
      start = totalPages - maxVisiblePages + 1
    }

    const pages = []

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('ellipsis-start')
      }
    }

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    // Add last page and ellipsis if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }, [totalPages, safePage, maxVisiblePages])

  /**
   * Handles page change with bounds checking and screen reader announcement.
   */
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages || page === safePage) {
        return
      }

      if (typeof onPageChange === 'function') {
        onPageChange(page)
      }

      announceToScreenReader(`Page ${page} of ${totalPages}`, { priority: 'polite' })
    },
    [totalPages, safePage, onPageChange],
  )

  const handlePrevious = useCallback(() => {
    if (!isFirstPage) {
      handlePageChange(safePage - 1)
    }
  }, [isFirstPage, safePage, handlePageChange])

  const handleNext = useCallback(() => {
    if (!isLastPage) {
      handlePageChange(safePage + 1)
    }
  }, [isLastPage, safePage, handlePageChange])

  const handleFirst = useCallback(() => {
    if (!isFirstPage) {
      handlePageChange(1)
    }
  }, [isFirstPage, handlePageChange])

  const handleLast = useCallback(() => {
    if (!isLastPage) {
      handlePageChange(totalPages)
    }
  }, [isLastPage, totalPages, handlePageChange])

  /**
   * Handles keyboard events on page buttons.
   */
  const handleKeyDown = useCallback(
    (event, page) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handlePageChange(page)
      }
    },
    [handlePageChange],
  )

  // Size class mapping for page items
  const sizeClassMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const itemSizeClass = sizeClassMap[size] || sizeClassMap.md

  // Compute item count display
  const itemCountText = useMemo(() => {
    if (!showItemCount || totalItems <= 0) {
      return ''
    }

    const startItem = (safePage - 1) * itemsPerPage + 1
    const endItem = Math.min(safePage * itemsPerPage, totalItems)

    return `${startItem}–${endItem} of ${totalItems}`
  }, [showItemCount, totalItems, safePage, itemsPerPage])

  // Don't render if there are no pages or only one page
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`.trim()}
      aria-label={ariaLabel || 'Pagination'}
      data-testid={testId || 'pagination'}
    >
      {/* Item count / page info */}
      {(showItemCount || showPageInfo) && (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          {showItemCount && itemCountText && (
            <span data-testid={testId ? `${testId}-item-count` : 'pagination-item-count'}>
              {itemCountText}
            </span>
          )}
          {showPageInfo && (
            <span data-testid={testId ? `${testId}-page-info` : 'pagination-page-info'}>
              Page {safePage} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div
        className="hb-pagination"
        role="list"
        data-testid={testId ? `${testId}-controls` : 'pagination-controls'}
      >
        {/* First page button */}
        {showFirstLast && (
          <button
            type="button"
            className={`hb-pagination-item ${itemSizeClass} ${isFirstPage ? 'hb-pagination-item-disabled' : ''}`.trim()}
            onClick={handleFirst}
            disabled={isFirstPage}
            aria-label="Go to first page"
            data-testid={testId ? `${testId}-first` : 'pagination-first'}
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
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        )}

        {/* Previous button */}
        <button
          type="button"
          className={`hb-pagination-item ${itemSizeClass} ${isFirstPage ? 'hb-pagination-item-disabled' : ''}`.trim()}
          onClick={handlePrevious}
          disabled={isFirstPage}
          aria-label="Go to previous page"
          data-testid={testId ? `${testId}-prev` : 'pagination-prev'}
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page number buttons */}
        {visiblePages.map((page) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span
                key={page}
                className={`hb-pagination-item ${itemSizeClass} cursor-default`}
                aria-hidden="true"
                data-testid={testId ? `${testId}-${page}` : `pagination-${page}`}
              >
                …
              </span>
            )
          }

          const isActive = page === safePage

          return (
            <button
              key={page}
              type="button"
              className={`hb-pagination-item ${itemSizeClass} ${isActive ? 'hb-pagination-item-active' : ''}`.trim()}
              onClick={() => handlePageChange(page)}
              onKeyDown={(event) => handleKeyDown(event, page)}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
              data-testid={testId ? `${testId}-page-${page}` : `pagination-page-${page}`}
            >
              {page}
            </button>
          )
        })}

        {/* Next button */}
        <button
          type="button"
          className={`hb-pagination-item ${itemSizeClass} ${isLastPage ? 'hb-pagination-item-disabled' : ''}`.trim()}
          onClick={handleNext}
          disabled={isLastPage}
          aria-label="Go to next page"
          data-testid={testId ? `${testId}-next` : 'pagination-next'}
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            type="button"
            className={`hb-pagination-item ${itemSizeClass} ${isLastPage ? 'hb-pagination-item-disabled' : ''}`.trim()}
            onClick={handleLast}
            disabled={isLastPage}
            aria-label="Go to last page"
            data-testid={testId ? `${testId}-last` : 'pagination-last'}
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
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Screen reader only: current page context */}
      <div className="hb-sr-only" aria-live="polite">
        Page {safePage} of {totalPages}
      </div>
    </nav>
  )
}

export default Pagination

export { Pagination }