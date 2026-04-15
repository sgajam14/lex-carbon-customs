import { CheckCircle, Circle, Package, Truck, Home, XCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const STEPS = [
  { status: 'Pending', icon: Circle, label: 'Order Placed' },
  { status: 'Confirmed', icon: CheckCircle, label: 'Confirmed' },
  { status: 'Processing', icon: Package, label: 'Processing' },
  { status: 'Shipped', icon: Truck, label: 'Shipped' },
  { status: 'Delivered', icon: Home, label: 'Delivered' },
];

const ORDER_INDEX = {
  Pending: 0, Confirmed: 1, Processing: 2, Shipped: 3, Delivered: 4,
  Cancelled: -1, Refunded: -1, 'Return Requested': -1,
};

export default function OrderStatusTimeline({ status, statusHistory = [] }) {
  const currentIdx = ORDER_INDEX[status] ?? 0;
  const isCancelled = status === 'Cancelled' || status === 'Refunded' || status === 'Return Requested';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 dark:bg-red-900/10 bg-red-50 border dark:border-red-500/20 border-red-200 rounded-xl p-4">
        <XCircle className="text-red-400 shrink-0" size={24} />
        <div>
          <p className="font-heading font-bold dark:text-white text-gray-900">{status}</p>
          {statusHistory.slice(-1)[0] && (
            <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">{formatDate(statusHistory.slice(-1)[0].timestamp)}</p>
          )}
        </div>
      </div>
    );
  }

  const getHistoryEntry = (s) => statusHistory.find(h => h.status === s);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          const entry = getHistoryEntry(step.status);
          const Icon = done ? CheckCircle : step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center relative flex-1">
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 transition-all ${i < currentIdx ? 'bg-brand-red' : 'dark:bg-dark-border bg-gray-200'}`} />
              )}

              {/* Icon */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                active ? 'bg-brand-red text-white ring-2 ring-brand-red/30 ring-offset-2 dark:ring-offset-dark-bg'
                : done ? 'bg-brand-red text-white'
                : 'dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-600 text-gray-300 border dark:border-dark-border border-gray-200'
              }`}>
                <Icon size={15} />
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p className={`text-[11px] font-heading font-semibold uppercase tracking-wider ${
                  done ? 'dark:text-white text-gray-900' : 'dark:text-gray-500 text-gray-400'
                }`}>{step.label}</p>
                {entry && (
                  <p className="text-[10px] dark:text-gray-600 text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
