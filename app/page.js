'use client'
import { useState, useEffect } from 'react'

const CYAN   = '#0891B2'
const WHITE  = '#FFFFFF'
const D0     = '#070D18'
const D1     = '#0C1424'
const D2     = '#0F172A'
const D3     = '#141F35'
const D4     = '#1E293B'
const DB     = 'rgba(255,255,255,0.08)'
const TW1    = '#FFFFFF'
const TW2    = 'rgba(255,255,255,0.62)'
const TW3    = 'rgba(255,255,255,0.32)'
const APP    = 'https://app.dakio.io'

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mOpen, setMOpen]       = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const pill = scrolled || mOpen

  return (
    <>
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:300, display:'flex', justifyContent:'center', padding: pill ? '10px 24px' : '20px 24px', transition:'padding 0.35s ease', pointerEvents:'none' }}>
        <nav style={{ maxWidth:1100, width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:52, borderRadius: pill ? 14 : 0, background: pill ? 'rgba(7,13,24,0.85)' : 'transparent', backdropFilter: pill ? 'blur(24px)' : 'none', WebkitBackdropFilter: pill ? 'blur(24px)' : 'none', border: pill ? `1px solid ${DB}` : 'none', boxShadow: pill ? '0 4px 32px rgba(0,0,0,0.3)' : 'none', transition:'all 0.35s ease', pointerEvents:'auto' }}>
          <a href="https://dakio.io" style={{ display:'flex', alignItems:'center', textDecoration:'none', flexShrink:0 }}>
            <img src="/dakio-logo-white.svg" alt="Dakio" style={{ height:22 }} />
          </a>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <a href={`${APP}/login`} className="nav-login" style={{ padding:'0 16px', height:36, fontSize:13, fontWeight:500, color:TW2, textDecoration:'none', display:'inline-flex', alignItems:'center' }}>Log In</a>
            <a href={APP} style={{ padding:'0 18px', height:36, background:CYAN, borderRadius:8, fontSize:13, fontWeight:600, color:WHITE, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
              Start Selling Free
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <button className="nav-burger" onClick={() => setMOpen(o => !o)} aria-label="Menu" style={{ display:'none', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:5, width:36, height:36, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <span style={{ display:'block', width:22, height:2, background:WHITE, borderRadius:2, transition:'all 0.25s', transform: mOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span style={{ display:'block', width:22, height:2, background:WHITE, borderRadius:2, opacity: mOpen ? 0 : 1, transition:'all 0.25s' }} />
              <span style={{ display:'block', width:22, height:2, background:WHITE, borderRadius:2, transition:'all 0.25s', transform: mOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </nav>
        <style>{`
          @media(max-width:600px){ .nav-login{display:none!important;} .nav-burger{display:flex!important;} }
        `}</style>
      </div>

      {/* mobile menu */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:299, background:'rgba(7,13,24,0.97)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderBottom:`1px solid ${DB}`, paddingTop:76, paddingBottom:24, transform: mOpen ? 'translateY(0)' : 'translateY(-110%)', transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)', pointerEvents: mOpen ? 'auto' : 'none' }}>
        <div style={{ display:'flex', flexDirection:'column', padding:'0 24px', gap:0 }}>
          {[['Features','https://dakio.io/#features'],['Pricing','https://dakio.io/#pricing'],['About','https://dakio.io/about']].map(([l,h]) => (
            <a key={l} href={h} onClick={() => setMOpen(false)} style={{ fontSize:17, fontWeight:400, color:TW2, textDecoration:'none', padding:'14px 4px', borderBottom:`1px solid ${DB}`, display:'block' }}>{l}</a>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <a href={`${APP}/login`} style={{ flex:1, textAlign:'center', padding:'13px 0', border:`1.5px solid ${DB}`, borderRadius:10, fontSize:14, fontWeight:500, color:TW2, textDecoration:'none' }}>Log In</a>
            <a href={APP} style={{ flex:1, textAlign:'center', padding:'13px 0', background:CYAN, borderRadius:10, fontSize:14, fontWeight:600, color:WHITE, textDecoration:'none' }}>Start Free</a>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [slug, setSlug] = useState('')

  const handleFind = (e) => {
    e.preventDefault()
    const s = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (s) window.open(`https://store.dakio.io/${s}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section style={{ background:`linear-gradient(160deg, ${D0} 0%, ${D2} 50%, ${D0} 100%)`, padding:'0 clamp(20px,4vw,40px)', minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
      {/* dot grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(rgba(8,145,178,0.1) 1px, transparent 1px)`, backgroundSize:'36px 36px', pointerEvents:'none', opacity:0.4 }} />
      {/* glow */}
      <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:900, height:600, background:`radial-gradient(ellipse, rgba(8,145,178,0.07) 0%, transparent 65%)`, pointerEvents:'none' }} />

      <div style={{ maxWidth:760, margin:'0 auto', width:'100%', textAlign:'center', padding:'100px 0 80px', position:'relative' }}>

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(8,145,178,0.12)', border:'1px solid rgba(8,145,178,0.25)', borderRadius:100, padding:'5px 16px', marginBottom:24 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:CYAN, display:'inline-block' }} />
          <span style={{ fontSize:12, fontWeight:600, color:CYAN, letterSpacing:'0.03em' }}>Bangladesh's Online Store Platform</span>
        </div>

        <h1 style={{ fontSize:'clamp(36px,5.5vw,72px)', fontWeight:800, color:TW1, lineHeight:1.08, letterSpacing:'-0.03em', marginBottom:20 }}>
          Thousands of Bangladeshi<br />
          <span style={{ color: CYAN }}>Stores Live Here.</span>
        </h1>

        <p style={{ fontSize:'clamp(16px,2vw,20px)', color:TW2, lineHeight:1.75, maxWidth:500, margin:'0 auto 48px' }}>
          Every store at <span style={{ color:WHITE, fontFamily:'monospace', fontSize:'0.88em' }}>store.dakio.io/your-store</span> is built and powered by Dakio — Bangladesh's #1 ecommerce platform.
        </p>

        {/* find a store */}
        <form onSubmit={handleFind} style={{ display:'flex', maxWidth:480, margin:'0 auto 20px', gap:0, borderRadius:12, border:`1px solid rgba(8,145,178,0.35)`, background:'rgba(255,255,255,0.04)', overflow:'hidden', backdropFilter:'blur(12px)' }}>
          <span style={{ padding:'0 14px', fontSize:13, color:TW3, display:'flex', alignItems:'center', whiteSpace:'nowrap', borderRight:`1px solid ${DB}`, flexShrink:0 }}>store.dakio.io/</span>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="store-name"
            style={{ flex:1, background:'transparent', border:'none', outline:'none', fontSize:14, color:TW1, padding:'0 14px', minWidth:0, fontFamily:'monospace' }}
          />
          <button type="submit" style={{ padding:'13px 20px', background:CYAN, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:WHITE, flexShrink:0 }}>
            Find Store
          </button>
        </form>

        <p style={{ fontSize:12, color:TW3, marginBottom:36 }}>Enter a store name above to visit it directly</p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <a href={APP} style={{ padding:'0 28px', height:50, background:CYAN, borderRadius:10, fontSize:15, fontWeight:600, color:WHITE, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, boxShadow:`0 4px 24px rgba(8,145,178,0.35)` }}>
            Create Your Store Free
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="https://dakio.io" style={{ padding:'0 24px', height:50, border:`1px solid ${DB}`, borderRadius:10, fontSize:15, fontWeight:500, color:TW2, textDecoration:'none', display:'inline-flex', alignItems:'center', background:'rgba(255,255,255,0.04)' }}>
            Learn About Dakio
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function Stats() {
  const items = [
    { value:'১,০০০+',   label:'Active Stores'        },
    { value:'১ লক্ষ+',  label:'Orders Processed'     },
    { value:'৳৫০ কোটি+', label:'Total Sales Volume'  },
    { value:'৩',        label:'Integrated Couriers'  },
  ]
  return (
    <section style={{ padding:'clamp(40px,5vw,60px) clamp(20px,4vw,40px)', background:D1, borderTop:`1px solid ${DB}` }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, textAlign:'center' }} className="stats-g">
        {items.map(({ value, label }) => (
          <div key={label}>
            <div style={{ fontSize:'clamp(28px,3vw,42px)', fontWeight:800, color:WHITE, letterSpacing:'-0.02em', marginBottom:6 }}>{value}</div>
            <div style={{ fontSize:13, color:TW3, fontWeight:500 }}>{label}</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:640px){ .stats-g{ grid-template-columns:1fr 1fr !important; } }`}</style>
    </section>
  )
}

// ── Features strip ────────────────────────────────────────────────────────────
function WhyDakio() {
  const cards = [
    {
      color: CYAN,
      title: 'Your Own Online Store',
      body:  'A full ecommerce website with product pages, cart, and checkout — live in minutes. No code needed.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <rect x="5" y="18" width="30" height="17" rx="2" fill={CYAN} fillOpacity="0.12" stroke={CYAN} strokeWidth="1.4"/>
          <path d="M3 18L8 8h24l5 10H3Z" fill={CYAN} fillOpacity="0.22" stroke={CYAN} strokeWidth="1.4" strokeLinejoin="round"/>
          <rect x="16" y="25" width="8" height="10" rx="1.5" fill={CYAN} fillOpacity="0.5"/>
        </svg>
      ),
    },
    {
      color: '#A78BFA',
      title: 'Custom Domain Support',
      body:  'Connect your own domain like yourstore.com and make your brand look fully professional.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <circle cx="20" cy="20" r="15" stroke="#A78BFA" strokeWidth="1.4" fillOpacity="0"/>
          <path d="M5 20h30M20 5c-4 5-6 9-6 15s2 10 6 15M20 5c4 5 6 9 6 15s-2 10-6 15" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      color: '#34D399',
      title: 'Fast & Mobile Ready',
      body:  'Stores load instantly on any device. 100% mobile-optimised so customers can shop from anywhere.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <rect x="13" y="4" width="14" height="32" rx="3" stroke="#34D399" strokeWidth="1.4" fillOpacity="0"/>
          <circle cx="20" cy="32" r="1.5" fill="#34D399" fillOpacity="0.6"/>
          <path d="M12 18l5 4 8-9" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      color: '#FBBF24',
      title: 'Courier & Payment Built In',
      body:  'Book Steadfast, RedX, Pathao pickups and accept bKash, Nagad, COD — all from one dashboard.',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" width="26" height="26">
          <rect x="2" y="14" width="24" height="16" rx="2" fill="#FBBF24" fillOpacity="0.12" stroke="#FBBF24" strokeWidth="1.4"/>
          <path d="M26 20h8l3 5v5h-11V20Z" fill="#FBBF24" fillOpacity="0.22" stroke="#FBBF24" strokeWidth="1.4" strokeLinejoin="round"/>
          <circle cx="10" cy="30" r="3.5" fill="#FBBF24" fillOpacity="0.15" stroke="#FBBF24" strokeWidth="1.4"/>
          <circle cx="31" cy="30" r="3.5" fill="#FBBF24" fillOpacity="0.15" stroke="#FBBF24" strokeWidth="1.4"/>
        </svg>
      ),
    },
  ]

  return (
    <section style={{ padding:'clamp(64px,8vw,96px) clamp(20px,4vw,40px)', background:D2 }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:52 }}>
          <p style={{ fontSize:11, fontWeight:700, color:TW3, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>Why Merchants Choose Dakio</p>
          <h2 style={{ fontSize:'clamp(24px,3vw,40px)', fontWeight:700, color:TW1, letterSpacing:'-0.025em', lineHeight:1.15 }}>
            Everything a Bangladeshi Seller Needs
          </h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }} className="why-g">
          {cards.map(({ color, title, body, icon }) => (
            <div key={title} className="why-card" style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${DB}`, borderRadius:20, padding:'28px 24px', transition:'all 0.22s ease' }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`rgba(255,255,255,0.04)`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
                {icon}
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, color:TW1, marginBottom:10, letterSpacing:'-0.01em' }}>{title}</h3>
              <p style={{ fontSize:13, color:TW2, lineHeight:1.72 }}>{body}</p>
            </div>
          ))}
        </div>
        <style>{`
          .why-card:hover { background: rgba(255,255,255,0.05) !important; transform: translateY(-3px); }
          @media(max-width:860px){ .why-g{ grid-template-columns:1fr 1fr !important; } }
          @media(max-width:480px){ .why-g{ grid-template-columns:1fr !important; } }
        `}</style>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ padding:'clamp(48px,7vw,80px) clamp(20px,4vw,40px)', background:D1 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', background:`linear-gradient(140deg, rgba(8,145,178,0.14) 0%, rgba(8,145,178,0.04) 100%)`, border:`1px solid rgba(8,145,178,0.22)`, borderRadius:24, padding:'clamp(40px,6vw,80px) clamp(24px,5vw,60px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:600, height:360, background:`radial-gradient(ellipse, rgba(8,145,178,0.14) 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(8,145,178,0.12)', border:'1px solid rgba(8,145,178,0.25)', borderRadius:100, padding:'5px 16px', marginBottom:20, position:'relative' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:CYAN, display:'inline-block' }} />
          <span style={{ fontSize:12, fontWeight:600, color:CYAN, letterSpacing:'0.03em' }}>Free Forever Plan Available</span>
        </div>
        <h2 style={{ fontSize:'clamp(26px,4vw,48px)', fontWeight:700, color:TW1, lineHeight:1.12, marginBottom:14, letterSpacing:'-0.03em', position:'relative' }}>
          Ready to Sell Online?
        </h2>
        <p style={{ fontSize:17, color:TW2, marginBottom:36, position:'relative', maxWidth:440, margin:'0 auto 36px' }}>
          Join 1,000+ merchants already selling on Dakio. Your store is free to start — no credit card needed.
        </p>
        <a href={APP} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0 34px', height:54, background:CYAN, borderRadius:10, fontSize:16, fontWeight:600, color:WHITE, textDecoration:'none', boxShadow:`0 4px 24px rgba(8,145,178,0.38)`, position:'relative' }}>
          Create Your Free Store
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <p style={{ fontSize:12, color:TW3, marginTop:14, position:'relative' }}>No credit card. No setup fee. Live in minutes.</p>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { h:'Platform', ls:[['Features','https://dakio.io/#features'],['Pricing','https://dakio.io/#pricing'],['Dropshipping','https://dakio.io/#features'],['Couriers','https://dakio.io/#features']] },
    { h:'Company',  ls:[['About Dakio','https://dakio.io/about'],['Blog','https://dakio.io/blog'],['Contact','https://dakio.io/contact']] },
    { h:'Legal',    ls:[['Privacy Policy','https://dakio.io/privacy'],['Terms of Service','https://dakio.io/terms'],['Data Deletion','https://dakio.io/data-deletion']] },
  ]
  return (
    <footer style={{ background:D0, borderTop:`1px solid ${DB}`, padding:'clamp(36px,5vw,52px) clamp(20px,4vw,40px) 28px' }}>
      <div style={{ maxWidth:1180, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:44 }} className="ft-g">
          <div>
            <a href="https://dakio.io" style={{ display:'inline-flex', alignItems:'center', textDecoration:'none', marginBottom:14 }}>
              <img src="/dakio-logo-white.svg" alt="Dakio" style={{ height:25 }} />
            </a>
            <p style={{ fontSize:13, color:TW3, lineHeight:1.7, maxWidth:240, marginBottom:20 }}>Bangladesh's all-in-one ecommerce platform for online sellers and dropshippers.</p>
            {[
              ['House 5, Road 5, Priyanka City, Sector 12, Uttara, Dhaka'],
              ['hello@dakio.io'],
              ['01521 305 403'],
            ].map(([text]) => (
              <div key={text} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:12, color:TW3, lineHeight:1.6 }}>{text}</span>
              </div>
            ))}
          </div>
          {cols.map(col => (
            <div key={col.h}>
              <p style={{ fontSize:11, fontWeight:700, color:TW3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>{col.h}</p>
              {col.ls.map(([label, href]) => (
                <a key={label} href={href} style={{ display:'block', fontSize:13, color:'rgba(255,255,255,0.35)', textDecoration:'none', marginBottom:9 }} className="ft-link">{label}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${DB}`, paddingTop:22, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <p style={{ fontSize:12, color:TW3 }}>© 2026 Dakio by Digidhaka Communication Limited. All rights reserved.</p>
          <p style={{ fontSize:12, color:TW3 }}>Made with love for Bangladesh entrepreneurs</p>
        </div>
      </div>
      <style>{`
        .ft-link:hover { color: rgba(255,255,255,0.62) !important; }
        @media(max-width:720px){ .ft-g{ grid-template-columns:1fr 1fr !important; gap:28px !important; } }
        @media(max-width:480px){ .ft-g{ grid-template-columns:1fr !important; } }
      `}</style>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", WebkitFontSmoothing:'antialiased', MozOsxFontSmoothing:'grayscale', background:D2 }}>
      <Nav />
      <Hero />
      <Stats />
      <WhyDakio />
      <CTABanner />
      <Footer />
    </div>
  )
}
