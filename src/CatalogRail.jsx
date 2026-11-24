import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, LayoutGrid, MoveHorizontal, Shirt } from 'lucide-react'
import { image, products } from './catalog'
import HangingRail from './HangingRail'
import './hanging-rail.css'

const filters = ['All styles', ...new Set(products.map((product) => product.category))]

function CardRail({ list, onProduct }) {
  const [position, setPosition] = useState(0)
  const rail = useRef(null)
  const drag = useRef(null)
  const blockClick = useRef(false)

  function updatePosition() {
    const { scrollWidth, clientWidth, scrollLeft } = rail.current
    setPosition(scrollWidth > clientWidth + 1 ? scrollLeft / (scrollWidth - clientWidth) : 0)
  }

  function step(direction) {
    const element = rail.current
    const card = element.firstElementChild
    if (!card) return
    const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap)
    element.scrollBy({
      left: distance * direction,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  function pointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    blockClick.current = false
    drag.current = { id: event.pointerId, x: event.clientX, left: rail.current.scrollLeft, last: event.clientX, time: event.timeStamp, velocity: 0 }
  }

  function pointerMove(event) {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    if (event.buttons === 0) {
      release(event)
      return
    }
    if (!blockClick.current && Math.abs(event.clientX - state.x) < 6) return
    if (!blockClick.current) {
      blockClick.current = true
      rail.current.setPointerCapture(event.pointerId)
      rail.current.classList.add('is-grabbing')
    }
    state.velocity = (event.clientX - state.last) / Math.max(1, event.timeStamp - state.time)
    state.last = event.clientX
    state.time = event.timeStamp
    rail.current.scrollLeft = state.left + state.x - event.clientX
  }

  function release(event) {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    const element = rail.current
    drag.current = null
    element.classList.remove('is-grabbing')
    if (blockClick.current && event.type === 'pointerup' && event.timeStamp - state.time < 100 &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const momentum = Math.max(-360, Math.min(360, state.velocity * 190))
      element.scrollBy({ left: -momentum, behavior: 'smooth' })
    }
  }

  return <>
      <div className="card-rail-controls">
        <div className="rail-controls">
          <button type="button" className="icon-button" onClick={() => step(-1)} aria-label="Previous styles"><ArrowLeft size={18} /></button>
          <button type="button" className="icon-button" onClick={() => step(1)} aria-label="Next styles"><ArrowRight size={18} /></button>
        </div>
      </div>

      <div className="rail" ref={rail} onScroll={updatePosition} onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onPointerLeave={(event) => {
          if (!blockClick.current) release(event)
        }} onClickCapture={(event) => {
          if (blockClick.current && event.detail > 0) {
            event.stopPropagation()
            blockClick.current = false
          }
        }} onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          step(event.key === 'ArrowLeft' ? -1 : 1)
        }}>
        {list.map((product) => <button className="product-card" key={product.id} onClick={() => onProduct(product)} type="button"
          aria-label={`View ${product.name}`}>
          <div className="product-photo">
            <img src={image(product.id)} alt="" loading="lazy" draggable="false" />
            <span className="sku">{product.sku}</span>
            <span className="product-open"><ArrowUpRight size={18} /></span>
          </div>
          <div className="product-info">
            <div><strong>{product.name}</strong><small>{product.fabric} · {product.tone}</small></div>
            <span>S–XL</span>
          </div>
        </button>)}
      </div>
      <div className="rail-footer">
        <span><MoveHorizontal size={16} /> Swipe or drag to browse</span>
        <div className="rail-progress" aria-hidden="true"><i style={{ left: `${position * 62}%` }} /></div>
      </div>
  </>
}

export default function CatalogRail({ onProduct }) {
  const [category, setCategory] = useState(filters[0])
  const [view, setView] = useState('hanging')
  const list = useMemo(() => category === filters[0] ? products : products.filter((product) => product.category === category), [category])

  return <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
    <div className="shell">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow"><span /> THE VELQORA CATALOG</p>
          <h2 id="catalog-title">The Everyday <em>Rail.</em></h2>
        </div>
        <p>Explore apparel for your marketplace catalog, from tees and polos to easy layers.</p>
      </div>
      <div className="catalog-toolbar">
        <div className="filters" role="group" aria-label="Filter by category">
          {filters.map((filter) => <button type="button" key={filter} aria-pressed={category === filter} onClick={() => setCategory(filter)}>{filter}</button>)}
        </div>
        <div className="catalog-views" role="group" aria-label="Catalog view">
          <button type="button" onClick={() => setView('hanging')} aria-pressed={view === 'hanging'}><Shirt size={15} /> Rail</button>
          <button type="button" onClick={() => setView('cards')} aria-pressed={view === 'cards'}><LayoutGrid size={15} /> Grid</button>
        </div>
      </div>
      {view === 'hanging' ? <HangingRail key={category} list={list} onProduct={onProduct} /> : <CardRail key={category} list={list} onProduct={onProduct} />}
      <p className="catalog-availability">Illustrative styles · stock on request</p>
    </div>
  </section>
}
