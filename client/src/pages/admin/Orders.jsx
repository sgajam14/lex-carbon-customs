import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, Edit } from 'lucide-react';
import { adminApi, orderApi } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import BackToDashboardButton from '../../components/admin/BackToDashboardButton';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Return Requested'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '', carrier: '', trackingUrl: '', note: '' });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllOrders({ page, limit: 20, status: statusFilter || undefined, search: search || undefined });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, search]);

  const openEdit = (order) => {
    setEditingOrder(order);
    setStatusForm({ status: order.status, trackingNumber: order.trackingNumber || '', carrier: order.carrier || '', trackingUrl: order.trackingUrl || '', note: '' });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await orderApi.updateStatus(editingOrder._id, statusForm);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order');
    }
  };

  return (
    <div className="pt-[88px] min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackToDashboardButton />
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">Orders</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Order # or email..." className="input-dark pl-9 !text-sm !py-2" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-dark !text-sm !py-2 !w-auto">
            <option value="">All Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="dark:bg-dark-surface-2 bg-gray-50 border-b dark:border-dark-border border-light-border">
                  <th className="text-left px-4 py-3 font-heading uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500">Order</th>
                  <th className="text-left px-4 py-3 font-heading uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500 hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 font-heading uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-heading uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-heading uppercase tracking-wider text-xs dark:text-gray-400 text-gray-500 hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b dark:border-dark-border border-light-border dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium dark:text-white text-gray-900 text-xs">{order.orderNumber}</p>
                      <p className="text-[11px] dark:text-gray-500 text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="dark:text-white text-gray-900">{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</p>
                      <p className="text-xs dark:text-gray-500 text-gray-400">{order.user?.email || order.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-white text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border text-[11px] ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs dark:text-gray-400 text-gray-500 hidden sm:table-cell">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(order)} className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-brand-red transition-colors" title="Update status">
                          <Edit size={14} />
                        </button>
                        <Link to={`/orders/${order._id}`} className="p-1.5 dark:text-gray-400 text-gray-500 hover:text-brand-red transition-colors" target="_blank" title="View order">
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-12 dark:text-gray-400 text-gray-500">No orders found</div>
            )}
          </div>
        )}

        {/* Edit status modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditingOrder(null)}>
            <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="font-heading font-bold dark:text-white text-gray-900 mb-1">Update Order</h3>
              <p className="text-xs dark:text-gray-400 text-gray-500 mb-4 font-mono">{editingOrder.orderNumber}</p>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Status</label>
                  <select value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))} className="input-dark">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Carrier</label>
                    <select value={statusForm.carrier} onChange={e => setStatusForm(f => ({ ...f, carrier: e.target.value }))} className="input-dark !text-sm">
                      <option value="">None</option>
                      {['UPS', 'FedEx', 'USPS'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Tracking #</label>
                    <input type="text" value={statusForm.trackingNumber} onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))} className="input-dark !text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Internal Note (optional)</label>
                  <input type="text" value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))} className="input-dark !text-sm" placeholder="Visible to admins only" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary text-sm !py-2">Save Changes</button>
                  <button type="button" onClick={() => setEditingOrder(null)} className="btn-ghost text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
