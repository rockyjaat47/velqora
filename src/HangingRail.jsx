import { useId, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react'
import { image } from './catalog'

const lineup = [0, 1, 2, 3, 4, 5, 1, 3, 0, 4, 2, 5, 3, 1, 0, 5, 2, 4, 0, 3]
const neighbourSpacing = [0, 20, 9, 3]
const railPath = 'M0 13 Q600 109 1200 13'

function BrassRail({ railRef }) {
  const gradient = useId()
  return <svg ref={railRef} className="hanging-brass" viewBox="0 0 1200 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#ad8244" />
        <stop offset=".5" stopColor="#d9b67a" />
        <stop offset="1" stopColor="#8d602b" />
      </linearGradient>
    </defs>
    <path d={railPath} transform="translate(0 3)" stroke="#74522b" opacity=".17" strokeWidth="5" />
    <path d={railPath} stroke={`url(#${gradient})`} strokeWidth="5" />
    <path d={railPath} transform="translate(0 -1.3)" stroke="#f3d79f" strokeWidth="1" />
  </svg>
}

function Hanger({ trousers }) {
  return <svg className="hanging-wood" viewBox="0 0 142 67" aria-hidden="true">
    <path d="M70 4C64-1 58 5 62 11C64 14 70 12 71 19L71 27" fill="none" stroke="#69461e" strokeWidth="2.4" strokeLinecap="round" />
    <path d={trousers ? 'M71 26 L19 50 H123 Z' : 'M71 26 L12 59 Q10 62 15 63 H127 Q132 62 130 59 Z'} fill="none" stroke="#63422d" strokeWidth="5" strokeLinejoin="round" />
    <path d={trousers ? 'M28 50v7m86-7v7' : 'M71 26 16 57m55-31 55 31'} fill="none" stroke="#ac7b4d" strokeWidth="2" strokeLinecap="round" />
  </svg>
}

export default function HangingRail({ list, onProduct }) {
  const items = list.length === 6 ? lineup.map((index) => list[index]) : list
  const [active, setActive] = useState(null)
  const [bounds, setBounds] = useState({ start: true, end: false })
  const scroller = useRef(null)
  const stage = useRef(null)
  const line = useRef(null)
  const progress = useRef(null)
  const drag = useRef(null)
  const ignoreClick = useRef(false)
  const lastPointer = useRef('')
  const motion = useRef(null)

  useLayoutEffect(() => {
    const viewport = scroller.current
    const rack = stage.current
    const buttons = Array.from(viewport.querySelectorAll('.hanging-item'))
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    motion.current = reduced
    let frame = 0
    let lastScroll = viewport.scrollLeft
    let lastTime = 0
    let angle = 0
    let angularVelocity = 0
    let width = 0
    let railHeight = 0
    let centers = []

    function render(time) {
      frame = 0
      const elapsed = lastTime ? Math.min(2.5, Math.max(.35, (time - lastTime) / 16.67)) : 1
      const scroll = viewport.scrollLeft
      const velocity = (scroll - lastScroll) / elapsed
      const maxScroll = viewport.scrollWidth - viewport.clientWidth
      lastScroll = scroll
      lastTime = time

      if (reduced.matches) {
        angle = 0
        angularVelocity = 0
      } else {
        const target = Math.max(-8, Math.min(8, -velocity * .34))
        angularVelocity = (angularVelocity + (target - angle) * .085 * elapsed) * .77 ** elapsed
        angle += angularVelocity * elapsed
      }

      for (const [index, button] of buttons.entries()) {
        const center = centers[index] - scroll
        if (center < -160 || center > width + 160) continue
        const t = 2 * center / (width || 1) - 1
        const hook = railHeight * (.13 + .48 * Math.max(0, 1 - t * t))
        button.style.setProperty('--hook-y', `${hook.toFixed(2)}px`)
        button.style.setProperty('--sway', `${(angle * (.76 + (index % 4) * .1)).toFixed(2)}deg`)
      }

      progress.current.style.setProperty('--rack-progress', maxScroll > 0 ? scroll / maxScroll : 0)
      const start = scroll < 2
      const end = maxScroll - scroll < 2
      setBounds((previous) => previous.start === start && previous.end === end ? previous : { start, end })
      if (Math.abs(angle) + Math.abs(angularVelocity) > .025) schedule()
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render)
    }

    function measure() {
      width = viewport.clientWidth
      railHeight = line.current.getBoundingClientRect().height
      centers = buttons.map((button) => button.offsetLeft + button.offsetWidth / 2)
      schedule()
    }

    function onWheel(event) {
      if (!event.shiftKey || event.deltaX || !event.deltaY) return
      if (viewport.scrollWidth <= viewport.clientWidth) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? viewport.clientWidth : 1
      viewport.scrollLeft += event.deltaY * unit
    }

    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    resize.observe(line.current)
    const intersection = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      rack.dataset.revealed = 'true'
      intersection.disconnect()
    }, { threshold: .22 })
    intersection.observe(rack)
    viewport.addEventListener('scroll', schedule, { passive: true })
    viewport.addEventListener('wheel', onWheel, { passive: false })
    reduced.addEventListener('change', schedule)
    measure()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      intersection.disconnect()
      viewport.removeEventListener('scroll', schedule)
      viewport.removeEventListener('wheel', onWheel)
      reduced.removeEventListener('change', schedule)
    }
  }, [list])

  const scrollBehavior = () => motion.current?.matches ? 'instant' : 'smooth'

  function step(direction) {
    const viewport = scroller.current
    const pitch = viewport.querySelector('.hanging-item')?.offsetWidth || 0
    viewport.scrollBy({ left: pitch * direction, behavior: scrollBehavior() })
    setActive(null)
  }

  function pointerDown(event) {
    lastPointer.current = event.pointerType
    ignoreClick.current = false
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    drag.current = {
      id: event.pointerId, x: event.clientX, start: scroller.current.scrollLeft,
      lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, moved: false,
    }
  }

  function pointerMove(event) {
    const pointer = drag.current
    if (!pointer || pointer.id !== event.pointerId) return
    if (event.buttons === 0) return endDrag(event)
    const offset = event.clientX - pointer.x
    if (!pointer.moved && Math.abs(offset) < 6) return
    const viewport = scroller.current
    if (!pointer.moved) {
      pointer.moved = true
      ignoreClick.current = true
      viewport.setPointerCapture(event.pointerId)
      viewport.classList.add('is-dragging')
      setActive(null)
    }
    pointer.velocity = (event.clientX - pointer.lastX) / Math.max(1, event.timeStamp - pointer.lastTime)
    pointer.lastX = event.clientX
    pointer.lastTime = event.timeStamp
    viewport.scrollLeft = pointer.start - offset
  }

  function endDrag(event) {
    const pointer = drag.current
    if (!pointer || pointer.id !== event.pointerId) return
    drag.current = null
    scroller.current.classList.remove('is-dragging')
    if (!pointer.moved || motion.current?.matches || event.type !== 'pointerup' || event.timeStamp - pointer.lastTime > 110) return
    const distance = Math.max(-430, Math.min(430, pointer.velocity * 205))
    scroller.current.scrollBy({ left: -distance, behavior: 'smooth' })
  }

  function keyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const children = Array.from(scroller.current.querySelectorAll('.hanging-item'))
    const focused = children.indexOf(event.target)
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    event.preventDefault()
    if (focused < 0 && event.key.startsWith('Arrow')) {
      step(direction)
      return
    }
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? children.length - 1
      : Math.min(children.length - 1, Math.max(0, focused + direction))
    children[index].focus({ preventScroll: true })
    children[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: scrollBehavior() })
  }

  return <div className="hanging-experience">
    <div className="hanging-stage" ref={stage}>
      <BrassRail railRef={line} />
      <div className="hanging-scroll" ref={scroller} tabIndex={0} role="group" aria-label="Garments on the rail" aria-describedby="hanging-instructions"
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
        onPointerLeave={(event) => {
          if (!drag.current?.moved) endDrag(event)
          if (event.pointerType === 'mouse') setActive(null)
        }} onKeyDown={keyDown}>
        <div className="hanging-track">
          {items.map((product, index) => {
            const distance = active === null ? 0 : index - active
            const nudge = Math.sign(distance) * (neighbourSpacing[Math.abs(distance)] || 0)
            return <button key={`${product.id}-${index}`} type="button" className={`hanging-item${active === index ? ' is-active' : ''}`}
              style={{ '--nudge': `${nudge}px`, '--delay': `${Math.min(index, 10) * 46}ms`, '--turn': index % 2 ? '-48deg' : '49deg' }}
              aria-label={`View ${product.name}, ${product.tone}, hanger ${index + 1} of ${items.length}`}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse' && !drag.current?.moved) setActive(index)
              }}
              onFocus={(event) => {
                if (event.currentTarget.matches(':focus-visible')) setActive(index)
              }}
              onBlur={() => setActive((previous) => previous === index ? null : previous)}
              onClick={(event) => {
                if (event.detail > 0 && ignoreClick.current) return
                if (event.detail > 0 && lastPointer.current === 'touch' && active !== index) {
                  setActive(index)
                  return
                }
                const art = event.currentTarget.querySelector('img')
                onProduct(product, art)
              }}>
              <span className="hanging-visual" aria-hidden="true">
                <span className="hanging-drop">
                  <span className="hanging-sway">
                    <span className={`hanging-piece hanging-piece-${product.id}`}>
                      <Hanger trousers={product.id === 'jogger'} />
                      <img src={image(product.id)} alt="" decoding="async" draggable="false" />
                      <span className="hanging-tag">{product.sku.slice(3)}</span>
                    </span>
                  </span>
                </span>
              </span>
            </button>
          })}
        </div>
      </div>
    </div>
    <div className="hanging-footer">
      <p id="hanging-instructions"><MoveHorizontal size={16} aria-hidden="true" /> <span className="hanging-mouse-hint">Drag to browse · select to inspect</span><span className="hanging-touch-hint">Swipe to browse · tap twice to inspect</span></p>
      {active !== null && <p className="hanging-active">{items[active].name}<small>{items[active].tone} · {items[active].sku}</small></p>}
      <div className="hanging-navigation">
        <button type="button" className="icon-button" onClick={() => step(-1)} disabled={bounds.start} aria-label="Previous hangers"><ChevronLeft size={19} /></button>
        <div className="hanging-progress" aria-hidden="true" ref={progress}><i /></div>
        <button type="button" className="icon-button" onClick={() => step(1)} disabled={bounds.end} aria-label="Next hangers"><ChevronRight size={19} /></button>
      </div>
    </div>
  </div>
}
