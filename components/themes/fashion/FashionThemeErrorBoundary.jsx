'use client'
import { Component } from 'react'

/**
 * Error boundary for the fashion_v1 theme.
 * Catches render errors inside FashionThemeWrapper so a broken theme
 * config does not crash the entire storefront page.
 */
export default class FashionThemeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // Log to console — Sentry or other monitoring can be wired here
    console.error('[FashionTheme] render error', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🛍️</p>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111', marginBottom: 8 }}>Store temporarily unavailable</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Please refresh the page. If the problem continues, contact support.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 24px', background: '#111', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, cursor: 'pointer' }}
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
