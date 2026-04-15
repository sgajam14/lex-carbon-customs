import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Share2, AlertTriangle } from 'lucide-react';
import { productApi, reviewApi } from '../utils/api';
import { formatPrice, getDiscount, formatDate } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useGarage } from '../context/GarageContext';
import { useAuth } from '../context/AuthContext';
import FitmentBadge from '../components/FitmentBadge';
import ScarcityIndicator from '../components/ScarcityIndicator';
import InstallInfo from '../components/InstallInfo';
import ReviewCard from '../components/ReviewCard';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState('description');
  const { addItem } = useCart();
  const { activeVehicle } = useGarage();
  const { user } = useAuth();
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productApi.getOne(id),
      reviewApi.getAll({ productId: id }),
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.product);
      setReviews(rRes.data.reviews || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product, qty, activeVehicle ? { make: activeVehicle.make, model: activeVehicle.model, year: activeVehicle.year } : null);
    setTimeout(() => setAdding(false), 800);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    try {
      await reviewApi.create({ product: product._id, ...reviewForm, vehicle: activeVehicle });
      const { data } = await reviewApi.getAll({ productId: id });
      setReviews(data.reviews || []);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <p className="font-heading text-xl dark:text-gray-400 text-gray-500">Product not found</p>
    </div>
  );

  const price = product.onSale && product.salePrice ? product.salePrice : product.price;
  const discount = getDiscount(product.price, product.salePrice);
  const beforeImg = product.images?.find(i => i.isBeforeAfter === 'before');
  const afterImg = product.images?.find(i => i.isBeforeAfter === 'after');
  const mainImages = product.images?.filter(i => !i.isBeforeAfter) || [];

  return (
    <div className="pt-[88px] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm dark:text-gray-500 text-gray-400 mb-6">
          <Link to="/" className="hover:text-brand-red">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-brand-red">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-brand-red">{product.category}</Link>
          <span>/</span>
          <span className="dark:text-white text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="relative dark:bg-dark-surface bg-gray-100 rounded-xl overflow-hidden aspect-[4/3] mb-3">
              {mainImages[activeImg] ? (
                <img src={mainImages[activeImg].url} alt={mainImages[activeImg].alt || product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center dark:text-gray-600 text-gray-400 font-heading uppercase tracking-wider text-sm">
                  No Image
                </div>
              )}
              {mainImages.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-brand-red transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setActiveImg(i => Math.min(mainImages.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-brand-red transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {mainImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {mainImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === activeImg ? 'border-brand-red' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-heading font-semibold tracking-widest uppercase text-brand-red">{product.brand}</span>
              <span className="text-xs dark:text-gray-500 text-gray-400">·</span>
              <span className="text-xs dark:text-gray-500 text-gray-400 font-mono">{product.finish}</span>
            </div>

            <h1 className="font-heading font-bold text-2xl md:text-3xl dark:text-white text-gray-900 leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                  ))}
                </div>
                <span className="text-sm dark:text-gray-400 text-gray-500">{product.rating} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span className="font-display font-black text-4xl text-brand-red">{formatPrice(price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg dark:text-gray-500 text-gray-400 line-through mb-1">{formatPrice(product.price)}</span>
                  <span className="badge bg-brand-red text-white mb-1">-{discount}%</span>
                </>
              )}
            </div>

            {/* Fitment */}
            <div className="mb-4">
              <FitmentBadge fitmentData={product.fitment} vehicle={activeVehicle} />
            </div>

            {/* Scarcity */}
            <div className="mb-5">
              <ScarcityIndicator
                stock={product.stock}
                isBackordered={product.isBackordered}
                backorderETA={product.backorderETA}
                leadTime={product.leadTime}
                vehicle={activeVehicle}
              />
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed mb-5">{product.shortDescription}</p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center dark:bg-dark-surface-2 bg-gray-100 border dark:border-dark-border border-light-border rounded-lg overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 dark:text-white text-gray-900 hover:text-brand-red transition-colors text-lg font-bold">−</button>
                <span className="w-12 text-center font-semibold dark:text-white text-gray-900">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="w-10 h-12 dark:text-white text-gray-900 hover:text-brand-red transition-colors text-lg font-bold">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 && !product.isBackordered}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {adding ? 'Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="p-3 dark:bg-dark-surface-2 bg-gray-100 border dark:border-dark-border border-light-border rounded-lg hover:border-brand-red transition-colors">
                <Heart size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
            </div>

            {/* Financing */}
            <div className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-3 mb-5">
              <p className="text-sm dark:text-gray-300 text-gray-600">
                As low as <span className="font-bold text-brand-red">{formatPrice(price / 12)}/mo</span> with{' '}
                <span className="font-semibold">Affirm</span> or <span className="font-semibold">Klarna</span>
              </p>
            </div>

            {/* SKU / Weight */}
            <div className="text-xs dark:text-gray-500 text-gray-400 space-y-1">
              {product.sku && <p>SKU: {product.sku}</p>}
              {product.weight && <p>Weight: {product.weight} lbs (vs ~{(product.weight * 4).toFixed(1)} lbs OEM)</p>}
              <p>Brand Tier: {product.brandTier}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-dark-border border-light-border mb-8">
          <div className="flex gap-0">
            {['description', 'fitment', 'install', 'reviews'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-heading font-semibold text-sm tracking-widest uppercase px-6 py-3 border-b-2 transition-colors ${
                  tab === t ? 'border-brand-red text-brand-red' : 'border-transparent dark:text-gray-400 text-gray-500 hover:text-brand-red'
                }`}
              >
                {t === 'reviews' ? `Reviews (${product.reviewCount})` : t}
              </button>
            ))}
          </div>
        </div>

        {tab === 'description' && (
          <div className="max-w-3xl prose prose-invert">
            <p className="dark:text-gray-300 text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            {beforeImg && afterImg && (
              <div className="mt-8">
                <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-4">Before vs After</h3>
                <BeforeAfterSlider beforeSrc={beforeImg.url} afterSrc={afterImg.url} />
              </div>
            )}
          </div>
        )}

        {tab === 'fitment' && (
          <div className="max-w-3xl">
            <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-4">Compatible Vehicles</h3>
            {product.fitment?.length > 0 ? (
              <div className="space-y-3">
                {product.fitment.map((f, i) => (
                  <div key={i} className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold dark:text-white text-gray-900">{f.yearFrom}–{f.yearTo} {f.make} {f.model}</p>
                        {f.trims?.length > 0 && <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">Trims: {f.trims.join(', ')}</p>}
                        {f.alsoFits?.length > 0 && <p className="text-sm text-blue-400 mt-1">Also fits: {f.alsoFits.join(', ')}</p>}
                      </div>
                      <div className="text-right">
                        {f.requiresModification ? (
                          <span className="flex items-center gap-1 text-xs text-orange-400 font-medium"><AlertTriangle size={12} /> Mod Required</span>
                        ) : (
                          <span className="text-xs text-green-400 font-medium">Direct Fit</span>
                        )}
                        <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">{f.fitmentConfidence}% confidence</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dark:text-gray-400 text-gray-500">Contact us to verify fitment for your vehicle.</p>
            )}
          </div>
        )}

        {tab === 'install' && (
          <div className="max-w-lg">
            <InstallInfo installInfo={product.installInfo} />
          </div>
        )}

        {tab === 'reviews' && (
          <div className="max-w-3xl">
            {/* Write review */}
            {user && (
              <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5 mb-6">
                <h3 className="font-heading font-bold text-base dark:text-white text-gray-900 mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}>
                        <Star size={20} className={i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                    className="input-dark"
                    required
                  />
                  <textarea
                    placeholder="Share your experience with this part..."
                    value={reviewForm.body}
                    onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                    className="input-dark min-h-[100px] resize-y"
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="btn-primary disabled:opacity-50">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
              </div>
            ) : (
              <p className="dark:text-gray-400 text-gray-500">No reviews yet. Be the first!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
