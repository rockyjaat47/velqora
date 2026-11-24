import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowDown, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Menu,
  Package, PackageCheck, ShieldCheck, Truck, Warehouse, X,
} from 'lucide-react'
import '@fontsource-variable/manrope'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/playfair-display/wght-italic.css'
import HeroArtwork from './HeroArtwork'
import CatalogRail from './CatalogRail'
import OrderDialog from './OrderDialog'
import { policies } from './catalog'
import './styles.css'

const links = [
  ['Catalog', '#catalog'],
  ['How it works', '#how-it-works'],
  ['Reorder', '#reorder'],
  ['Policies', '#policies'],
]

const stats = [
  [Package, '25 pieces', 'First sample pack'],
  [ChartNoAxesCombined, '100% organic', 'Marketplace growth model'],
  [Warehouse, '2× inventory', 'Amazon FBA stock guidance'],
]

const supplySteps = [
  [Package, 'Start with samples', 'Choose 25 pieces to assess fabric, sizing and fit for your catalog.'],
  [PackageCheck, 'We pack and label', 'Velqora prepares the apparel and applies the required barcodes and labels.'],
  [Truck, 'Courier to your address', 'Choose a carrier to deliver your stock to your registered location.'],
  [Warehouse, 'Amazon collects for FBA', 'For eligible Amazon FBA shipments, hand over the stock at your registered address.'],
]

function Brand() {
  return <a className="brand" href="#top" aria-label="Velqora home">
    <svg viewBox="0 0 42 42" width="39" height="39" aria-hidden="true">
      <path d="M2.5 9H11l10 20.5L31 9h8.5L21 38Z" fill="currentColor" />
      <path d="m21 2.5 5.4 7.2-5.4 5.4-5.4-5.4Z" fill="currentColor" />
    </svg>
    <span>VELQORA</span>
  </a>
}

function Header({ onStart }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="site-header">
    <div className="shell header-inner">
      <Brand />
      <nav className={menuOpen ? 'site-nav open' : 'site-nav'} id="primary-nav" aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
      </nav>
      <button className="button header-cta" type="button" onClick={() => {
        setMenuOpen(false)
        onStart()
      }}>Get started <ArrowUpRight size={17} /></button>
      <button className="icon-button menu-button" type="button" aria-expanded={menuOpen} aria-controls="primary-nav"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  </header>
}

function Hero({ onStart }) {
  return <>
    <section className="hero" aria-labelledby="hero-title">
      <HeroArtwork />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span /> B2B APPAREL FOR MARKETPLACE SELLERS</p>
          <h1 id="hero-title">Build your <em>apparel business.</em></h1>
          <p className="hero-description">Source everyday clothing, launch on Amazon and Flipkart, and grow through organic sales.</p>
          <div className="hero-actions">
            <button className="button button-gold" type="button" onClick={onStart}>Start with 25 pieces <ArrowUpRight size={19} /></button>
            <a className="quiet-link" href="#catalog">Explore catalog <ArrowDown size={16} /></a>
          </div>
        </div>
        <a className="guarantee" href="#refund">
          <ShieldCheck size={23} strokeWidth={1.5} />
          <span><strong>₹10,000</strong><small>Zero-sale refund guarantee</small></span>
          <ArrowUpRight className="guarantee-arrow" size={15} />
        </a>
      </div>
    </section>
    <div className="trust">
      <div className="shell trust-inner">
        {stats.map(([Icon, headline, label]) => <div className="trust-item" key={label}>
          <span className="trust-icon"><Icon size={22} strokeWidth={1.45} /></span>
          <div><strong>{headline}</strong><small>{label}</small></div>
        </div>)}
      </div>
    </div>
  </>
}

function Fulfillment() {
  return <section className="fulfillment" id="how-it-works" aria-labelledby="supply-title">
    <div className="shell">
      <div className="section-intro">
        <p className="eyebrow"><span /> THE SUPPLY CHAIN</p>
        <h2 id="supply-title">From sample <em>to shelf.</em></h2>
        <p>See who handles your stock at each step, from the initial pack to Amazon fulfillment.</p>
      </div>
      <ol className="steps">
        {supplySteps.map(([Icon, title, description], index) => <li key={title}>
          <div className="step-top"><Icon size={24} strokeWidth={1.5} /><span>0{index + 1}</span></div>
          <h3>{title}</h3><p>{description}</p>
        </li>)}
      </ol>
    </div>
  </section>
}

