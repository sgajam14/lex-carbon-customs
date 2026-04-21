import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../utils/api';
import { formatPrice } from '../utils/formatters';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PAYMENT_ELEMENT_OPTIONS = {
  layout: { type: 'tabs', defaultCollapsed: false },
  paymentMethodOrder: ['card', 'link', 'cashapp', 'paypal', 'klarna', 'afterpay_clearpay'],
  wallets: {
    applePay: 'auto',
    googlePay: 'auto',
  },
};

const EXPRESS_CHECKOUT_OPTIONS = {
  buttonHeight: 46,
  layout: { maxColumns: 2, maxRows: 2, overflow: 'auto' },
  paymentMethodOrder: ['google_pay', 'apple_pay', 'link', 'paypal'],
};

const ELEMENTS_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#ef232a',
    colorBackground: '#111114',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    colorTextSecondary: '#9ca3af',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
  },
  rules: {
    '.Input': {
      border: '1px solid #2a2b31',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #ef232a',
      boxShadow: '0 0 0 1px #ef232a',
    },
    '.Tab': {
      border: '1px solid #2a2b31',
      backgroundColor: '#1a1b20',
    },
    '.Tab:hover': {
      border: '1px solid #3a3b42',
    },
    '.Tab--selected': {
      border: '1px solid #ef232a',
    },
  },
};

