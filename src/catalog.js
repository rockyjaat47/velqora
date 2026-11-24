export const image = (name) => `${import.meta.env.BASE_URL}images/${name}.webp`

export const products = [
  { id: 'tee', sku: 'VQ-101', name: 'Essential Crew Tee', category: 'T-shirts', fabric: 'Cotton jersey', tone: 'Oat', sizes: ['S', 'M', 'L', 'XL'], description: 'A clean crew neckline, straight hem and an easy everyday fit.' },
  { id: 'polo', sku: 'VQ-102', name: 'Classic Piqué Polo', category: 'Polos', fabric: 'Cotton piqué', tone: 'Black', sizes: ['S', 'M', 'L', 'XL'], description: 'A textured short-sleeve polo with a soft collar and button placket.' },
  { id: 'shirt', sku: 'VQ-103', name: 'Everyday Oxford Shirt', category: 'Shirts', fabric: 'Woven cotton', tone: 'Olive', sizes: ['S', 'M', 'L', 'XL'], description: 'A long-sleeve woven shirt with a curved hem and button cuffs.' },
  { id: 'sweatshirt', sku: 'VQ-104', name: 'Studio Crew Sweatshirt', category: 'Layers', fabric: 'Cotton-blend fleece', tone: 'Camel', sizes: ['S', 'M', 'L', 'XL'], description: 'A crewneck layer with ribbed cuffs and a soft fleece interior.' },
  { id: 'hoodie', sku: 'VQ-105', name: 'Core Fleece Hoodie', category: 'Layers', fabric: 'Cotton-blend fleece', tone: 'Charcoal', sizes: ['S', 'M', 'L', 'XL'], description: 'An easy pullover hoodie with a drawstring hood and kangaroo pocket.' },
  { id: 'jogger', sku: 'VQ-106', name: 'Relaxed Lounge Jogger', category: 'Bottoms', fabric: 'French terry', tone: 'Sand', sizes: ['S', 'M', 'L', 'XL'], description: 'A tapered jogger with an adjustable waist and ribbed ankle cuffs.' },
]

export const couriers = [
  { id: 'economy', name: 'Economy courier', fee: 149, time: '5–7 days', score: '94%', label: 'Lowest rate' },
  { id: 'balanced', name: 'Standard courier', fee: 199, time: '3–5 days', score: '98%', label: 'Recommended' },
  { id: 'express', name: 'Express courier', fee: 279, time: '2–3 days', score: '97%', label: 'Fastest' },
]

export const policies = [
  ['What qualifies for the ₹10,000 zero-sale refund?', 'The onboarding amount is refundable when the seller records zero sales in the agreed evaluation period and meets the onboarding agreement’s conditions. These include account approval, timely pickup handover and operational cooperation. The agreement defines the start date and evaluation period. The sample pack is excluded from the refund.'],
  ['Can I apply the sample cost to a later order?', 'The initial 25-piece sample pack is mandatory for new clients. Its cost cannot be credited toward future orders, replenishment or account balances.'],
  ['What does organic growth include?', 'The service focuses on search-friendly listings, accurate sizing and catalog information, and stock availability. The catalog focuses on affordable everyday apparel.'],
  ['How do shipping and Amazon FBA pickup work?', 'Velqora packages and labels stock for dispatch. A selected courier delivers it to your registered address. For Amazon FBA orders, Amazon then collects eligible stock from that address for fulfillment. Confirm the applicable pickup process during onboarding.'],
  ['How much inventory should I reorder?', 'Velqora recommends targeting twice your recorded sales as FBA stock after the first 25 sales. For example, 25 sales suggest 50 units and 50 sales suggest 100 units. The final quantity depends on available stock, space and budget.'],
  ['When is payment due, and how are invoices sent?', 'Orders are processed after advance payment. The planned invoice service sends a PDF after a confirmed payment by email and WhatsApp. On this site you can download a request summary to review or share.'],
]

export const rupees = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value)
