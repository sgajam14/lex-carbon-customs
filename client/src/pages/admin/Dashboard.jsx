import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, Users, ShoppingBag, AlertTriangle, ArrowRight, BarChart2, Medal } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';

function StatCard({ label, value, subValue, icon: Icon, color, trend }) {
  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-display font-black text-3xl dark:text-white text-gray-900 mb-1">{value}</p>
      <p className="text-sm dark:text-gray-400 text-gray-500 font-heading uppercase tracking-wider">{label}</p>
      {subValue && <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">{subValue}</p>}
    </div>
  );
}

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      adminApi.getAffiliates(),
    ]).then(([dashRes, affRes]) => {
      setData(dashRes.data);
      setAffiliates(affRes.data.affiliates?.slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, recentOrders, salesData } = data || {};

  const monthGrowth = stats?.lastMonthOrders > 0
    ? Math.round(((stats.monthOrders - stats.lastMonthOrders) / stats.lastMonthOrders) * 100)
    : 100;

  return (
    <div className="pt-[88px] min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">Admin Dashboard</h1>
            <p className="dark:text-gray-400 text-gray-500 text-sm mt-1">Welcome back — here's what's happening</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products/new" className="btn-primary !py-2 !px-4 text-sm">+ New Product</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Monthly Revenue" value={formatPrice(stats?.monthRevenue || 0)} subValue={`${formatPrice(stats?.totalRevenue || 0)} total`} icon={TrendingUp} color="bg-green-600" />
          <StatCard label="Orders This Month" value={stats?.monthOrders || 0} subValue={`${stats?.totalOrders || 0} total`} icon={ShoppingBag} color="bg-blue-600" trend={monthGrowth} />
          <StatCard label="Total Products" value={stats?.totalProducts || 0} subValue={`${stats?.lowStockProducts || 0} low stock`} icon={Package} color="bg-purple-600" />
          <StatCard label="Total Users" value={stats?.totalUsers || 0} subValue={`+${stats?.newUsers || 0} this month`} icon={Users} color="bg-orange-600" />
        </div>

        {/* Alerts */}
        {stats?.lowStockProducts > 0 && (
          <div className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm">
            <AlertTriangle size={16} />
            <span><strong>{stats.lowStockProducts}</strong> products are low stock (≤3 units)</span>
            <Link to="/admin/products" className="ml-auto text-yellow-400 hover:underline flex items-center gap-1">
              Review <ArrowRight size={12} />
            </Link>
          </div>
        )}
        {stats?.pendingOrders > 0 && (
          <div className="flex items-center gap-2 bg-orange-900/20 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-lg mb-6 text-sm">
            <AlertTriangle size={16} />
            <span><strong>{stats.pendingOrders}</strong> orders awaiting confirmation</span>
            <Link to="/admin/orders" className="ml-auto text-orange-400 hover:underline flex items-center gap-1">
              View <ArrowRight size={12} />
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Recent orders */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-brand-red hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentOrders?.map(order => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b dark:border-dark-border border-light-border last:border-0">
                  <div>
                    <p className="text-sm font-medium dark:text-white text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs dark:text-gray-400 text-gray-500">{order.user ? `${order.user.firstName} ${order.user.lastName}` : order.guestEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold dark:text-white text-gray-900">{formatPrice(order.total)}</p>
                    <span className={`text-[10px] badge border ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <h3 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', href: '/admin/products/new', icon: Package },
                { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag },
                { label: 'All Products', href: '/admin/products', icon: Package },
                { label: 'Affiliates', href: '/admin/affiliates', icon: Users },
              ].map(action => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-2 p-3 dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg hover:border-brand-red/50 transition-colors"
                >
                  <action.icon size={15} className="text-brand-red" />
                  <span className="text-sm dark:text-white text-gray-900 font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Affiliate leaderboard */}
        {affiliates.length > 0 && (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm flex items-center gap-2">
                <Medal size={15} className="text-yellow-400" /> Top Affiliates
              </h3>
              <Link to="/admin/affiliates" className="text-xs text-brand-red hover:underline">Manage All</Link>
            </div>
            <div className="space-y-3">
              {affiliates.map((aff, i) => (
                <div key={aff._id} className="flex items-center gap-3 py-2 border-b dark:border-dark-border border-light-border last:border-0">
                  <span className={`font-display font-black text-lg w-6 text-center ${MEDAL_COLORS[i] || 'text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium dark:text-white text-gray-900 truncate">{aff.firstName} {aff.lastName}</p>
                    <p className="text-xs dark:text-gray-500 text-gray-400 font-mono">{aff.affiliateCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{formatPrice(aff.affiliateEarnings)}</p>
                    <p className="text-xs dark:text-gray-500 text-gray-400">{aff.affiliateSales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
