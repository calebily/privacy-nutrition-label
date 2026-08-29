export type Product = {
  id: string
  name: string
  category: string
  description: string
  price: number
  imagePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  privacy?: {
    headline: string
    detail: string
  }
}

export const products: Product[] = [
  {
    id: 'loop-cable',
    name: 'Loop USB-C Cable',
    category: 'Charging',
    description: 'A durable 2 m braided cable for everyday charging.',
    price: 24.95,
    imagePosition: 'top-left',
  },
  {
    id: 'hush-headphones',
    name: 'Hush Wireless Headphones',
    category: 'Audio',
    description: 'Comfortable over-ear sound with 40 hours of battery.',
    price: 129,
    imagePosition: 'top-right',
  },
  {
    id: 'halo-stand',
    name: 'Halo Magnetic Stand',
    category: 'Mobile',
    description: 'A compact aluminium stand for desks and bedside tables.',
    price: 39.95,
    imagePosition: 'bottom-left',
  },
  {
    id: 'orbit-companion',
    name: 'Orbit Home Companion',
    category: 'Home',
    description: 'A palm-sized companion for reminders, timers and daily routines.',
    price: 249,
    imagePosition: 'bottom-right',
    privacy: {
      headline: 'Camera-free · Voice processed on device',
      detail: 'Orbit has no camera. Voice requests stay on the device by default; cloud features are opt-in.',
    },
  },
]

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(price)
