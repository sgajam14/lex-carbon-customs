import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../utils/api';
import { formatPrice } from '../utils/formatters';

// Replace with your Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      '::placeholder': { color: '#6b7280' },
      backgroundColor: 'transparent',
    },
    invalid: { color: '#EF4444' },
  },
};

function CheckoutForm({ order, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);
    setError('');

    try {
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}` },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        await paymentApi.confirm({ paymentIntentId: paymentIntent.id, orderId: order._id });
        onSuccess(order._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-4 mb-4">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Lock size={16} />
        {processing ? 'Processing...' : `Pay ${formatPrice(order.total)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: info, 2: payment
  const [order, setOrder] = useState(null);
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
      // Create order
      const orderData = {
        items: items.map(i => ({ product: i._id, qty: i.qty, fitment: i.fitment })),
        shippingAddress: address,
        shippingMethod,
        guestEmail: !user ? guestEmail : undefined,
        guestName: !user ? `${address.firstName} ${address.lastName}` : undefined,
      };
      const { data: orderRes } = await orderApi.create(orderData);
      setOrder(orderRes.order);

      // Create payment intent
      const { data: piRes } = await paymentApi.createIntent({ orderId: orderRes.order._id, amount: orderRes.order.total });
      setClientSecret(piRes.clientSecret);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (orderId) => {
    clearCart();
    navigate(`/orders/${orderId}?success=true`);
  };

  if (items.length === 0 && !order) {
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

            {step === 2 && order && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={16} className="text-brand-red" /> Payment
                </h3>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm order={order} clientSecret={clientSecret} onSuccess={handleSuccess} />
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
