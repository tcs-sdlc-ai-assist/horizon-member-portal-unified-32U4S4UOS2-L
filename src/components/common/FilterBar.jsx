import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'

/**
 * Reusable filter bar component with dropdown selects, date range inputs,
 * text search, and reset functionality. Accepts a filter configuration array
 * and onChange callback. Styled with Honeybee CSS form classes.
 *
 * Used by Claims and Document Center pages for filtering data.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.filters - Array of filter configuration objects.
 * @param {string} props.filters[].id - Unique identifier for the filter.
 * @param {string} props.filters[].label - Display label for the filter.
 * @param {string} props.filters[].type - Filter type: 'select', 'date', 'dateRange', 'text', 'multiSelect'.
 * @param {Array<{value: string, label: string}>} [props.filters[].options] - Options for select/multiSelect filters.
 * @param {string} [props.filters[].placeholder] - Placeholder text for the filter input.
 * @param {string} [props.filters[].defaultValue] - Default value for the filter.
 * @param {object} [props.filters[].dateRange] - Date range configuration for dateRange type.
 * @param {string} [props.filters[].dateRange.startLabel] - Label for the start date input.
 * @param {string} [props.filters[].dateRange.endLabel] - Label for the end date input.
 * @param {object} props.values - Current filter values keyed by filter id.
 * @param {function} props.onChange - Callback invoked with (filterId, value) when a filter changes.
 * @param {function} [props.onReset] - Callback invoked when the reset button is clicked.
 * @param {boolean} [props.showReset=true] - Whether to show the reset/clear all button.
 * @param {string} [props.resetLabel='Clear Filters'] - Label for the reset button.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.layout='inline'] - Layout variant: 'inline', 'stacked', 'grid'.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.collapsible=false] - Whether the filter bar is collapsible on mobile.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {string} [props.ariaLabel] - Custom aria-label for the filter bar.
 *
 * @example
 * <FilterBar
 *   filters={[
 *     { id: 'status', label: 'Status', type: 'select', options: [{ value: 'paid', label: 'Paid' }] },
 *     { id: 'type', label: 'Type', type: 'select', options: [{ value: 'medical', label: 'Medical' }] },
 *     { id: 'dateRange', label: 'Date Range', type: 'dateRange' },
 *   ]}
 *   values={{ status: '', type: '', dateRange: { start: '', end: '' } }}
 *   onChange={(filterId, value) => handleFilterChange(filterId, value)}
 *   onReset={handleReset}
 * />
 *
 * @example
 * <FilterBar
 *   filters={[
 *     { id: 'search', label: 'Search', type: 'text', placeholder: 'Search documents...' },
 *     { id: 'category', label: 'Category', type: 'select', options: categoryOptions },
 *   ]}
 *   values={filterValues}
 *   onChange={handleFilterChange}
 *   onReset={handleReset}
 *   layout="stacked"
 *   size="sm"
 * />
 */
