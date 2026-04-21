import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { affiliateApi } from '../utils/api';

export default function AffiliateJoin() {
  const [searchParams] = useSearchParams();
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid invite link.'); return; }

    if (!user) {
      // Not logged in — redirect to register with token preserved
      navigate(`/register?affiliateToken=${encodeURIComponent(token)}`, { replace: true });
      return;
    }

    affiliateApi.activate(token)
      .then(async () => {
        await fetchMe();
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to activate affiliate account.');
      });
  }, [token, user, navigate, fetchMe]);

  if (status === 'loading') {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-2">You're an Affiliate!</h1>
          <p className="dark:text-gray-400 text-gray-500 mb-6">Your affiliate account is now active. Start sharing your link to earn commissions.</p>
          <Link to="/affiliate" className="btn-primary inline-block">Go to Affiliate Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-2">Invite Invalid</h1>
        <p className="dark:text-gray-400 text-gray-500 mb-6">{message}</p>
        <Link to="/" className="btn-primary inline-block">Back to Home</Link>
      </div>
    </div>
  );
}
