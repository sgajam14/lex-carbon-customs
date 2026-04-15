import { useState, useEffect } from 'react';
import { Car, Search, Package, Plus, X, ShoppingCart } from 'lucide-react';
import FitmentLookup from '../components/FitmentLookup';
import ProductCard from '../components/ProductCard';
import BundleCard from '../components/BundleCard';
import { productApi, bundleApi } from '../utils/api';
import { useGarage } from '../context/GarageContext';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['Hood', 'Spoiler', 'Diffuser', 'Side Skirts', 'Front Bumper', 'Rear Bumper', 'Fenders', 'Mirrors', 'Interior Trim'];

export default function BuildYourCar() {
  const [vehicle, setVehicle] = useState(null);
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [build, setBuild] = useState({}); // { category: product }
  const [loading, setLoading] = useState(false);
  const { activeVehicle } = useGarage();
  const { addItem } = useCart();

  useEffect(() => {
    if (activeVehicle) setVehicle(activeVehicle);
  }, [activeVehicle]);

  useEffect(() => {
    if (!vehicle) return;
    setLoading(true);
    const params = { make: vehicle.make, model: vehicle.model, year: vehicle.year, limit: 50 };
    if (activeCategory) params.category = activeCategory;
    productApi.getAll(params)
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false));

    bundleApi.getAll().then(({ data }) => setBundles(data.bundles?.slice(0, 3) || []));
  }, [vehicle, activeCategory]);

  const addToBuild = (product) => {
    setBuild(b => ({ ...b, [product.category]: product }));
  };

  const removeFromBuild = (category) => {
    setBuild(b => { const n = { ...b }; delete n[category]; return n; });
  };

  const buildTotal = Object.values(build).reduce((sum, p) => {
    return sum + (p.onSale && p.salePrice ? p.salePrice : p.price);
  }, 0);

  const addAllToCart = () => {
    Object.values(build).forEach(p => addItem(p, 1, vehicle ? { make: vehicle.make, model: vehicle.model, year: vehicle.year } : null));
  };

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl dark:text-white text-gray-900 mb-1">Build Your Car</h1>
          <p className="dark:text-gray-400 text-gray-500">Select your vehicle, then pick parts that are guaranteed to fit.</p>
        </div>

        {/* Vehicle selector */}
        <div className="mb-8 max-w-2xl">
          {vehicle ? (
            <div className="flex items-center justify-between dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/20 rounded-lg flex items-center justify-center">
                  <Car size={18} className="text-brand-red" />
                </div>
                <div>
                  <p className="font-heading font-bold dark:text-white text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                  {vehicle.trim && <p className="text-xs dark:text-gray-400 text-gray-500">{vehicle.trim}</p>}
                </div>
              </div>
              <button onClick={() => setVehicle(null)} className="text-gray-400 hover:text-brand-red transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <FitmentLookup onFitmentSelect={setVehicle} />
          )}
        </div>

        {vehicle && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products */}
            <div className="lg:col-span-2">
              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
                <button
                  onClick={() => setActiveCategory('')}
                  className={`shrink-0 px-4 py-2 text-xs font-heading font-semibold tracking-wider uppercase rounded-lg transition-colors ${!activeCategory ? 'bg-brand-red text-white' : 'dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border dark:text-gray-300 text-gray-600'}`}
                >
                  All Parts
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 py-2 text-xs font-heading font-semibold tracking-wider uppercase rounded-lg transition-colors ${activeCategory === cat ? 'bg-brand-red text-white' : 'dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border dark:text-gray-300 text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="dark:bg-dark-surface-2 bg-gray-200 rounded-xl aspect-[4/3] animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p._id} className="relative">
                      <ProductCard product={p} />
                      <button
                        onClick={() => addToBuild(p)}
                        className="absolute bottom-16 right-3 w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center hover:bg-brand-red-dark transition-colors shadow-lg z-10"
                        title="Add to build"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={36} className="mx-auto mb-3 dark:text-gray-600 text-gray-400" />
                  <p className="dark:text-gray-400 text-gray-500">No parts found for this vehicle in this category</p>
                </div>
              )}
            </div>

            {/* Build summary */}
            <div>
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 sticky top-24">
                <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-4">
                  Your Build ({Object.keys(build).length} parts)
                </h3>

                {Object.keys(build).length === 0 ? (
                  <p className="dark:text-gray-400 text-gray-500 text-sm py-4 text-center">
                    Click + on any part to add it to your build
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {Object.entries(build).map(([category, product]) => (
                      <div key={category} className="flex items-center justify-between p-2 dark:bg-dark-surface-2 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-brand-red font-heading font-semibold uppercase tracking-wider">{category}</p>
                          <p className="text-sm dark:text-white text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-brand-red font-bold">{formatPrice(product.onSale && product.salePrice ? product.salePrice : product.price)}</p>
                        </div>
                        <button onClick={() => removeFromBuild(category)} className="text-gray-500 hover:text-red-400 ml-2">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {Object.keys(build).length > 0 && (
                  <div className="border-t dark:border-dark-border border-light-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-heading dark:text-white text-gray-900 font-bold">Build Total</span>
                      <span className="font-display font-black text-brand-red text-xl">{formatPrice(buildTotal)}</span>
                    </div>
                    <button onClick={addAllToCart} className="btn-primary w-full flex items-center justify-center gap-2">
                      <ShoppingCart size={16} /> Add All to Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Featured bundles */}
              {bundles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-heading font-bold dark:text-white text-gray-900 mb-3 uppercase tracking-wider text-sm">Save with Bundles</h4>
                  <div className="space-y-4">
                    {bundles.map(b => <BundleCard key={b._id} bundle={b} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
