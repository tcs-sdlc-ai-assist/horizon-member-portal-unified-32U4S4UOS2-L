import { useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventTagger } from '@/hooks/useEventTagger'
import { useAuditLogger } from '@/hooks/useAuditLogger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { formatCurrency, formatDate } from '@/utils/formatters'
import {
  CLAIM_TYPE,
  CLAIM_TYPE_LABELS,
} from '@/constants/constants'

/**
 * localStorage key for storing submitted claim records.
 */
const SUBMITTED_CLAIMS_STORAGE_KEY = 'hb_submitted_claims'

/**
 * Maximum number of stored submitted claim records.
 */
const MAX_STORED_SUBMISSIONS = 100

/**
 * Default form field values.
 */
const DEFAULT_FORM_VALUES = {
  claimType: '',
  provider: '',
  facility: '',
  serviceDate: '',
  billedAmount: '',
  description: '',
  patientName: '',
}

/**
 * Claim type options derived from CLAIM_TYPE constants.
 */
const CLAIM_TYPE_OPTIONS = Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/**
 * Retrieves stored submitted claim records from localStorage.
 * @returns {object[]} Array of submitted claim records.
 */
const getStoredSubmissions = () => {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_CLAIMS_STORAGE_KEY)

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
 * Persists a submitted claim record to localStorage.
 * Maintains a rolling window of MAX_STORED_SUBMISSIONS entries.
 * @param {object} record - The submitted claim record to persist.
 * @returns {boolean} Whether the save was successful.
 */
