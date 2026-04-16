import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, getDiscount } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../utils/api';
import { useEffect, useMemo, useState } from 'react';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user, fetchMe } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const price = product.onSale && product.salePrice ? product.salePrice : product.price;
  const discount = getDiscount(product.price, product.salePrice);
  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
  const isLowStock = product.stock <= 3 && product.stock > 0;
  const isOutOfStock = product.stock === 0 && !product.isBackordered;
  const wishlistIds = useMemo(
    () => (user?.wishlist || []).map((item) => (typeof item === 'string' ? item : item?._id)).filter(Boolean),
    [user]
  );

  useEffect(() => {
    setWishlisted(wishlistIds.includes(product._id));
  }, [wishlistIds, product._id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const previous = wishlisted;
    setWishlisted(!previous);
    try {
      await productApi.toggleWishlist(product._id);
      await fetchMe();
    } catch {
      setWishlisted(previous);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group h-full"
    >
      <Link to={`/shop/${product.slug || product._id}`} className="block h-full">
        <div className="h-full flex flex-col dark:bg-dark-surface bg-white dark:border-dark-border border-light-border border rounded-xl overflow-hidden transition-all duration-300 dark:hover:border-brand-red/40 hover:shadow-xl dark:hover:shadow-brand-red/5">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden dark:bg-dark-surface-2 bg-gray-100">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                className="w-full h-full object-cover product-img-hover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-heading text-gray-600 text-sm uppercase tracking-wider">No Image</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.onSale && discount > 0 && (
                <span className="badge bg-brand-red text-white text-[10px]">-{discount}% OFF</span>
              )}
              {product.isFeatured && (
                <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px]">FEATURED</span>
              )}
              {product.isBackordered && (
                <span className="badge bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px]">BACKORDER</span>
              )}
            </div>

            {/* Scarcity */}
            {isLowStock && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 text-red-400 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur">
                <span className="scarcity-dot" />
                Only {product.stock} left
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-all ${
                wishlisted ? 'bg-brand-red text-white' : 'bg-black/40 text-white hover:bg-brand-red'
              }`}
            >
              <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col flex-1">
            {/* Brand + Finish */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-heading font-semibold tracking-widest uppercase text-brand-red">
                {product.brand}
              </span>
              <span className="text-[11px] dark:text-gray-500 text-gray-400 font-mono">{product.finish}</span>
            </div>

            <h3 className="font-heading font-semibold dark:text-white text-gray-900 text-base leading-snug mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
                <span className="text-[11px] dark:text-gray-500 text-gray-400">({product.reviewCount})</span>
              </div>
            )}

            {/* Lead time */}
            {product.leadTime && (
              <div className="flex items-center gap-1 text-[11px] dark:text-gray-500 text-gray-400 mb-3">
                <Clock size={11} />
                <span>Lead time: {product.leadTime}</span>
              </div>
            )}

            {/* Price + Add to cart */}
            <div className="mt-auto pt-3 flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-xl dark:text-white text-gray-900">
                  {formatPrice(price)}
                </span>
                {product.onSale && product.salePrice && (
                  <span className="text-xs dark:text-gray-500 text-gray-400 line-through ml-2">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`flex items-center gap-1.5 text-xs font-heading font-semibold tracking-wider uppercase px-3 py-2 rounded transition-all ${
                  isOutOfStock
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : adding
                    ? 'bg-green-600 text-white'
                    : 'bg-brand-red hover:bg-brand-red-dark text-white'
                }`}
              >
                {adding ? <Zap size={14} /> : <ShoppingCart size={14} />}
                {isOutOfStock ? 'OOS' : adding ? 'Added!' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
