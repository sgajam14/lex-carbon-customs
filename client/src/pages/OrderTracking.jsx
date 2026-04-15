import { useState } from 'react';
import { Search, Package, ExternalLink } from 'lucide-react';
import { orderApi } from '../utils/api';
import { formatDate, getStatusColor, getCarrierTrackingUrl } from '../utils/formatters';
import OrderStatusTimeline from '../components/OrderStatusTimeline';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await orderApi.track(orderNumber.trim().toUpperCase());
      setOrder(data.order);
    } catch {
      setError('Order not found. Please check your order number.');
    } finally {
      setLoading(false);
    }
  };

  const trackingUrl = order ? getCarrierTrackingUrl(order.carrier, order.trackingNumber) : null;

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <Package size={40} className="mx-auto mb-3 text-brand-red" />
          <h1 className="font-display font-bold text-3xl dark:text-white text-gray-900 mb-2">Track Your Order</h1>
          <p className="dark:text-gray-400 text-gray-500">Enter your order number to get real-time updates</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <input
            type="text"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
            placeholder="e.g. LCC-000001"
            className="input-dark flex-1 uppercase font-mono tracking-wider"
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Search size={16} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-5 animate-fade-in">
            <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading font-bold text-lg dark:text-white text-gray-900">{order.orderNumber}</h2>
                  <p className="text-xs dark:text-gray-400 text-gray-500">Placed {formatDate(order.createdAt)}</p>
                </div>
                <span className={`badge border ${getStatusColor(order.status)}`}>{order.status}</span>
              </div>
              <OrderStatusTimeline status={order.status} statusHistory={order.statusHistory} />
            </div>

            {order.trackingNumber && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-3">Carrier Tracking</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium dark:text-white text-gray-900">{order.carrier} · <span className="font-mono text-sm">{order.trackingNumber}</span></p>
                    {order.estimatedDelivery && (
                      <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">Est. delivery: {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                  {trackingUrl && (
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2 !px-4 text-sm flex items-center gap-1.5">
                      Track <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {order.items?.length > 0 && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-10 h-10 rounded dark:bg-dark-surface-2 bg-gray-100 overflow-hidden">
                        {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="dark:text-gray-300 text-gray-600 flex-1">{item.name}</span>
                      <span className="dark:text-gray-400 text-gray-500">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