function FilterBar({
  filters = [],
  values = {},
  onChange,
  onReset,
  showReset = true,
  resetLabel = 'Clear Filters',
  className = '',
  layout = 'inline',
  size = 'md',
  collapsible = false,
  testId,
  ariaLabel,
}) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  const filterBarRef = useRef(null)

  const [ids] = useState(() => ({
    filterBar: generateAriaId('hb-filter-bar'),
  }))

  /**
   * Determines if any filters have active (non-default) values.
   */
  const hasActiveFilters = useMemo(() => {
    if (!values || typeof values !== 'object') {
      return false
    }

    return filters.some((filter) => {
      const value = values[filter.id]

      if (filter.type === 'dateRange') {
        return (
          (value && typeof value === 'object' && (value.start || value.end)) ||
          false
        )
      }

      if (value === undefined || value === null || value === '') {
        return false
      }

      if (filter.defaultValue !== undefined && value === filter.defaultValue) {
        return false
      }

      return true
    })
  }, [filters, values])

  /**
   * Counts the number of active filters.
   */
  const activeFilterCount = useMemo(() => {
    if (!values || typeof values !== 'object') {
      return 0
    }

    return filters.reduce((count, filter) => {
      const value = values[filter.id]

      if (filter.type === 'dateRange') {
        if (value && typeof value === 'object' && (value.start || value.end)) {
          return count + 1
        }
        return count
      }

      if (value === undefined || value === null || value === '') {
        return count
      }

      if (filter.defaultValue !== undefined && value === filter.defaultValue) {
        return count
      }

      return count + 1
    }, 0)
  }, [filters, values])

  /**
   * Handles a filter value change.
   */
  const handleChange = useCallback(
    (filterId, value) => {
      if (typeof onChange === 'function') {
        onChange(filterId, value)
      }
    },
    [onChange],
  )

  /**
   * Handles the reset/clear all action.
   */
  const handleReset = useCallback(() => {
    if (typeof onReset === 'function') {
      onReset()
    }

    announceToScreenReader('All filters cleared', { priority: 'polite' })
  }, [onReset])

  /**
   * Toggles the expanded state for collapsible mode.
   */
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  /**
   * Handles date range changes by merging start/end into the value object.
   */
  const handleDateRangeChange = useCallback(
    (filterId, field, dateValue) => {
      const currentValue = values[filterId] || { start: '', end: '' }
      const updatedValue = {
        ...currentValue,
        [field]: dateValue,
      }
      handleChange(filterId, updatedValue)
    },
    [values, handleChange],
  )

  // Size class mapping for inputs
  const inputSizeClassMap = {
    sm: 'text-xs py-1.5 px-2.5',
    md: 'text-sm py-2.5 px-3',
    lg: 'text-base py-3 px-4',
  }

  const inputSizeClass = inputSizeClassMap[size] || inputSizeClassMap.md

  // Layout class mapping
  const layoutClassMap = {
    inline: 'flex flex-wrap items-end gap-3',
    stacked: 'flex flex-col gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-end',
  }

  const layoutClass = layoutClassMap[layout] || layoutClassMap.inline

  /**
   * Renders a single filter based on its type.
   */
  const renderFilter = (filter) => {
    const filterId = filter.id
    const filterValue = values[filterId]
    const inputId = `${ids.filterBar}-${filterId}`

    switch (filter.type) {
      case 'select': {
        return (
          <div
            key={filterId}
            className="hb-form-group min-w-[10rem] flex-shrink-0"
            data-testid={testId ? `${testId}-filter-${filterId}` : `filter-${filterId}`}
          >
            <label htmlFor={inputId} className="hb-label">
              {filter.label}
            </label>
            <select
              id={inputId}
              className={`hb-select ${inputSizeClass}`.trim()}
              value={filterValue || ''}
              onChange={(e) => handleChange(filterId, e.target.value)}
              aria-label={filter.label}
              data-testid={
                testId ? `${testId}-select-${filterId}` : `filter-select-${filterId}`
              }
            >
              <option value="">
                {filter.placeholder || `All ${filter.label}`}
              </option>
              {filter.options &&
                filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        )
      }

      case 'text': {
        return (
          <div
            key={filterId}
            className="hb-form-group min-w-[12rem] flex-1 max-w-xs"
            data-testid={testId ? `${testId}-filter-${filterId}` : `filter-${filterId}`}
          >
            <label htmlFor={inputId} className="hb-label">
              {filter.label}
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id={inputId}
                type="text"
                className={`hb-input pl-9 ${inputSizeClass}`.trim()}
                value={filterValue || ''}
                onChange={(e) => handleChange(filterId, e.target.value)}
                placeholder={filter.placeholder || `Search...`}
                aria-label={filter.label}
                data-testid={
                  testId ? `${testId}-input-${filterId}` : `filter-input-${filterId}`
                }
              />
              {filterValue && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
                  onClick={() => handleChange(filterId, '')}
                  aria-label={`Clear ${filter.label}`}
                  data-testid={
                    testId
                      ? `${testId}-clear-${filterId}`
                      : `filter-clear-${filterId}`
                  }
                >
                  <svg
                    className="w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      }

      case 'date': {
        return (
          <div
            key={filterId}
            className="hb-form-group min-w-[10rem] flex-shrink-0"
            data-testid={testId ? `${testId}-filter-${filterId}` : `filter-${filterId}`}
          >
            <label htmlFor={inputId} className="hb-label">
              {filter.label}
            </label>
            <input
              id={inputId}
              type="date"
              className={`hb-input ${inputSizeClass}`.trim()}
              value={filterValue || ''}
              onChange={(e) => handleChange(filterId, e.target.value)}
              aria-label={filter.label}
              data-testid={
                testId ? `${testId}-date-${filterId}` : `filter-date-${filterId}`
              }
            />
          </div>
        )
      }

      case 'dateRange': {
        const rangeValue = filterValue && typeof filterValue === 'object'
          ? filterValue
          : { start: '', end: '' }
        const startLabel = filter.dateRange?.startLabel || 'From'
        const endLabel = filter.dateRange?.endLabel || 'To'
        const startInputId = `${inputId}-start`
        const endInputId = `${inputId}-end`

        return (
          <div
            key={filterId}
            className="flex flex-wrap items-end gap-2"
            role="group"
            aria-label={filter.label}
            data-testid={testId ? `${testId}-filter-${filterId}` : `filter-${filterId}`}
          >
            <div className="hb-form-group min-w-[9rem] flex-shrink-0">
              <label htmlFor={startInputId} className="hb-label">
                {startLabel}
              </label>
              <input
                id={startInputId}
                type="date"
                className={`hb-input ${inputSizeClass}`.trim()}
                value={rangeValue.start || ''}
                max={rangeValue.end || undefined}
                onChange={(e) => handleDateRangeChange(filterId, 'start', e.target.value)}
                aria-label={`${filter.label} ${startLabel}`}
                data-testid={
                  testId
                    ? `${testId}-date-start-${filterId}`
                    : `filter-date-start-${filterId}`
                }
              />
            </div>
            <div className="hb-form-group min-w-[9rem] flex-shrink-0">
              <label htmlFor={endInputId} className="hb-label">
                {endLabel}
              </label>
              <input
                id={endInputId}
                type="date"
                className={`hb-input ${inputSizeClass}`.trim()}
                value={rangeValue.end || ''}
                min={rangeValue.start || undefined}
                onChange={(e) => handleDateRangeChange(filterId, 'end', e.target.value)}
                aria-label={`${filter.label} ${endLabel}`}
                data-testid={
                  testId
                    ? `${testId}-date-end-${filterId}`
                    : `filter-date-end-${filterId}`
                }
              />
            </div>
          </div>
        )
      }

      case 'multiSelect': {
        return (
          <div
            key={filterId}
            className="hb-form-group min-w-[10rem] flex-shrink-0"
            data-testid={testId ? `${testId}-filter-${filterId}` : `filter-${filterId}`}
          >
            <label htmlFor={inputId} className="hb-label">
              {filter.label}
            </label>
            <select
              id={inputId}
              className={`hb-select ${inputSizeClass}`.trim()}
              multiple
              value={Array.isArray(filterValue) ? filterValue : []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, (opt) => opt.value)
                handleChange(filterId, selectedOptions)
              }}
              aria-label={filter.label}
              data-testid={
                testId
                  ? `${testId}-multiselect-${filterId}`
                  : `filter-multiselect-${filterId}`
              }
            >
              {filter.options &&
                filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Don't render if no filters are configured
  if (!filters || filters.length === 0) {
    return null
  }

  return (
    <div
      ref={filterBarRef}
      className={`bg-surface-primary border border-neutral-200 rounded-lg p-4 ${className}`.trim()}
      role="search"
      aria-label={ariaLabel || 'Filter results'}
      data-testid={testId || 'filter-bar'}
    >
      {/* Collapsible toggle header */}
      {collapsible && (
        <div className="flex items-center justify-between mb-3 sm:mb-0 sm:hidden">
          <button
            type="button"
            className="hb-btn-sm hb-btn-ghost flex items-center gap-2 text-neutral-700"
            onClick={handleToggleExpand}
            aria-expanded={isExpanded}
            aria-controls={ids.filterBar}
            data-testid={testId ? `${testId}-toggle` : 'filter-bar-toggle'}
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
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span className="text-sm font-medium">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-2xs font-semibold rounded-full bg-hb-primary text-white">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
        </div>
      )}

      {/* Filter controls */}
      <div
        id={ids.filterBar}
        className={`${collapsible && !isExpanded ? 'hidden sm:block' : ''}`}
      >
        <div className={layoutClass}>
          {filters.map((filter) => renderFilter(filter))}

          {/* Reset button */}
          {showReset && (
            <div className="flex items-end flex-shrink-0">
              <button
                type="button"
                className={`hb-btn-${size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} hb-btn-ghost text-neutral-500 hover:text-neutral-700 ${!hasActiveFilters ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`.trim()}
                onClick={handleReset}
                disabled={!hasActiveFilters}
                aria-label={resetLabel}
                data-testid={testId ? `${testId}-reset` : 'filter-bar-reset'}
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
                {resetLabel}
              </button>
            </div>
          )}
        </div>

        {/* Active filter count summary for screen readers */}
        {hasActiveFilters && (
          <div className="hb-sr-only" aria-live="polite">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterBar

export { FilterBar }