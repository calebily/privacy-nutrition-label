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
      createAccount: true,
    })

    expect(receipt.shared).toHaveLength(3)
    expect(receipt.skipped).toEqual(['Phone number', 'Marketing preference'])
    expect(receipt.accountCreated).toBe(true)
  })

  it('keeps personal values out of the agent summary', () => {
    const summary = JSON.stringify(getAgentPrivacySummary())
    expect(summary).not.toContain('email@example.com')
    expect(summary).toContain('categories and choices only')
  })
})
