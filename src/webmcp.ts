import type { Product } from './data'
import {
  getAgentPrivacySummary,
  validateCheckout,
  type CheckoutForm,
  type PrivacyChoice,
  type PrivacyReceipt,
} from './privacy'

export type PrivacyToolDefinition = {
  name: string
  title: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: {
    readOnlyHint: boolean
    untrustedContentHint: boolean
  }
  execute: (input: unknown) => Promise<string>
}

type PrivacyToolDependencies = {
  getForm: () => CheckoutForm
  getProduct: () => Product
  getReceipt: () => PrivacyReceipt | null
  openPrivacyLabel: () => void
  showMissingFields: (missing: string[]) => void
  completeCheckout: (choice: PrivacyChoice) => PrivacyReceipt
}

type CompleteCheckoutInput = {
  share_phone: boolean
  join_marketing: boolean
  create_account: boolean
  confirmed: boolean
}

export const WEBMCP_TOOL_NAMES = {
  inspect: 'inspect_checkout_privacy',
  complete: 'complete_private_checkout',
} as const

const inspectToolMetadata = {
  name: WEBMCP_TOOL_NAMES.inspect,
  title: 'Inspect checkout privacy',
  description:
    'Explains why each checkout data group is requested, which groups are optional, and the minimum-disclosure choice. Returns declared categories only, never personal form values.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: false },
}

const completeToolMetadata = {
  name: WEBMCP_TOOL_NAMES.complete,
  title: 'Complete privacy-aware checkout',
  description:
    'Completes the local demo checkout using confirmed privacy choices. Use after presenting the privacy summary and receiving explicit confirmation. Personal values are validated inside the page and are never returned.',
  inputSchema: {
    type: 'object',
    properties: {
      share_phone: {
        type: 'boolean',
        description: 'Share an entered phone number with the courier.',
      },
      join_marketing: {
        type: 'boolean',
        description: 'Use the email for optional product marketing.',
      },
      create_account: {
        type: 'boolean',
        description: 'Create the password-free demo account.',
      },
      confirmed: {
        type: 'boolean',
        description: 'True only after explicit human confirmation.',
      },
    },
    required: ['share_phone', 'join_marketing', 'create_account', 'confirmed'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: false, untrustedContentHint: false },
}

function isCompleteCheckoutInput(input: unknown): input is CompleteCheckoutInput {
  if (!input || typeof input !== 'object') return false
  const value = input as Record<string, unknown>
  const allowedKeys = ['share_phone', 'join_marketing', 'create_account', 'confirmed']
  const keys = Object.keys(value)
  return (
    keys.length === allowedKeys.length &&
    keys.every((key) => allowedKeys.includes(key)) &&
    typeof value.share_phone === 'boolean' &&
    typeof value.join_marketing === 'boolean' &&
    typeof value.create_account === 'boolean' &&
    typeof value.confirmed === 'boolean'
  )
}

function receiptOutput(status: 'complete' | 'already_complete', receipt: PrivacyReceipt) {
  return JSON.stringify({
    status,
    order: receipt.orderNumber,
    shared_categories: receipt.shared,
    skipped_categories: receipt.skipped,
    account_created: receipt.accountCreated,
    personal_values_returned: false,
  })
}

export function buildPrivacyTools(dependencies: PrivacyToolDependencies): PrivacyToolDefinition[] {
  return [
    {
      ...inspectToolMetadata,
      execute: async () => {
        dependencies.openPrivacyLabel()
        return JSON.stringify(getAgentPrivacySummary(dependencies.getProduct()))
      },
    },
    {
      ...completeToolMetadata,
      execute: async (input) => {
        if (!isCompleteCheckoutInput(input)) {
          return JSON.stringify({
            status: 'invalid_request',
            message: 'Provide all four privacy choices as booleans.',
          })
        }

        if (!input.confirmed) {
          return JSON.stringify({
            status: 'confirmation_required',
            message: 'Present the privacy summary and ask the person to confirm before completing checkout.',
          })
        }

        const existingReceipt = dependencies.getReceipt()
        if (existingReceipt) return receiptOutput('already_complete', existingReceipt)

        const form = dependencies.getForm()
        const missing = validateCheckout(form)
        if (missing.length) {
          dependencies.showMissingFields(missing)
          return JSON.stringify({
            status: 'details_required',
            missing,
            message: 'Ask the person to complete these fields in the page. Do not request their values in chat.',
          })
        }

        const receipt = dependencies.completeCheckout({
          sharePhone: input.share_phone && Boolean(form.phone.trim()),
          joinMarketing: input.join_marketing,
          createAccount: input.create_account,
        })
        return receiptOutput('complete', receipt)
      },
    },
  ]
}
