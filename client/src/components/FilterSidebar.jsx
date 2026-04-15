import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const categories = ['Hood', 'Trunk Lid', 'Spoiler', 'Diffuser', 'Side Skirts', 'Front Bumper', 'Rear Bumper', 'Fenders', 'Mirrors', 'Hood Vents', 'Canards', 'Interior Trim', 'Roof Panel'];
const finishes = ['Dry Carbon', 'Wet Carbon', 'Forged Carbon', 'Carbon Kevlar', 'Pre-Preg'];
const brandTiers = ['Budget', 'Mid-Range', 'Premium', 'OEM-Style'];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b dark:border-dark-border border-light-border pb-4 mb-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left py-1"
      >
        <span className="font-heading font-semibold text-sm tracking-wider uppercase dark:text-white text-gray-900">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onClear }) {
  const handleCheck = (key, value) => {
    const current = filters[key] ? filters[key].split(',') : [];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onChange({ ...filters, [key]: updated.join(',') });
  };

  const hasFilters = Object.values(filters).some(v => v && v !== '' && v !== '-createdAt');

  return (
    <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-base tracking-widest uppercase dark:text-white text-gray-900">Filters</h3>
        {hasFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-brand-red hover:underline font-medium">
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={e => onChange({ ...filters, minPrice: e.target.value })}
            className="input-dark !py-2 !text-sm"
          />
          <span className="dark:text-gray-500 text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
            className="input-dark !py-2 !text-sm"
          />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[['Under $500', { minPrice: '', maxPrice: '500' }], ['$500-$1000', { minPrice: '500', maxPrice: '1000' }], ['Over $1000', { minPrice: '1000', maxPrice: '' }]].map(([label, vals]) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, ...vals })}
              className="text-[11px] dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-400 text-gray-500 px-2 py-1 rounded hover:bg-brand-red hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-1.5">
          {[
            ['-createdAt', 'Newest First'],
            ['price', 'Price: Low to High'],
            ['-price', 'Price: High to Low'],
            ['-rating', 'Top Rated'],
            ['-reviewCount', 'Most Reviewed'],
          ].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={val}
                checked={filters.sort === val}
                onChange={() => onChange({ ...filters, sort: val })}
                className="accent-brand-red"
              />
              <span className="text-sm dark:text-gray-300 text-gray-600 group-hover:text-brand-red transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category?.split(',').includes(cat) || false}
                onChange={() => handleCheck('category', cat)}
                className="accent-brand-red"
              />
              <span className="text-sm dark:text-gray-300 text-gray-600 group-hover:text-brand-red transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Finish */}
      <FilterSection title="Carbon Finish">
        <div className="space-y-1.5">
          {finishes.map(f => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.finish?.split(',').includes(f) || false}
                onChange={() => handleCheck('finish', f)}
                className="accent-brand-red"
              />
              <span className="text-sm dark:text-gray-300 text-gray-600 group-hover:text-brand-red transition-colors">{f}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand Tier */}
      <FilterSection title="Brand Tier" defaultOpen={false}>
        <div className="space-y-1.5">
          {brandTiers.map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brandTier?.split(',').includes(t) || false}
                onChange={() => handleCheck('brandTier', t)}
                className="accent-brand-red"
              />
              <span className="text-sm dark:text-gray-300 text-gray-600 group-hover:text-brand-red transition-colors">{t}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* On Sale */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="onSale"
          checked={filters.onSale === 'true'}
          onChange={e => onChange({ ...filters, onSale: e.target.checked ? 'true' : '' })}
          className="accent-brand-red"
        />
        <label htmlFor="onSale" className="text-sm dark:text-gray-300 text-gray-600 cursor-pointer">On Sale Only</label>
      </div>
    </div>
  );
}
