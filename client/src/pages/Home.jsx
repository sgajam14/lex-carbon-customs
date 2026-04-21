import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Package, Star, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FitmentLookup from '../components/FitmentLookup';
import BundleCard from '../components/BundleCard';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { productApi, bundleApi } from '../utils/api';
import carbonHoodImage from '../assets/carbonHood2.jpeg';
import carbonSpoilerImage from '../assets/carbonSpoiler.jpg';
import carbonDiffuserImage from '../assets/carbonDiffuser.jpg';
import carbonBumperImage from '../assets/carbonBumper.jpg';
import carbonInteriorImage from '../assets/carbonInterior.jpg';
import carbonSideSkirtsImage from '../assets/carbonSideSkirts.png';

const CATEGORIES = [
  { name: 'Hoods', href: '/shop?category=Hood', image: carbonHoodImage },
  { name: 'Spoilers', href: '/shop?category=Spoiler', image: carbonSpoilerImage },
  { name: 'Diffusers', href: '/shop?category=Diffuser', image: carbonDiffuserImage },
  { name: 'Side Skirts', href: '/shop?category=Side+Skirts', image: carbonSideSkirtsImage },
  { name: 'Front Bumpers', href: '/shop?category=Front+Bumper', image: carbonBumperImage },
  { name: 'Interior', href: '/shop?category=Interior+Trim', image: carbonInteriorImage },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [liveViews, setLiveViews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveViews = useCallback(() => {
    productApi.getLiveViews().then(({ data }) => setLiveViews(data.products || [])).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      productApi.getFeatured(),
      bundleApi.getAll(),
      productApi.getBestSellers(6),
      productApi.getLiveViews(),
    ]).then(([pRes, bRes, bsRes, lvRes]) => {
      setFeatured(pRes.data.products || []);
      setBundles(bRes.data.bundles?.filter(b => b.isFeatured) || []);
      setBestSellers(bsRes.data.products || []);
      setLiveViews(lvRes.data.products || []);
    }).finally(() => setLoading(false));

    // Poll live views every 30 s
    const interval = setInterval(fetchLiveViews, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveViews]);

  return (
    <div className="pt-[88px]">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden carbon-texture">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-dark-bg to-dark-surface-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-px h-64 bg-gradient-to-b from-transparent via-brand-red/30 to-transparent" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-brand-red/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-px bg-brand-red" />
              <span className="text-brand-red font-heading font-semibold text-sm tracking-widest uppercase">Premium Carbon Fiber</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-black text-white leading-none mb-6">
              BUILT TO<br />
              <span className="text-gradient">DOMINATE</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
              Hand-laid carbon fiber parts engineered for your exact vehicle. Precision-matched fitment — minor adjustments may be needed during installation.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                <CheckCircle size={15} /> Precision Fitment
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
                <Shield size={15} /> Lifetime Warranty
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
                <Star size={15} fill="currentColor" /> 4.9/5 Rating
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/build" className="btn-outline flex items-center gap-2">
                Build Your Car
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <FitmentLookup />
          </motion.div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="dark:bg-dark-surface bg-gray-900 border-y dark:border-dark-border border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '5,000+', label: 'Parts Sold' },
            { value: '500+', label: 'Fitment Entries' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '98%', label: 'Fitment Success Rate' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-black text-brand-red">{stat.value}</p>
              <p className="font-heading text-sm tracking-widest uppercase text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title dark:text-white text-gray-900">Shop By <span>Category</span></h2>
            <div className="w-12 h-0.5 bg-brand-red mt-3" />
          </div>
          <Link to="/shop" className="text-brand-red font-heading font-semibold text-sm tracking-wider uppercase hover:underline flex items-center gap-1">
            All Parts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const hasImage = !!cat.image;
            return (
              <Link
                key={cat.name}
                to={cat.href}
                className={`group relative rounded-xl text-center hover:border-brand-red/50 hover:shadow-lg dark:hover:shadow-brand-red/5 transition-all min-h-[112px] overflow-hidden ${
                  hasImage ? 'border border-dark-border' : 'dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border p-4'
                }`}
              >
                {hasImage && (
                  <>
                    <img src={cat.image} alt={`${cat.name} category`} className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  </>
                )}
                <div className={`relative z-10 h-full flex flex-col items-center justify-center ${hasImage ? 'px-3 py-4' : ''}`}>
                  <span className={`font-heading font-semibold text-sm transition-colors ${hasImage ? 'text-white bg-black/65 border border-white/25 rounded px-2.5 py-1 tracking-wide shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'dark:text-white text-gray-900 group-hover:text-brand-red'}`}>
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="dark:bg-dark-surface bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} className="text-brand-red" />
                <span className="text-brand-red font-heading font-semibold text-sm tracking-widest uppercase">Top Sellers</span>
              </div>
              <h2 className="section-title dark:text-white text-gray-900">Best <span>Sellers</span></h2>
              <div className="w-12 h-0.5 bg-brand-red mt-3" />
            </div>
            <Link to="/shop?sort=bestseller" className="text-brand-red font-heading font-semibold text-sm tracking-wider uppercase hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dark:bg-dark-surface-2 bg-gray-200 rounded-xl aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.slice(0, 8).map((p, idx) => (
                <div key={p._id} className="relative">
                  {idx < 3 && (
                    <div className={`absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}>
                      #{idx + 1}
                    </div>
                  )}
                  {p.totalSold > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-brand-red/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {p.totalSold}+ sold
                    </div>
                  )}
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 dark:text-gray-500 text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-heading uppercase tracking-wider">Sales data loading soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title dark:text-white text-gray-900">Featured <span>Parts</span></h2>
              <div className="w-12 h-0.5 bg-brand-red mt-3" />
            </div>
            <Link to="/shop?featured=true" className="text-brand-red font-heading font-semibold text-sm tracking-wider uppercase hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dark:bg-dark-surface-2 bg-gray-200 rounded-xl aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 dark:text-gray-500 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-heading uppercase tracking-wider">Products coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Live Views */}
      {liveViews.length > 0 && (
        <section className="dark:bg-dark-surface bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="text-green-400 font-heading font-semibold text-sm tracking-widest uppercase">Live Now</span>
                </div>
                <h2 className="section-title dark:text-white text-gray-900">Being Viewed <span>Right Now</span></h2>
                <div className="w-12 h-0.5 bg-brand-red mt-3" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {liveViews.slice(0, 8).map(p => (
                <div key={p._id} className="relative">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/80 text-green-400 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur border border-green-500/20">
                    <Eye size={10} />
                    {p.viewersNow} viewing
                  </div>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Before / After */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-px bg-brand-red" />
              <span className="text-brand-red font-heading text-sm tracking-widest uppercase">See the Difference</span>
            </div>
            <h2 className="section-title dark:text-white text-gray-900 mb-4">
              Stock vs <span>Carbon</span>
            </h2>
            <p className="dark:text-gray-400 text-gray-500 leading-relaxed mb-6">
              Drag the slider to see the before-and-after transformation. Carbon fiber doesn't just look aggressive — it sheds pounds and improves airflow.
            </p>
            <ul className="space-y-2">
              {['Up to 60% lighter than OEM parts', 'Improved aerodynamics', 'UV-resistant clear coat', 'Precision-matched fitment'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm dark:text-gray-300 text-gray-600">
                  <CheckCircle size={14} className="text-green-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <BeforeAfterSlider
            beforeSrc="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"
            afterSrc="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"
            beforeLabel="Stock"
            afterLabel="Carbon"
          />
        </div>
      </section>

      {/* Bundles */}
      {bundles.length > 0 && (
        <section className="dark:bg-dark-surface bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title dark:text-white text-gray-900">Bundle & <span>Save</span></h2>
                <div className="w-12 h-0.5 bg-brand-red mt-3" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.slice(0, 3).map(b => <BundleCard key={b._id} bundle={b} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trust section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="section-title dark:text-white text-gray-900 text-center mb-12">
          Why Choose <span>Lex's</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Precision Fitment', desc: "Every part is verified against your vehicle's specs. Carbon fiber may require minor panel adjustments during install — this is normal and expected." },
            { icon: Zap, title: 'Lightning Fast', desc: 'In-stock parts ship within 24 hours. Custom pieces include clear lead time estimates upfront.' },
            { icon: Package, title: 'Insured Packaging', desc: 'Carbon fiber ships in custom foam-lined crates. Every order is insured and tracked door to door.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-brand-red" />
              </div>
              <h3 className="font-heading font-bold text-lg dark:text-white text-gray-900 mb-2">{title}</h3>
              <p className="text-sm dark:text-gray-400 text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="carbon-texture border-t dark:border-dark-border border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-4xl font-black text-white mb-4">READY TO BUILD?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Enter your vehicle and get a personalized list of precision-matched carbon parts in seconds.</p>
          <Link to="/build" className="btn-primary inline-flex items-center gap-2 text-base">
            Start Building <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
