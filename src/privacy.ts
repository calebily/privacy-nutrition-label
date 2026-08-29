export type CheckoutForm = {
  fullName: string
  email: string
  address: string
  city: string
  postcode: string
  phone: string
  marketing: boolean
  createAccount: boolean
}

export type PrivacyChoice = {
  sharePhone: boolean
  joinMarketing: boolean
  createAccount: boolean
}

export type PrivacyItem = {
  id: string
  data: string
  why: string
  required: boolean
  sharedWith: string
  retention: string
}

export type PrivacyReceipt = {
  orderNumber: string
  shared: string[]
  skipped: string[]
  accountCreated: boolean
}

export const emptyCheckoutForm: CheckoutForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postcode: '',
  phone: '',
  marketing: false,
  createAccount: true,
}

export const privacyItems: PrivacyItem[] = [
  {
    id: 'contact',
    data: 'Name & email',
    why: 'Send your receipt and identify your demo account.',
    required: true,
    sharedWith: 'Not shared outside Relay.',
    retention: 'Kept with the demo order until refresh.',
  },
  {
    id: 'address',
    data: 'Delivery address',
    why: 'Deliver this order to the right place.',
    required: true,
    sharedWith: 'Delivery partner for this order.',
    retention: 'Kept with the demo order until refresh.',
  },
  {
    id: 'order',
    data: 'Order details',
    why: 'Prepare the item and provide order support.',
    required: true,
    sharedWith: 'Delivery partner receives parcel details only.',
    retention: 'Kept with the demo order until refresh.',
  },
  {
    id: 'phone',
    data: 'Phone number',
    why: 'Let the courier contact you about delivery.',
    required: false,
    sharedWith: 'Delivery partner only if you provide it.',
    retention: 'Kept with the demo order until refresh.',
  },
  {
    id: 'marketing',
    data: 'Marketing preference',
    why: 'Send occasional product news and offers.',
    required: false,
    sharedWith: 'Not shared outside Relay.',
    retention: 'Not persisted in this demo.',
  },
]

export function validateCheckout(form: CheckoutForm): string[] {
  const errors: string[] = []
  if (!form.fullName.trim()) errors.push('Full name')
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.push('Valid email')
  if (!form.address.trim()) errors.push('Street address')
  if (!form.city.trim()) errors.push('City or suburb')
  if (!/^\d{4}$/.test(form.postcode.trim())) errors.push('4-digit postcode')
  return errors
}

export function createPrivacyReceipt(choice: PrivacyChoice): PrivacyReceipt {
  const shared = ['Name & email', 'Delivery address', 'Order details']
  const skipped: string[] = []

  if (choice.sharePhone) shared.push('Phone number')
  else skipped.push('Phone number')

  if (choice.joinMarketing) shared.push('Marketing preference')
  else skipped.push('Marketing preference')

  return {
    orderNumber: 'RLY-51026',
    shared,
    skipped,
    accountCreated: choice.createAccount,
  }
}

export function getAgentPrivacySummary(product?: {
  name: string
  privacy?: { headline: string; detail: string }
}) {
  return {
    action: 'Create a demo account and place an electronics order',
    product: product
      ? {
          name: product.name,
          device_privacy: product.privacy ?? 'No product-specific device disclosure.',
        }
      : undefined,
    summary: '3 required data groups, 2 optional. No advertising tracking.',
    required: privacyItems
      .filter((item) => item.required)
      .map(({ data, why, sharedWith }) => ({ data, why, sharedWith })),
    optional: privacyItems
      .filter((item) => !item.required)
      .map(({ data, why, sharedWith }) => ({ data, why, sharedWith })),
    recommendation: 'Omit phone number and decline marketing for minimum disclosure.',
    boundary: 'Personal values remain in the page. Tool output contains categories and choices only.',
    scope: 'The checkout label covers this purchase. Product-specific device privacy is declared separately when relevant.',
    next: 'Explain the minimum option and ask the person to confirm before completing checkout.',
  }
}
