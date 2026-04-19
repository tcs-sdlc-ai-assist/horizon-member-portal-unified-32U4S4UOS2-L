import { useCallback, useMemo } from 'react'
import { useInstrumentation } from '@/context/InstrumentationProvider'

// -----------------------------------------------------------------------------
// Predefined Audit Action Types
// -----------------------------------------------------------------------------
const AUDIT_ACTIONS = {
  DOCUMENT_DOWNLOAD: 'document_download',
  ID_CARD_DOWNLOAD: 'id_card_download',
  ID_CARD_PRINT: 'id_card_print',
  EOB_DOWNLOAD: 'eob_download',
  TAX_DOCUMENT_DOWNLOAD: 'tax_document_download',
  FORM_DOWNLOAD: 'form_download',
  PLAN_DOCUMENT_DOWNLOAD: 'plan_document_download',
  APPEAL_DOCUMENT_DOWNLOAD: 'appeal_document_download',
  PROVIDER_DIRECTORY_DOWNLOAD: 'provider_directory_download',
}

// -----------------------------------------------------------------------------
// Local Storage Key for MVP Audit Log Persistence
// -----------------------------------------------------------------------------
const AUDIT_LOG_STORAGE_KEY = 'hb_audit_log'
const MAX_STORED_AUDIT_ENTRIES = 500

/**
 * Retrieves stored audit log entries from localStorage.
 * @returns {object[]} Array of audit log entries.
 */
const getStoredAuditLogs = () => {
  try {
    const raw = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (_error) {
    return []
  }
}

/**
 * Persists an audit log entry to localStorage (MVP).
 * Maintains a rolling window of MAX_STORED_AUDIT_ENTRIES entries.
 * @param {object} entry - The audit log entry to persist.
 * @returns {boolean} Whether the save was successful.
 */
const persistAuditEntry = (entry) => {
  try {
    const existing = getStoredAuditLogs()
    existing.push(entry)

    // Trim to max entries (keep most recent)
    const trimmed = existing.slice(-MAX_STORED_AUDIT_ENTRIES)

    window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch (_error) {
    console.warn('[useAuditLogger] Failed to persist audit log entry to localStorage.')
    return false
  }
}

/**
 * Custom React hook for audit logging.
 *
 * Provides a `logAuditEvent` function that records document and ID card
 * download events with userId, documentId, timestamp, and action type.
 * For MVP, audit logs are persisted to localStorage and forwarded to the
 * InstrumentationProvider's `logAudit` function.
 *
 * @returns {object} Object containing logAuditEvent, convenience methods, and AUDIT_ACTIONS.
 *
 * @example
 * const { logAuditEvent, logDocumentDownload, logIdCardDownload } = useAuditLogger()
 *
 * logAuditEvent('document_download', { documentId: 'doc_001', documentType: 'eob' })
 * logDocumentDownload({ documentId: 'doc_001', documentType: 'eob' })
 * logIdCardDownload({ coverageType: 'medical' })
 */
function useAuditLogger() {
  const { logAudit, isInstrumentationEnabled, containsPHI, sanitizePayload } = useInstrumentation()

  /**
   * Logs an audit event with the given action and details.
   * Sanitizes the payload to ensure no PHI/PII is included,
   * persists to localStorage (MVP), and forwards to InstrumentationProvider.
   *
   * @param {string} action - The audit action identifier.
   * @param {object} [details={}] - Audit event details (must not contain PHI/PII).
   * @returns {Promise<void>}
   */
  const logAuditEvent = useCallback(
    async (action, details = {}) => {
      if (!action || typeof action !== 'string') {
        console.warn('[useAuditLogger] logAuditEvent requires a valid action string.')
        return
      }

      // Sanitize details to remove any PHI/PII
      const safeDetails = containsPHI(details) ? sanitizePayload(details) : { ...details }

      const auditEntry = {
        action,
        details: safeDetails,
        timestamp: new Date().toISOString(),
        timestampMs: Date.now(),
      }

      // Persist to localStorage (MVP)
      persistAuditEntry(auditEntry)

      // Forward to InstrumentationProvider logAudit (handles rate limiting, circuit breaker, retries)
      try {
        await logAudit(action, safeDetails)
      } catch (_error) {
        // logAudit handles its own error reporting; localStorage persistence is the MVP fallback
      }
    },
    [logAudit, containsPHI, sanitizePayload],
  )

  /**
   * Logs a document download audit event.
   * @param {object} [details={}] - Details about the downloaded document.
   * @returns {Promise<void>}
   */
  const logDocumentDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.DOCUMENT_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs an ID card download audit event.
   * @param {object} [details={}] - Details about the downloaded ID card.
   * @returns {Promise<void>}
   */
  const logIdCardDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.ID_CARD_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs an ID card print audit event.
   * @param {object} [details={}] - Details about the printed ID card.
   * @returns {Promise<void>}
   */
  const logIdCardPrint = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.ID_CARD_PRINT, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs an EOB download audit event.
   * @param {object} [details={}] - Details about the downloaded EOB.
   * @returns {Promise<void>}
   */
  const logEobDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.EOB_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs a tax document download audit event.
   * @param {object} [details={}] - Details about the downloaded tax document.
   * @returns {Promise<void>}
   */
  const logTaxDocumentDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.TAX_DOCUMENT_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs a form download audit event.
   * @param {object} [details={}] - Details about the downloaded form.
   * @returns {Promise<void>}
   */
  const logFormDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.FORM_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs a plan document download audit event.
   * @param {object} [details={}] - Details about the downloaded plan document.
   * @returns {Promise<void>}
   */
  const logPlanDocumentDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.PLAN_DOCUMENT_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs an appeal document download audit event.
   * @param {object} [details={}] - Details about the downloaded appeal document.
   * @returns {Promise<void>}
   */
  const logAppealDocumentDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.APPEAL_DOCUMENT_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  /**
   * Logs a provider directory download audit event.
   * @param {object} [details={}] - Details about the downloaded provider directory.
   * @returns {Promise<void>}
   */
  const logProviderDirectoryDownload = useCallback(
    async (details = {}) => {
      await logAuditEvent(AUDIT_ACTIONS.PROVIDER_DIRECTORY_DOWNLOAD, details)
    },
    [logAuditEvent],
  )

  const value = useMemo(
    () => ({
      logAuditEvent,
      isInstrumentationEnabled,
      logDocumentDownload,
      logIdCardDownload,
      logIdCardPrint,
      logEobDownload,
      logTaxDocumentDownload,
      logFormDownload,
      logPlanDocumentDownload,
      logAppealDocumentDownload,
      logProviderDirectoryDownload,
      getStoredAuditLogs,
      AUDIT_ACTIONS,
    }),
    [
      logAuditEvent,
      isInstrumentationEnabled,
      logDocumentDownload,
      logIdCardDownload,
      logIdCardPrint,
      logEobDownload,
      logTaxDocumentDownload,
      logFormDownload,
      logPlanDocumentDownload,
      logAppealDocumentDownload,
      logProviderDirectoryDownload,
    ],
  )

  return value
}

export default useAuditLogger

export { useAuditLogger, AUDIT_ACTIONS, getStoredAuditLogs }