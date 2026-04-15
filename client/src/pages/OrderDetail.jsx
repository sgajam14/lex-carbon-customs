import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ExternalLink, RotateCcw, Download, CheckCircle } from 'lucide-react';
import { orderApi } from '../utils/api';
import { formatPrice, formatDate, getStatusColor, getCarrierTrackingUrl } from '../utils/formatters';
import OrderStatusTimeline from '../components/OrderStatusTimeline';

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    orderApi.getOne(id).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleReturn = async () => {
    if (!returnReason) return;
    try {
      const { data } = await orderApi.requestReturn(id, returnReason);
      setOrder(data.order);
      setReturning(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting return');
    }
  };

  if (loading) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <p className="dark:text-gray-400 text-gray-500">Order not found</p>
    </div>
  );

  const trackingUrl = getCarrierTrackingUrl(order.carrier, order.trackingNumber);

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {isSuccess && (
          <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 text-green-400 px-5 py-4 rounded-xl mb-6">
            <CheckCircle size={22} />
            <div>
              <p className="font-heading font-bold">Order Confirmed!</p>
              <p className="text-sm opacity-80">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">{order.orderNumber}</h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm mt-1">Placed {formatDate(order.createdAt)}</p>
          </div>
          <span className={`badge border text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
        </div>

        {/* Status timeline */}
        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 mb-6">
          <OrderStatusTimeline status={order.status} statusHistory={order.statusHistory} />
        </div>

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 mb-6">
            <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-3">Tracking</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm dark:text-white text-gray-900 font-medium">{order.carrier} · {order.trackingNumber}</p>
                {order.estimatedDelivery && (
                  <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                )}
              </div>
              {trackingUrl && (
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-red text-sm font-medium hover:underline">
                  Track <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Items */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-4">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg dark:bg-dark-surface-2 bg-gray-100 overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs dark:text-gray-400 text-gray-500">×{item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold dark:text-white text-gray-900 shrink-0">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-500">Subtotal</span>
                <span className="dark:text-white text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-500">Shipping ({order.shippingMethod})</span>
                <span className="dark:text-white text-gray-900">{order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-500">Tax</span>
                <span className="dark:text-white text-gray-900">{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t dark:border-dark-border border-light-border pt-2 flex justify-between">
                <span className="font-bold dark:text-white text-gray-900">Total</span>
                <span className="font-display font-black text-brand-red">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="dark:text-gray-500 text-gray-400">Payment</span>
                <span className={order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>{order.paymentStatus}</span>
              </div>
            </div>

            {/* Address */}
            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t dark:border-dark-border border-light-border">
                <p className="text-xs font-heading uppercase tracking-wider dark:text-gray-400 text-gray-500 mb-2">Ship To</p>
                <p className="text-sm dark:text-white text-gray-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p className="text-xs dark:text-gray-400 text-gray-500">{order.shippingAddress.line1}</p>
                <p className="text-xs dark:text-gray-400 text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm">
            <Download size={14} /> Download Invoice
          </button>
          {order.status === 'Delivered' && !order.returnRequest?.requested && (
            <button onClick={() => setReturning(v => !v)} className="btn-ghost border dark:border-dark-border border-light-border rounded text-sm flex items-center gap-2">
              <RotateCcw size={14} /> Request Return
            </button>
          )}
        </div>

        {returning && (
          <div className="mt-4 dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-3">Return Request</h3>
            <textarea
              placeholder="Please describe the reason for return..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              className="input-dark mb-3 min-h-[80px]"
            />
            <div className="flex gap-2">
              <button onClick={handleReturn} className="btn-primary text-sm">Submit Request</button>
              <button onClick={() => setReturning(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
