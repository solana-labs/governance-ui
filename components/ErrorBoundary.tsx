import React from 'react'

class ErrorBoundary extends React.Component<
  any,
  { hasError: boolean; error: any }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error }
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)

    if (process.env.NEXT_ERROR_WEBHOOK_URL) {
      try {
        fetch(process.env.NEXT_ERROR_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `UI ERROR: ${error} : ${errorInfo?.componentStack}`,
          }),
        })
      } catch (err) {
        console.error('Error posting to notify webhook:', err)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="text-th-bkg-2 text-center pt-1">
          <div>Something went wrong.</div>
          <div className="text-th-red">{this.state.error.message}</div>
          <button className="mt-2" onClick={() => location.reload()}>
            Refresh and try again
          </button>
          <div className="mt-4 px-4">{this.state.error.stack}</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
