import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Moon, Sun, Menu, X, ChevronDown, Car, Shield, Search, Package, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useGarage } from '../context/GarageContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const [topBarMessageIndex, setTopBarMessageIndex] = useState(0);
  const { user, logout, isAdmin, isAffiliate } = useAuth();
  const { count } = useCart();
  const { isDark, toggle } = useTheme();
  const { activeVehicle } = useGarage();
  const location = useLocation();
  const navigate = useNavigate();

  const topBarMessages = [
    'FREE SHIPPING ON ORDERS OVER $500 | PRECISION FITMENT — MINOR ADJUSTMENTS MAY BE NEEDED',
    'Need Help? Contact us: (667) 786-9362',
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserDropdown(false);
  }, [location]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTopBarMessageIndex((prev) => (prev + 1) % topBarMessages.length);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [topBarMessages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Shop', href: '/shop' },
    { label: 'Build Your Car', href: '/build' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Track Order', href: '/track' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'dark:bg-dark-bg/95 bg-white/95 backdrop-blur-md shadow-lg shadow-black/20 border-b dark:border-dark-border border-light-border'
        : 'bg-transparent'
    }`}>
      {/* Top bar */}
      <div className="dark:bg-dark-surface-2 bg-gray-100 border-b dark:border-dark-border border-light-border py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center text-xs min-h-[20px]">
          <div />
          <span
            key={topBarMessageIndex}
            className="font-heading tracking-wider text-center px-2 animate-fade-in dark:text-white text-black"
          >
            {topBarMessages[topBarMessageIndex]}
          </span>
          <div className="justify-self-end">
            {activeVehicle && (
              <span className="flex items-center gap-1.5 text-brand-red font-medium whitespace-nowrap">
                <Car size={12} />
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-red flex items-center justify-center rounded font-display font-black text-white text-sm">
              LC
            </div>
            <span className="font-display font-bold text-base sm:text-lg tracking-wider uppercase dark:text-white text-gray-900 group-hover:text-brand-red transition-colors">
              LEX'S <span className="text-brand-red">CARBON</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-heading font-semibold text-sm tracking-widest uppercase transition-colors duration-200 ${
                  location.pathname === link.href
                    ? 'text-brand-red'
                    : 'dark:text-gray-300 text-gray-600 hover:text-brand-red'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 dark:text-gray-300 text-gray-600 hover:text-brand-red transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 dark:text-gray-300 text-gray-600 hover:text-brand-red transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 dark:text-gray-300 text-gray-600 hover:text-brand-red transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-red text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(v => !v)}
                  className="flex items-center gap-1.5 p-2 dark:text-gray-300 text-gray-600 hover:text-brand-red transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>
                {userDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-52 dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b dark:border-dark-border border-light-border">
                      <p className="font-semibold dark:text-white text-gray-900 text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs dark:text-gray-400 text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/account" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                      <User size={14} /> My Account
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                      <Package size={14} /> Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                      <Heart size={14} /> Wishlist
                    </Link>
                    <Link to="/build" className="flex items-center gap-2 px-4 py-2 text-sm dark:text-gray-300 text-gray-600 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors">
                      <Car size={14} /> My Garage
                    </Link>
                    {isAffiliate && (
                      <>
                        <div className="border-t dark:border-dark-border border-light-border my-1" />
                        <Link to="/affiliate" className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors font-semibold">
                          <TrendingUp size={14} /> Affiliate Dashboard
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <div className="border-t dark:border-dark-border border-light-border my-1" />
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-red dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors font-semibold">
                          <Shield size={14} /> Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="border-t dark:border-dark-border border-light-border my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm dark:text-gray-400 text-gray-500 dark:hover:bg-dark-surface-2 hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1.5 btn-primary !py-2 !px-4 !text-xs">
                <User size={14} /> Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 dark:text-gray-300 text-gray-600"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search carbon fiber parts..."
                className="input-dark pr-10 !rounded-full"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-red">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden dark:bg-dark-surface bg-white border-t dark:border-dark-border border-light-border animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-2.5 font-heading font-semibold text-sm tracking-widest uppercase ${
                  location.pathname === link.href ? 'text-brand-red' : 'dark:text-gray-300 text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t dark:border-dark-border border-light-border pt-3 mt-3">
              {user ? (
                <button onClick={logout} className="w-full btn-outline text-sm">Sign Out</button>
              ) : (
                <Link to="/login" className="block btn-primary text-center text-sm">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
