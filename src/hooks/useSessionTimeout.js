import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SESSION } from '@/constants/constants'

// -----------------------------------------------------------------------------
// Activity events that reset the session timer
// -----------------------------------------------------------------------------
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

// -----------------------------------------------------------------------------
// Session States
// -----------------------------------------------------------------------------
const SESSION_STATE = {
  ACTIVE: 'active',
  WARNING: 'warning',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
}

/**
 * Custom React hook for session timeout management.
 *
 * Tracks user activity (mouse, keyboard, scroll, touch), shows a warning
 * before timeout, and triggers logout on expiry. Configurable timeout and
 * warning durations from environment variables via SESSION constants.
 *
 * @param {object} [options] - Configuration options.
 * @param {number} [options.timeoutMs] - Session timeout in milliseconds (defaults to SESSION.timeoutMs).
 * @param {number} [options.warningMs] - Warning prompt duration before timeout in milliseconds (defaults to SESSION.warningMs).
 * @param {function} [options.onWarning] - Callback invoked when the warning period begins.
 * @param {function} [options.onTimeout] - Callback invoked when the session expires.
 * @param {function} [options.onExtend] - Callback invoked when the session is extended by the user.
 * @param {boolean} [options.enabled=true] - Whether session timeout tracking is enabled.
 * @returns {object} Session timeout state and control methods.
 *
 * @example
 * const { sessionState, isWarningVisible, remainingTime, extendSession, logout } = useSessionTimeout({
 *   onWarning: () => console.log('Session expiring soon'),
 *   onTimeout: () => console.log('Session expired'),
 * })
 */
function useSessionTimeout(options = {}) {
  const {
    timeoutMs = SESSION.timeoutMs,
    warningMs = SESSION.warningMs,
    onWarning,
    onTimeout,
    onExtend,
    enabled = true,
  } = options

  const { isAuthenticated, logout: authLogout, extendSession: authExtendSession } = useAuth()

  const [sessionState, setSessionState] = useState(SESSION_STATE.INACTIVE)
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeoutMs)

  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const countdownRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const activityListenerAttached = useRef(false)

  /**
   * Clears all active timers.
   */
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  /**
   * Handles session expiration.
   */
  const handleTimeout = useCallback(() => {
    clearAllTimers()
    setSessionState(SESSION_STATE.EXPIRED)
    setIsWarningVisible(false)
    setRemainingTime(0)

    if (typeof onTimeout === 'function') {
      onTimeout()
    }

    authLogout()
  }, [clearAllTimers, onTimeout, authLogout])

  /**
   * Handles the warning phase before timeout.
   */
  const handleWarning = useCallback(() => {
    setSessionState(SESSION_STATE.WARNING)
    setIsWarningVisible(true)
    setRemainingTime(warningMs)

    if (typeof onWarning === 'function') {
      onWarning()
    }

    // Start countdown interval to update remaining time every second
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    const warningStartTime = Date.now()

    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - warningStartTime
      const remaining = Math.max(warningMs - elapsed, 0)
      setRemainingTime(remaining)

      if (remaining <= 0) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }, 1000)

    // Set the final timeout for session expiration
    timeoutRef.current = setTimeout(() => {
      handleTimeout()
    }, warningMs)
  }, [warningMs, onWarning, handleTimeout])

  /**
   * Resets all session timers and starts a new timeout cycle.
   */
  const resetTimers = useCallback(() => {
    clearAllTimers()

    if (!isAuthenticated || !enabled) {
      return
    }

    lastActivityRef.current = Date.now()
    setSessionState(SESSION_STATE.ACTIVE)
    setIsWarningVisible(false)
    setRemainingTime(timeoutMs)

    const warningDelay = timeoutMs - warningMs

    if (warningDelay > 0) {
      warningRef.current = setTimeout(() => {
        handleWarning()
      }, warningDelay)
    } else {
      // If warning duration >= timeout duration, show warning immediately
      handleWarning()
    }
  }, [clearAllTimers, isAuthenticated, enabled, timeoutMs, warningMs, handleWarning])

  /**
   * Handles user activity events by resetting the session timers.
   */
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated || !enabled) {
      return
    }

    // Only reset if we are not already in the warning state
    // (user must explicitly extend session during warning)
    if (sessionState !== SESSION_STATE.WARNING) {
      lastActivityRef.current = Date.now()
      resetTimers()
    }
  }, [isAuthenticated, enabled, sessionState, resetTimers])

  /**
   * Extends the session, dismissing the warning and resetting timers.
   */
  const extendSession = useCallback(() => {
    if (!isAuthenticated) {
      return
    }

    clearAllTimers()
    setSessionState(SESSION_STATE.ACTIVE)
    setIsWarningVisible(false)
    setRemainingTime(timeoutMs)
    lastActivityRef.current = Date.now()

    authExtendSession()

    if (typeof onExtend === 'function') {
      onExtend()
    }

    resetTimers()
  }, [isAuthenticated, clearAllTimers, timeoutMs, authExtendSession, onExtend, resetTimers])

  /**
   * Logs the user out immediately.
   */
  const logout = useCallback(() => {
    clearAllTimers()
    setSessionState(SESSION_STATE.EXPIRED)
    setIsWarningVisible(false)
    setRemainingTime(0)
    authLogout()
  }, [clearAllTimers, authLogout])

  // Attach/detach activity event listeners based on authentication state
  useEffect(() => {
    if (isAuthenticated && enabled && !activityListenerAttached.current) {
      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, handleUserActivity, { passive: true })
      })
      activityListenerAttached.current = true
      resetTimers()
    }

    if ((!isAuthenticated || !enabled) && activityListenerAttached.current) {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      activityListenerAttached.current = false
      clearAllTimers()

      if (!isAuthenticated) {
        setSessionState(SESSION_STATE.INACTIVE)
        setIsWarningVisible(false)
        setRemainingTime(timeoutMs)
      }
    }

    return () => {
      if (activityListenerAttached.current) {
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, handleUserActivity)
        })
        activityListenerAttached.current = false
      }
      clearAllTimers()
    }
  }, [isAuthenticated, enabled, handleUserActivity, resetTimers, clearAllTimers, timeoutMs])

  /**
   * Returns the remaining time formatted as "M:SS".
   * @returns {string} Formatted remaining time string.
   */
  const formattedRemainingTime = useCallback(() => {
    const totalSeconds = Math.ceil(remainingTime / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [remainingTime])

  return {
    sessionState,
    isWarningVisible,
    remainingTime,
    formattedRemainingTime: formattedRemainingTime(),
    isActive: sessionState === SESSION_STATE.ACTIVE,
    isExpired: sessionState === SESSION_STATE.EXPIRED,
    extendSession,
    logout,
    resetTimers,
    SESSION_STATE,
  }
}

export default useSessionTimeout

export { useSessionTimeout, SESSION_STATE, ACTIVITY_EVENTS }