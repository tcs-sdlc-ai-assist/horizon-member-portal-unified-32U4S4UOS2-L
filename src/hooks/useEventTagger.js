import { useCallback, useMemo } from 'react'
import { useInstrumentation } from '@/context/InstrumentationProvider'

// -----------------------------------------------------------------------------
// Predefined Event Types
// -----------------------------------------------------------------------------
const EVENT_TYPES = {
  CLAIM_OPENED: 'claim_opened',
  ID_CARD_DOWNLOADED: 'id_card_downloaded',
  ID_CARD_PRINTED: 'id_card_printed',
  EXTERNAL_LINK_CLICK: 'external_link_click',
  DOCUMENT_DOWNLOAD: 'document_download',
  PAGE_VIEW: 'page_view',
  SEARCH_PERFORMED: 'search_performed',
  NOTIFICATION_OPENED: 'notification_opened',
  BENEFIT_VIEWED: 'benefit_viewed',
  COVERAGE_VIEWED: 'coverage_viewed',
  SUPPORT_CONTACT: 'support_contact',
  TELEHEALTH_LAUNCHED: 'telehealth_launched',
}

/**
 * Custom React hook for Glassbox event tagging.
 *
 * Provides a `tagEvent` function that sends named events to the Glassbox SDK
 * via the InstrumentationProvider context. No-ops when instrumentation is
 * disabled or when the provider is not available.
 *
 * @returns {object} Object containing tagEvent and convenience methods.
 *
 * @example
 * const { tagEvent, tagClaimOpened, tagDocumentDownload } = useEventTagger()
 *
 * tagEvent('custom_event', { key: 'value' })
 * tagClaimOpened({ claimId: 'clm_001' })
 * tagDocumentDownload({ documentId: 'doc_001', documentType: 'eob' })
 */
function useEventTagger() {
  const { tagEvent, isInstrumentationEnabled, sanitizePayload, containsPHI } = useInstrumentation()

  /**
   * Tags a claim opened event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagClaimOpened = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.CLAIM_OPENED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags an ID card downloaded event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagIdCardDownloaded = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.ID_CARD_DOWNLOADED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags an ID card printed event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagIdCardPrinted = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.ID_CARD_PRINTED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags an external link click event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagExternalLinkClick = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.EXTERNAL_LINK_CLICK, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a document download event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagDocumentDownload = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.DOCUMENT_DOWNLOAD, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a page view event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagPageView = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.PAGE_VIEW, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a search performed event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagSearchPerformed = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.SEARCH_PERFORMED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a notification opened event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagNotificationOpened = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.NOTIFICATION_OPENED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a benefit viewed event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagBenefitViewed = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.BENEFIT_VIEWED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a coverage viewed event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagCoverageViewed = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.COVERAGE_VIEWED, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a support contact event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagSupportContact = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.SUPPORT_CONTACT, payload)
    },
    [tagEvent],
  )

  /**
   * Tags a telehealth launched event.
   * @param {object} [payload={}] - Event payload (must not contain PHI/PII).
   */
  const tagTelehealthLaunched = useCallback(
    (payload = {}) => {
      tagEvent(EVENT_TYPES.TELEHEALTH_LAUNCHED, payload)
    },
    [tagEvent],
  )

  /**
   * Safely tags an event, sanitizing the payload if PHI/PII is detected.
   * This is a convenience wrapper around tagEvent that guarantees no PHI/PII
   * is included in the payload even if the caller accidentally passes it.
   *
   * @param {string} eventType - The event type identifier.
   * @param {object} [payload={}] - Event payload.
   */
  const safeTagEvent = useCallback(
    (eventType, payload = {}) => {
      if (!eventType || typeof eventType !== 'string') {
        return
      }

      const safePayload = containsPHI(payload) ? sanitizePayload(payload) : payload
      tagEvent(eventType, safePayload)
    },
    [tagEvent, containsPHI, sanitizePayload],
  )

  const value = useMemo(
    () => ({
      tagEvent,
      safeTagEvent,
      isInstrumentationEnabled,
      tagClaimOpened,
      tagIdCardDownloaded,
      tagIdCardPrinted,
      tagExternalLinkClick,
      tagDocumentDownload,
      tagPageView,
      tagSearchPerformed,
      tagNotificationOpened,
      tagBenefitViewed,
      tagCoverageViewed,
      tagSupportContact,
      tagTelehealthLaunched,
      EVENT_TYPES,
    }),
    [
      tagEvent,
      safeTagEvent,
      isInstrumentationEnabled,
      tagClaimOpened,
      tagIdCardDownloaded,
      tagIdCardPrinted,
      tagExternalLinkClick,
      tagDocumentDownload,
      tagPageView,
      tagSearchPerformed,
      tagNotificationOpened,
      tagBenefitViewed,
      tagCoverageViewed,
      tagSupportContact,
      tagTelehealthLaunched,
    ],
  )

  return value
}

export default useEventTagger

export { useEventTagger, EVENT_TYPES }