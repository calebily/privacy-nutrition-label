# Privacy Nutrition Label

A WebMCP-enabled electronics store that explains why checkout data is requested and helps people share only what is necessary.

## The idea

Privacy policies are comprehensive, but they are not designed for a decision someone is making right now. This demo lets a website declare the privacy requirements of a checkout as structured, action-specific information. A person sees a quick Privacy Nutrition Label; a WebMCP agent reads the same contract and can recommend the minimum-disclosure path.

This is not an AI summary of a privacy policy. Relay—the fictional retailer in the demo—explicitly publishes what its checkout needs, why it needs it, what is optional, and where the information goes.

## MVP flow

1. Choose a realistic electronics product.
2. Enter local-only demo checkout details or use the included fictional identity.
3. Review the Privacy Nutrition Label before sharing anything.
4. Apply the minimum-data choice manually or through a WebMCP-capable agent.
5. Complete the simulated order and receive a category-level Privacy Receipt.

No backend, database, authentication service, analytics, external fonts, or payment service is used. Refresh clears the demo.

The collection uses one simple house-brand naming system—Loop, Hush, Halo, and Orbit—rather than presenting invented sub-brands. Orbit, the camera-free home companion, also demonstrates how a product-specific device privacy declaration can sit beside the action-specific checkout label without turning the MVP into a device-management platform.

## WebMCP tools

The page registers two imperative WebMCP tools through `document.modelContext`:

- `inspect_checkout_privacy` — read-only. Returns the declared data categories, purposes, sharing, required/optional status, and minimum recommendation. It also opens the same label for the person.
- `complete_private_checkout` — state-changing. Accepts privacy choices only and requires explicit confirmation. It reads completed form values inside the page, validates them locally, and returns a receipt containing categories—not personal values.

This boundary is deliberate: the agent needs to reason about the disclosure contract and the person’s choices, not receive their name, email, address, or phone number in its tool output.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open `http://localhost:51026`.

```bash
npm test
npm run build
npm run preview
```

The preview server also uses port `51026`. WebMCP support currently requires a compatible client/browser; the complete human checkout remains usable without it.

## Demo prompt

After opening the checkout and filling the fictional demo details, ask a WebMCP-capable agent:

> Check what this checkout wants to collect, recommend the minimum-data option, and wait for my confirmation before placing the demo order.

After confirming, the agent can call the completion tool with phone sharing and marketing disabled.
