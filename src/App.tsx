import { useEffect, useRef, useState } from 'react'
import { formatPrice, products, type Product } from './data'
import {
  createPrivacyReceipt,
  emptyCheckoutForm,
  privacyItems,
  validateCheckout,
  type CheckoutForm,
  type PrivacyChoice,
  type PrivacyReceipt,
} from './privacy'
import { buildPrivacyTools } from './webmcp'

type View = 'shop' | 'checkout' | 'success'
type WebMcpStatus = 'checking' | 'ready' | 'unavailable'

const demoIdentity: CheckoutForm = {
  fullName: 'Jamie Lee',
  email: 'jamie@example.test',
  address: '18 Harbour Street',
  city: 'Sydney',
  postcode: '2000',
  phone: '',
  marketing: false,
  createAccount: false,
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10 4 4 8-9" />
    </svg>
  )
}

function ProductImage({ product }: { product: Product }) {
  return (
    <div className={`product-image ${product.imagePosition}`}>
      <img src="/product-grid.webp" alt={product.name} />
    </div>
  )
}

function Header({ view, onLogoClick }: { view: View; onLogoClick: () => void }) {
  return (
    <header className="site-header">
      <button className="wordmark" type="button" onClick={onLogoClick} aria-label="Relay home">
        RELAY<span>.</span>
      </button>
      <nav aria-label="Primary navigation">
        <button type="button" onClick={onLogoClick} className={view === 'shop' ? 'active' : ''}>
          Shop
        </button>
        <a href="#privacy-promise">Our privacy promise</a>
      </nav>
      <div className="header-meta">
        <span>AU</span>
        <span className="bag-dot" aria-hidden="true" />
      </div>
    </header>
  )
}

