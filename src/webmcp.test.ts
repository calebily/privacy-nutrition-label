import { describe, expect, it, vi } from 'vitest'
import { products } from './data'
import { createPrivacyReceipt, type CheckoutForm, type PrivacyReceipt } from './privacy'
import { buildPrivacyTools, WEBMCP_TOOL_NAMES } from './webmcp'

const completedForm: CheckoutForm = {
  fullName: 'Jamie Lee',
  email: 'jamie@example.test',
  address: '18 Harbour Street',
  city: 'Sydney',
  postcode: '2000',
  phone: '',
  marketing: false,
  createAccount: false,
}

function setup(form: CheckoutForm = completedForm) {
  let receipt: PrivacyReceipt | null = null
  const openPrivacyLabel = vi.fn()
  const showMissingFields = vi.fn()
  const completeCheckout = vi.fn((choice) => {
    receipt = createPrivacyReceipt(choice)
    return receipt
  })
  const tools = buildPrivacyTools({
    getForm: () => form,
    getProduct: () => products[3],
    getReceipt: () => receipt,
    openPrivacyLabel,
    showMissingFields,
    completeCheckout,
  })
  return { tools, openPrivacyLabel, showMissingFields, completeCheckout }
}

describe('WebMCP privacy tools', () => {
  it('publishes two focused tools within recommended metadata budgets', () => {
    const { tools } = setup()
    expect(tools.map((tool) => tool.name)).toEqual([
      WEBMCP_TOOL_NAMES.inspect,
      WEBMCP_TOOL_NAMES.complete,
    ])
    for (const tool of tools) {
      expect(tool.name.length).toBeLessThanOrEqual(30)
      expect(tool.description.length).toBeLessThanOrEqual(500)
    }
    expect(tools[0].annotations.readOnlyHint).toBe(true)
    expect(tools[1].annotations.readOnlyHint).toBe(false)
  })

  it('opens the human label and returns a compact category-only summary', async () => {
    const { tools, openPrivacyLabel } = setup()
    const output = await tools[0].execute({})
    expect(openPrivacyLabel).toHaveBeenCalledOnce()
    expect(output.length).toBeLessThanOrEqual(1500)
    expect(output).toContain('Orbit Home Companion')
    expect(output).not.toContain(completedForm.email)
    expect(output).not.toContain(completedForm.address)
  })

  it('rejects malformed inputs and unconfirmed actions', async () => {
    const { tools, completeCheckout } = setup()
    expect(await tools[1].execute({ confirmed: true })).toContain('invalid_request')
    expect(
      await tools[1].execute({
        share_phone: false,
        join_marketing: false,
        create_account: true,
        confirmed: true,
        unexpected: true,
      }),
    ).toContain('invalid_request')
    expect(
      await tools[1].execute({
        share_phone: false,
        join_marketing: false,
        create_account: true,
        confirmed: false,
      }),
    ).toContain('confirmation_required')
    expect(completeCheckout).not.toHaveBeenCalled()
  })

  it('keeps missing personal values in the page', async () => {
    const { tools, showMissingFields } = setup({ ...completedForm, address: '' })
    const output = await tools[1].execute({
      share_phone: false,
      join_marketing: false,
      create_account: true,
      confirmed: true,
    })
    expect(output).toContain('details_required')
    expect(output).toContain('Street address')
    expect(output).not.toContain(completedForm.address)
    expect(showMissingFields).toHaveBeenCalledWith(['Street address'])
  })

  it('returns a receipt without personal values and is idempotent', async () => {
    const { tools, completeCheckout } = setup()
    const input = {
      share_phone: false,
      join_marketing: false,
      create_account: true,
      confirmed: true,
    }
    const first = await tools[1].execute(input)
    const second = await tools[1].execute(input)
    expect(first).toContain('"status":"complete"')
    expect(second).toContain('"status":"already_complete"')
    expect(first).toContain('"personal_values_returned":false')
    expect(first).not.toContain(completedForm.fullName)
    expect(first).not.toContain(completedForm.email)
    expect(first).not.toContain(completedForm.address)
    expect(completeCheckout).toHaveBeenCalledOnce()
  })

  it('does not claim an empty optional phone number was shared', async () => {
    const { tools } = setup()
    const output = await tools[1].execute({
      share_phone: true,
      join_marketing: false,
      create_account: true,
      confirmed: true,
    })
    expect(output).toContain('"skipped_categories":["Phone number"')
    expect(output).not.toContain('"shared_categories":["Phone number"')
  })
})
