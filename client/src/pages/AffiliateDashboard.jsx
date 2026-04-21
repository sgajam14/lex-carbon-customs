import { useEffect, useState } from 'react';
import { Copy, Check, TrendingUp, MousePointerClick, ShoppingBag, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { affiliateApi } from '../utils/api';
import { formatPrice } from '../utils/formatters';

function StatCard({ icon: Icon, label, value, color = 'text-brand-red' }) {
  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color === 'text-brand-red' ? 'bg-brand-red/10' : color === 'text-green-400' ? 'bg-green-500/10' : color === 'text-blue-400' ? 'bg-blue-500/10' : 'bg-yellow-500/10'}`}>
        <Icon size={20} className={color} />
      </div>
      <p className="dark:text-gray-400 text-gray-500 text-sm mb-0.5">{label}</p>
      <p className="font-display font-bold text-xl dark:text-white text-gray-900">{value}</p>
    </div>
  );
}

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = user?.affiliateCode
    ? `${window.location.origin}/?ref=${user.affiliateCode}`
    : '';

  useEffect(() => {
    affiliateApi.getMe()
      .then(({ data }) => setStats(data.affiliate))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl dark:text-white text-gray-900 mb-1">Affiliate Dashboard</h1>
          <p className="dark:text-gray-400 text-gray-500 text-sm">Track your referrals and earnings</p>
        </div>

        {/* Referral link */}
        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 mb-6">
          <p className="text-sm font-medium dark:text-gray-300 text-gray-600 mb-2">Your Referral Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={referralLink}
              className="input-dark flex-1 text-sm font-mono"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs dark:text-gray-500 text-gray-400 mt-2">
            Commission rate: <span className="text-green-400 font-semibold">{stats?.affiliateCommissionRate ?? 10}%</span> on every sale
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={MousePointerClick} label="Total Clicks" value={stats?.affiliateClicks ?? 0} color="text-blue-400" />
          <StatCard icon={ShoppingBag} label="Total Sales" value={stats?.affiliateSales ?? 0} color="text-brand-red" />
          <StatCard icon={DollarSign} label="Total Earned" value={formatPrice(stats?.affiliateEarnings ?? 0)} color="text-green-400" />
          <StatCard icon={TrendingUp} label="Commission Rate" value={`${stats?.affiliateCommissionRate ?? 10}%`} color="text-yellow-400" />
        </div>

        {/* Recent referred orders */}
        {stats?.recentOrders?.length > 0 && (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 mb-6">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-4">Recent Referred Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="dark:text-gray-500 text-gray-400 text-left">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Order Total</th>
                    <th className="pb-3 font-medium">Your Commission</th>
                  </tr>
                </thead>
                <tbody className="dark:divide-y dark:divide-dark-border divide-y divide-light-border">
                  {stats.recentOrders.map(order => (
                    <tr key={order._id}>
                      <td className="py-3 dark:text-white text-gray-900 font-mono">{order.orderNumber}</td>
                      <td className="py-3 dark:text-gray-400 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 dark:text-gray-300 text-gray-700">{formatPrice(order.total)}</td>
                      <td className="py-3 text-green-400 font-semibold">{formatPrice(order.affiliateCommission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top products */}
        {stats?.topProducts?.length > 0 && (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-4">Top Referred Products</h2>
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-red/20 text-brand-red text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="dark:text-white text-gray-900 text-sm flex-1">{p.name}</span>
                  <span className="dark:text-gray-400 text-gray-500 text-xs">{p.count} sale{p.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!stats?.recentOrders?.length && !stats?.topProducts?.length && (
          <div className="text-center py-16 dark:text-gray-500 text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-heading text-sm">No referrals yet — share your link to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
