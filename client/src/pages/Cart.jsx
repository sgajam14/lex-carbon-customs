import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ShoppingBag size={60} className="mx-auto mb-4 dark:text-gray-700 text-gray-300" />
        <h2 className="font-heading font-bold text-2xl dark:text-white text-gray-900 mb-2">Your cart is empty</h2>
        <p className="dark:text-gray-400 text-gray-500 mb-6">Add some carbon to your build</p>
        <Link to="/shop" className="btn-primary">Browse Parts</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">Cart ({items.length})</h1>
          <button onClick={clearCart} className="text-sm text-gray-400 hover:text-brand-red transition-colors">Clear cart</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-4 flex gap-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg dark:bg-dark-surface-2 bg-gray-100 overflow-hidden shrink-0">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/shop/${item.slug || item._id}`} className="font-heading font-semibold dark:text-white text-gray-900 hover:text-brand-red transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs dark:text-gray-500 text-gray-400 mt-0.5">{item.brand} · {item.finish}</p>
                    {item.fitment && (
                      <p className="text-xs text-brand-red mt-0.5">
                        For: {item.fitment.year} {item.fitment.make} {item.fitment.model}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty */}
                      <div className="flex items-center dark:bg-dark-surface-2 bg-gray-100 rounded overflow-hidden text-sm">
                        <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:text-brand-red transition-colors dark:text-white text-gray-900">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-semibold dark:text-white text-gray-900">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:text-brand-red transition-colors dark:text-white text-gray-900">
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold dark:text-white text-gray-900">{formatPrice(item.cartPrice * item.qty)}</span>
                        <button onClick={() => removeItem(item._id)} className="text-gray-500 hover:text-brand-red transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 sticky top-24">
              <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-5">Order Summary</h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="dark:text-gray-400 text-gray-500">Subtotal</span>
                  <span className="dark:text-white text-gray-900 font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="dark:text-gray-400 text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400 font-medium' : 'dark:text-white text-gray-900 font-medium'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="dark:text-gray-400 text-gray-500">Est. Tax</span>
                  <span className="dark:text-white text-gray-900 font-medium">{formatPrice(tax)}</span>
                </div>
                {subtotal < 500 && (
                  <p className="text-xs text-blue-400 bg-blue-900/10 border border-blue-500/20 rounded px-2 py-1.5">
                    Add {formatPrice(500 - subtotal)} more for FREE shipping
                  </p>
                )}
              </div>

              <div className="border-t dark:border-dark-border border-light-border pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-heading font-bold dark:text-white text-gray-900">Total</span>
                  <span className="font-display font-black text-xl text-brand-red">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs dark:text-gray-500 text-gray-400">
                <Shield size={12} className="text-green-400" />
                Secure checkout · SSL encrypted
              </div>

              <p className="text-xs dark:text-gray-500 text-gray-400 text-center mt-3">
                Affirm & Klarna available at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
