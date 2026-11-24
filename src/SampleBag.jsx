import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { image, products } from './catalog'
import './sample-bag.css'

export const packSize = 25
const storageKey = 'velqora-sample-bag-v1'
const catalogBySku = new Map(products.map((product) => [product.sku, product]))
export const bagQuantity = (items) => items.reduce((count, item) => count + item.quantity, 0)
export const bagProduct = (item) => catalogBySku.get(item.sku)

export function updateBag(items, sku, size, change) {
  const current = items.find((item) => item.sku === sku && item.size === size)
  const quantity = current?.quantity || 0
  const next = Math.max(0, Math.min(quantity + change, packSize - bagQuantity(items) + quantity))
  if (next === quantity) return items
  if (!current) return [...items, { sku, size, quantity: next }]
  return next === 0 ? items.filter((item) => item !== current)
    : items.map((item) => item === current ? { ...item, quantity: next } : item)
}

export function loadBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey))
    if (!Array.isArray(saved)) return []
    return saved.reduce((bag, item) => {
      if (!item || !catalogBySku.get(item.sku)?.sizes.includes(item.size) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return bag
      return updateBag(bag, item.sku, item.size, item.quantity)
    }, [])
  } catch {
    return []
  }
}

export function saveBag(items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items))
  } catch {
    // Keep the selections available in memory when storage is disabled.
  }
}

export default function SampleBag({ items, onChange, onContinue, onBrowse }) {
  const quantity = bagQuantity(items)
  const remaining = packSize - quantity

  return <div className="sample-drawer">
    <header className="sample-drawer-heading">
      <p className="eyebrow"><span /> FIRST SAMPLE PACK</p>
      <h2 id="dialog-title">Sample bag <span>{quantity}</span></h2>
      <p>Select styles and sizes for your 25-piece request.</p>
    </header>
    {items.length ? <ul className="sample-lines">
      {items.map((item) => {
        const product = bagProduct(item)
        const label = `${product.name}, size ${item.size}`
        return <li key={`${item.sku}-${item.size}`}>
          <img src={image(product.id)} alt="" width={66} height={78} />
          <div className="sample-line-info">
            <strong>{product.name}</strong>
            <small>{product.sku} · {product.tone} · Size {item.size}</small>
            <div className="sample-quantity">
              <button type="button" aria-label={`Decrease quantity of ${label}`} onClick={() => onChange(item.sku, item.size, -1)}><Minus size={14} /></button>
              <output aria-label={`Quantity of ${label}`}>{item.quantity}</output>
              <button type="button" disabled={!remaining} aria-label={`Increase quantity of ${label}`} onClick={() => onChange(item.sku, item.size, 1)}><Plus size={14} /></button>
            </div>
          </div>
          <button className="icon-button sample-remove" type="button" aria-label={`Remove ${label}`} onClick={() => onChange(item.sku, item.size, -item.quantity)}><Trash2 size={17} /></button>
        </li>
      })}
    </ul> : <div className="empty-sample"><ShoppingBag size={28} strokeWidth={1.4} /><p>Your sample bag is empty.</p>
      <a className="button button-dark" href="#catalog" onClick={onBrowse}>Browse the rail <ArrowRight size={18} /></a>
    </div>}
    {!!items.length && <footer className="sample-drawer-footer">
      <div><strong>Selected pieces</strong><output aria-live="polite">{quantity} / {packSize}</output></div>
      {remaining > 0 && <p>{remaining} assorted {remaining === 1 ? 'piece' : 'pieces'} will complete your pack. You can add more styles before continuing.</p>}
      <button type="button" className="button button-dark" onClick={onContinue}>Continue to sample request <ArrowRight size={18} /></button>
    </footer>}
  </div>
}
