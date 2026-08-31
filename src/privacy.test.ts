import { describe, expect, it } from 'vitest'
import {
  createPrivacyReceipt,
  emptyCheckoutForm,
  getAgentPrivacySummary,
  validateCheckout,
} from './privacy'

describe('privacy minimisation', () => {
  it('identifies missing checkout fields', () => {
    expect(validateCheckout(emptyCheckoutForm)).toEqual([
      'Full name',
      'Valid email',
      'Street address',
      'City or suburb',
      '4-digit postcode',
    ])
  })

  it('records optional data as skipped in a minimum receipt', () => {
    const receipt = createPrivacyReceipt({
      sharePhone: false,
      joinMarketing: false,
      createAccount: false,
    })

    expect(receipt.shared).toHaveLength(3)
    expect(receipt.skipped).toEqual(['Phone number', 'Marketing preference'])
    expect(receipt.accountCreated).toBe(false)
  })

  it('starts the checkout on the guest minimum-data path', () => {
    expect(emptyCheckoutForm.createAccount).toBe(false)
  })

  it('keeps personal values out of the agent summary', () => {
    const summary = JSON.stringify(getAgentPrivacySummary())
    expect(summary).not.toContain('email@example.com')
    expect(summary).toContain('categories and choices only')
    expect(summary).toContain('Continue as a guest')
  })

  it('includes a selected product privacy declaration without form values', () => {
    const summary = getAgentPrivacySummary({
      name: 'Orbit Home Companion',
      privacy: {
        headline: 'Camera-free · Voice processed on device',
        detail: 'Cloud features are opt-in.',
      },
    })

    expect(summary.product).toEqual({
      name: 'Orbit Home Companion',
      device_privacy: {
        headline: 'Camera-free · Voice processed on device',
        detail: 'Cloud features are opt-in.',
      },
    })
  })
})
