import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '@/hooks/useSearch'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader, handleKeyboardNavigation } from '@/utils/accessibility'

/**
 * Global search bar component for the portal header.
 *
 * Renders an input field with a search icon, a dropdown results panel with
 * keyboard navigation, recent searches, and a clear button. Uses the useSearch
 * hook for debounced filtering against the search index. Excludes
 * member-sensitive data from results. Styled with Honeybee CSS form/input
 * classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.placeholder='Search the portal...'] - Placeholder text for the search input.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.showRecentSearches=true] - Whether to show recent searches when input is focused with no query.
 * @param {boolean} [props.autoFocus=false] - Whether to auto-focus the input on mount.
 * @param {function} [props.onResultSelect] - Optional callback invoked when a result is selected.
 * @param {function} [props.onClose] - Optional callback invoked when the search dropdown closes.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <SearchBar />
 *
 * @example
 * <SearchBar
 *   placeholder="Search benefits, claims, documents..."
 *   size="sm"
 *   onResultSelect={(result) => handleResultSelect(result)}
 * />
 */
function SearchBar({
  placeholder = 'Search the portal...',
  className = '',
  size = 'md',
  showRecentSearches = true,
  autoFocus = false,
  onResultSelect,
  onClose,
  testId,
}) {
  const navigate = useNavigate()
  const { tagSearchPerformed } = useEventTagger()

  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    hasQuery,
    isQueryTooShort,
    clearSearch,
    selectResult,
    getHighlightedText,
    recentSearches,
  } = useSearch()

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const resultItemsRef = useRef([])

  const [ids] = useState(() => ({
    input: generateAriaId('hb-search-input'),
    listbox: generateAriaId('hb-search-listbox'),
    label: generateAriaId('hb-search-label'),
  }))

  /**
   * Category icon mapping for search result display.
   */
  const categoryIcons = useMemo(
    () => ({
      page: (
        <svg
          className="w-4 h-4 text-neutral-400 flex-shrink-0"
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
      ),
      document: (
        <svg
          className="w-4 h-4 text-neutral-400 flex-shrink-0"
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
      ),
    }),
    [],
  )

  /**
   * Size class mapping for the input.
   */
  const inputSizeClassMap = {
    sm: 'text-xs py-1.5 px-8',
    md: 'text-sm py-2 px-9',
    lg: 'text-base py-2.5 px-10',
  }

  const inputSizeClass = inputSizeClassMap[size] || inputSizeClassMap.md

  const iconSizeClassMap = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-5 h-5 left-3',
  }

  const iconSizeClass = iconSizeClassMap[size] || iconSizeClassMap.md

  /**
   * Opens the dropdown panel.
   */
  const openDropdown = useCallback(() => {
    setIsOpen(true)
    setActiveIndex(-1)
  }, [])

  /**
   * Closes the dropdown panel.
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)

    if (typeof onClose === 'function') {
      onClose()
    }
  }, [onClose])

  /**
   * Handles input change events.
   */
  const handleInputChange = useCallback(
    (event) => {
      const value = event.target.value
      setQuery(value)
      setActiveIndex(-1)

      if (value.trim().length > 0) {
        openDropdown()
      }
    },
    [setQuery, openDropdown],
  )

  /**
   * Handles input focus events.
   */
  const handleInputFocus = useCallback(() => {
    if (hasQuery || (showRecentSearches && recentSearches.length > 0)) {
      openDropdown()
    }
  }, [hasQuery, showRecentSearches, recentSearches, openDropdown])

  /**
   * Navigates to a search result.
   */
  const handleNavigateToResult = useCallback(
    (result) => {
      if (!result) {
        return
      }

      selectResult(result)

      tagSearchPerformed({
        query: query.trim(),
        resultId: result.id,
        resultTitle: result.title,
        resultCategory: result.category,
      })

      if (typeof onResultSelect === 'function') {
        onResultSelect(result)
      }

      if (result.externalUrl) {
        try {
          window.open(result.externalUrl, '_blank', 'noopener,noreferrer')
        } catch (_error) {
          // Silently fail if popup is blocked
        }
      } else if (result.route) {
        navigate(result.route)
      }

      closeDropdown()
      clearSearch()

      if (inputRef.current) {
        inputRef.current.blur()
      }
    },
    [selectResult, tagSearchPerformed, query, onResultSelect, navigate, closeDropdown, clearSearch],
  )

  /**
   * Handles selecting a recent search term.
   */
  const handleRecentSearchSelect = useCallback(
    (searchTerm) => {
      setQuery(searchTerm)
      openDropdown()

      if (inputRef.current) {
        inputRef.current.focus()
      }
    },
    [setQuery, openDropdown],
  )

  /**
   * Handles clearing the search input.
   */
  const handleClear = useCallback(() => {
    clearSearch()
    closeDropdown()

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [clearSearch, closeDropdown])

  /**
   * Handles keyboard events on the search input.
   */
  const handleInputKeyDown = useCallback(
    (event) => {
      if (!isOpen) {
        if (event.key === 'ArrowDown' && (hasResults || (showRecentSearches && recentSearches.length > 0))) {
          event.preventDefault()
          openDropdown()
          setActiveIndex(0)
          return
        }
        return
      }

      const totalItems = hasResults ? results.length : showRecentSearches ? recentSearches.length : 0

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          setActiveIndex((prev) => {
            const next = prev + 1
            return next >= totalItems ? 0 : next
          })
          break
        }

        case 'ArrowUp': {
          event.preventDefault()
          setActiveIndex((prev) => {
            const next = prev - 1
            return next < 0 ? totalItems - 1 : next
          })
          break
        }

        case 'Enter': {
          event.preventDefault()
          if (activeIndex >= 0) {
            if (hasResults && results[activeIndex]) {
              handleNavigateToResult(results[activeIndex])
            } else if (!hasResults && showRecentSearches && recentSearches[activeIndex]) {
              handleRecentSearchSelect(recentSearches[activeIndex])
            }
          }
          break
        }

        case 'Escape': {
          event.preventDefault()
          closeDropdown()

          if (inputRef.current) {
            inputRef.current.blur()
          }
          break
        }

        case 'Home': {
          if (isOpen && totalItems > 0) {
            event.preventDefault()
            setActiveIndex(0)
          }
          break
        }

        case 'End': {
          if (isOpen && totalItems > 0) {
            event.preventDefault()
            setActiveIndex(totalItems - 1)
          }
          break
        }

        default:
          break
      }
    },
    [
      isOpen,
      hasResults,
      results,
      showRecentSearches,
      recentSearches,
      activeIndex,
      openDropdown,
      closeDropdown,
      handleNavigateToResult,
      handleRecentSearchSelect,
    ],
  )

  /**
   * Scrolls the active result item into view.
   */
  useEffect(() => {
    if (activeIndex >= 0 && resultItemsRef.current[activeIndex]) {
      resultItemsRef.current[activeIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }
  }, [activeIndex])

  /**
   * Announces search results count to screen readers.
   */
  useEffect(() => {
    if (hasQuery && !isSearching) {
      if (hasResults) {
        announceToScreenReader(
          `${results.length} ${results.length === 1 ? 'result' : 'results'} found`,
          { priority: 'polite' },
        )
      } else if (!isQueryTooShort) {
        announceToScreenReader('No results found', { priority: 'polite' })
      }
    }
  }, [hasQuery, isSearching, hasResults, results.length, isQueryTooShort])

  /**
   * Closes dropdown when clicking outside the search container.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeDropdown])

  /**
   * Renders highlighted text segments for a result title.
   */
  const renderHighlightedText = (text) => {
    const segments = getHighlightedText(text)

    return segments.map((segment, index) => {
      if (segment.highlighted) {
        return (
          <mark
            key={index}
            className="bg-hb-accent/20 text-neutral-900 rounded-sm px-0.5"
          >
            {segment.text}
          </mark>
        )
      }
      return <span key={index}>{segment.text}</span>
    })
  }

  /**
   * Determines whether to show the dropdown.
   */
  const showDropdown = isOpen && (hasResults || isSearching || isQueryTooShort || (!hasQuery && showRecentSearches && recentSearches.length > 0))

  /**
   * Determines whether to show recent searches section.
   */
  const showRecent = !hasQuery && showRecentSearches && recentSearches.length > 0

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`.trim()}
      data-testid={testId || 'search-bar'}
    >
      {/* Hidden label for accessibility */}
      <label id={ids.label} htmlFor={ids.input} className="hb-sr-only">
        Search the portal
      </label>

      {/* Search input container */}
      <div className="relative">
        {/* Search icon */}
        <svg
          className={`absolute top-1/2 -translate-y-1/2 ${iconSizeClass} text-neutral-400 pointer-events-none`}
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

        {/* Input field */}
        <input
          ref={inputRef}
          id={ids.input}
          type="text"
          className={`hb-input ${inputSizeClass} pr-8`.trim()}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? ids.listbox : undefined}
          aria-activedescendant={
            showDropdown && activeIndex >= 0
              ? `${ids.listbox}-option-${activeIndex}`
              : undefined
          }
          aria-labelledby={ids.label}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          data-testid={testId ? `${testId}-input` : 'search-bar-input'}
        />

        {/* Loading spinner */}
        {isSearching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <span
              className="hb-spinner-sm"
              aria-hidden="true"
              data-testid={testId ? `${testId}-spinner` : 'search-bar-spinner'}
            />
          </div>
        )}

        {/* Clear button */}
        {hasQuery && !isSearching && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-150 rounded-sm"
            onClick={handleClear}
            aria-label="Clear search"
            data-testid={testId ? `${testId}-clear` : 'search-bar-clear'}
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

      {/* Dropdown results panel */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id={ids.listbox}
          className="absolute top-full left-0 right-0 mt-1 bg-surface-primary rounded-lg border border-neutral-200 overflow-hidden max-h-80 hb-scrollable"
          style={{ boxShadow: 'var(--hb-shadow-dropdown)', zIndex: 'var(--hb-z-dropdown)' }}
          role="listbox"
          aria-label="Search results"
          data-testid={testId ? `${testId}-dropdown` : 'search-bar-dropdown'}
        >
          {/* Recent searches */}
          {showRecent && (
            <div className="py-2">
              <div className="px-3 py-1.5">
                <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Recent Searches
                </span>
              </div>
              {recentSearches.map((searchTerm, index) => {
                const isActive = activeIndex === index

                return (
                  <button
                    key={`recent-${index}`}
                    ref={(el) => {
                      resultItemsRef.current[index] = el
                    }}
                    id={`${ids.listbox}-option-${index}`}
                    type="button"
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors duration-150 ${
                      isActive
                        ? 'bg-hb-primary/5 text-hb-primary'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleRecentSearchSelect(searchTerm)}
                    data-testid={
                      testId
                        ? `${testId}-recent-${index}`
                        : `search-bar-recent-${index}`
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"
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
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="hb-text-truncate">{searchTerm}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Search results */}
          {hasQuery && hasResults && (
            <div className="py-1">
              <div className="px-3 py-1.5">
                <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Results ({results.length})
                </span>
              </div>
              {results.map((result, index) => {
                const isActive = activeIndex === index
                const categoryIcon = categoryIcons[result.category] || categoryIcons.page

                return (
                  <button
                    key={result.id}
                    ref={(el) => {
                      resultItemsRef.current[index] = el
                    }}
                    id={`${ids.listbox}-option-${index}`}
                    type="button"
                    className={`flex items-start gap-2.5 w-full px-3 py-2.5 text-left transition-colors duration-150 ${
                      isActive
                        ? 'bg-hb-primary/5'
                        : 'hover:bg-neutral-50'
                    }`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleNavigateToResult(result)}
                    data-testid={
                      testId
                        ? `${testId}-result-${index}`
                        : `search-bar-result-${index}`
                    }
                  >
                    <div className="mt-0.5">{categoryIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium leading-snug ${
                          isActive ? 'text-hb-primary' : 'text-neutral-800'
                        }`}
                      >
                        {renderHighlightedText(result.title)}
                      </div>
                      {result.description && (
                        <div className="text-xs text-neutral-500 mt-0.5 hb-text-truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                    {result.externalUrl && (
                      <svg
                        className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* No results state */}
          {hasQuery && !hasResults && !isSearching && !isQueryTooShort && (
            <div
              className="px-4 py-6 text-center"
              data-testid={testId ? `${testId}-no-results` : 'search-bar-no-results'}
            >
              <svg
                className="w-8 h-8 text-neutral-300 mx-auto mb-2"
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
              <p className="text-sm text-neutral-500">
                No results found for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Try a different search term
              </p>
            </div>
          )}

          {/* Query too short hint */}
          {isQueryTooShort && !isSearching && (
            <div
              className="px-4 py-4 text-center"
              data-testid={testId ? `${testId}-too-short` : 'search-bar-too-short'}
            >
              <p className="text-xs text-neutral-400">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {/* Keyboard hint */}
          {(hasResults || showRecent) && (
            <div className="px-3 py-2 border-t border-neutral-100 bg-surface-secondary">
              <div className="flex items-center gap-3 text-2xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 bg-neutral-100 border border-neutral-200 rounded text-2xs font-mono">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 bg-neutral-100 border border-neutral-200 rounded text-2xs font-mono">
                    ↵
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 bg-neutral-100 border border-neutral-200 rounded text-2xs font-mono">
                    esc
                  </kbd>
                  close
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen reader live region for result count */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {isSearching && 'Searching...'}
        {!isSearching && hasQuery && hasResults && `${results.length} results available`}
        {!isSearching && hasQuery && !hasResults && !isQueryTooShort && 'No results found'}
      </div>
    </div>
  )
}

export default SearchBar

export { SearchBar }