import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { user, fetchMe } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      setLoading(true);
      try {
        await fetchMe();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWishlist();
    return () => {
      mounted = false;
    };
  }, [fetchMe]);

  const wishlistProducts = useMemo(
    () => (user?.wishlist || []).filter((item) => item && typeof item === 'object' && item._id),
    [user]
  );

  if (loading) {
    return (
      <div className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl dark:text-white text-gray-900">My Wishlist</h1>
            <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
              {wishlistProducts.length} saved item{wishlistProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-10 text-center">
            <Heart size={40} className="mx-auto mb-3 text-brand-red" />
            <p className="font-heading text-2xl dark:text-white text-gray-900 mb-2 uppercase tracking-wider">Your wishlist is empty</p>
            <p className="text-sm dark:text-gray-400 text-gray-500 mb-6">Save products you like and come back to them anytime.</p>
            <Link to="/shop" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5 items-stretch">
            {wishlistProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
