import { AlertCircle, Clock } from 'lucide-react';

export default function ScarcityIndicator({ stock, isBackordered, backorderETA, leadTime, vehicle }) {
  if (isBackordered) {
    return (
      <div className="flex items-start gap-2 bg-orange-900/20 border border-orange-500/25 text-orange-400 px-4 py-3 rounded-lg text-sm">
        <Clock size={16} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">This item is currently on backorder</p>
          {backorderETA && (
            <p className="text-xs mt-0.5 opacity-80">
              Expected availability: {new Date(backorderETA).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {leadTime && <p className="text-xs mt-0.5 opacity-80">Lead time: {leadTime}</p>}
        </div>
      </div>
    );
  }

  if (stock === 0) {
    return (
      <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm">
        <AlertCircle size={16} />
        <span className="font-semibold">Out of stock</span>
      </div>
    );
  }

  if (stock <= 3) {
    return (
      <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm animate-pulse-red">
        <span className="scarcity-dot" />
        <div>
          <span className="font-semibold">Only {stock} left</span>
          {vehicle && <span className="opacity-80"> for your {vehicle.year} {vehicle.make} {vehicle.model}</span>}
        </div>
      </div>
    );
  }

  if (leadTime) {
    return (
      <div className="flex items-center gap-2 dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-400 text-gray-500 px-4 py-3 rounded-lg text-sm">
        <Clock size={16} className="text-brand-red" />
        <span>Lead time: <span className="font-semibold dark:text-white text-gray-900">{leadTime}</span></span>
      </div>
    );
  }

  return null;
}
