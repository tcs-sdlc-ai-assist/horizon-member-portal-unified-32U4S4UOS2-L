import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { filterSearchIndex, highlightMatch, debounce } from '@/utils/searchUtils'
import { addRecentSearch, getRecentSearches } from '@/utils/storage'

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
const DEBOUNCE_DELAY_MS = 300
const MIN_QUERY_LENGTH = 2
const MAX_RESULTS = 20

/**
 * Custom React hook for portal search functionality.
 *
 * Manages search query state, debounced filtering against the searchIndex,
 * and result formatting. Persists recent searches to localStorage.
 *
 * @param {object} [options] - Configuration options.
 * @param {number} [options.debounceMs=300] - Debounce delay in milliseconds.
 * @param {number} [options.minQueryLength=2] - Minimum query length before searching.
 * @param {number} [options.maxResults=20] - Maximum number of results to return.
 * @param {string} [options.category] - Filter results by category (e.g., 'page', 'document').
 * @param {boolean} [options.persistRecent=true] - Whether to persist recent searches to localStorage.
 * @returns {object} Search state and control methods.
 *
 * @example
 * const { query, setQuery, results, isSearching, clearSearch, recentSearches } = useSearch()
 */
function useSearch(options = {}) {
  const {
    debounceMs = DEBOUNCE_DELAY_MS,
    minQueryLength = MIN_QUERY_LENGTH,
    maxResults = MAX_RESULTS,
    category,
    persistRecent = true,
  } = options

  const [query, setQueryState] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    if (persistRecent) {
      return getRecentSearches()
    }
    return []
  })

  const debouncedSearchRef = useRef(null)
  const isMountedRef = useRef(true)

  // Perform the actual search against the index
  const performSearch = useCallback(
    (searchQuery) => {
      if (!isMountedRef.current) {
        return
      }

      const trimmedQuery = searchQuery.trim()

      if (!trimmedQuery || trimmedQuery.length < minQueryLength) {
        setResults([])
        setIsSearching(false)
        return
      }

      const searchResults = filterSearchIndex(trimmedQuery, {
        maxResults,
        category,
      })

      if (isMountedRef.current) {
        setResults(searchResults)
        setIsSearching(false)
      }
    },
    [minQueryLength, maxResults, category],
  )

  // Create debounced search function
  useEffect(() => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current.cancel()
    }

    debouncedSearchRef.current = debounce(performSearch, debounceMs)

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
    }
  }, [performSearch, debounceMs])

  /**
   * Updates the search query and triggers a debounced search.
   * @param {string} newQuery - The new search query string.
   */
  const setQuery = useCallback(
    (newQuery) => {
      const queryValue = typeof newQuery === 'string' ? newQuery : ''
      setQueryState(queryValue)

      const trimmed = queryValue.trim()

      if (!trimmed || trimmed.length < minQueryLength) {
        setResults([])
        setIsSearching(false)

        if (debouncedSearchRef.current) {
          debouncedSearchRef.current.cancel()
        }
        return
      }

      setIsSearching(true)

      if (debouncedSearchRef.current) {
        debouncedSearchRef.current(queryValue)
      }
    },
    [minQueryLength],
  )

  /**
   * Clears the search query and results.
   */
  const clearSearch = useCallback(() => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current.cancel()
    }

    setQueryState('')
    setResults([])
    setIsSearching(false)
  }, [])

  /**
   * Selects a search result and persists the query to recent searches.
   * @param {object} result - The selected search result item.
   */
  const selectResult = useCallback(
    (result) => {
      const trimmedQuery = query.trim()

      if (persistRecent && trimmedQuery.length >= minQueryLength) {
        addRecentSearch(trimmedQuery)
        setRecentSearches(getRecentSearches())
      }

      return result
    },
    [query, persistRecent, minQueryLength],
  )

  /**
   * Returns highlighted text segments for a given text and the current query.
   * @param {string} text - The text to highlight.
   * @returns {Array<{text: string, highlighted: boolean}>} Array of text segments.
   */
  const getHighlightedText = useCallback(
    (text) => highlightMatch(text, query),
    [query],
  )

  /**
   * Refreshes the recent searches list from localStorage.
   */
  const refreshRecentSearches = useCallback(() => {
    if (persistRecent) {
      setRecentSearches(getRecentSearches())
    }
  }, [persistRecent])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
    }
  }, [])

  const hasResults = results.length > 0
  const hasQuery = query.trim().length > 0
  const isQueryTooShort = hasQuery && query.trim().length < minQueryLength

  const value = useMemo(
    () => ({
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
      refreshRecentSearches,
    }),
    [
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
      refreshRecentSearches,
    ],
  )

  return value
}

export default useSearch

export { useSearch }