function CheckoutForm({ orderData, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [walletsAvailable, setWalletsAvailable] = useState(false);

  const confirmAndFinalizePayment = async (paymentIntent) => {
    // Only create the order after payment is confirmed
    const { data: orderRes } = await orderApi.create(orderData);
    const orderId = orderRes.order._id;
    await paymentApi.confirm({ paymentIntentId: paymentIntent.id, orderId });
    onSuccess(orderId);
  };

  const handleStripeConfirm = async () => {
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/orders?success=true`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      throw new Error(stripeError.message || 'Payment failed. Please try again.');
    }

    if (paymentIntent?.status === 'succeeded') {
      await confirmAndFinalizePayment(paymentIntent);
      return;
    }

    if (paymentIntent?.status === 'processing') {
      // Webhook will handle order creation for async payments
      const { data: orderRes } = await orderApi.create(orderData);
      onSuccess(orderRes.order._id);
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Please complete your payment details.');
        return;
      }

      await handleStripeConfirm();
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExpressConfirm = async (event) => {
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);
    setError('');

    try {
      await handleStripeConfirm();
    } catch (err) {
      event.paymentFailed();
      setError(err.message || 'Express checkout failed. Please try another payment option.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-4 mb-4">
        <ExpressCheckoutElement
          options={EXPRESS_CHECKOUT_OPTIONS}
          onConfirm={handleExpressConfirm}
          onReady={(event) => {
            const available = event?.availablePaymentMethods;
            setWalletsAvailable(Boolean(available && (available.googlePay || available.applePay)));
          }}
        />
      </div>

      {walletsAvailable && (
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t dark:border-dark-border border-light-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs dark:text-gray-500 text-gray-400 uppercase tracking-wide dark:bg-dark-surface bg-white">Or pay with card / other methods</span>
          </div>
        </div>
      )}

      <div className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-4 mb-4">
        <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lock size={16} />
        {processing ? 'Processing...' : `Pay ${formatPrice(orderData.total)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: info, 2: payment
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    line1: '', line2: '', city: '', state: '', zip: '',
    country: 'US', phone: user?.phone || '',
  });
  const [guestEmail, setGuestEmail] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Standard');

  const shippingOptions = [
    { id: 'Standard', label: 'Standard Shipping', desc: '5-10 business days', price: subtotal >= 500 ? 0 : 25 },
    { id: 'Expedited', label: 'Expedited', desc: '2-4 business days', price: 35 },
    { id: 'Overnight', label: 'Overnight', desc: 'Next business day', price: 75 },
  ];

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const affiliateCode = localStorage.getItem('lcc_ref') || undefined;
      const orderData = {
        items: items.map(i => ({ product: i._id, qty: i.qty, fitment: i.fitment })),
        shippingAddress: address,
        shippingMethod,
        guestEmail: !user ? guestEmail : undefined,
        guestName: !user ? `${address.firstName} ${address.lastName}` : undefined,
        affiliateCode,
        total,
      };
      setPendingOrderData(orderData);

      // Create payment intent only — order is created after payment succeeds
      const { data: piRes } = await paymentApi.createIntent({ amount: total });
      setClientSecret(piRes.clientSecret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error setting up payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (orderId) => {
    clearCart();
    navigate(`/orders/${orderId}?success=true`);
  };

  if (items.length === 0 && !pendingOrderData) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Payment' }].map(s => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.n ? 'bg-brand-red text-white' : 'dark:bg-dark-surface-2 bg-gray-200 dark:text-gray-500 text-gray-400'}`}>
                {s.n}
              </div>
              <span className={`text-sm font-heading font-semibold uppercase tracking-wider ${step >= s.n ? 'dark:text-white text-gray-900' : 'dark:text-gray-500 text-gray-400'}`}>{s.label}</span>
              {s.n < 2 && <span className="w-8 h-px dark:bg-dark-border bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                {!user && (
                  <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                    <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4">Contact</h3>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      className="input-dark"
                      required
                    />
                    <p className="text-xs dark:text-gray-500 text-gray-400 mt-1.5">
                      <a href="/login" className="text-brand-red">Sign in</a> for order history and faster checkout
                    </p>
                  </div>
                )}

                <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                  <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">First Name</label>
                      <input type="text" value={address.firstName} onChange={e => setAddress(a => ({ ...a, firstName: e.target.value }))} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Last Name</label>
                      <input type="text" value={address.lastName} onChange={e => setAddress(a => ({ ...a, lastName: e.target.value }))} className="input-dark" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Address Line 1</label>
                      <input type="text" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} className="input-dark" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Address Line 2</label>
                      <input type="text" value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} className="input-dark" placeholder="Apt, suite, etc." />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">City</label>
                      <input type="text" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">State</label>
                      <input type="text" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="input-dark" maxLength={2} required />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">ZIP Code</label>
                      <input type="text" value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} className="input-dark" required />
                    </div>
                    <div>
                      <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Phone</label>
                      <input type="tel" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} className="input-dark" />
                    </div>
                  </div>
                </div>

                <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                  <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4">Shipping Method</h3>
                  <div className="space-y-2">
                    {shippingOptions.map(opt => (
                      <label key={opt.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shippingMethod === opt.id ? 'border-brand-red dark:bg-brand-red/5 bg-red-50' : 'dark:border-dark-border border-light-border dark:hover:border-dark-border-2'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping" value={opt.id} checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)} className="accent-brand-red" />
                          <div>
                            <p className="font-medium dark:text-white text-gray-900 text-sm">{opt.label}</p>
                            <p className="text-xs dark:text-gray-400 text-gray-500">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="font-semibold dark:text-white text-gray-900 text-sm">{opt.price === 0 ? 'FREE' : formatPrice(opt.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            )}

            {step === 2 && pendingOrderData && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={16} className="text-brand-red" /> Payment
                </h3>
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: ELEMENTS_APPEARANCE }}>
                  <CheckoutForm orderData={pendingOrderData} clientSecret={clientSecret} onSuccess={handleSuccess} />
                </Elements>
                <p className="text-xs dark:text-gray-500 text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <Shield size={11} /> Secured by Stripe · Your card info is never stored
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 sticky top-24">
              <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="dark:text-gray-300 text-gray-600 line-clamp-1 flex-1 mr-2">{item.name} ×{item.qty}</span>
                    <span className="dark:text-white text-gray-900 shrink-0">{formatPrice(item.cartPrice * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t dark:border-dark-border border-light-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-500">Subtotal</span>
                  <span className="dark:text-white text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'dark:text-white text-gray-900'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-400 text-gray-500">Tax</span>
                  <span className="dark:text-white text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between border-t dark:border-dark-border border-light-border pt-2">
                  <span className="font-bold dark:text-white text-gray-900">Total</span>
                  <span className="font-display font-black text-lg text-brand-red">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