const persistSubmission = (record) => {
  try {
    const existing = getStoredSubmissions()
    existing.push(record)

    const trimmed = existing.slice(-MAX_STORED_SUBMISSIONS)

    window.localStorage.setItem(SUBMITTED_CLAIMS_STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch (_error) {
    return false
  }
}

/**
 * Validates the claim submission form fields.
 * @param {object} values - The form field values.
 * @returns {object} An object with field keys mapped to error message strings. Empty object if valid.
 */
const validateForm = (values) => {
  const errors = {}

  if (!values.claimType) {
    errors.claimType = 'Claim type is required.'
  }

  if (!values.provider || values.provider.trim().length === 0) {
    errors.provider = 'Provider name is required.'
  }

  if (!values.serviceDate) {
    errors.serviceDate = 'Date of service is required.'
  } else {
    const serviceDate = new Date(values.serviceDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (Number.isNaN(serviceDate.getTime())) {
      errors.serviceDate = 'Please enter a valid date.'
    } else if (serviceDate > today) {
      errors.serviceDate = 'Date of service cannot be in the future.'
    }
  }

  if (!values.billedAmount || values.billedAmount.trim().length === 0) {
    errors.billedAmount = 'Billed amount is required.'
  } else {
    const amount = Number(values.billedAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      errors.billedAmount = 'Please enter a valid amount greater than $0.00.'
    } else if (amount > 999999.99) {
      errors.billedAmount = 'Amount cannot exceed $999,999.99.'
    }
  }

  if (!values.patientName || values.patientName.trim().length === 0) {
    errors.patientName = 'Patient name is required.'
  }

  return errors
}

/**
 * Claim submission form component.
 *
 * Provides form fields for claim type, provider, date of service, amount,
 * and description. On submit, creates a claim record in localStorage and
 * shows a confirmation message. Styled with Honeybee CSS form classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <ClaimSubmission />
 *
 * @example
 * <ClaimSubmission className="mt-4" testId="claim-submission-form" />
 */
function ClaimSubmission({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagEvent } = useEventTagger()
  const { logAuditEvent } = useAuditLogger()

  const [formValues, setFormValues] = useState({ ...DEFAULT_FORM_VALUES })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionState, setSubmissionState] = useState('idle') // 'idle' | 'success' | 'error'
  const [submittedRecord, setSubmittedRecord] = useState(null)

  const formRef = useRef(null)
  const confirmationTimeoutRef = useRef(null)

  const [ids] = useState(() => ({
    form: generateAriaId('hb-claim-form'),
    claimType: generateAriaId('hb-claim-type'),
    provider: generateAriaId('hb-claim-provider'),
    facility: generateAriaId('hb-claim-facility'),
    serviceDate: generateAriaId('hb-claim-service-date'),
    billedAmount: generateAriaId('hb-claim-billed-amount'),
    description: generateAriaId('hb-claim-description'),
    patientName: generateAriaId('hb-claim-patient-name'),
  }))

  /**
   * Determines if the form has any validation errors.
   */
  const hasErrors = useMemo(
    () => Object.keys(formErrors).length > 0,
    [formErrors],
  )

  /**
   * Handles form field value changes.
   */
  const handleFieldChange = useCallback(
    (fieldId, value) => {
      setFormValues((prev) => ({
        ...prev,
        [fieldId]: value,
      }))

      // Clear the error for this field when the user starts editing
      if (formErrors[fieldId]) {
        setFormErrors((prev) => {
          const updated = { ...prev }
          delete updated[fieldId]
          return updated
        })
      }
    },
    [formErrors],
  )

  /**
   * Handles input change events.
   */
  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target
      handleFieldChange(name, value)
    },
    [handleFieldChange],
  )

  /**
   * Handles form submission.
   */
  const handleSubmit = useCallback(
    async (event) => {
      if (event) {
        event.preventDefault()
      }

      if (isSubmitting) {
        return
      }

      // Validate form
      const errors = validateForm(formValues)

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        announceToScreenReader(
          `Form has ${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'error' : 'errors'}. Please correct and try again.`,
          { priority: 'assertive' },
        )
        return
      }

      setFormErrors({})
      setIsSubmitting(true)

      try {
        const claimRecord = {
          id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          claimNumber: `HZN-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`,
          type: formValues.claimType,
          provider: formValues.provider.trim(),
          facility: formValues.facility.trim() || null,
          serviceDate: formValues.serviceDate,
          billedAmount: Number(formValues.billedAmount),
          description: formValues.description.trim() || null,
          patientName: formValues.patientName.trim(),
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        }

        const saved = persistSubmission(claimRecord)

        if (saved) {
          tagEvent('claim_submitted', {
            claimType: claimRecord.type,
            claimId: claimRecord.id,
            source: 'claim_submission_form',
          })

          await logAuditEvent('claim_submission', {
            claimId: claimRecord.id,
            claimType: claimRecord.type,
            source: 'claim_submission_form',
          })

          setSubmittedRecord(claimRecord)
          setSubmissionState('success')
          setFormValues({ ...DEFAULT_FORM_VALUES })

          announceToScreenReader(
            `Claim submitted successfully. Claim number ${claimRecord.claimNumber}.`,
            { priority: 'assertive' },
          )
        } else {
          setSubmissionState('error')
          announceToScreenReader(
            'Failed to submit claim. Please try again.',
            { priority: 'assertive' },
          )
        }
      } catch (_error) {
        setSubmissionState('error')
        announceToScreenReader(
          'An unexpected error occurred. Please try again.',
          { priority: 'assertive' },
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [formValues, isSubmitting, tagEvent, logAuditEvent],
  )

  /**
   * Handles resetting the form to submit another claim.
   */
  const handleSubmitAnother = useCallback(() => {
    setSubmissionState('idle')
    setSubmittedRecord(null)
    setFormValues({ ...DEFAULT_FORM_VALUES })
    setFormErrors({})

    announceToScreenReader('Form reset. Ready to submit a new claim.', { priority: 'polite' })
  }, [])

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

  // Success confirmation view
  if (submissionState === 'success' && submittedRecord) {
    return (
      <div
        className={`flex flex-col gap-6 ${className}`.trim()}
        data-testid={testId || 'claim-submission'}
      >
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hb-btn-sm hb-btn-ghost text-neutral-600 hover:text-neutral-800"
            onClick={handleBackToClaims}
            onKeyDown={handleBackKeyDown}
            aria-label="Back to claims list"
            data-testid={testId ? `${testId}-back-btn` : 'claim-submission-back-btn'}
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

        {/* Success card */}
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-success-card` : 'claim-submission-success-card'}
        >
          <div className="hb-card-body text-center py-10 px-6">
            {/* Success icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-success"
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
              </div>
            </div>

            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Claim Submitted Successfully
            </h2>
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed max-w-md mx-auto">
              Your claim has been submitted and is now being processed. You will receive a
              notification once the claim has been reviewed.
            </p>

            {/* Submitted claim details */}
            <div className="bg-surface-secondary rounded-lg px-6 py-4 mb-6 max-w-sm mx-auto text-left">
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Claim Number</p>
                  <p className="text-sm font-mono font-medium text-neutral-800">
                    {submittedRecord.claimNumber}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Type</p>
                  <p className="text-sm text-neutral-700">
                    {CLAIM_TYPE_LABELS[submittedRecord.type] || submittedRecord.type}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Provider</p>
                  <p className="text-sm text-neutral-700">{submittedRecord.provider}</p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Service Date</p>
                  <p className="text-sm text-neutral-700">
                    {formatDate(submittedRecord.serviceDate, { preset: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Billed Amount</p>
                  <p className="text-sm font-semibold text-neutral-800">
                    {formatCurrency(submittedRecord.billedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-neutral-400 uppercase tracking-wider">Status</p>
                  <span className="hb-badge-sm hb-badge-info">Submitted</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                className="hb-btn-md hb-btn-primary w-full sm:w-auto"
                onClick={handleSubmitAnother}
                data-testid={
                  testId
                    ? `${testId}-submit-another-btn`
                    : 'claim-submission-submit-another-btn'
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
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Submit Another Claim
              </button>
              <button
                type="button"
                className="hb-btn-md hb-btn-outline-secondary w-full sm:w-auto"
                onClick={handleBackToClaims}
                data-testid={
                  testId
                    ? `${testId}-view-claims-btn`
                    : 'claim-submission-view-claims-btn'
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                View All Claims
              </button>
            </div>
          </div>
        </div>

        {/* Screen reader live region */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          Claim {submittedRecord.claimNumber} submitted successfully.
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'claim-submission'}
    >
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hb-btn-sm hb-btn-ghost text-neutral-600 hover:text-neutral-800"
          onClick={handleBackToClaims}
          onKeyDown={handleBackKeyDown}
          aria-label="Back to claims list"
          data-testid={testId ? `${testId}-back-btn` : 'claim-submission-back-btn'}
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

      {/* Form card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-form-card` : 'claim-submission-form-card'}
      >
        {/* Header */}
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
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Submit a Claim</h2>
            <p className="text-2xs text-neutral-500 mt-0.5">
              Submit a claim for reimbursement of out-of-network or out-of-pocket services.
            </p>
          </div>
        </div>

        {/* Form body */}
        <div className="hb-card-body">
          {/* Error summary */}
          {submissionState === 'error' && (
            <div
              className="hb-alert-error mb-4"
              role="alert"
              data-testid={
                testId
                  ? `${testId}-error-alert`
                  : 'claim-submission-error-alert'
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <p className="text-sm font-medium mb-0.5">Submission Failed</p>
                <p className="text-xs leading-relaxed">
                  We were unable to submit your claim. Please try again. If the problem persists,
                  contact Member Services.
                </p>
              </div>
            </div>
          )}

          {/* Info banner */}
          <div className="hb-alert-info mb-6">
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
              <p className="text-xs leading-relaxed">
                Use this form to submit claims for services received from out-of-network providers
                or for out-of-pocket expenses. In-network claims are typically submitted by your
                provider automatically.
              </p>
            </div>
          </div>

          <form
            ref={formRef}
            id={ids.form}
            onSubmit={handleSubmit}
            noValidate
            data-testid={testId ? `${testId}-form` : 'claim-submission-form'}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Name */}
              <div className="hb-form-group">
                <label htmlFor={ids.patientName} className="hb-label hb-label-required">
                  Patient Name
                </label>
                <input
                  id={ids.patientName}
                  name="patientName"
                  type="text"
                  className={`hb-input ${formErrors.patientName ? 'hb-input-error' : ''}`.trim()}
                  value={formValues.patientName}
                  onChange={handleInputChange}
                  placeholder="e.g., Sarah Mitchell"
                  aria-required="true"
                  aria-invalid={!!formErrors.patientName}
                  aria-describedby={formErrors.patientName ? `${ids.patientName}-error` : undefined}
                  data-testid={
                    testId
                      ? `${testId}-patient-name-input`
                      : 'claim-submission-patient-name-input'
                  }
                />
                {formErrors.patientName && (
                  <p
                    id={`${ids.patientName}-error`}
                    className="hb-form-error"
                    role="alert"
                  >
                    {formErrors.patientName}
                  </p>
                )}
              </div>

              {/* Claim Type */}
              <div className="hb-form-group">
                <label htmlFor={ids.claimType} className="hb-label hb-label-required">
                  Claim Type
                </label>
                <select
                  id={ids.claimType}
                  name="claimType"
                  className={`hb-select ${formErrors.claimType ? 'hb-input-error' : ''}`.trim()}
                  value={formValues.claimType}
                  onChange={handleInputChange}
                  aria-required="true"
                  aria-invalid={!!formErrors.claimType}
                  aria-describedby={formErrors.claimType ? `${ids.claimType}-error` : undefined}
                  data-testid={
                    testId
                      ? `${testId}-claim-type-select`
                      : 'claim-submission-claim-type-select'
                  }
                >
                  <option value="">Select claim type</option>
                  {CLAIM_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.claimType && (
                  <p
                    id={`${ids.claimType}-error`}
                    className="hb-form-error"
                    role="alert"
                  >
                    {formErrors.claimType}
                  </p>
                )}
              </div>

              {/* Provider Name */}
              <div className="hb-form-group">
                <label htmlFor={ids.provider} className="hb-label hb-label-required">
                  Provider Name
                </label>
                <input
                  id={ids.provider}
                  name="provider"
                  type="text"
                  className={`hb-input ${formErrors.provider ? 'hb-input-error' : ''}`.trim()}
                  value={formValues.provider}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. Rebecca Torres"
                  aria-required="true"
                  aria-invalid={!!formErrors.provider}
                  aria-describedby={formErrors.provider ? `${ids.provider}-error` : undefined}
                  data-testid={
                    testId
                      ? `${testId}-provider-input`
                      : 'claim-submission-provider-input'
                  }
                />
                {formErrors.provider && (
                  <p
                    id={`${ids.provider}-error`}
                    className="hb-form-error"
                    role="alert"
                  >
                    {formErrors.provider}
                  </p>
                )}
              </div>

              {/* Facility (optional) */}
              <div className="hb-form-group">
                <label htmlFor={ids.facility} className="hb-label">
                  Facility
                </label>
                <input
                  id={ids.facility}
                  name="facility"
                  type="text"
                  className="hb-input"
                  value={formValues.facility}
                  onChange={handleInputChange}
                  placeholder="e.g., Springfield Family Medicine"
                  data-testid={
                    testId
                      ? `${testId}-facility-input`
                      : 'claim-submission-facility-input'
                  }
                />
                <p className="hb-form-hint">Optional</p>
              </div>

              {/* Date of Service */}
              <div className="hb-form-group">
                <label htmlFor={ids.serviceDate} className="hb-label hb-label-required">
                  Date of Service
                </label>
                <input
                  id={ids.serviceDate}
                  name="serviceDate"
                  type="date"
                  className={`hb-input ${formErrors.serviceDate ? 'hb-input-error' : ''}`.trim()}
                  value={formValues.serviceDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  aria-required="true"
                  aria-invalid={!!formErrors.serviceDate}
                  aria-describedby={formErrors.serviceDate ? `${ids.serviceDate}-error` : undefined}
                  data-testid={
                    testId
                      ? `${testId}-service-date-input`
                      : 'claim-submission-service-date-input'
                  }
                />
                {formErrors.serviceDate && (
                  <p
                    id={`${ids.serviceDate}-error`}
                    className="hb-form-error"
                    role="alert"
                  >
                    {formErrors.serviceDate}
                  </p>
                )}
              </div>

              {/* Billed Amount */}
              <div className="hb-form-group">
                <label htmlFor={ids.billedAmount} className="hb-label hb-label-required">
                  Billed Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">
                    $
                  </span>
                  <input
                    id={ids.billedAmount}
                    name="billedAmount"
                    type="text"
                    inputMode="decimal"
                    className={`hb-input pl-7 ${formErrors.billedAmount ? 'hb-input-error' : ''}`.trim()}
                    value={formValues.billedAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    aria-required="true"
                    aria-invalid={!!formErrors.billedAmount}
                    aria-describedby={
                      formErrors.billedAmount ? `${ids.billedAmount}-error` : undefined
                    }
                    data-testid={
                      testId
                        ? `${testId}-billed-amount-input`
                        : 'claim-submission-billed-amount-input'
                    }
                  />
                </div>
                {formErrors.billedAmount && (
                  <p
                    id={`${ids.billedAmount}-error`}
                    className="hb-form-error"
                    role="alert"
                  >
                    {formErrors.billedAmount}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="hb-form-group sm:col-span-2">
                <label htmlFor={ids.description} className="hb-label">
                  Description
                </label>
                <textarea
                  id={ids.description}
                  name="description"
                  className="hb-textarea"
                  value={formValues.description}
                  onChange={handleInputChange}
                  placeholder="Describe the services received (e.g., office visit for annual physical, lab work, etc.)"
                  rows={3}
                  data-testid={
                    testId
                      ? `${testId}-description-input`
                      : 'claim-submission-description-input'
                  }
                />
                <p className="hb-form-hint">Optional — provide details about the services received.</p>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                type="button"
                className="hb-btn-md hb-btn-outline-secondary"
                onClick={handleBackToClaims}
                disabled={isSubmitting}
                data-testid={
                  testId
                    ? `${testId}-cancel-btn`
                    : 'claim-submission-cancel-btn'
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="hb-btn-md hb-btn-primary"
                disabled={isSubmitting}
                data-testid={
                  testId
                    ? `${testId}-submit-btn`
                    : 'claim-submission-submit-btn'
                }
              >
                {isSubmitting ? (
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
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {isSubmitting && 'Submitting claim...'}
      </div>
    </div>
  )
}

export default ClaimSubmission

export { ClaimSubmission, getStoredSubmissions }