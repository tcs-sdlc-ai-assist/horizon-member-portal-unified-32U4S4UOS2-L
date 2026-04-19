import { useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import claims from '@/data/claims'
import documents from '@/data/documents'
import StatusBadge from '@/components/common/StatusBadge'
import PrivacyMaskedText from '@/components/common/PrivacyMaskedText'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { announceToScreenReader } from '@/utils/accessibility'
import {
  CLAIM_TYPE_LABELS,
  CLAIM_STATUS_LABELS,
} from '@/constants/constants'

/**
 * Returns the claim type icon SVG based on claim type.
 * @param {string} type - The claim type key.
 * @returns {React.ReactNode} The icon element.
 */
const getClaimTypeIcon = (type) => {
  switch (type) {
    case 'medical':
    case 'preventive':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'pharmacy':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      )
    case 'dental':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    case 'vision':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'emergency':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    case 'specialist':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'behavioral_health':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'lab':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
      )
    case 'imaging':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )
    case 'hospital':
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    default:
      return (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
  }
}

/**
 * Claim detail view component.
 *
 * Displays full claim information including financial summary (billed, allowed,
 * plan paid, what you owe), line items table, provider info, and EOB download
 * link. Uses useEventTagger for claim_opened analytics tagging and useAuditLogger
 * for EOB download audit logging. All sensitive fields (claim number, patient name,
 * member ID, financial amounts) are wrapped with PrivacyMaskedText for Glassbox
 * session replay masking.
 *
 * @param {object} props - Component props.
 * @param {string} [props.claimId] - The claim ID to display. If not provided, displays the most recent claim.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimDetail claimId="clm_001" />
 *
 * @example
 * <ClaimDetail className="mt-4" testId="claim-detail-page" />
 */
