import { Component } from 'react'
import { SUPPORT } from '@/constants/constants'

/**
 * Global error boundary component that catches JavaScript errors anywhere in
 * the child component tree, logs the error, and displays a user-friendly
 * fallback UI styled with Honeybee CSS classes.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <Dashboard />
 * </ErrorBoundary>
 *
 * @example
 * // With error callback
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error, errorInfo)}>
 *   <ClaimsPage />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)

    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo)
      } catch (_callbackError) {
        // Prevent callback errors from causing further issues
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    this.setState(
      {
        hasError: false,
        error: null,
        errorInfo: null,
      },
      () => {
        try {
          window.location.href = '/'
        } catch (_error) {
          // Silently fail if navigation is not possible
        }
      },
    )
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (!hasError) {
      return children
    }

    // If a custom fallback is provided, render it
    if (fallback) {
      return fallback
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12"
        role="alert"
        aria-live="assertive"
      >
        <div className="hb-card max-w-lg w-full">
          <div className="hb-card-body text-center py-10 px-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-error"
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
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-semibold text-neutral-900 mb-2">
              Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-sm text-neutral-600 mb-6 leading-relaxed max-w-md mx-auto">
              We encountered an unexpected error while loading this page. Please try again, or
              contact support if the problem persists.
            </p>

            {/* Error Details (development only) */}
            {error && import.meta.env.DEV && (
              <div className="hb-alert-error mb-6 text-left">
                <div>
                  <p className="text-xs font-semibold mb-1">Error Details</p>
                  <p className="text-xs font-mono break-all">
                    {error.message || 'Unknown error'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                type="button"
                className="hb-btn-md hb-btn-primary w-full sm:w-auto"
                onClick={this.handleRetry}
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
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Try Again
              </button>

              <button
                type="button"
                className="hb-btn-md hb-btn-outline-secondary w-full sm:w-auto"
                onClick={this.handleGoHome}
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
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Go to Dashboard
              </button>
            </div>

            {/* Support Contact */}
            <div className="border-t border-neutral-200 pt-6">
              <p className="text-xs text-neutral-500 mb-1">Need help? Contact Member Services</p>
              <p className="text-sm font-medium text-hb-primary">
                <a
                  href={`tel:${SUPPORT.phone.replace(/[^\d]/g, '')}`}
                  className="hover:text-hb-primary-light transition-colors duration-200"
                >
                  {SUPPORT.phoneDisplay}
                </a>
              </p>
              <p className="text-xs text-neutral-400 mt-1">{SUPPORT.hoursOfOperation}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary

export { ErrorBoundary }