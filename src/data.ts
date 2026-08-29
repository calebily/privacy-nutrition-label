export type Product = {
  id: string
  name: string
  category: string
  description: string
  price: number
  imagePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const products: Product[] = [
  {
    id: 'weave-cable',
    name: 'Weave USB-C Cable',
    category: 'Charging',
    description: 'A durable 2 m braided cable for everyday charging.',
    price: 24.95,
    imagePosition: 'top-left',
  },
  {
    id: 'quiet-headphones',
    name: 'Quiet Wireless Headphones',
    category: 'Audio',
    description: 'Comfortable over-ear sound with 40 hours of battery.',
    price: 129,
    imagePosition: 'top-right',
  },
  {
    id: 'snap-stand',
    name: 'Snap Magnetic Stand',
    category: 'Mobile',
    description: 'A compact aluminium stand for desks and bedside tables.',
    price: 39.95,
    imagePosition: 'bottom-left',
  },
  {
    id: 'duo-charger',
    name: 'Duo 65W USB-C Charger',
    category: 'Charging',
    description: 'Fast charging for a laptop and phone from one small plug.',
    price: 69.95,
    imagePosition: 'bottom-right',
  },
]

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(price)
