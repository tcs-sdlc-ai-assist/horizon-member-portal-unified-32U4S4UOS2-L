import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { WIDGET_TYPE } from '@/constants/constants'
import storage from '@/utils/storage'
import { useAuth } from '@/context/AuthContext'

const WidgetContext = createContext(null)

const WIDGET_PREFS_KEY_PREFIX = 'dashboardWidgetPrefs_'

const DEFAULT_WIDGET_ORDER = [
  WIDGET_TYPE.QUICK_ACTIONS,
  WIDGET_TYPE.BENEFITS_SUMMARY,
  WIDGET_TYPE.RECENT_CLAIMS,
  WIDGET_TYPE.DEDUCTIBLE_PROGRESS,
  WIDGET_TYPE.SPENDING_TRACKER,
  WIDGET_TYPE.ID_CARD,
  WIDGET_TYPE.NOTIFICATIONS,
  WIDGET_TYPE.UPCOMING_APPOINTMENTS,
  WIDGET_TYPE.PLAN_HIGHLIGHTS,
  WIDGET_TYPE.COST_ESTIMATOR,
  WIDGET_TYPE.CLAIMS_OVERVIEW,
]

const DEFAULT_WIDGET_VISIBILITY = {
  [WIDGET_TYPE.QUICK_ACTIONS]: true,
  [WIDGET_TYPE.BENEFITS_SUMMARY]: true,
  [WIDGET_TYPE.RECENT_CLAIMS]: true,
  [WIDGET_TYPE.DEDUCTIBLE_PROGRESS]: true,
  [WIDGET_TYPE.SPENDING_TRACKER]: true,
  [WIDGET_TYPE.ID_CARD]: true,
  [WIDGET_TYPE.NOTIFICATIONS]: true,
  [WIDGET_TYPE.UPCOMING_APPOINTMENTS]: true,
  [WIDGET_TYPE.PLAN_HIGHLIGHTS]: true,
  [WIDGET_TYPE.COST_ESTIMATOR]: false,
  [WIDGET_TYPE.CLAIMS_OVERVIEW]: false,
}

const VALID_WIDGET_IDS = Object.values(WIDGET_TYPE)

const getPrefsKey = (userId) => `${WIDGET_PREFS_KEY_PREFIX}${userId || 'default'}`

const isValidWidgetOrder = (order) => {
  if (!Array.isArray(order)) {
    return false
  }

  return order.every((id) => VALID_WIDGET_IDS.includes(id))
}

const isValidWidgetVisibility = (visibility) => {
  if (!visibility || typeof visibility !== 'object') {
    return false
  }

  return Object.entries(visibility).every(
    ([key, value]) => VALID_WIDGET_IDS.includes(key) && typeof value === 'boolean',
  )
}

/**
 * Retrieves widget preferences from localStorage for a given user.
 * @param {string} userId - The user ID.
 * @returns {{ widgetOrder: string[], widgetVisibility: object }} Widget preferences.
 */
export const getWidgetPrefs = (userId) => {
  const key = getPrefsKey(userId)
  const saved = storage.getItem(key, null)

  if (
    saved &&
    isValidWidgetOrder(saved.widgetOrder) &&
    isValidWidgetVisibility(saved.widgetVisibility)
  ) {
    return {
      widgetOrder: saved.widgetOrder,
      widgetVisibility: saved.widgetVisibility,
    }
  }

  return {
    widgetOrder: [...DEFAULT_WIDGET_ORDER],
    widgetVisibility: { ...DEFAULT_WIDGET_VISIBILITY },
  }
}

/**
 * Persists widget preferences to localStorage for a given user.
 * @param {string} userId - The user ID.
 * @param {{ widgetOrder: string[], widgetVisibility: object }} prefs - Widget preferences.
 * @returns {boolean} Whether the save was successful.
 */
export const setWidgetPrefs = (userId, prefs) => {
  if (!prefs || typeof prefs !== 'object') {
    return false
  }

  const { widgetOrder, widgetVisibility } = prefs

  if (!isValidWidgetOrder(widgetOrder)) {
    console.warn('[WidgetContext] Invalid widget order, not saving.')
    return false
  }

  if (!isValidWidgetVisibility(widgetVisibility)) {
    console.warn('[WidgetContext] Invalid widget visibility, not saving.')
    return false
  }

  const key = getPrefsKey(userId)
  return storage.setItem(key, { widgetOrder, widgetVisibility })
}