function Scaling({ onReorder }) {
  const [sales, setSales] = useState(25)
  const stock = sales * 2
  return <section id="reorder" className="scaling" aria-labelledby="scale-title">
    <div className="shell scaling-inner">
      <div className="scaling-copy">
        <p className="eyebrow"><span /> REPLENISHMENT</p>
        <h2 id="scale-title">Plan your next <em>reorder.</em></h2>
        <p>From your first 25 sales, use our 2× guideline to estimate how many units to keep in Amazon FBA.</p>
        <button type="button" className="button button-dark" onClick={() => onReorder(sales)}>Create a SKU reorder <ArrowUpRight size={18} /></button>
      </div>
      <div className="calculator">
        <div className="calculator-label"><ChartNoAxesCombined size={19} /> FBA STOCK PLANNER</div>
        <div className="calculator-stats">
          <div><output htmlFor="sales-slider">{sales}</output><span>Recorded sales</span></div>
          <ArrowRight size={25} strokeWidth={1.5} />
          <div><output htmlFor="sales-slider">{stock}</output><span>Suggested units</span></div>
        </div>
        <label className="sr-only" htmlFor="sales-slider">Recorded sales</label>
        <input id="sales-slider" type="range" min="25" max="100" step="1" value={sales}
          onChange={(event) => setSales(Number(event.target.value))} />
        <div className="range-labels" aria-hidden="true"><span>25</span><span>50</span><span>75</span><span>100</span></div>
      </div>
    </div>
  </section>
}

function PolicyHub() {
  const refund = useRef(null)

  useEffect(() => {
    function openLinkedPolicy() {
      if (location.hash === '#refund') refund.current.open = true
    }
    openLinkedPolicy()
    window.addEventListener('hashchange', openLinkedPolicy)
    return () => window.removeEventListener('hashchange', openLinkedPolicy)
  }, [])

  return <section className="policies" id="policies" aria-labelledby="policy-title">
    <div className="shell policies-inner">
      <div className="section-intro">
        <p className="eyebrow"><span /> SELLER POLICIES</p>
        <h2 id="policy-title">Know the <em>terms.</em></h2>
        <p>How the sample pack, zero-sale refund and fulfillment work.</p>
      </div>
      <div className="faq">
        {policies.map(([question, answer], index) => <details key={question} id={index === 0 ? 'refund' : undefined} ref={index === 0 ? refund : undefined}>
          <summary>{question}<span aria-hidden="true" /></summary>
          <p>{answer}</p>
        </details>)}
      </div>
    </div>
  </section>
}

function App() {
  const [modal, setModal] = useState(null)
  const dialog = useRef(null)

  useEffect(() => {
    const element = dialog.current
    if (modal && !element.open) element.showModal()
    if (modal) {
      element.scrollTop = 0
      element.querySelector('.dialog-close')?.focus()
    }
    if (!modal && element.open) element.close()
  }, [modal])

  const openOrder = (type, initial, defaultSales) => setModal({ type, initial, defaultSales })
  const start = () => openOrder('sample')

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div id="top" />
    <Header onStart={start} />
    <main id="main">
      <Hero onStart={start} />
      <CatalogRail onProduct={(product) => setModal({ type: 'product', product })} />
      <Fulfillment />
      <Scaling onReorder={(sales) => openOrder('reorder', undefined, sales)} />
      <PolicyHub />
      <section className="closing" aria-labelledby="closing-title">
        <div className="shell closing-inner">
          <div>
            <p className="eyebrow"><span /> FIRST SAMPLE PACK</p>
            <h2 id="closing-title">Start with <em>25 pieces.</em></h2>
          </div>
          <button type="button" className="button button-gold" onClick={start}>Prepare a sample request <ArrowUpRight size={18} /></button>
        </div>
      </section>
    </main>
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Brand />
        <nav aria-label="Footer navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
        <small>© {new Date().getFullYear()} Velqora</small>
      </div>
    </footer>
    <OrderDialog dialogRef={dialog} modal={modal} close={() => setModal(null)} openOrder={openOrder} />
  </>
}

createRoot(document.getElementById('root')).render(<App />)
