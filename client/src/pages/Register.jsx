import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { affiliateApi } from '../utils/api';

export default function Register() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefillEmail = location.state?.prefillEmail || '';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: prefillEmail,
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Persist referral code from ?ref=CODE to localStorage
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) localStorage.setItem('lcc_ref', ref);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const ref = localStorage.getItem('lcc_ref');
      await register({ ...form, referredBy: ref || undefined });

      // If arriving via affiliate invite link, activate affiliate status
      const affiliateToken = searchParams.get('affiliateToken');
      if (affiliateToken) {
        await affiliateApi.activate(affiliateToken).catch(() => {});
        navigate('/affiliate');
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4 font-display font-black text-white">LC</div>
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-1">Create Account</h1>
          <p className="dark:text-gray-400 text-gray-500 text-sm">Join the Lex's Carbon family</p>
        </div>

        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
          {location.state?.fromLogin && (
            <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm px-4 py-3 rounded-lg mb-4">
              We could not find an account for that email. Create one below.
            </div>
          )}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input-dark" required />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input-dark" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-dark" required />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-dark pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="input-dark"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm dark:text-gray-400 text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-red hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
