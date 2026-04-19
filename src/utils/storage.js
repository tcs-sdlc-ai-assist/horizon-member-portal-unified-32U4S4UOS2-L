import { STORAGE_KEYS, SESSION } from '@/constants/constants'

const KEY_PREFIX = 'hb_'

const isLocalStorageAvailable = () => {
  try {
    const testKey = `${KEY_PREFIX}__storage_test__`
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return true
  } catch (_e) {
    return false
  }
}

const storageAvailable = isLocalStorageAvailable()

const prefixKey = (key) => {
  if (key.startsWith(KEY_PREFIX)) {
    return key
  }
  return `${KEY_PREFIX}${key}`
}

const getItem = (key, defaultValue = null) => {
  if (!storageAvailable) {
    return defaultValue
  }

  try {
    const prefixedKey = prefixKey(key)
    const raw = window.localStorage.getItem(prefixedKey)

    if (raw === null || raw === undefined) {
      return defaultValue
    }

    try {
      return JSON.parse(raw)
    } catch (_parseError) {
      return raw
    }
  } catch (error) {
    console.warn(`[storage] Failed to get item "${key}":`, error)
    return defaultValue
  }
}

const setItem = (key, value) => {
  if (!storageAvailable) {
    console.warn('[storage] localStorage is not available')
    return false
  }

  try {
    const prefixedKey = prefixKey(key)
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    window.localStorage.setItem(prefixedKey, serialized)
    return true
  } catch (error) {
    console.warn(`[storage] Failed to set item "${key}":`, error)
    return false
  }
}

const removeItem = (key) => {
  if (!storageAvailable) {
    return false
  }

  try {
    const prefixedKey = prefixKey(key)
    window.localStorage.removeItem(prefixedKey)
    return true
  } catch (error) {
    console.warn(`[storage] Failed to remove item "${key}":`, error)
    return false
  }
}

const clear = () => {
  if (!storageAvailable) {
    return false
  }

  try {
    const keysToRemove = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key)
    })

    return true
  } catch (error) {
    console.warn('[storage] Failed to clear prefixed items:', error)
    return false
  }
}

const has = (key) => {
  if (!storageAvailable) {
    return false
  }

  try {
    const prefixedKey = prefixKey(key)
    return window.localStorage.getItem(prefixedKey) !== null
  } catch (error) {
    console.warn(`[storage] Failed to check item "${key}":`, error)
    return false
  }
}

const getKeys = () => {
  if (!storageAvailable) {
    return []
  }

  try {
    const keys = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(KEY_PREFIX)) {
        keys.push(key)
      }
    }
    return keys
  } catch (error) {
    console.warn('[storage] Failed to get keys:', error)
    return []
  }
}

const getTheme = () => getItem(STORAGE_KEYS.theme, 'light')

const setTheme = (theme) => setItem(STORAGE_KEYS.theme, theme)

const getSidebarCollapsed = () => getItem(STORAGE_KEYS.sidebarCollapsed, false)

const setSidebarCollapsed = (collapsed) => setItem(STORAGE_KEYS.sidebarCollapsed, collapsed)

const getRecentSearches = () => getItem(STORAGE_KEYS.recentSearches, [])

const setRecentSearches = (searches) => setItem(STORAGE_KEYS.recentSearches, searches)

const addRecentSearch = (query, maxItems = 10) => {
  const searches = getRecentSearches()
  const filtered = searches.filter((s) => s !== query)
  filtered.unshift(query)
  return setRecentSearches(filtered.slice(0, maxItems))
}

const clearRecentSearches = () => removeItem(STORAGE_KEYS.recentSearches)

const getDismissedBanners = () => getItem(STORAGE_KEYS.dismissedBanners, [])

const dismissBanner = (bannerId) => {
  const dismissed = getDismissedBanners()
  if (!dismissed.includes(bannerId)) {
    dismissed.push(bannerId)
    return setItem(STORAGE_KEYS.dismissedBanners, dismissed)
  }
  return true
}

const isBannerDismissed = (bannerId) => {
  const dismissed = getDismissedBanners()
  return dismissed.includes(bannerId)
}

const getNotificationPreferences = () => getItem(STORAGE_KEYS.notificationPreferences, {})

const setNotificationPreferences = (prefs) => setItem(STORAGE_KEYS.notificationPreferences, prefs)

const getDashboardLayout = () => getItem(STORAGE_KEYS.dashboardLayout, null)

const setDashboardLayout = (layout) => setItem(STORAGE_KEYS.dashboardLayout, layout)

const getPreferredLanguage = () => getItem(STORAGE_KEYS.preferredLanguage, 'en')

const setPreferredLanguage = (language) => setItem(STORAGE_KEYS.preferredLanguage, language)

const getSessionToken = () => getItem(SESSION.tokenKey, null)

const setSessionToken = (token) => setItem(SESSION.tokenKey, token)

const removeSessionToken = () => removeItem(SESSION.tokenKey)

const getRefreshToken = () => getItem(SESSION.refreshTokenKey, null)

const setRefreshToken = (token) => setItem(SESSION.refreshTokenKey, token)

const removeRefreshToken = () => removeItem(SESSION.refreshTokenKey)

const getLastActivity = () => getItem(SESSION.lastActivityKey, null)

const setLastActivity = (timestamp = Date.now()) => setItem(SESSION.lastActivityKey, timestamp)

const clearSession = () => {
  removeSessionToken()
  removeRefreshToken()
  removeItem(SESSION.lastActivityKey)
  removeItem(SESSION.storageKey)
  return true
}

const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  has,
  getKeys,
  isAvailable: () => storageAvailable,

  getTheme,
  setTheme,
  getSidebarCollapsed,
  setSidebarCollapsed,
  getRecentSearches,
  setRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getDismissedBanners,
  dismissBanner,
  isBannerDismissed,
  getNotificationPreferences,
  setNotificationPreferences,
  getDashboardLayout,
  setDashboardLayout,
  getPreferredLanguage,
  setPreferredLanguage,

  getSessionToken,
  setSessionToken,
  removeSessionToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getLastActivity,
  setLastActivity,
  clearSession,
}

export default storage

export {
  getItem,
  setItem,
  removeItem,
  clear,
  has,
  getKeys,
  getTheme,
  setTheme,
  getSidebarCollapsed,
  setSidebarCollapsed,
  getRecentSearches,
  setRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getDismissedBanners,
  dismissBanner,
  isBannerDismissed,
  getNotificationPreferences,
  setNotificationPreferences,
  getDashboardLayout,
  setDashboardLayout,
  getPreferredLanguage,
  setPreferredLanguage,
  getSessionToken,
  setSessionToken,
  removeSessionToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getLastActivity,
  setLastActivity,
  clearSession,
}