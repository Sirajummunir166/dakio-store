'use client'
import { useState, useEffect } from 'react'
import { useFashionTheme } from '../../FashionThemeContext.jsx'

const TABS = [
  { id: 'women', label: 'Women' },
  { id: 'men',   label: 'Men' },
  { id: 'kids',  label: 'Kids' },
]

const SIZE_DATA = {
  women: {
    headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hip (in)'],
    rows: [
      ['XS',  '32–33', '24–25', '34–35'],
      ['S',   '34–35', '26–27', '36–37'],
      ['M',   '36–37', '28–29', '38–39'],
      ['L',   '38–40', '30–32', '40–42'],
      ['XL',  '41–43', '33–35', '43–45'],
      ['XXL', '44–46', '36–38', '46–48'],
    ],
  },
  men: {
    headers: ['Size', 'Chest (in)', 'Waist (in)', 'Shoulder (in)'],
    rows: [
      ['XS',  '34–36', '28–30', '16.5'],
      ['S',   '36–38', '30–32', '17'],
      ['M',   '38–40', '32–34', '17.5'],
      ['L',   '40–42', '34–36', '18'],
      ['XL',  '42–44', '36–38', '18.5'],
      ['XXL', '44–46', '38–40', '19'],
    ],
  },
  kids: {
    headers: ['Age', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'],
    rows: [
      ['2–3Y',  '92–98',   '53',    '50'],
      ['3–4Y',  '98–104',  '55',    '51'],
      ['4–5Y',  '104–110', '57',    '52'],
      ['5–6Y',  '110–116', '59',    '53'],
      ['6–7Y',  '116–122', '61',    '54'],
      ['7–8Y',  '122–128', '63',    '55'],
    ],
  },
}

export function SizeGuideTrigger({ className = '' }) {
  const { sizeGuide } = useFashionTheme()

  return (
    <button
      type="button"
      className={`size-guide-trigger ${className}`}
      onClick={sizeGuide?.open}
      aria-label="Open size guide"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      Size Guide
    </button>
  )
}

export default function SizeGuideModal() {
  const { sizeGuide } = useFashionTheme()
  const [activeTab, setActiveTab] = useState('women')

  const isOpen = sizeGuide?.isOpen ?? false

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') sizeGuide?.close() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, sizeGuide])

  if (!isOpen) return null

  const data = SIZE_DATA[activeTab]

  return (
    <div className="size-guide-modal" role="dialog" aria-modal="true" aria-label="Size Guide">
      <button
        type="button"
        className="size-guide-modal__backdrop"
        onClick={sizeGuide?.close}
        aria-label="Close size guide"
      />
      <div className="size-guide-modal__panel">
        <div className="size-guide-modal__head">
          <h2 className="size-guide-modal__title">Size Guide</h2>
          <button
            type="button"
            className="size-guide-modal__close"
            onClick={sizeGuide?.close}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="size-guide-modal__note">
          Measurements are in inches unless specified. For best fit, measure over underwear. If between sizes, size up.
        </p>

        <div className="size-guide-modal__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`size-guide-modal__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <table className="size-guide-table" role="tabpanel">
          <thead>
            <tr>
              {data.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map(([size, ...rest]) => (
              <tr key={size}>
                <td>{size}</td>
                {rest.map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
