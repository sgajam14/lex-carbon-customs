import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import FitmentLookup from '../components/FitmentLookup';
import { productApi } from '../utils/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    sort: searchParams.get('sort') || '-createdAt',
    category: searchParams.get('category') || '',
    finish: searchParams.get('finish') || '',
    brandTier: searchParams.get('brandTier') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    onSale: searchParams.get('onSale') || '',
    search: searchParams.get('search') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    year: searchParams.get('year') || '',
    featured: searchParams.get('featured') || '',
  });
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 24, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await productApi.getAll(params);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFitment = (fitment) => {
    setFilters(f => ({ ...f, make: fitment.make, model: fitment.model, year: String(fitment.year) }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ sort: '-createdAt', category: '', finish: '', brandTier: '', minPrice: '', maxPrice: '', onSale: '', search: '', make: '', model: '', year: '', featured: '' });
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v && !['sort'].includes(k)).length;

  const fitmentActive = filters.make && filters.model && filters.year;

  return (
    <div className="pt-[88px] min-h-screen">
      {/* Header */}
      <div className="dark:bg-dark-surface bg-gray-50 border-b dark:border-dark-border border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="font-display font-bold text-3xl dark:text-white text-gray-900 mb-1">
            {filters.search ? `Results for "${filters.search}"` : 'All Parts'}
          </h1>
          {fitmentActive && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm dark:text-gray-400 text-gray-500">Showing parts for:</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand-red dark:bg-brand-red/10 bg-red-50 border border-brand-red/20 px-3 py-1 rounded-full">
                {filters.year} {filters.make} {filters.model}
                <button onClick={() => setFilters(f => ({ ...f, make: '', model: '', year: '' }))}>
                  <X size={12} />
                </button>
              </span>
            </div>
          )}
          {/* Fitment bar */}
          <div className="mt-4 max-w-2xl">
            <FitmentLookup onFitmentSelect={handleFitment} compact />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={clearFilters} />
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm dark:text-gray-400 text-gray-500">
                {loading ? 'Loading...' : `${pagination.total || 0} products`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className="lg:hidden flex items-center gap-1.5 btn-ghost text-sm border dark:border-dark-border border-light-border rounded"
                >
                  <SlidersHorizontal size={14} />
                  Filters {activeFilterCount > 0 && <span className="bg-brand-red text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
                </button>
              </div>
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="lg:hidden mb-4">
                <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={clearFilters} />
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="dark:bg-dark-surface-2 bg-gray-200 rounded-xl aspect-[4/3] animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded disabled:opacity-40 dark:text-white text-gray-900 text-sm hover:border-brand-red transition-colors"
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                          page === p ? 'bg-brand-red text-white' : 'dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border dark:text-white text-gray-900 hover:border-brand-red'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-4 py-2 dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded disabled:opacity-40 dark:text-white text-gray-900 text-sm hover:border-brand-red transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="font-heading text-2xl dark:text-gray-500 text-gray-400 uppercase tracking-wider mb-2">No parts found</p>
                <p className="text-sm dark:text-gray-600 text-gray-400">Try adjusting your filters or vehicle selection</p>
                <button onClick={clearFilters} className="btn-outline mt-6">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
