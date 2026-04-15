import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock } from 'lucide-react';
import { orderApi } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/formatters';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll().then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto mb-4 dark:text-gray-700 text-gray-300" />
            <p className="font-heading text-xl dark:text-gray-400 text-gray-500 uppercase tracking-wider mb-4">No orders yet</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-heading font-bold dark:text-white text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs dark:text-gray-500 text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge border ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>

                {/* Items preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {order.items?.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-14 h-14 rounded-lg dark:bg-dark-surface-2 bg-gray-100 overflow-hidden shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-14 h-14 rounded-lg dark:bg-dark-surface-2 bg-gray-100 shrink-0 flex items-center justify-center text-sm dark:text-gray-400 text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs dark:text-gray-500 text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    <p className="font-heading font-bold dark:text-white text-gray-900 text-lg">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.trackingNumber && (
                      <span className="flex items-center gap-1 text-xs text-blue-400 dark:bg-blue-900/10 bg-blue-50 border border-blue-500/20 px-2 py-1 rounded">
                        <Clock size={10} /> {order.carrier} {order.trackingNumber}
                      </span>
                    )}
                    <Link to={`/orders/${order._id}`} className="flex items-center gap-1.5 text-sm text-brand-red hover:underline font-medium">
                      View <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