/**
 * Resets widget preferences to defaults for a given user.
 * @param {string} userId - The user ID.
 * @returns {boolean} Whether the reset was successful.
 */
export const resetWidgetPrefs = (userId) => {
  const key = getPrefsKey(userId)
  return storage.removeItem(key)
}

export function WidgetProvider({ children }) {
  const { currentUser } = useAuth()
  const userId = currentUser?.id || 'default'

  const [widgetOrder, setWidgetOrder] = useState(() => {
    const prefs = getWidgetPrefs(userId)
    return prefs.widgetOrder
  })

  const [widgetVisibility, setWidgetVisibility] = useState(() => {
    const prefs = getWidgetPrefs(userId)
    return prefs.widgetVisibility
  })

  useEffect(() => {
    const prefs = getWidgetPrefs(userId)
    setWidgetOrder(prefs.widgetOrder)
    setWidgetVisibility(prefs.widgetVisibility)
  }, [userId])

  useEffect(() => {
    setWidgetPrefs(userId, { widgetOrder, widgetVisibility })
  }, [userId, widgetOrder, widgetVisibility])

  const reorderWidgets = useCallback(
    (newOrder) => {
      if (!isValidWidgetOrder(newOrder)) {
        console.warn('[WidgetContext] Attempted to set invalid widget order.')
        return
      }

      setWidgetOrder(newOrder)
    },
    [],
  )

  const toggleWidgetVisibility = useCallback((widgetId) => {
    if (!VALID_WIDGET_IDS.includes(widgetId)) {
      console.warn(`[WidgetContext] Invalid widget ID: ${widgetId}`)
      return
    }

    setWidgetVisibility((prev) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }))
  }, [])

  const setWidgetVisible = useCallback((widgetId, visible) => {
    if (!VALID_WIDGET_IDS.includes(widgetId)) {
      console.warn(`[WidgetContext] Invalid widget ID: ${widgetId}`)
      return
    }

    if (typeof visible !== 'boolean') {
      console.warn('[WidgetContext] Visibility must be a boolean.')
      return
    }

    setWidgetVisibility((prev) => ({
      ...prev,
      [widgetId]: visible,
    }))
  }, [])

  const resetWidgets = useCallback(() => {
    resetWidgetPrefs(userId)
    setWidgetOrder([...DEFAULT_WIDGET_ORDER])
    setWidgetVisibility({ ...DEFAULT_WIDGET_VISIBILITY })
  }, [userId])

  const getVisibleWidgets = useCallback(
    () => widgetOrder.filter((widgetId) => widgetVisibility[widgetId] === true),
    [widgetOrder, widgetVisibility],
  )

  const getHiddenWidgets = useCallback(
    () => widgetOrder.filter((widgetId) => widgetVisibility[widgetId] === false),
    [widgetOrder, widgetVisibility],
  )

  const moveWidget = useCallback(
    (widgetId, direction) => {
      if (!VALID_WIDGET_IDS.includes(widgetId)) {
        return
      }

      setWidgetOrder((prev) => {
        const currentIndex = prev.indexOf(widgetId)

        if (currentIndex === -1) {
          return prev
        }

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= prev.length) {
          return prev
        }

        const updated = [...prev]
        const [removed] = updated.splice(currentIndex, 1)
        updated.splice(newIndex, 0, removed)
        return updated
      })
    },
    [],
  )

  const value = useMemo(
    () => ({
      widgetOrder,
      widgetVisibility,
      reorderWidgets,
      toggleWidgetVisibility,
      setWidgetVisible,
      resetWidgets,
      getVisibleWidgets,
      getHiddenWidgets,
      moveWidget,
    }),
    [
      widgetOrder,
      widgetVisibility,
      reorderWidgets,
      toggleWidgetVisibility,
      setWidgetVisible,
      resetWidgets,
      getVisibleWidgets,
      getHiddenWidgets,
      moveWidget,
    ],
  )

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  )
}

export function useWidgets() {
  const context = useContext(WidgetContext)

  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider')
  }

  return context
}

export default WidgetContext