function PrivacyLabel({
  onClose,
  onUseMinimum,
  source,
  product,
}: {
  onClose: () => void
  onUseMinimum: () => void
  source: 'person' | 'agent'
  product: Product
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="privacy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-topbar">
          <div className="eyebrow-row">
            <span className="eyebrow">Privacy Nutrition Label</span>
            {source === 'agent' && <span className="agent-opened">Opened by your agent</span>}
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close privacy label" autoFocus>
            ×
          </button>
        </div>

        <div className="label-intro">
          <h2 id="privacy-title">Know what you’re sharing before you check out.</h2>
          <p>Three things make this order work. Two are your choice.</p>
          <div className="privacy-stats" aria-label="Privacy summary">
            <div><strong>3</strong><span>required</span></div>
            <div><strong>2</strong><span>optional</span></div>
            <div className="no-track"><strong>None</strong><span>ad tracking</span></div>
          </div>
          {product.privacy && (
            <div className="device-privacy-note">
              <span>About {product.name}</span>
              <div>
                <strong>{product.privacy.headline}</strong>
                <p>{product.privacy.detail}</p>
              </div>
            </div>
          )}
        </div>

        <div className="label-list">
          <div className="label-list-heading">
            <span>Data</span>
            <span>Why it’s needed</span>
            <span>Choice</span>
          </div>
          {privacyItems.map((item) => (
            <details className="label-row" key={item.id}>
              <summary>
                <strong>{item.data}</strong>
                <span>{item.why}</span>
                <span className={`requirement ${item.required ? 'required' : 'optional'}`}>
                  {item.required ? 'Required' : 'Optional'}
                </span>
              </summary>
              <div className="label-detail">
                <p><span>Shared with</span>{item.sharedWith}</p>
                <p><span>In this demo</span>{item.retention}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="modal-actions">
          <p><span className="signal-dot" /> Declared by Relay for this checkout</p>
          <button type="button" className="primary-button" onClick={onUseMinimum}>
            Use minimum data <ArrowIcon />
          </button>
        </div>
      </section>
    </div>
  )
}

function Shop({ onBuy }: { onBuy: (product: Product) => void }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Everyday tech, considered.</p>
          <h1>Better essentials.<br />Nothing extra.</h1>
        </div>
        <div className="hero-copy">
          <p>Useful electronics chosen for daily life, with a checkout that explains every piece of data it asks for.</p>
          <a href="#products">Shop the collection <ArrowIcon /></a>
        </div>
      </section>

      <section className="assurance-strip" aria-label="Store assurances">
        <span>Free delivery over A$80</span>
        <span>30-day returns</span>
        <span>Privacy-clear checkout</span>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Small upgrades, made useful.</h2>
          </div>
          <p>Four essentials. Carefully selected, clearly explained.</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <ProductImage product={product} />
              <div className="product-info">
                <div>
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  {product.privacy && <em className="product-privacy">{product.privacy.headline}</em>}
                </div>
                <div className="product-action">
                  <strong>{formatPrice(product.price)}</strong>
                  <button type="button" onClick={() => onBuy(product)} aria-label={`Buy ${product.name}`}>
                    <ArrowIcon />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-promise" id="privacy-promise">
        <p className="eyebrow">A clearer kind of checkout</p>
        <h2>The policy tells the whole story.<br />The label tells you what matters now.</h2>
        <p className="promise-copy">
          Before you share anything, Relay shows what this checkout needs, why it needs it, and what you can leave out.
          The same structured information is available to a WebMCP agent—without sending your form values to it.
        </p>
        <div className="promise-points">
          <div><span>01</span><h3>Purpose, not just categories</h3><p>See why each data type is requested.</p></div>
          <div><span>02</span><h3>Minimum by default</h3><p>Optional data stays optional.</p></div>
          <div><span>03</span><h3>One source, two readers</h3><p>Clear for people and structured for agents.</p></div>
        </div>
      </section>
    </main>
  )
}

function Checkout({
  product,
  form,
  errors,
  reviewed,
  onChange,
  onFillDemo,
  onOpenLabel,
  onPlaceOrder,
}: {
  product: Product
  form: CheckoutForm
  errors: string[]
  reviewed: boolean
  onChange: (patch: Partial<CheckoutForm>) => void
  onFillDemo: () => void
  onOpenLabel: () => void
  onPlaceOrder: () => void
}) {
  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">Demo checkout</p>
          <h1>Where should we send it?</h1>
        </div>
        <button type="button" className="text-button" onClick={onFillDemo}>Use demo details</button>
      </div>

      <div className="checkout-layout">
        <section className="checkout-form" aria-labelledby="contact-heading">
          <div className="form-section">
            <div className="form-section-heading">
              <span>01</span>
              <div><h2 id="contact-heading">Contact</h2><p>For your receipt and order updates.</p></div>
            </div>
            <div className="field-grid two-columns">
              <label>Full name<input value={form.fullName} autoComplete="name" onChange={(e) => onChange({ fullName: e.target.value })} /></label>
              <label>Email<input type="email" value={form.email} autoComplete="email" onChange={(e) => onChange({ email: e.target.value })} /></label>
            </div>
            <label className="choice-row">
              <input type="checkbox" checked={form.createAccount} onChange={(e) => onChange({ createAccount: e.target.checked })} />
              <span><strong>Create a password-free demo account</strong><small>Uses your email for a one-time sign-in. Nothing is saved after refresh.</small></span>
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span>02</span>
              <div><h2>Delivery</h2><p>Only the details needed to route this order.</p></div>
            </div>
            <div className="field-grid">
              <label>Street address<input value={form.address} autoComplete="street-address" onChange={(e) => onChange({ address: e.target.value })} /></label>
            </div>
            <div className="field-grid two-columns narrow-second">
              <label>City or suburb<input value={form.city} autoComplete="address-level2" onChange={(e) => onChange({ city: e.target.value })} /></label>
              <label>Postcode<input value={form.postcode} inputMode="numeric" maxLength={4} autoComplete="postal-code" onChange={(e) => onChange({ postcode: e.target.value.replace(/\D/g, '') })} /></label>
            </div>
            <label>Phone <span className="optional-copy">Optional</span><input type="tel" value={form.phone} autoComplete="tel" onChange={(e) => onChange({ phone: e.target.value })} placeholder="For courier updates" /></label>
          </div>

          <div className="form-section compact-section">
            <label className="choice-row">
              <input type="checkbox" checked={form.marketing} onChange={(e) => onChange({ marketing: e.target.checked })} />
              <span><strong>Send me occasional product news</strong><small>Optional. Not needed for this order.</small></span>
            </label>
          </div>
        </section>

        <aside className="order-summary">
          <p className="eyebrow">Your order</p>
          <div className="summary-product">
            <ProductImage product={product} />
            <div><h2>{product.name}</h2><p>Qty 1</p><strong>{formatPrice(product.price)}</strong></div>
          </div>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(product.price)}</dd></div>
            <div><dt>Delivery</dt><dd>{product.price >= 80 ? 'Free' : formatPrice(8.95)}</dd></div>
            <div className="total"><dt>Total</dt><dd>{formatPrice(product.price + (product.price >= 80 ? 0 : 8.95))}</dd></div>
          </dl>

          <button type="button" className={`privacy-preview ${reviewed ? 'reviewed' : ''}`} onClick={onOpenLabel}>
            <span className="privacy-mark">P</span>
            <span><strong>{reviewed ? 'Privacy reviewed' : 'Check before you share'}</strong><small>3 required · 2 optional · no ad tracking</small></span>
            {reviewed ? <CheckIcon /> : <ArrowIcon />}
          </button>

          {errors.length > 0 && (
            <div className="form-errors" role="alert">
              <strong>Please check:</strong> {errors.join(', ')}
            </div>
          )}
          <button type="button" className="primary-button place-order" onClick={onPlaceOrder}>
            Place demo order <ArrowIcon />
          </button>
          <p className="demo-note">Demo only. No payment details or real order are created.</p>
        </aside>
      </div>
    </main>
  )
}

