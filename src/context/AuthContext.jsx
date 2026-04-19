import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import memberProfile from '@/data/memberProfile'
import { SESSION } from '@/constants/constants'
import storage from '@/utils/storage'

const AuthContext = createContext(null)

const AUTH_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

export function AuthProvider({ children, onSessionWarning, onSessionTimeout }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = storage.getSessionToken()
    if (token) {
      return memberProfile
    }
    return null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = storage.getSessionToken()
    return !!token
  })

  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const activityListenerAttached = useRef(false)

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current)
      warningRef.current = null
    }
  }, [])

  const handleSessionTimeout = useCallback(() => {
    clearTimers()
    setCurrentUser(null)
    setIsAuthenticated(false)
    storage.clearSession()

    if (typeof onSessionTimeout === 'function') {
      onSessionTimeout()
    }
  }, [clearTimers, onSessionTimeout])

  const resetSessionTimers = useCallback(() => {
    clearTimers()

    if (!isAuthenticated) {
      return
    }

    storage.setLastActivity(Date.now())

    const warningDelay = SESSION.timeoutMs - SESSION.warningMs

    if (warningDelay > 0) {
      warningRef.current = setTimeout(() => {
        if (typeof onSessionWarning === 'function') {
          onSessionWarning()
        }
      }, warningDelay)
    }

    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout()
    }, SESSION.timeoutMs)
  }, [clearTimers, isAuthenticated, handleSessionTimeout, onSessionWarning])

  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      resetSessionTimers()
    }
  }, [isAuthenticated, resetSessionTimers])

  useEffect(() => {
    if (isAuthenticated && !activityListenerAttached.current) {
      AUTH_EVENTS.forEach((event) => {
        window.addEventListener(event, handleUserActivity, { passive: true })
      })
      activityListenerAttached.current = true
      resetSessionTimers()
    }

    if (!isAuthenticated && activityListenerAttached.current) {
      AUTH_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      activityListenerAttached.current = false
      clearTimers()
    }

    return () => {
      if (activityListenerAttached.current) {
        AUTH_EVENTS.forEach((event) => {
          window.removeEventListener(event, handleUserActivity)
        })
        activityListenerAttached.current = false
      }
      clearTimers()
    }
  }, [isAuthenticated, handleUserActivity, resetSessionTimers, clearTimers])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const lastActivity = storage.getLastActivity()

    if (lastActivity) {
      const elapsed = Date.now() - lastActivity

      if (elapsed >= SESSION.timeoutMs) {
        handleSessionTimeout()
      }
    }
  }, [isAuthenticated, handleSessionTimeout])

  const login = useCallback((user = null) => {
    const resolvedUser = user || memberProfile

    storage.setSessionToken(`session_${Date.now()}`)
    storage.setLastActivity(Date.now())

    setCurrentUser(resolvedUser)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearTimers()
    setCurrentUser(null)
    setIsAuthenticated(false)
    storage.clearSession()
  }, [clearTimers])

  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      resetSessionTimers()
    }
  }, [isAuthenticated, resetSessionTimers])

  const isAdmin = currentUser?.role === 'admin'

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    extendSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export default AuthContext