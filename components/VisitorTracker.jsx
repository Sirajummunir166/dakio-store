'use client'
import { useEffect } from 'react'

const API = 'https://dakio-api-production.up.railway.app/api'

function getSessionId() {
  let id = sessionStorage.getItem('_dvid')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_dvid', id)
  }
  return id
}

export default function VisitorTracker({ slug }) {
  useEffect(() => {
    const sessionId = getSessionId()
    const page = window.location.pathname

    function ping() {
      fetch(`${API}/visitors/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, sessionId, page }),
      }).catch(() => {})
    }

    ping()
    const interval = setInterval(ping, 30_000)
    return () => clearInterval(interval)
  }, [slug])

  return null
}
