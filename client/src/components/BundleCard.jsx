import { Link } from 'react-router-dom';
import { Package, Tag } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

export default function BundleCard({ bundle }) {
  const { addItem } = useCart();

  const originalTotal = bundle.items?.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.qty;
  }, 0) || 0;

  const discount = bundle.discountType === 'percentage'
    ? originalTotal * (bundle.discountValue / 100)
    : bundle.discountValue;

  const bundlePrice = originalTotal - discount;

  const addBundle = () => {
    bundle.items?.forEach(item => {
      if (item.product) addItem(item.product, item.qty);
    });
  };

  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl overflow-hidden hover:border-brand-red/40 transition-all group">
      {bundle.image ? (
        <img src={bundle.image} alt={bundle.name} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full aspect-video dark:bg-dark-surface-2 bg-gray-100 flex items-center justify-center">
          <Package size={40} className="text-gray-600" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900">{bundle.name}</h3>
          <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 shrink-0">
            <Tag size={10} className="inline mr-1" />
            {bundle.discountType === 'percentage' ? `${bundle.discountValue}% OFF` : `$${bundle.discountValue} OFF`}
          </span>
        </div>

        {bundle.description && (
          <p className="text-sm dark:text-gray-400 text-gray-500 mb-4">{bundle.description}</p>
        )}

        {/* Items list */}
        <div className="space-y-1.5 mb-4">
          {bundle.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="dark:text-gray-300 text-gray-600">{item.product?.name || 'Product'}</span>
              <span className="dark:text-gray-400 text-gray-500">×{item.qty}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="border-t dark:border-dark-border border-light-border pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs dark:text-gray-500 text-gray-400 line-through">{formatPrice(originalTotal)}</p>
            <p className="font-heading font-bold text-2xl text-brand-red">{formatPrice(bundlePrice)}</p>
          </div>
          <button onClick={addBundle} className="btn-primary !py-2 !px-4 text-sm">
            Add Bundle
          </button>
        </div>
      </div>
    </div>
  );
}