function ClaimDetail({ claimId, className = '', testId }) {
  const navigate = useNavigate()
  const { tagClaimOpened, tagDocumentDownload } = useEventTagger()
  const { logEobDownload } = useAuditLogger()

  /**
   * Resolves the claim to display.
   */
  const claim = useMemo(() => {
    if (claimId) {
      return claims.find((c) => c.id === claimId) || null
    }
    // Default to the most recent claim by service date
    const sorted = [...claims].sort(
      (a, b) => new Date(b.serviceDate) - new Date(a.serviceDate),
    )
    return sorted[0] || null
  }, [claimId])

  /**
   * Resolves the related EOB document for the claim.
   */
  const eobDocument = useMemo(() => {
    if (!claim || !claim.eobDocumentId) {
      return null
    }
    return documents.find((doc) => doc.id === claim.eobDocumentId) || null
  }, [claim])

  /**
   * Financial summary calculations.
   */
  const financialSummary = useMemo(() => {
    if (!claim) {
      return null
    }

    const adjustmentAmount = (claim.billedAmount || 0) - (claim.allowedAmount || 0)

    return {
      billedAmount: claim.billedAmount || 0,
      allowedAmount: claim.allowedAmount || 0,
      planPaid: claim.planPaid || 0,
      whatYouOwe: claim.whatYouOwe || 0,
      adjustmentAmount,
    }
  }, [claim])

  /**
   * Tag claim_opened event when the claim detail is viewed.
   */
  useEffect(() => {
    if (claim) {
      tagClaimOpened({
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        claimType: claim.type,
        claimStatus: claim.status,
        source: 'claim_detail',
      })

      announceToScreenReader(
        `Viewing claim ${claim.claimNumber} for ${claim.provider}, status ${CLAIM_STATUS_LABELS[claim.status] || claim.status}`,
        { priority: 'polite' },
      )
    }
  }, [claim, tagClaimOpened])

  /**
   * Handles the EOB download action.
   */
  const handleEobDownload = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault()
      }

      if (!eobDocument) {
        return
      }

      tagDocumentDownload({
        documentId: eobDocument.id,
        documentType: 'eob',
        claimId: claim?.id,
        claimNumber: claim?.claimNumber,
        source: 'claim_detail',
      })

      await logEobDownload({
        documentId: eobDocument.id,
        documentType: 'eob',
        claimId: claim?.id,
        source: 'claim_detail',
      })

      announceToScreenReader(`Downloading ${eobDocument.title}`, { priority: 'polite' })
    },
    [eobDocument, claim, tagDocumentDownload, logEobDownload],
  )

  /**
   * Handles navigating back to the claims list.
   */
  const handleBackToClaims = useCallback(() => {
    navigate('/claims')
  }, [navigate])

  /**
   * Handles keyboard activation on the back button.
   */
  const handleBackKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleBackToClaims()
      }
    },
    [handleBackToClaims],
  )

  // No claim found
  if (!claim) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'claim-detail'}
      >
        <div className="hb-card-body">
          <div className="hb-empty-state py-12">
            <svg
              className="w-12 h-12 text-neutral-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-sm font-medium text-neutral-600 mb-1">Claim not found</p>
            <p className="text-xs text-neutral-400 mb-4">
              The claim you are looking for could not be found.
            </p>
            <button
              type="button"
              className="hb-btn-sm hb-btn-outline"
              onClick={handleBackToClaims}
            >
              Back to Claims
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'claim-detail'}
    >
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hb-btn-sm hb-btn-ghost text-neutral-600 hover:text-neutral-800"
          onClick={handleBackToClaims}
          onKeyDown={handleBackKeyDown}
          aria-label="Back to claims list"
          data-testid={testId ? `${testId}-back-btn` : 'claim-detail-back-btn'}
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
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Claims
        </button>
      </div>

      {/* Claim header card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-header-card` : 'claim-detail-header-card'}
      >
        <div className="hb-card-body">
          <div className="flex items-start gap-4">
            {/* Claim type icon */}
            <div className="w-10 h-10 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
              {getClaimTypeIcon(claim.type)}
            </div>

            {/* Claim header info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-neutral-900">
                    {claim.provider}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <PrivacyMaskedText
                      fieldType="claimNumber"
                      className="text-sm text-neutral-500 font-mono"
                    >
                      {claim.claimNumber}
                    </PrivacyMaskedText>
                    <span className="text-neutral-300" aria-hidden="true">·</span>
                    <span className="hb-badge-sm hb-badge-neutral">
                      {CLAIM_TYPE_LABELS[claim.type] ||
                        claim.type
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                </div>

                <StatusBadge
                  status={claim.status}
                  type="claim"
                  size="md"
                  showDot
                  testId={testId ? `${testId}-status` : 'claim-detail-status'}
                />
              </div>

              {/* Key dates */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-600">Service Date:</span>{' '}
                  {formatDate(claim.serviceDate, { preset: 'short' })}
                </div>
                {claim.processedDate && (
                  <div className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-600">Processed:</span>{' '}
                    {formatDate(claim.processedDate, { preset: 'short' })}
                  </div>
                )}
                {claim.paidDate && (
                  <div className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-600">Paid:</span>{' '}
                    {formatDate(claim.paidDate, { preset: 'short' })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial summary card */}
      {financialSummary && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-financial-card` : 'claim-detail-financial-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-neutral-900">Financial Summary</h2>
          </div>

          <div className="hb-card-body">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Billed Amount */}
              <div
                className="text-center"
                data-testid={
                  testId
                    ? `${testId}-billed-amount`
                    : 'claim-detail-billed-amount'
                }
              >
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">
                  Billed
                </p>
                <PrivacyMaskedText
                  fieldType="financialAmount"
                  className="text-lg font-bold text-neutral-800 block"
                >
                  {formatCurrency(financialSummary.billedAmount)}
                </PrivacyMaskedText>
              </div>

              {/* Allowed Amount */}
              <div
                className="text-center"
                data-testid={
                  testId
                    ? `${testId}-allowed-amount`
                    : 'claim-detail-allowed-amount'
                }
              >
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">
                  Allowed
                </p>
                <PrivacyMaskedText
                  fieldType="financialAmount"
                  className="text-lg font-bold text-neutral-800 block"
                >
                  {formatCurrency(financialSummary.allowedAmount)}
                </PrivacyMaskedText>
              </div>

              {/* Plan Paid */}
              <div
                className="text-center"
                data-testid={
                  testId
                    ? `${testId}-plan-paid`
                    : 'claim-detail-plan-paid'
                }
              >
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">
                  Plan Paid
                </p>
                <PrivacyMaskedText
                  fieldType="financialAmount"
                  className="text-lg font-bold text-success-dark block"
                >
                  {formatCurrency(financialSummary.planPaid)}
                </PrivacyMaskedText>
              </div>

              {/* What You Owe */}
              <div
                className="text-center"
                data-testid={
                  testId
                    ? `${testId}-you-owe`
                    : 'claim-detail-you-owe'
                }
              >
                <p className="text-2xs text-neutral-400 uppercase tracking-wider mb-1">
                  You Owe
                </p>
                <PrivacyMaskedText
                  fieldType="financialAmount"
                  className="text-lg font-bold text-neutral-900 block"
                >
                  {formatCurrency(financialSummary.whatYouOwe)}
                </PrivacyMaskedText>
              </div>
            </div>

            {/* Adjustment note */}
            {financialSummary.adjustmentAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-info flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p className="text-xs text-neutral-500">
                    Network discount / adjustment:{' '}
                    <PrivacyMaskedText
                      fieldType="financialAmount"
                      className="font-medium text-neutral-700"
                    >
                      {formatCurrency(financialSummary.adjustmentAmount)}
                    </PrivacyMaskedText>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider & patient info card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-provider-card` : 'claim-detail-provider-card'}
      >
        <div className="hb-card-header flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-hb-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-neutral-900">Provider & Patient Information</h2>
        </div>

        <div className="hb-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Provider info */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Provider
              </h3>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-2xs text-neutral-400">Provider Name</p>
                  <p className="text-sm font-medium text-neutral-800">{claim.provider}</p>
                </div>
                {claim.facility && (
                  <div>
                    <p className="text-2xs text-neutral-400">Facility</p>
                    <p className="text-sm text-neutral-700">{claim.facility}</p>
                  </div>
                )}
                {claim.providerNpi && (
                  <div>
                    <p className="text-2xs text-neutral-400">NPI</p>
                    <p className="text-sm text-neutral-600 font-mono">{claim.providerNpi}</p>
                  </div>
                )}
                {claim.network && (
                  <div>
                    <p className="text-2xs text-neutral-400">Network Status</p>
                    <span
                      className={`hb-badge-sm ${
                        claim.network === 'in_network'
                          ? 'hb-badge-success'
                          : 'hb-badge-warning'
                      }`}
                    >
                      {claim.network === 'in_network' ? 'In-Network' : 'Out-of-Network'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Patient info */}
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Patient
              </h3>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-2xs text-neutral-400">Patient Name</p>
                  <PrivacyMaskedText
                    fieldType="patientName"
                    className="text-sm font-medium text-neutral-800 block"
                  >
                    {claim.patient}
                  </PrivacyMaskedText>
                </div>
                {claim.patientMemberId && (
                  <div>
                    <p className="text-2xs text-neutral-400">Member ID</p>
                    <PrivacyMaskedText
                      fieldType="memberId"
                      className="text-sm text-neutral-600 font-mono block"
                    >
                      {claim.patientMemberId}
                    </PrivacyMaskedText>
                  </div>
                )}
                <div>
                  <p className="text-2xs text-neutral-400">Service Date</p>
                  <p className="text-sm text-neutral-700">
                    {formatDate(claim.serviceDate, { preset: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line items card */}
      {claim.lineItems && claim.lineItems.length > 0 && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-line-items-card` : 'claim-detail-line-items-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Service Line Items</h2>
              <p className="text-2xs text-neutral-500 mt-0.5">
                {claim.lineItems.length} {claim.lineItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Desktop table view */}
          <div className="hidden lg:block overflow-x-auto">
            <table
              className="hb-table"
              aria-label="Claim line items"
              data-testid={
                testId
                  ? `${testId}-line-items-table`
                  : 'claim-detail-line-items-table'
              }
            >
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Description</th>
                  <th scope="col" className="text-right">Billed</th>
                  <th scope="col" className="text-right">Allowed</th>
                  <th scope="col" className="text-right">Plan Paid</th>
                  <th scope="col" className="text-right">You Owe</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                {claim.lineItems.map((lineItem) => (
                  <tr
                    key={lineItem.id}
                    data-testid={
                      testId
                        ? `${testId}-line-item-${lineItem.id}`
                        : `claim-detail-line-item-${lineItem.id}`
                    }
                  >
                    <td>
                      <span className="text-sm font-mono text-neutral-600">
                        {lineItem.procedureCode}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-neutral-700 block max-w-[16rem] hb-text-truncate">
                        {lineItem.description}
                      </span>
                    </td>
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm text-neutral-600 font-mono"
                      >
                        {formatCurrency(lineItem.billedAmount)}
                      </PrivacyMaskedText>
                    </td>
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm text-neutral-600 font-mono"
                      >
                        {formatCurrency(lineItem.allowedAmount)}
                      </PrivacyMaskedText>
                    </td>
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm text-success-dark font-mono"
                      >
                        {formatCurrency(lineItem.planPaid)}
                      </PrivacyMaskedText>
                    </td>
                    <td className="text-right">
                      <PrivacyMaskedText
                        fieldType="financialAmount"
                        className="text-sm font-semibold text-neutral-900 font-mono"
                      >
                        {formatCurrency(lineItem.memberResponsibility)}
                      </PrivacyMaskedText>
                    </td>
                    <td>
                      <span className="text-xs text-neutral-500 block max-w-[12rem] hb-text-truncate">
                        {lineItem.adjustmentReason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="lg:hidden divide-y divide-neutral-100">
            {claim.lineItems.map((lineItem) => (
              <div
                key={lineItem.id}
                className="px-4 sm:px-6 py-3.5"
                data-testid={
                  testId
                    ? `${testId}-mobile-line-item-${lineItem.id}`
                    : `claim-detail-mobile-line-item-${lineItem.id}`
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {lineItem.procedureCode}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 mt-1">
                      {lineItem.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <PrivacyMaskedText
                      fieldType="financialAmount"
                      className="text-sm font-semibold text-neutral-900 block"
                    >
                      {formatCurrency(lineItem.memberResponsibility)}
                    </PrivacyMaskedText>
                    <span className="text-2xs text-neutral-400">You owe</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="text-2xs text-neutral-400">
                    Billed:{' '}
                    <PrivacyMaskedText
                      fieldType="financialAmount"
                      className="text-neutral-600 font-mono"
                    >
                      {formatCurrency(lineItem.billedAmount)}
                    </PrivacyMaskedText>
                  </div>
                  <div className="text-2xs text-neutral-400">
                    Allowed:{' '}
                    <PrivacyMaskedText
                      fieldType="financialAmount"
                      className="text-neutral-600 font-mono"
                    >
                      {formatCurrency(lineItem.allowedAmount)}
                    </PrivacyMaskedText>
                  </div>
                  <div className="text-2xs text-neutral-400">
                    Plan Paid:{' '}
                    <PrivacyMaskedText
                      fieldType="financialAmount"
                      className="text-success-dark font-mono"
                    >
                      {formatCurrency(lineItem.planPaid)}
                    </PrivacyMaskedText>
                  </div>
                </div>

                {lineItem.adjustmentReason && (
                  <p className="text-2xs text-neutral-400 mt-1.5">
                    {lineItem.adjustmentReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EOB download card */}
      {eobDocument && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-eob-card` : 'claim-detail-eob-card'}
        >
          <div className="hb-card-body">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-info"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    {eobDocument.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {eobDocument.sizeDisplay} · {formatDate(eobDocument.date, { preset: 'short' })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="hb-btn-sm hb-btn-primary"
                onClick={handleEobDownload}
                aria-label={`Download ${eobDocument.title}`}
                data-testid={
                  testId
                    ? `${testId}-eob-download-btn`
                    : 'claim-detail-eob-download-btn'
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download EOB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No EOB available notice */}
      {!eobDocument && claim.status !== 'submitted' && claim.status !== 'pending' && (
        <div
          className="hb-alert-info"
          data-testid={testId ? `${testId}-no-eob` : 'claim-detail-no-eob'}
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className="text-sm font-medium mb-0.5">EOB Not Yet Available</p>
            <p className="text-xs leading-relaxed">
              The Explanation of Benefits for this claim is not yet available. It will be generated
              once the claim has been fully processed.
            </p>
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Viewing claim {claim.claimNumber} for {claim.provider}, status{' '}
        {CLAIM_STATUS_LABELS[claim.status] || claim.status}
      </div>
    </div>
  )
}

export default ClaimDetail

export { ClaimDetail }