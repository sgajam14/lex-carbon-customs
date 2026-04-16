import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Archive, AlertTriangle, Search, Package } from 'lucide-react';
import { productApi, adminApi } from '../../utils/api';
import { formatPrice } from '../../utils/formatters';
import BackToDashboardButton from '../../components/admin/BackToDashboardButton';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({ page, limit: 20, search: search || undefined });
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleArchive = async (id) => {
    if (!confirm('Archive this product?')) return;
    await productApi.remove(id);
    fetchProducts();
  };

  const handleInventory = async (id, stock) => {
    const s = prompt('Enter new stock quantity:', stock);
    if (s === null) return;
    await adminApi.updateInventory(id, { stock: parseInt(s) });
    fetchProducts();
  };

  return (
    <div className="pt-[88px] min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackToDashboardButton />
            <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">Products</h1>
          </div>
          <Link to="/admin/products/new" className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-dark pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="dark:bg-dark-surface-2 bg-gray-50 border-b dark:border-dark-border border-light-border">
                    <th className="text-left px-4 py-3 font-heading font-semibold uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500">Product</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500 hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500 hidden sm:table-cell">Stock</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500 hidden lg:table-cell">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg dark:bg-dark-surface-2 bg-gray-100 overflow-hidden shrink-0">
                            {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs dark:text-gray-500 text-gray-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 dark:text-gray-400 text-gray-500 hidden md:table-cell">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="dark:text-white text-gray-900 font-medium">{formatPrice(p.onSale && p.salePrice ? p.salePrice : p.price)}</p>
                        {p.onSale && <p className="text-xs line-through dark:text-gray-500 text-gray-400">{formatPrice(p.price)}</p>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <button
                          onClick={() => handleInventory(p._id, p.stock)}
                          className={`text-sm font-medium hover:text-brand-red transition-colors ${p.stock <= 3 ? 'text-red-400' : 'dark:text-white text-gray-900'}`}
                        >
                          {p.isBackordered ? 'Backorder' : `${p.stock} units`}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1">
                          {p.isFeatured && <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px]">Featured</span>}
                          {p.onSale && <span className="badge bg-brand-red/20 text-brand-red border border-brand-red/30 text-[10px]">Sale</span>}
                          {p.stock <= 3 && !p.isBackordered && <span className="badge bg-red-900/20 text-red-400 border border-red-500/30 text-[10px]"><AlertTriangle size={8} className="inline" /> Low</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Link to={`/admin/products/${p._id}/edit`} className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-brand-red transition-colors" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => handleArchive(p._id)} className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-red-400 transition-colors" title="Archive">
                            <Archive size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package size={32} className="mx-auto mb-2 dark:text-gray-600 text-gray-400" />
                  <p className="dark:text-gray-400 text-gray-500">No products found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded disabled:opacity-40 dark:text-white text-gray-900">
                  Prev
                </button>
                <span className="text-sm dark:text-gray-400 text-gray-500">Page {page} of {pagination.pages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-3 py-1.5 text-sm dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded disabled:opacity-40 dark:text-white text-gray-900">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
