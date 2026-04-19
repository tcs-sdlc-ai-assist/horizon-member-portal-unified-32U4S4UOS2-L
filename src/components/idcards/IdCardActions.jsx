import { useState, useCallback, useRef } from 'react'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { generateIdCardPdf, generateIdCardPdfFrontBack } from '@/utils/pdfGenerator'
import { announceToScreenReader } from '@/utils/accessibility'
import storage from '@/utils/storage'

/**
 * localStorage key for storing new card request records.
 */
const CARD_REQUESTS_STORAGE_KEY = 'hb_card_requests'

/**
 * Maximum number of stored card request records.
 */
const MAX_STORED_REQUESTS = 50

/**
 * Retrieves stored card request records from localStorage.
 * @returns {object[]} Array of card request records.
 */
const getStoredCardRequests = () => {
  try {
    const raw = window.localStorage.getItem(CARD_REQUESTS_STORAGE_KEY)

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
 * Persists a card request record to localStorage.
 * Maintains a rolling window of MAX_STORED_REQUESTS entries.
 * @param {object} record - The card request record to persist.
 * @returns {boolean} Whether the save was successful.
 */
const persistCardRequest = (record) => {
  try {
    const existing = getStoredCardRequests()
    existing.push(record)

    const trimmed = existing.slice(-MAX_STORED_REQUESTS)

    window.localStorage.setItem(CARD_REQUESTS_STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch (_error) {
    return false
  }
}

/**
 * ID card action buttons component providing Print, Download, and Request New Card
 * functionality. Print opens a print-friendly view via window.print(). Download
 * triggers PDF generation via the pdfGenerator utility. Request New Card creates
 * a request record in localStorage and shows a confirmation message.
 *
 * Uses useEventTagger for analytics tagging and useAuditLogger for audit logging
 * of download and print actions.
 *
 * @param {object} props - Component props.
 * @param {React.RefObject} [props.cardFrontRef] - Ref to the front card DOM element for PDF capture.
 * @param {React.RefObject} [props.cardBackRef] - Ref to the back card DOM element for PDF capture (optional, for front+back PDF).
 * @param {object} [props.coverage] - The coverage object associated with the ID card.
 * @param {string} [props.coverage.id] - Coverage ID.
 * @param {string} [props.coverage.type] - Coverage type (e.g., 'medical', 'dental').
 * @param {string} [props.coverage.planName] - Plan name.
 * @param {string} [props.coverage.subscriberName] - Subscriber name.
 * @param {string} [props.layout='inline'] - Layout variant: 'inline', 'stacked'.
 * @param {string} [props.size='md'] - Button size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.showPrint=true] - Whether to show the Print button.
 * @param {boolean} [props.showDownload=true] - Whether to show the Download button.
 * @param {boolean} [props.showRequestNew=true] - Whether to show the Request New Card button.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <IdCardActions
 *   cardFrontRef={cardFrontRef}
 *   cardBackRef={cardBackRef}
 *   coverage={selectedCoverage}
 * />
 *
 * @example
 * <IdCardActions
 *   cardFrontRef={cardFrontRef}
 *   coverage={coverage}
 *   layout="stacked"
 *   size="sm"
 *   showRequestNew={false}
 * />
 */
function IdCardActions({
  cardFrontRef,
  cardBackRef,
  coverage,
  layout = 'inline',
  size = 'md',
  showPrint = true,
  showDownload = true,
  showRequestNew = true,
  className = '',
  testId,
}) {
  const {
    tagIdCardDownloaded,
    tagIdCardPrinted,
    tagEvent,
  } = useEventTagger()

  const {
    logIdCardDownload,
    logIdCardPrint,
  } = useAuditLogger()

  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [requestState, setRequestState] = useState('idle') // 'idle' | 'confirming' | 'submitted'
  const [requestConfirmationMessage, setRequestConfirmationMessage] = useState('')

  const requestTimeoutRef = useRef(null)

  /**
   * Resolves the file name for the downloaded PDF.
   */
  const getFileName = useCallback(() => {
    const coverageType = coverage?.type || 'Card'
    const subscriberName = coverage?.subscriberName?.replace(/\s+/g, '_') || 'Member'
    return `ID_Card_${coverageType}_${subscriberName}.pdf`
  }, [coverage])

  /**
   * Handles the Download action — generates a PDF from the card element(s).
   */
  const handleDownload = useCallback(
    async (event) => {
      if (event) {
        event.stopPropagation()
      }

      if (isDownloading) {
        return
      }

      const frontElement = cardFrontRef?.current
      if (!frontElement) {
        announceToScreenReader('Unable to download ID card. Card element not found.', {
          priority: 'assertive',
        })
        return
      }

      setIsDownloading(true)

      try {
        const backElement = cardBackRef?.current
        const fileName = getFileName()

        if (backElement) {
          await generateIdCardPdfFrontBack(frontElement, backElement, {
            fileName,
            onLoadingChange: setIsDownloading,
          })
        } else {
          await generateIdCardPdf(frontElement, {
            fileName,
            onLoadingChange: setIsDownloading,
          })
        }

        tagIdCardDownloaded({
          coverageType: coverage?.type,
          coverageId: coverage?.id,
          source: 'id_card_actions',
        })

        await logIdCardDownload({
          coverageType: coverage?.type,
          coverageId: coverage?.id,
          source: 'id_card_actions',
        })

        announceToScreenReader('ID card PDF downloaded successfully', { priority: 'polite' })
      } catch (_error) {
        setIsDownloading(false)
        announceToScreenReader('Failed to download ID card PDF. Please try again.', {
          priority: 'assertive',
        })
      }
    },
    [
      cardFrontRef,
      cardBackRef,
      coverage,
      isDownloading,
      getFileName,
      tagIdCardDownloaded,
      logIdCardDownload,
    ],
  )

  /**
   * Handles the Print action — opens a print-friendly view via window.print().
   */
  const handlePrint = useCallback(
    async (event) => {
      if (event) {
        event.stopPropagation()
      }

      if (isPrinting) {
        return
      }

      setIsPrinting(true)

      try {
        tagIdCardPrinted({
          coverageType: coverage?.type,
          coverageId: coverage?.id,
          source: 'id_card_actions',
        })

        await logIdCardPrint({
          coverageType: coverage?.type,
          coverageId: coverage?.id,
          source: 'id_card_actions',
        })

        window.print()

        announceToScreenReader('Print dialog opened', { priority: 'polite' })
      } catch (_error) {
        announceToScreenReader('Failed to open print dialog. Please try again.', {
          priority: 'assertive',
        })
      } finally {
        setIsPrinting(false)
      }
    },
    [coverage, isPrinting, tagIdCardPrinted, logIdCardPrint],
  )

  /**
   * Handles the Request New Card action — shows confirmation prompt.
   */
  const handleRequestNewCard = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation()
      }

      if (requestState === 'confirming') {
        // User confirmed — create the request record
        const requestRecord = {
          id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          coverageType: coverage?.type || 'unknown',
          coverageId: coverage?.id || 'unknown',
          planName: coverage?.planName || 'Unknown Plan',
          requestedAt: new Date().toISOString(),
          status: 'submitted',
        }

        const saved = persistCardRequest(requestRecord)

        if (saved) {
          tagEvent('id_card_request_new', {
            coverageType: coverage?.type,
            coverageId: coverage?.id,
            requestId: requestRecord.id,
            source: 'id_card_actions',
          })

          setRequestState('submitted')
          setRequestConfirmationMessage(
            'Your request for a new ID card has been submitted. You should receive your new card within 7-10 business days.',
          )

          announceToScreenReader(
            'New ID card request submitted successfully. You should receive your new card within 7-10 business days.',
            { priority: 'assertive' },
          )

          // Reset state after a delay
          if (requestTimeoutRef.current) {
            clearTimeout(requestTimeoutRef.current)
          }

          requestTimeoutRef.current = setTimeout(() => {
            setRequestState('idle')
            setRequestConfirmationMessage('')
            requestTimeoutRef.current = null
          }, 8000)
        } else {
          announceToScreenReader('Failed to submit new card request. Please try again.', {
            priority: 'assertive',
          })
          setRequestState('idle')
        }
      } else {
        setRequestState('confirming')
        announceToScreenReader(
          'Are you sure you want to request a new ID card? Click Request New Card again to confirm.',
          { priority: 'polite' },
        )
      }
    },
    [requestState, coverage, tagEvent],
  )

  /**
   * Cancels the request new card confirmation.
   */
  const handleCancelRequest = useCallback(() => {
    setRequestState('idle')
    setRequestConfirmationMessage('')
    announceToScreenReader('New card request cancelled', { priority: 'polite' })
  }, [])

  // Button size class mapping
  const buttonSizeClassMap = {
    sm: 'hb-btn-sm',
    md: 'hb-btn-md',
    lg: 'hb-btn-lg',
  }

  const buttonSizeClass = buttonSizeClassMap[size] || buttonSizeClassMap.md

  // Layout class mapping
  const layoutClassMap = {
    inline: 'flex flex-wrap items-center gap-2',
    stacked: 'flex flex-col gap-2',
  }

  const layoutClass = layoutClassMap[layout] || layoutClassMap.inline

  return (
    <div
      className={`${className}`.trim()}
      data-testid={testId || 'id-card-actions'}
    >
      {/* Action buttons */}
      <div
        className={layoutClass}
        role="group"
        aria-label="ID card actions"
      >
        {/* Print button */}
        {showPrint && (
          <button
            type="button"
            className={`${buttonSizeClass} hb-btn-outline-secondary`}
            onClick={handlePrint}
            disabled={isPrinting}
            aria-label="Print ID card"
            data-testid={testId ? `${testId}-print-btn` : 'id-card-actions-print-btn'}
          >
            {isPrinting ? (
              <span className="hb-spinner-sm" aria-hidden="true" />
            ) : (
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            )}
            Print
          </button>
        )}

        {/* Download button */}
        {showDownload && (
          <button
            type="button"
            className={`${buttonSizeClass} hb-btn-primary`}
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download ID card as PDF"
            data-testid={testId ? `${testId}-download-btn` : 'id-card-actions-download-btn'}
          >
            {isDownloading ? (
              <span className="hb-spinner-sm" aria-hidden="true" />
            ) : (
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            Download PDF
          </button>
        )}

        {/* Request New Card button */}
        {showRequestNew && requestState !== 'submitted' && (
          <>
            {requestState === 'confirming' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-warning-dark font-medium">Request new card?</span>
                <button
                  type="button"
                  className={`${buttonSizeClass === 'hb-btn-lg' ? 'hb-btn-md' : 'hb-btn-sm'} hb-btn-primary`}
                  onClick={handleRequestNewCard}
                  aria-label="Confirm request for new ID card"
                  data-testid={
                    testId
                      ? `${testId}-confirm-request-btn`
                      : 'id-card-actions-confirm-request-btn'
                  }
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className={`${buttonSizeClass === 'hb-btn-lg' ? 'hb-btn-md' : 'hb-btn-sm'} hb-btn-outline-secondary`}
                  onClick={handleCancelRequest}
                  aria-label="Cancel new card request"
                  data-testid={
                    testId
                      ? `${testId}-cancel-request-btn`
                      : 'id-card-actions-cancel-request-btn'
                  }
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`${buttonSizeClass} hb-btn-outline-secondary`}
                onClick={handleRequestNewCard}
                aria-label="Request a new ID card"
                data-testid={
                  testId
                    ? `${testId}-request-btn`
                    : 'id-card-actions-request-btn'
                }
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Request New Card
              </button>
            )}
          </>
        )}
      </div>

      {/* Request confirmation message */}
      {requestState === 'submitted' && requestConfirmationMessage && (
        <div
          className="hb-alert-success mt-3"
          role="status"
          aria-live="polite"
          data-testid={
            testId
              ? `${testId}-request-confirmation`
              : 'id-card-actions-request-confirmation'
          }
        >
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <p className="text-sm font-medium mb-0.5">Request Submitted</p>
            <p className="text-xs leading-relaxed">{requestConfirmationMessage}</p>
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {isDownloading && 'Generating ID card PDF...'}
        {isPrinting && 'Opening print dialog...'}
      </div>
    </div>
  )
}

export default IdCardActions

export { IdCardActions, getStoredCardRequests }