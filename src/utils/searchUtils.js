import searchIndex from '@/data/searchIndex'

// -----------------------------------------------------------------------------
// Search Utility Functions
// -----------------------------------------------------------------------------

/**
 * Normalizes a string for search comparison by lowercasing and trimming.
 * @param {string} str - The string to normalize.
 * @returns {string} Normalized string.
 */
const normalizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return ''
  }
  return str.toLowerCase().trim()
}

/**
 * Calculates a relevance score for a search result based on where and how the query matches.
 * @param {object} item - The search index item.
 * @param {string} normalizedQuery - The normalized search query.
 * @returns {number} Relevance score (higher is more relevant).
 */
const calculateRelevanceScore = (item, normalizedQuery) => {
  let score = 0

  const normalizedTitle = normalizeString(item.title)
  const normalizedDescription = normalizeString(item.description)

  // Exact title match
  if (normalizedTitle === normalizedQuery) {
    score += 100
  }

  // Title starts with query
  if (normalizedTitle.startsWith(normalizedQuery)) {
    score += 75
  }

  // Title contains query
  if (normalizedTitle.includes(normalizedQuery)) {
    score += 50
  }

  // Description contains query
  if (normalizedDescription.includes(normalizedQuery)) {
    score += 25
  }

  // Keyword matches
  if (item.keywords && Array.isArray(item.keywords)) {
    for (const keyword of item.keywords) {
      const normalizedKeyword = normalizeString(keyword)

      if (normalizedKeyword === normalizedQuery) {
        score += 40
      } else if (normalizedKeyword.startsWith(normalizedQuery)) {
        score += 30
      } else if (normalizedKeyword.includes(normalizedQuery)) {
        score += 15
      }
    }
  }

  return score
}

/**
 * Checks whether a search index item matches a query using fuzzy matching
 * on title, description, and keywords.
 * @param {object} item - The search index item.
 * @param {string} normalizedQuery - The normalized search query.
 * @returns {boolean} Whether the item matches the query.
 */
const itemMatchesQuery = (item, normalizedQuery) => {
  if (!normalizedQuery) {
    return false
  }

  const normalizedTitle = normalizeString(item.title)
  const normalizedDescription = normalizeString(item.description)

  if (normalizedTitle.includes(normalizedQuery)) {
    return true
  }

  if (normalizedDescription.includes(normalizedQuery)) {
    return true
  }

  if (item.keywords && Array.isArray(item.keywords)) {
    for (const keyword of item.keywords) {
      if (normalizeString(keyword).includes(normalizedQuery)) {
        return true
      }
    }
  }

  // Fuzzy match: check if all individual words in the query appear somewhere in the item
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean)

  if (queryWords.length > 1) {
    const combinedText = `${normalizedTitle} ${normalizedDescription} ${
      item.keywords ? item.keywords.map(normalizeString).join(' ') : ''
    }`

    return queryWords.every((word) => combinedText.includes(word))
  }

  return false
}

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Filters the search index against a query string using fuzzy matching
 * on title, description, and keywords. Results are sorted by relevance.
 *
 * @param {string} query - The search query string.
 * @param {object} [options] - Configuration options.
 * @param {object[]} [options.index] - Custom search index to filter (defaults to searchIndex data).
 * @param {number} [options.maxResults=20] - Maximum number of results to return.
 * @param {string} [options.category] - Filter results by category (e.g., 'page', 'document').
 * @returns {object[]} Array of matching search index items sorted by relevance.
 */
const filterSearchIndex = (query, options = {}) => {
  const {
    index = searchIndex,
    maxResults = 20,
    category,
  } = options

  if (!query || typeof query !== 'string') {
    return []
  }

  const normalizedQuery = normalizeString(query)

  if (normalizedQuery.length === 0) {
    return []
  }

  let items = index

  if (category) {
    items = items.filter((item) => item.category === category)
  }

  const matches = []

  for (const item of items) {
    if (itemMatchesQuery(item, normalizedQuery)) {
      const score = calculateRelevanceScore(item, normalizedQuery)
      matches.push({ ...item, _relevanceScore: score })
    }
  }

  matches.sort((a, b) => b._relevanceScore - a._relevanceScore)

  return matches.slice(0, maxResults).map(({ _relevanceScore, ...item }) => item)
}

/**
 * Wraps matched portions of text with a highlight marker for display.
 * Returns an array of objects with `text` and `highlighted` properties
 * suitable for rendering in React components.
 *
 * @param {string} text - The full text to search within.
 * @param {string} query - The search query to highlight.
 * @returns {Array<{text: string, highlighted: boolean}>} Array of text segments.
 */
const highlightMatch = (text, query) => {
  if (!text || typeof text !== 'string') {
    return [{ text: '', highlighted: false }]
  }

  if (!query || typeof query !== 'string') {
    return [{ text, highlighted: false }]
  }

  const normalizedQuery = normalizeString(query)

  if (normalizedQuery.length === 0) {
    return [{ text, highlighted: false }]
  }

  const segments = []
  const lowerText = text.toLowerCase()
  let lastIndex = 0

  let searchFrom = 0

  while (searchFrom < lowerText.length) {
    const matchIndex = lowerText.indexOf(normalizedQuery, searchFrom)

    if (matchIndex === -1) {
      break
    }

    // Add non-highlighted segment before the match
    if (matchIndex > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, matchIndex),
        highlighted: false,
      })
    }

    // Add highlighted segment
    segments.push({
      text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
      highlighted: true,
    })

    lastIndex = matchIndex + normalizedQuery.length
    searchFrom = lastIndex
  }

  // Add remaining non-highlighted text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlighted: false,
    })
  }

  if (segments.length === 0) {
    return [{ text, highlighted: false }]
  }

  return segments
}

/**
 * Creates a debounced version of a function that delays invocation
 * until after `delay` milliseconds have elapsed since the last call.
 *
 * @param {function} fn - The function to debounce.
 * @param {number} [delay=300] - The debounce delay in milliseconds.
 * @returns {function} The debounced function with a `.cancel()` method.
 */
const debounce = (fn, delay = 300) => {
  if (typeof fn !== 'function') {
    throw new Error('debounce requires a function as the first argument.')
  }

  let timeoutId = null

  const debounced = (...args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = null
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const searchUtils = {
  filterSearchIndex,
  highlightMatch,
  debounce,
}

export default searchUtils

export {
  filterSearchIndex,
  highlightMatch,
  debounce,
}