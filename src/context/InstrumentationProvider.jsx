import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ANALYTICS } from '@/constants/constants'

const InstrumentationContext = createContext(null)

// -----------------------------------------------------------------------------
// PHI/PII Field Selectors — default fields to mask in session replays
// -----------------------------------------------------------------------------
const DEFAULT_MASKED_SELECTORS = [
  '[data-phi]',
  '[data-pii]',
  '[data-mask]',
  '.phi-field',
  '.pii-field',
]

// -----------------------------------------------------------------------------
// Rate Limiting Configuration
// -----------------------------------------------------------------------------
const RATE_LIMIT = {
  maxEventsPerSecond: 10,
  circuitBreakerThreshold: 5,
  circuitBreakerCooldownMs: 60000,
}

// -----------------------------------------------------------------------------
// PHI/PII Detection — keys that should never appear in payloads
// -----------------------------------------------------------------------------
const PHI_PII_KEYS = [
  'ssn',
  'socialSecurityNumber',
  'social_security_number',
  'dateOfBirth',
  'date_of_birth',
  'dob',
  'email',
  'emailAddress',
  'email_address',
  'phone',
  'phoneNumber',
  'phone_number',
  'address',
  'street',
  'street1',
  'street2',
  'zipCode',
  'zip_code',
  'firstName',
  'first_name',
  'lastName',
  'last_name',
  'fullName',
  'full_name',
  'memberName',
  'member_name',
  'subscriberName',
  'subscriber_name',
  'patientName',
  'patient_name',
  'beneficiary',
  'pcpName',
  'pcp_name',
]

/**
 * Checks whether a payload object contains any PHI/PII keys.
 * @param {object} payload - The payload to check.
 * @returns {boolean} True if PHI/PII keys are detected.
 */
const containsPHI = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const keys = Object.keys(payload)

  for (const key of keys) {
    const lowerKey = key.toLowerCase()

    for (const phiKey of PHI_PII_KEYS) {
      if (lowerKey === phiKey.toLowerCase()) {
        return true
      }
    }

    // Recursively check nested objects
    if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
      if (containsPHI(payload[key])) {
        return true
      }
    }
  }

  return false
}

/**
 * Masks a PHI/PII field value for safe logging/display.
 * @param {string|number} fieldValue - The value to mask.
 * @returns {string} Masked value.
 */
const maskPHI = (fieldValue) => {
  if (fieldValue === null || fieldValue === undefined) {
    return '****'
  }

  if (typeof fieldValue === 'number') {
    return '****'
  }

  const strValue = String(fieldValue)

  if (strValue.length <= 2) {
    return '****'
  }

  return `${'*'.repeat(strValue.length - 2)}${strValue.slice(-2)}`
}

/**
 * Sanitizes a payload by removing any PHI/PII keys.
 * @param {object} payload - The payload to sanitize.
 * @returns {object} Sanitized payload.
 */
const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  const sanitized = {}
  const keys = Object.keys(payload)

  for (const key of keys) {
    const lowerKey = key.toLowerCase()
    let isPHI = false

    for (const phiKey of PHI_PII_KEYS) {
      if (lowerKey === phiKey.toLowerCase()) {
        isPHI = true
        break
      }
    }

    if (isPHI) {
      sanitized[key] = '****'
    } else if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
      sanitized[key] = sanitizePayload(payload[key])
    } else {
      sanitized[key] = payload[key]
    }
  }

  return sanitized
}

// -----------------------------------------------------------------------------
// Glassbox SDK Stub (MVP)
// -----------------------------------------------------------------------------
const GlassboxSDKStub = {
  _initialized: false,

  init() {
    this._initialized = true
  },

  isInitialized() {
    return this._initialized
  },

  tagEvent(eventType, payload) {
    if (!this._initialized) {
      return
    }

    // Stub: in production, this would forward to the real Glassbox SDK
    if (ANALYTICS.glassboxEnabled) {
      // eslint-disable-next-line no-console
      // Intentionally silent in production; logging only in dev
    }
  },

  maskFields(_selectors) {
    if (!this._initialized) {
      return
    }

    // Stub: in production, this would configure Glassbox field masking
  },

  destroy() {
    this._initialized = false
  },
}

// -----------------------------------------------------------------------------
// Audit Log Service Stub (MVP)
// -----------------------------------------------------------------------------
const AuditLogServiceStub = {
  async log(action, details) {
    // Stub: in production, this would send audit events to the backend
    // Validate no PHI/PII
    if (containsPHI(details)) {
      console.warn('[AuditLogService] PHI/PII detected in audit log details — sanitizing.')
      return sanitizePayload(details)
    }

    return details
  },
}

