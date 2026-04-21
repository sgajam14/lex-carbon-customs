import { useEffect, useState } from 'react';
import { Copy, Check, UserPlus, Medal } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatPrice } from '../../utils/formatters';

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [email, setEmail] = useState('');
  const [rate, setRate] = useState(10);
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [copied, setCopied] = useState(false);

  // Rate update
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    adminApi.getAffiliates()
      .then(({ data }) => setAffiliates(data.affiliates || []))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    setInviteLink('');
    try {
      const { data } = await adminApi.createAffiliateInvite(email, rate);
      setInviteLink(data.inviteUrl);
      setEmail('');
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to create invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRateUpdate = async (id, newRate) => {
    setUpdatingId(id);
    try {
      await adminApi.updateAffiliateRate(id, newRate);
      setAffiliates(prev => prev.map(a => a._id === id ? { ...a, affiliateCommissionRate: newRate } : a));
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center dark:bg-dark-bg bg-light-bg">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[88px] min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-8">Affiliate Management</h1>

        {/* Invite form */}
        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 mb-6">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-4 flex items-center gap-2">
            <UserPlus size={14} /> Generate Invite Link
          </h2>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="partner@example.com"
                required
                className="input-dark w-full"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1.5">Commission %</label>
              <input
                type="number"
                min="1"
                max="50"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="input-dark w-full"
              />
            </div>
            <button type="submit" disabled={inviting} className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50">
              {inviting ? 'Generating...' : 'Generate Link'}
            </button>
          </form>
          {inviteError && <p className="text-red-400 text-sm mt-3">{inviteError}</p>}
          {inviteLink && (
            <div className="mt-4">
              <p className="text-xs dark:text-gray-400 text-gray-500 mb-2">Share this link — it expires in 7 days:</p>
              <div className="flex gap-2">
                <input readOnly value={inviteLink} className="input-dark flex-1 text-sm font-mono" />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-red text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-4 flex items-center gap-2">
            <Medal size={14} className="text-yellow-400" /> Affiliate Leaderboard
          </h2>
          {affiliates.length === 0 ? (
            <p className="dark:text-gray-500 text-gray-400 text-sm text-center py-8">No affiliates yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="dark:text-gray-500 text-gray-400 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium w-8">#</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Clicks</th>
                    <th className="pb-3 font-medium">Sales</th>
                    <th className="pb-3 font-medium">Earned</th>
                    <th className="pb-3 font-medium">Rate %</th>
                  </tr>
                </thead>
                <tbody className="dark:divide-y dark:divide-dark-border divide-y divide-light-border">
                  {affiliates.map((aff, i) => (
                    <tr key={aff._id}>
                      <td className="py-3">
                        <span className={`font-display font-black text-base ${MEDAL_COLORS[i] || 'dark:text-gray-500 text-gray-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="dark:text-white text-gray-900 font-medium">{aff.firstName} {aff.lastName}</p>
                        <p className="text-xs dark:text-gray-500 text-gray-400">{aff.email}</p>
                      </td>
                      <td className="py-3 font-mono dark:text-gray-300 text-gray-600 text-xs">{aff.affiliateCode}</td>
                      <td className="py-3 dark:text-gray-300 text-gray-700">{aff.affiliateClicks}</td>
                      <td className="py-3 dark:text-gray-300 text-gray-700">{aff.affiliateSales}</td>
                      <td className="py-3 text-green-400 font-semibold">{formatPrice(aff.affiliateEarnings)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            defaultValue={aff.affiliateCommissionRate}
                            onBlur={e => {
                              const val = Number(e.target.value);
                              if (val !== aff.affiliateCommissionRate) handleRateUpdate(aff._id, val);
                            }}
                            className="w-14 px-2 py-1 text-xs rounded-lg dark:bg-dark-surface-2 bg-gray-100 border dark:border-dark-border border-light-border dark:text-white text-gray-900"
                          />
                          {updatingId === aff._id && <span className="text-xs dark:text-gray-500 text-gray-400">saving…</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
