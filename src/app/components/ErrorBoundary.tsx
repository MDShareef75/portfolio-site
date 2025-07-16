'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text)]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 mx-auto text-red-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">
              Oops! Something went wrong
            </h1>
            
            <p className="text-[var(--text-secondary)] mb-6">
              We encountered an unexpected error. Don't worry, we've been notified and are working on fixing it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-[var(--accent)] to-blue-500 text-[#0a192f] font-semibold rounded-lg hover:from-blue-500 hover:to-[var(--accent)] transition-all duration-300"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                className="px-6 py-3 border border-[var(--accent)] text-[var(--accent)] font-semibold rounded-lg hover:bg-[var(--accent)]/10 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-[var(--accent)] hover:text-blue-400">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-[var(--surface)] rounded-lg text-xs overflow-auto text-red-400">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 