// -----------------------------------------------------------------------------
// InstrumentationProvider
// -----------------------------------------------------------------------------

export function InstrumentationProvider({ children }) {
  const { isAuthenticated, currentUser } = useAuth()

  const [isInstrumentationEnabled, setIsInstrumentationEnabled] = useState(false)
  const [maskedSelectors, setMaskedSelectors] = useState([...DEFAULT_MASKED_SELECTORS])

  // Rate limiting state
  const eventCountRef = useRef(0)
  const eventWindowStartRef = useRef(Date.now())
  const consecutiveFailuresRef = useRef(0)
  const circuitBreakerOpenRef = useRef(false)
  const circuitBreakerTimerRef = useRef(null)

  // Initialize Glassbox SDK when user is authenticated
  useEffect(() => {
    if (isAuthenticated && ANALYTICS.glassboxEnabled) {
      try {
        GlassboxSDKStub.init()
        GlassboxSDKStub.maskFields(maskedSelectors)
        setIsInstrumentationEnabled(true)
      } catch (error) {
        console.error('[InstrumentationProvider] Failed to initialize Glassbox SDK:', error.message)
        setIsInstrumentationEnabled(false)
      }
    }

    if (!isAuthenticated) {
      GlassboxSDKStub.destroy()
      setIsInstrumentationEnabled(false)
    }

    return () => {
      if (circuitBreakerTimerRef.current) {
        clearTimeout(circuitBreakerTimerRef.current)
        circuitBreakerTimerRef.current = null
      }
    }
  }, [isAuthenticated, maskedSelectors])

  /**
   * Checks rate limiting and circuit breaker before allowing an event.
   * @returns {boolean} Whether the event is allowed.
   */
  const isEventAllowed = useCallback(() => {
    // Circuit breaker check
    if (circuitBreakerOpenRef.current) {
      return false
    }

    const now = Date.now()
    const elapsed = now - eventWindowStartRef.current

    // Reset window every second
    if (elapsed >= 1000) {
      eventCountRef.current = 0
      eventWindowStartRef.current = now
    }

    if (eventCountRef.current >= RATE_LIMIT.maxEventsPerSecond) {
      return false
    }

    eventCountRef.current += 1
    return true
  }, [])

  /**
   * Records a failure for circuit breaker tracking.
   */
  const recordFailure = useCallback(() => {
    consecutiveFailuresRef.current += 1

    if (consecutiveFailuresRef.current >= RATE_LIMIT.circuitBreakerThreshold) {
      circuitBreakerOpenRef.current = true
      console.warn('[InstrumentationProvider] Circuit breaker opened — pausing instrumentation for 60s.')

      circuitBreakerTimerRef.current = setTimeout(() => {
        circuitBreakerOpenRef.current = false
        consecutiveFailuresRef.current = 0
        circuitBreakerTimerRef.current = null
      }, RATE_LIMIT.circuitBreakerCooldownMs)
    }
  }, [])

  /**
   * Records a success, resetting the failure counter.
   */
  const recordSuccess = useCallback(() => {
    consecutiveFailuresRef.current = 0
  }, [])

  /**
   * Tags a user action event for analytics/session replay.
   * @param {string} eventType - The event type identifier.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagEvent = useCallback((eventType, payload = {}) => {
    if (!isInstrumentationEnabled) {
      return
    }

    if (!eventType || typeof eventType !== 'string') {
      console.warn('[InstrumentationProvider] tagEvent requires a valid eventType string.')
      return
    }

    if (!isEventAllowed()) {
      return
    }

    try {
      const safePayload = containsPHI(payload) ? sanitizePayload(payload) : { ...payload }

      safePayload._timestamp = Date.now()
      safePayload._userId = currentUser?.id ? maskPHI(currentUser.id) : undefined

      GlassboxSDKStub.tagEvent(eventType, safePayload)
      recordSuccess()
    } catch (error) {
      console.error('[InstrumentationProvider] tagEvent failed:', error.message)
      recordFailure()
    }
  }, [isInstrumentationEnabled, currentUser, isEventAllowed, recordSuccess, recordFailure])

  /**
   * Triggers an audit log event (e.g., for document/ID card downloads).
   * @param {string} action - The audit action identifier.
   * @param {object} [details={}] - Audit details (must not contain PHI/PII).
   * @returns {Promise<void>}
   */
  const logAudit = useCallback(async (action, details = {}) => {
    if (!action || typeof action !== 'string') {
      console.warn('[InstrumentationProvider] logAudit requires a valid action string.')
      return
    }

    if (!isEventAllowed()) {
      return
    }

    const safeDetails = containsPHI(details) ? sanitizePayload(details) : { ...details }

    safeDetails._timestamp = Date.now()
    safeDetails._userId = currentUser?.id ? maskPHI(currentUser.id) : undefined
    safeDetails._action = action

    let attempts = 0
    const maxRetries = 3

    while (attempts < maxRetries) {
      try {
        await AuditLogServiceStub.log(action, safeDetails)
        recordSuccess()
        return
      } catch (error) {
        attempts += 1

        if (attempts >= maxRetries) {
          console.error(`[InstrumentationProvider] logAudit failed after ${maxRetries} attempts:`, error.message)
          recordFailure()
          return
        }

        // Exponential backoff
        const backoffMs = Math.pow(2, attempts) * 100
        await new Promise((resolve) => {
          setTimeout(resolve, backoffMs)
        })
      }
    }
  }, [currentUser, isEventAllowed, recordSuccess, recordFailure])

  /**
   * Adds additional CSS selectors to the privacy masking configuration.
   * @param {string[]} selectors - Array of CSS selectors to mask.
   */
  const addMaskedSelectors = useCallback((selectors) => {
    if (!Array.isArray(selectors)) {
      console.warn('[InstrumentationProvider] addMaskedSelectors requires an array of selectors.')
      return
    }

    setMaskedSelectors((prev) => {
      const newSelectors = selectors.filter((s) => typeof s === 'string' && !prev.includes(s))

      if (newSelectors.length === 0) {
        return prev
      }

      const updated = [...prev, ...newSelectors]

      // Update Glassbox SDK masking configuration
      if (isInstrumentationEnabled) {
        GlassboxSDKStub.maskFields(updated)
      }

      return updated
    })
  }, [isInstrumentationEnabled])

  /**
   * Removes CSS selectors from the privacy masking configuration.
   * @param {string[]} selectors - Array of CSS selectors to remove.
   */
  const removeMaskedSelectors = useCallback((selectors) => {
    if (!Array.isArray(selectors)) {
      return
    }

    setMaskedSelectors((prev) => {
      const updated = prev.filter((s) => !selectors.includes(s))

      if (isInstrumentationEnabled) {
        GlassboxSDKStub.maskFields(updated)
      }

      return updated
    })
  }, [isInstrumentationEnabled])

  /**
   * Resets masking configuration to defaults.
   */
  const resetMaskedSelectors = useCallback(() => {
    setMaskedSelectors([...DEFAULT_MASKED_SELECTORS])

    if (isInstrumentationEnabled) {
      GlassboxSDKStub.maskFields(DEFAULT_MASKED_SELECTORS)
    }
  }, [isInstrumentationEnabled])

  const value = useMemo(
    () => ({
      isInstrumentationEnabled,
      maskedSelectors,
      tagEvent,
      logAudit,
      addMaskedSelectors,
      removeMaskedSelectors,
      resetMaskedSelectors,
      maskPHI,
      containsPHI,
      sanitizePayload,
    }),
    [
      isInstrumentationEnabled,
      maskedSelectors,
      tagEvent,
      logAudit,
      addMaskedSelectors,
      removeMaskedSelectors,
      resetMaskedSelectors,
    ],
  )

  return (
    <InstrumentationContext.Provider value={value}>
      {children}
    </InstrumentationContext.Provider>
  )
}

// -----------------------------------------------------------------------------
// Custom Hooks
// -----------------------------------------------------------------------------

/**
 * Hook to access the full instrumentation context.
 * @returns {object} Instrumentation context value.
 */
export function useInstrumentation() {
  const context = useContext(InstrumentationContext)

  if (!context) {
    throw new Error('useInstrumentation must be used within an InstrumentationProvider')
  }

  return context
}

/**
 * Hook for tagging user action events.
 * @returns {function} tagEvent function.
 */
export function useEventTagger() {
  const { tagEvent } = useInstrumentation()
  return tagEvent
}

/**
 * Hook for triggering audit log events.
 * @returns {function} logAudit function.
 */
export function useAuditLogger() {
  const { logAudit } = useInstrumentation()
  return logAudit
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export { maskPHI, containsPHI, sanitizePayload }

export default InstrumentationContext