function Success({ receipt, product, onReset }: { receipt: PrivacyReceipt; product: Product; onReset: () => void }) {
  return (
    <main className="success-page">
      <section className="success-intro">
        <div className="success-check"><CheckIcon /></div>
        <p className="eyebrow">Demo order {receipt.orderNumber}</p>
        <h1>Order placed.<br />Nothing extra shared.</h1>
        <p>Your {product.name} is on its imaginary way. Here’s the privacy receipt for this action.</p>
      </section>

      <section className="receipt-card" aria-labelledby="receipt-heading">
        <div className="receipt-header">
          <div><p className="eyebrow">Privacy Receipt</p><h2 id="receipt-heading">What this checkout used</h2></div>
          <span>Action complete</span>
        </div>
        <div className="receipt-columns">
          <div>
            <h3>Shared for this order</h3>
            <ul>{receipt.shared.map((item) => <li key={item}><CheckIcon />{item}</li>)}</ul>
          </div>
          <div className="skipped-list">
            <h3>Left out</h3>
            <ul>{receipt.skipped.length ? receipt.skipped.map((item) => <li key={item}>— {item}</li>) : <li>Nothing</li>}</ul>
          </div>
        </div>
        <div className="receipt-foot">
          <p>{receipt.accountCreated ? 'Password-free demo account created.' : 'Guest demo checkout used.'} Personal values stayed in this page and disappear on refresh.</p>
          <button type="button" className="secondary-button" onClick={onReset}>Back to shop</button>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState<View>('shop')
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm)
  const [receipt, setReceipt] = useState<PrivacyReceipt | null>(null)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [privacySource, setPrivacySource] = useState<'person' | 'agent'>('person')
  const [privacyReviewed, setPrivacyReviewed] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [webMcpStatus, setWebMcpStatus] = useState<WebMcpStatus>('checking')
  const formRef = useRef(form)
  const productRef = useRef(selectedProduct)
  const receiptRef = useRef(receipt)

  useEffect(() => { formRef.current = form }, [form])
  useEffect(() => { productRef.current = selectedProduct }, [selectedProduct])
  useEffect(() => { receiptRef.current = receipt }, [receipt])

  useEffect(() => {
    if (!privacyOpen) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPrivacyOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      previouslyFocused?.focus()
    }
  }, [privacyOpen])

  const finishCheckout = (choice: PrivacyChoice) => {
    const nextForm = {
      ...formRef.current,
      phone: choice.sharePhone ? formRef.current.phone : '',
      marketing: choice.joinMarketing,
      createAccount: choice.createAccount,
    }
    formRef.current = nextForm
    setForm(nextForm)
    const nextReceipt = createPrivacyReceipt(choice)
    receiptRef.current = nextReceipt
    setReceipt(nextReceipt)
    setPrivacyOpen(false)
    setView('success')
    setErrors([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return nextReceipt
  }

  useEffect(() => {
    if (!('modelContext' in document) || !document.modelContext) {
      setWebMcpStatus('unavailable')
      return
    }

    const modelContext = document.modelContext
    const controller = new AbortController()

    const register = async () => {
      try {
        const tools = buildPrivacyTools({
          getForm: () => formRef.current,
          getProduct: () => productRef.current,
          getReceipt: () => receiptRef.current,
          openPrivacyLabel: () => {
            setPrivacySource('agent')
            setPrivacyOpen(true)
          },
          showMissingFields: (missing) => {
            setView('checkout')
            setErrors(missing)
          },
          completeCheckout: finishCheckout,
        })

        for (const tool of tools) {
          await modelContext.registerTool(
            tool as Parameters<typeof modelContext.registerTool>[0],
            { signal: controller.signal },
          )
        }
        setWebMcpStatus('ready')
      } catch {
        if (!controller.signal.aborted) setWebMcpStatus('unavailable')
      }
    }

    void register()
    return () => controller.abort()
  }, [])

  const goHome = () => {
    setView('shop')
    setPrivacyOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startCheckout = (product: Product) => {
    setSelectedProduct(product)
    setReceipt(null)
    receiptRef.current = null
    setView('checkout')
    setErrors([])
    setPrivacyReviewed(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateForm = (patch: Partial<CheckoutForm>) => {
    setForm((current) => ({ ...current, ...patch }))
    setErrors([])
  }

  const openPrivacy = () => {
    setPrivacySource('person')
    setPrivacyOpen(true)
  }

  const applyMinimum = () => {
    updateForm({ phone: '', marketing: false, createAccount: false })
    setPrivacyReviewed(true)
    setPrivacyOpen(false)
  }

  const placeOrder = () => {
    const missing = validateCheckout(form)
    if (missing.length) {
      setErrors(missing)
      return
    }
    if (!privacyReviewed) {
      openPrivacy()
      return
    }
    finishCheckout({
      sharePhone: Boolean(form.phone.trim()),
      joinMarketing: form.marketing,
      createAccount: form.createAccount,
    })
  }

  const resetDemo = () => {
    setForm(emptyCheckoutForm)
    formRef.current = emptyCheckoutForm
    setReceipt(null)
    receiptRef.current = null
    setPrivacyReviewed(false)
    goHome()
  }

  return (
    <div className="app-shell">
      <Header view={view} onLogoClick={goHome} />
      {view === 'shop' && <Shop onBuy={startCheckout} />}
      {view === 'checkout' && (
        <Checkout
          product={selectedProduct}
          form={form}
          errors={errors}
          reviewed={privacyReviewed}
          onChange={updateForm}
          onFillDemo={() => { setForm(demoIdentity); formRef.current = demoIdentity; setErrors([]) }}
          onOpenLabel={openPrivacy}
          onPlaceOrder={placeOrder}
        />
      )}
      {view === 'success' && receipt && <Success receipt={receipt} product={selectedProduct} onReset={resetDemo} />}

      <footer>
        <div className="footer-brand"><span>RELAY.</span><p>Everyday tech, considered.</p></div>
        <div className="footer-links"><a href="#products">Shop</a><a href="#privacy-promise">Privacy</a><span>Demo store · Australia</span></div>
        <div className={`webmcp-status ${webMcpStatus}`} role="status" aria-live="polite">
          <span /> {webMcpStatus === 'ready' ? 'WebMCP ready' : webMcpStatus === 'checking' ? 'Checking WebMCP' : 'WebMCP preview mode'}
        </div>
      </footer>

      {privacyOpen && (
        <PrivacyLabel
          onClose={() => setPrivacyOpen(false)}
          onUseMinimum={applyMinimum}
          source={privacySource}
          product={selectedProduct}
        />
      )}
    </div>
  )
}
