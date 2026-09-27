'use client'
// Last-resort boundary: an error in the root layout itself. Reports it, then
// shows a bare page (the store's own layout could not render).
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => { Sentry.captureException(error) }, [error])
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 32, textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <button onClick={() => reset()} style={{ marginTop: 16, padding: '8px 16px' }}>Try again</button>
      </body>
    </html>
  )
}
