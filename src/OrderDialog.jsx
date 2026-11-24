import { useState } from 'react'
import { Check, Download, PackageCheck, ShoppingBag, X } from 'lucide-react'
import { couriers, image, products, rupees } from './catalog'
import SampleBag, { bagProduct, bagQuantity, packSize } from './SampleBag'

function downloadRequest(request) {
  const url = URL.createObjectURL(new Blob([request.body], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `velqora-${request.id.toLowerCase()}.txt`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ProductDetail({ product, bagFull, onAddToBag, onSample, onReorder }) {
  const [size, setSize] = useState('M')
  const [view, setView] = useState('front')
  return <div className="detail">
    <div className="detail-gallery">
      <div className={`detail-spin ${view === 'back' ? 'show-back' : ''}`}>
        <img className="detail-photo" src={image(product.id)} alt={`Front of ${product.name} in ${product.tone}`} aria-hidden={view !== 'front'} />
        <img className="detail-photo back-photo" src={image(product.id + '-back')} alt={`Back of ${product.name} in ${product.tone}`} aria-hidden={view !== 'back'} />
      </div>
      <fieldset className="view-controls" aria-label="Garment view">
        {['front', 'back'].map((face) => <button type="button" key={face} aria-pressed={view === face} onClick={() => setView(face)}>{face}</button>)}
      </fieldset>
    </div>
    <div className="detail-content">
      <p className="eyebrow"><span /> {product.sku} / {product.category}</p>
      <h2 id="dialog-title">{product.name}</h2>
      <p>{product.description}</p>
      <dl className="product-specs">
        <div><dt>Fabric</dt><dd>{product.fabric}</dd></div>
        <div><dt>Colour</dt><dd>{product.tone}</dd></div>
        <div><dt>Stock</dt><dd>Confirm in quote</dd></div>
      </dl>
      <fieldset className="sizes">
        <legend>Preferred size</legend>
        {product.sizes.map((item) => <button type="button" aria-pressed={size === item} key={item} onClick={() => setSize(item)}>{item}</button>)}
      </fieldset>
      <button type="button" className="button button-dark" disabled={bagFull} onClick={() => onAddToBag(product, size)}><ShoppingBag size={17} /> Add to sample bag</button>
      {bagFull && <p className="detail-bag-full">Your bag already has 25 pieces.</p>}
      <button type="button" className="text-button" onClick={() => onSample({ product, size })}>Request a single-style sample pack</button>
      <button type="button" className="text-button" onClick={() => onReorder({ product, size })}>Plan a reorder for this style</button>
    </div>
  </div>
}

export function OrderForm({ mode, initial, defaultSales, onClose, onEditBag }) {
  const isSample = mode === 'sample'
  const [sku, setSku] = useState(initial?.product?.sku || (isSample ? 'assorted' : products[0].sku))
  const [size, setSize] = useState(initial?.size || 'Mixed')
  const [courier, setCourier] = useState(couriers[1].id)
  const [sales, setSales] = useState(defaultSales || 25)
  const [qty, setQty] = useState(Math.min(100000, (defaultSales || 25) * 2))
  const [request, setRequest] = useState(null)
  const product = products.find((item) => item.sku === sku)
  const suggested = Number(sales) >= 25 ? Number(sales) * 2 : null
  const sampleItems = initial?.sampleItems
  const remaining = sampleItems ? packSize - bagQuantity(sampleItems) : 0

  function submit(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const delivery = couriers.find((option) => option.id === courier)
    const id = `${isSample ? 'SAMPLE' : 'REORDER'}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const body = [
      'VELQORA — REQUEST DRAFT', id, new Date().toLocaleDateString('en-IN'),
      '',
      `Business: ${fields.get('business')}`,
      `GST registered: ${fields.get('gst')}`,
      `Marketplace: ${fields.get('marketplace')}`,
      `Email: ${fields.get('email')}`,
      `WhatsApp: ${fields.get('phone')}`,
      `Pickup address: ${fields.get('address')}`,
      '',
      ...(sampleItems ? [
        'Sample mix:',
        ...sampleItems.map((item) => `  ${item.quantity} × ${bagProduct(item).name} (${item.sku}), size ${item.size}`),
        ...(remaining > 0 ? [`  ${remaining} × Assorted apparel, mixed sizes`] : []),
      ] : [`Style: ${product ? product.name + ' (' + sku + ')' : 'Assorted apparel'}`, `Size: ${size}`]),
      `Units requested: ${isSample ? packSize : qty}`,
      ...(isSample ? [] : [`Recorded sales: ${sales}`, `Suggested FBA stock: ${suggested ?? 'First milestone begins at 25 sales'}`]),
      `Preferred delivery: ${delivery.name}`,
      `Illustrative shipping estimate: INR ${delivery.fee}, ${delivery.time}`,
      '',
      ...(isSample ? ['Acknowledged: 25-piece sample cost is non-adjustable.', 'Acknowledged: the INR 10,000 onboarding refund requires zero sales within the agreed period and compliance with onboarding conditions. The sample pack is excluded.'] : []),
      '',
      'Quote, stock and shipping to be confirmed by Velqora. This draft has not been submitted. No payment has been taken.',
    ].join('\n')
    setRequest({ id, body })
    event.currentTarget.closest('dialog').scrollTop = 0
  }

  if (request) return <div className="order-success">
    <span className="success-mark"><PackageCheck size={28} /></span>
    <h2 id="dialog-title">Your request is ready.</h2>
    <p>Download a copy to share with Velqora. The details were prepared in this browser and have yet to be submitted.</p>
    <small>{request.id}</small>
    <button type="button" className="button button-dark" autoFocus onClick={() => downloadRequest(request)}><Download size={18} /> Download request</button>
    <button type="button" className="text-button" onClick={onClose}>Return to site</button>
  </div>

  return <div className="order-content">
    <p className="eyebrow"><span /> {isSample ? 'NEW SELLERS' : 'EXISTING SELLERS'}</p>
    <h2 id="dialog-title">{isSample ? 'Start with 25 pieces.' : 'Plan a SKU reorder.'}</h2>
    <p>{isSample ? 'Choose an initial sample mix and prepare your onboarding request.' : 'Set your quantity using recorded marketplace sales.'}</p>
    <div className="draft-notice">Request draft · pricing, stock and shipping are confirmed separately.</div>
    <form onSubmit={submit}>
      <fieldset className="form-section">
        <legend>{isSample ? 'Your sample pack' : 'Your replenishment'}</legend>
        {sampleItems ? <>
          <ul className="sample-mix">
            {sampleItems.map((item) => <li key={`${item.sku}-${item.size}`}><strong>{item.quantity} ×</strong> {bagProduct(item).name} · Size {item.size}</li>)}
            {remaining > 0 && <li><strong>{remaining} ×</strong> Assorted apparel · Mixed sizes</li>}
          </ul>
          <button type="button" className="text-button" onClick={onEditBag}>Edit sample bag</button>
        </> : <div className="field-grid">
          <label>Style<select value={sku} onChange={(event) => setSku(event.target.value)}>{isSample && <option value="assorted">Assorted apparel</option>}{products.map((item) => <option key={item.sku} value={item.sku}>{item.name} · {item.sku}</option>)}</select></label>
          <label>{isSample ? 'Size mix' : 'Size'}<select value={size} onChange={(event) => setSize(event.target.value)}>{['Mixed', 'S', 'M', 'L', 'XL'].map((item) => <option key={item}>{item}</option>)}</select></label>
          {isSample ? <label>Units<input value={packSize} readOnly /></label> : <>
            <label>Recorded sales<input required type="number" min="0" max="50000" value={sales} onChange={(event) => setSales(event.target.value)} /></label>
            <label>Units to reorder<input required type="number" min="1" max="100000" value={qty} onChange={(event) => setQty(event.target.value)} /></label>
          </>}
        </div>}
        {!isSample && <div className="form-suggestion">
          <span>{suggested === null ? '2× FBA guidance starts at 25 sales.' : `Suggested FBA stock: ${suggested} units`}</span>
          {suggested !== null && <button type="button" className="text-button" onClick={() => setQty(suggested)}>Use suggestion</button>}
        </div>}
      </fieldset>
      <fieldset className="form-section">
        <legend>Business details</legend>
        <div className="field-grid">
          <label>Business name<input name="business" required maxLength="100" autoComplete="organization" /></label>
          <label>GST registered<select name="gst" required defaultValue=""><option value="" disabled>Select status</option><option>Yes</option><option>No</option></select></label>
          <label>Marketplace<select name="marketplace" required defaultValue=""><option value="" disabled>Select marketplace</option><option>Amazon</option><option>Flipkart</option><option>Both</option></select></label>
          <label>Email<input name="email" type="email" required autoComplete="email" maxLength="200" /></label>
          <label>WhatsApp number<input name="phone" type="tel" pattern="[+]?[0-9]{10,15}" title="Enter 10 to 15 digits, with an optional leading plus." required autoComplete="tel" /></label>
          <label>Registered pickup address<input name="address" required autoComplete="street-address" maxLength="240" /></label>
        </div>
      </fieldset>
      <fieldset className="form-section">
        <legend>Preferred delivery</legend>
        <p className="field-note">Example rates, estimates and reliability scores.</p>
        <div className="courier-grid">{couriers.map((item) => <label className="courier" key={item.id}>
          <input type="radio" name="courier" value={item.id} checked={courier === item.id} onChange={() => setCourier(item.id)} />
          <span className="courier-body"><span><strong>{item.name}</strong><small>{item.label}</small></span><span>{rupees(item.fee)} · {item.time}</span><span>{item.score} reliability</span></span>
        </label>)}</div>
      </fieldset>
      {isSample && <fieldset className="form-section terms-checks">
        <legend>Sample and refund terms</legend>
        <label><input type="checkbox" name="sample-policy" required /><span><strong>The 25-piece sample pack cost is non-adjustable.</strong> It cannot be credited toward future orders.</span></label>
        <label><input type="checkbox" name="refund-policy" required /><span><strong>The ₹10,000 refund requires zero sales.</strong> The agreed evaluation period and onboarding conditions apply. The sample pack is excluded.</span></label>
      </fieldset>}
      <button type="submit" className="button button-dark"><Check size={18} /> Prepare request</button>
    </form>
  </div>
}

export default function OrderDialog({ dialogRef, modal, close, openOrder, bag, onChangeBag, onAddToBag }) {
  return <dialog className={`modal ${modal ? `modal-${modal.type}` : ''}`} ref={dialogRef}
    aria-labelledby="dialog-title" onCancel={(event) => {
      event.preventDefault()
      close()
    }} onClose={(event) => {
      if (!event.currentTarget.open) close()
    }} onClick={(event) => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
      }
    }}>
    {modal && <>
      <button type="button" className="icon-button dialog-close" aria-label="Close dialog" onClick={close}><X size={20} /></button>
      {modal.type === 'product' && <ProductDetail key={modal.product.sku} product={modal.product}
        bagFull={bagQuantity(bag) >= packSize} onAddToBag={onAddToBag}
        onSample={(initial) => openOrder('sample', initial)} onReorder={(initial) => openOrder('reorder', initial)} />}
      {modal.type === 'bag' && <SampleBag items={bag} onChange={onChangeBag} onBrowse={close}
        onContinue={() => openOrder('sample', { sampleItems: bag })} />}
      {(modal.type === 'sample' || modal.type === 'reorder') && <OrderForm key={modal.type} mode={modal.type} initial={modal.initial}
        defaultSales={modal.defaultSales} onClose={close} onEditBag={() => openOrder('bag')} />}
    </>}
  </dialog>
}
