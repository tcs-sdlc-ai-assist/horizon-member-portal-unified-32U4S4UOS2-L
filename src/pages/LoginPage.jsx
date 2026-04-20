import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/components/common/Logo'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { BRANDING, SUPPORT } from '@/constants/constants'

/**
 * Validates the login form fields.
 * @param {object} values - The form field values.
 * @returns {object} An object with field keys mapped to error message strings. Empty object if valid.
 */
const validateLoginForm = (values) => {
  const errors = {}

  if (!values.email || values.email.trim().length === 0) {
    errors.email = 'Email address is required.'
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(values.email.trim())) {
      errors.email = 'Please enter a valid email address.'
    }
  }

  if (!values.password || values.password.length === 0) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

/**
 * Default form field values.
 */
const DEFAULT_FORM_VALUES = {
  email: '',
  password: '',
}

/**
 * Login page component.
 *
 * Renders a login form with email/password fields, Horizon branding (logo,
 * banner image), error messaging, and a submit handler that authenticates
 * via AuthContext. Redirects to the dashboard on successful login. Styled
 * with Honeybee CSS form/button classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <LoginPage />
 *
 * @example
 * <LoginPage testId="login-page" />
 */
function LoginPage({ className = '', testId }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [formValues, setFormValues] = useState({ ...DEFAULT_FORM_VALUES })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const formRef = useRef(null)
  const emailInputRef = useRef(null)

  const [ids] = useState(() => ({
    form: generateAriaId('hb-login-form'),
    email: generateAriaId('hb-login-email'),
    password: generateAriaId('hb-login-password'),
    loginError: generateAriaId('hb-login-error'),
  }))

  /**
   * Redirect to dashboard if already authenticated.
   */
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

  /**
   * Focus the email input on mount.
   */
  useEffect(() => {
    if (emailInputRef.current && !isAuthenticated) {
      emailInputRef.current.focus()
    }
  }, [isAuthenticated])

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

      // Clear the general login error when user edits any field
      if (loginError) {
        setLoginError('')
      }
    },
    [formErrors, loginError],
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
   * Toggles password visibility.
   */
  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

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
      const errors = validateLoginForm(formValues)

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        announceToScreenReader(
          `Login form has ${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'error' : 'errors'}. Please correct and try again.`,
          { priority: 'assertive' },
        )
        return
      }

      setFormErrors({})
      setLoginError('')
      setIsSubmitting(true)

      try {
        // Simulate a brief network delay for realistic UX
        await new Promise((resolve) => {
          setTimeout(resolve, 800)
        })

        // For MVP, accept any valid-format credentials and authenticate with the dummy member profile
        login()

        announceToScreenReader('Login successful. Redirecting to dashboard.', {
          priority: 'assertive',
        })

        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } catch (_error) {
        setLoginError(
          'Unable to sign in. Please check your email and password and try again.',
        )
        setIsSubmitting(false)
        announceToScreenReader(
          'Login failed. Please check your email and password and try again.',
          { priority: 'assertive' },
        )
      }
    },
    [formValues, isSubmitting, login, navigate, location.state],
  )

  /**
   * Handles keyboard activation on the password toggle.
   */
  const handlePasswordToggleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleTogglePassword()
      }
    },
    [handleTogglePassword],
  )

  // Don't render the login page if already authenticated (redirect will happen via useEffect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div
      className={`min-h-screen flex ${className}`.trim()}
      data-testid={testId || 'login-page'}
    >
      {/* Left panel — Banner image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center p-8 xl:p-16">
        <img
          src={BRANDING.bannerUrl}
          alt={`${BRANDING.companyName} banner`}
          className="w-full max-w-2xl h-auto object-contain"
        />
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-surface-secondary">
        <div className="w-full max-w-md">
          {/* Mobile logo (visible only on mobile/tablet) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={BRANDING.logoUrl} alt={BRANDING.logoAltText} className="h-12 w-auto object-contain mb-4" />
            <h1 className="text-xl font-bold text-neutral-900">{BRANDING.companyName}</h1>
            <p className="text-sm text-neutral-500 mt-1">{BRANDING.portalName}</p>
          </div>

          {/* Login card */}
          <div
            className="hb-card overflow-hidden"
            data-testid={testId ? `${testId}-card` : 'login-page-card'}
          >
            {/* Card header */}
            <div className="px-6 sm:px-8 pt-8 pb-2">
              <div className="hidden lg:flex items-center gap-4 mb-6">
                <img src={BRANDING.logoUrl} alt={BRANDING.logoAltText} className="h-16 w-auto object-contain flex-shrink-0" />
                <div>
                  <p className="text-lg font-bold text-neutral-900">{BRANDING.companyName}</p>
                  <p className="text-sm text-neutral-500">{BRANDING.portalName}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-neutral-900">Sign in to your account</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Enter your email and password to access your member portal.
              </p>
            </div>

            {/* Card body — form */}
            <div className="px-6 sm:px-8 py-6">
              {/* Login error alert */}
              {loginError && (
                <div
                  id={ids.loginError}
                  className="hb-alert-error mb-6"
                  role="alert"
                  data-testid={
                    testId
                      ? `${testId}-error-alert`
                      : 'login-page-error-alert'
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
                    <p className="text-sm font-medium mb-0.5">Sign In Failed</p>
                    <p className="text-xs leading-relaxed">{loginError}</p>
                  </div>
                </div>
              )}

              <form
                ref={formRef}
                id={ids.form}
                onSubmit={handleSubmit}
                noValidate
                data-testid={testId ? `${testId}-form` : 'login-page-form'}
              >
                <div className="flex flex-col gap-4">
                  {/* Email field */}
                  <div className="hb-form-group">
                    <label htmlFor={ids.email} className="hb-label hb-label-required">
                      Email Address
                    </label>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        ref={emailInputRef}
                        id={ids.email}
                        name="email"
                        type="email"
                        className={`hb-input pl-10 ${formErrors.email ? 'hb-input-error' : ''}`.trim()}
                        value={formValues.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-required="true"
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? `${ids.email}-error` : undefined}
                        disabled={isSubmitting}
                        data-testid={
                          testId
                            ? `${testId}-email-input`
                            : 'login-page-email-input'
                        }
                      />
                    </div>
                    {formErrors.email && (
                      <p
                        id={`${ids.email}-error`}
                        className="hb-form-error"
                        role="alert"
                      >
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div className="hb-form-group">
                    <div className="flex items-center justify-between">
                      <label htmlFor={ids.password} className="hb-label hb-label-required">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-150"
                        tabIndex={-1}
                        aria-label="Forgot password"
                        data-testid={
                          testId
                            ? `${testId}-forgot-password`
                            : 'login-page-forgot-password'
                        }
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        id={ids.password}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className={`hb-input pl-10 pr-10 ${formErrors.password ? 'hb-input-error' : ''}`.trim()}
                        value={formValues.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-required="true"
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? `${ids.password}-error` : undefined}
                        disabled={isSubmitting}
                        data-testid={
                          testId
                            ? `${testId}-password-input`
                            : 'login-page-password-input'
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors duration-150 rounded-sm"
                        onClick={handleTogglePassword}
                        onKeyDown={handlePasswordToggleKeyDown}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                        data-testid={
                          testId
                            ? `${testId}-toggle-password`
                            : 'login-page-toggle-password'
                        }
                      >
                        {showPassword ? (
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
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
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
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p
                        id={`${ids.password}-error`}
                        className="hb-form-error"
                        role="alert"
                      >
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="hb-btn-lg hb-btn-primary w-full justify-center mt-2"
                    disabled={isSubmitting}
                    data-testid={
                      testId
                        ? `${testId}-submit-btn`
                        : 'login-page-submit-btn'
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <span className="hb-spinner-sm" aria-hidden="true" />
                        Signing in...
                      </>
                    ) : (
                      <>
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
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <div className="hb-alert-info">
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
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
                      <span className="font-medium">Demo Mode:</span> Enter any valid email and
                      password (6+ characters) to sign in.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-6 sm:px-8 py-4 bg-surface-secondary border-t border-neutral-200">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-neutral-500 text-center">
                  Need help signing in? Contact Member Services
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href={`tel:${SUPPORT.phone.replace(/[^\d]/g, '')}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-150"
                    data-testid={
                      testId
                        ? `${testId}-support-phone`
                        : 'login-page-support-phone'
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {SUPPORT.phoneDisplay}
                  </a>
                  <span className="text-neutral-300" aria-hidden="true">·</span>
                  <a
                    href={`mailto:${SUPPORT.email}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-150"
                    data-testid={
                      testId
                        ? `${testId}-support-email`
                        : 'login-page-support-email'
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email
                  </a>
                </div>
                <p className="text-2xs text-neutral-400">{SUPPORT.hoursOfOperation}</p>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://www.horizonhealthcare.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
            >
              Privacy Policy
            </a>
            <span className="text-neutral-300" aria-hidden="true">·</span>
            <a
              href="https://www.horizonhealthcare.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
            >
              Terms of Service
            </a>
            <span className="text-neutral-300" aria-hidden="true">·</span>
            <a
              href="https://www.horizonhealthcare.com/accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xs text-neutral-400 hover:text-neutral-600 transition-colors duration-150"
            >
              Accessibility
            </a>
          </div>

          {/* Mobile copyright */}
          <div className="lg:hidden mt-4 text-center">
            <p className="text-2xs text-neutral-400">
              © {BRANDING.copyrightYear} {BRANDING.companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {isSubmitting && 'Signing in...'}
      </div>
    </div>
  )
}

export default LoginPage

export { LoginPage }