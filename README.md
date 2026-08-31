# Privacy Nutrition Label

A WebMCP-enabled electronics store that explains why checkout data is requested and helps people share only what is necessary.

**Live demo:** [privacy-nutrition-label.netlify.app](https://privacy-nutrition-label.netlify.app/)

## The idea

Privacy policies are comprehensive, but they are not designed for a decision someone is making right now. This demo lets a website declare the privacy requirements of a checkout as structured, action-specific information. A person sees a quick Privacy Nutrition Label; a WebMCP agent reads the same contract and can recommend the minimum-disclosure path.

This is not an AI summary of a privacy policy. Relay—the fictional retailer in the demo—explicitly publishes what its checkout needs, why it needs it, what is optional, and where the information goes.

## MVP flow

1. Choose a realistic electronics product.
2. Enter local-only demo checkout details or use the included fictional identity.
3. Review the Privacy Nutrition Label before sharing anything.
4. Apply the minimum-data choice manually or through a WebMCP-capable agent.
5. Confirm the simulated order and receive a category-level Privacy Receipt.

The minimum path is a guest checkout: no account, phone number, or marketing use. Account creation remains an explicit option for a more realistic retail flow.

No backend, database, authentication service, analytics, external fonts, or payment service is used. Refresh clears the demo.

The collection uses one simple house-brand naming system—Loop, Hush, Halo, and Orbit—rather than invented sub-brands. Orbit, the camera-free home companion, also shows how a product-specific device privacy declaration can sit beside the action-specific checkout label without turning the MVP into a device-management platform.

## Why WebMCP

Without WebMCP, an agent has to infer checkout behaviour from visible UI or scrape prose. Relay instead exposes a small, explicit contract for the current action. This lets the agent explain the privacy trade-off, wait for the person’s decision, and complete the demo using confirmed choices.

The page registers two imperative tools through `document.modelContext`:

- `inspect_checkout_privacy` — read-only. Returns the declared data categories, purposes, sharing, required/optional status, and minimum recommendation. It also opens the same label for the person.
- `complete_private_checkout` — state-changing. Accepts privacy choices only and requires explicit confirmation. It reads completed form values inside the page, validates them locally, and returns a receipt containing categories—not personal values.

## Data-minimisation boundary

- The agent receives declared categories, purposes, choices, and category-level receipts.
- Name, email, address, and phone values remain inside the page.
- Optional uses start off: guest checkout, no courier phone sharing, and no marketing.
- The write tool stops unless `confirmed` is explicitly true.
- The response states whether an account was created and which categories were used, but never returns personal values.

The agent needs the disclosure contract and the person’s choices; it does not need their identity or delivery details in its tool output.

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

The preview server also uses port `51026`. The complete human checkout remains usable when WebMCP is unavailable.

## Demo walkthrough

Open the live site in a WebMCP-capable ChatGPT browser. Start a fresh chat with:

> For this demo, respond in English only, including tool explanations and confirmation messages.

Choose a product, open its checkout, use the fictional demo details, and then ask:

> Inspect this checkout’s privacy requirements. Explain what is required, what is optional, and recommend the minimum-data choice. Do not place the order; wait for my explicit confirmation.

After the agent explains the label, confirm with:

> I confirm this demo order with account creation, phone sharing, and marketing all disabled. Complete it using the site’s write tool.

Expected result: the write tool completes a guest demo checkout and returns only the three required categories. The page shows a matching Privacy Receipt.

## WebMCP verification

### ChatGPT built-in browser

1. Open the live demo in ChatGPT’s browser.
2. Open **Site tools** and verify that both tools are listed.
3. Call `inspect_checkout_privacy`; the visible label should open and the output should contain categories rather than form values.
4. Call `complete_private_checkout` with `confirmed: false`; it must stop with `confirmation_required`.
5. After explicit confirmation, call it with all optional choices disabled; it may complete the local demo order.

### Local Chrome testing

WebMCP is experimental and requires a compatible client/browser.

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Enable the flag and relaunch Chrome.
3. Start this project and open the checkout page.
4. Use the Model Context Tool Inspector described in the [official Chrome WebMCP guide](https://developer.chrome.com/docs/ai/webmcp/) to confirm both tools are registered.

Automated tests cover metadata budgets, malformed inputs, missing page fields, explicit confirmation, category-only outputs, and repeated execution. They do not replace a final pass in a WebMCP-capable client because the browser API remains experimental.

## Tech stack

- React + TypeScript
- Vite
- WebMCP `document.modelContext`
- Vitest
- Netlify static hosting

## License

Released under the [MIT License](LICENSE).
