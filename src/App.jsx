import AppRouter from '@/AppRouter'

/**
 * Root application component.
 *
 * Entry point for the React component tree. Renders the AppRouter which
 * handles all routing, context providers (AuthContext, NotificationContext,
 * WidgetContext, InstrumentationProvider), error boundaries, and layout
 * composition internally.
 *
 * The provider hierarchy is managed within AppRouter and AppLayout:
 * - ErrorBoundary (wraps entire app in AppRouter)
 * - AuthProvider (wraps all routes in AppRouter)
 * - InstrumentationProvider (wraps authenticated routes in AppLayout)
 * - NotificationProvider (wraps authenticated routes in AppLayout)
 * - WidgetProvider (wraps authenticated routes in AppLayout)
 *
 * @example
 * <App />
 */
function App() {
  return <AppRouter />
}

export default App

export { App }