import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountNotFound, setAccountNotFound] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAccountNotFound(false);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      setError(err.response?.data?.message || 'Login failed');
      setAccountNotFound(status === 404 || code === 'ACCOUNT_NOT_FOUND');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate('/register', {
      state: {
        prefillEmail: form.email.trim(),
        fromLogin: true,
      },
    });
  };

  return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4 font-display font-black text-white">LC</div>
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900 mb-1">Welcome Back</h1>
          <p className="dark:text-gray-400 text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm(f => ({ ...f, email: e.target.value }));
                  setAccountNotFound(false);
                }}
                className="input-dark"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => {
                    setForm(f => ({ ...f, password: e.target.value }));
                    setAccountNotFound(false);
                  }}
                  className="input-dark pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn size={16} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {accountNotFound && (
            <button
              type="button"
              onClick={handleCreateAccount}
              className="mt-4 w-full border border-brand-red/50 text-brand-red hover:bg-brand-red/10 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              No account found - Create Account
            </button>
          )}
        </div>

        <p className="text-center text-sm dark:text-gray-400 text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-red hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
