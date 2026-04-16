import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, X, Save, Upload } from 'lucide-react';
import { productApi } from '../../utils/api';
import BackToDashboardButton from '../../components/admin/BackToDashboardButton';

const CATEGORIES = ['Hood', 'Trunk Lid', 'Spoiler', 'Diffuser', 'Side Skirts', 'Front Bumper', 'Rear Bumper', 'Fenders', 'Mirrors', 'Hood Vents', 'Canards', 'Interior Trim', 'Roof Panel', 'Other'];
const FINISHES = ['Dry Carbon', 'Wet Carbon', 'Forged Carbon', 'Carbon Kevlar', 'Pre-Preg', 'Other'];
const BRAND_TIERS = ['Budget', 'Mid-Range', 'Premium', 'OEM-Style'];
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

const ensurePrimaryImage = (images = []) => {
  if (!images.length) return [];
  if (images.some(img => img.isPrimary)) return images;
  return images.map((img, idx) => ({ ...img, isPrimary: idx === 0 }));
};

const defaultForm = {
  name: '', description: '', shortDescription: '', price: '', salePrice: '', onSale: false,
  category: 'Hood', brand: '', brandTier: 'Mid-Range', finish: 'Dry Carbon',
  sku: '', stock: '0', leadTime: '', weight: '', isBackordered: false, isFeatured: false,
  images: [],
  fitment: [{ make: '', model: '', yearFrom: '', yearTo: '', requiresModification: false, fitmentConfidence: 100 }],
  installInfo: { difficulty: 'Intermediate', timeEstimate: '', requiredTools: [], notes: '' },
  tags: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isEdit) {
      productApi.getOne(id).then(({ data }) => {
        const p = data.product;
        const initialImages = ensurePrimaryImage(p.images?.length ? p.images : defaultForm.images);
        setForm({
          ...defaultForm, ...p,
          price: String(p.price),
          salePrice: String(p.salePrice || ''),
          stock: String(p.stock || 0),
          weight: String(p.weight || ''),
          images: initialImages,
          fitment: p.fitment?.length ? p.fitment.map(f => ({ ...f, yearFrom: String(f.yearFrom), yearTo: String(f.yearTo) })) : defaultForm.fitment,
          installInfo: p.installInfo || defaultForm.installInfo,
          tags: p.tags || [],
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setNested = (parent, key, value) => setForm(f => ({ ...f, [parent]: { ...f[parent], [key]: value } }));

  const updateImage = (i, key, value) => {
    const imgs = [...form.images];
    imgs[i] = { ...imgs[i], [key]: value };
    set('images', imgs);
  };

  const setPrimaryImage = (i) => {
    const imgs = form.images.map((img, idx) => ({ ...img, isPrimary: idx === i }));
    set('images', imgs);
  };

  const removeImage = (i) => {
    const next = form.images.filter((_, idx) => idx !== i);
    set('images', ensurePrimaryImage(next));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImages(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const { data } = await productApi.uploadImages(formData);
      const merged = ensurePrimaryImage([...form.images, ...(data.images || [])]);
      set('images', merged);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image(s)');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const updateFitment = (i, key, value) => {
    const f = [...form.fitment];
    f[i] = { ...f[i], [key]: value };
    set('fitment', f);
  };
  const addFitment = () => set('fitment', [...form.fitment, { make: '', model: '', yearFrom: '', yearTo: '', requiresModification: false, fitmentConfidence: 100 }]);
  const removeFitment = (i) => set('fitment', form.fitment.filter((_, idx) => idx !== i));

  const addTool = () => {
    if (toolInput.trim()) {
      setNested('installInfo', 'requiredTools', [...(form.installInfo.requiredTools || []), toolInput.trim()]);
      setToolInput('');
    }
  };
  const removeTool = (t) => setNested('installInfo', 'requiredTools', form.installInfo.requiredTools.filter(x => x !== t));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        stock: parseInt(form.stock),
        weight: form.weight ? parseFloat(form.weight) : undefined,
        fitment: form.fitment.map(f => ({ ...f, yearFrom: parseInt(f.yearFrom), yearTo: parseInt(f.yearTo) })).filter(f => f.make && f.model),
        images: ensurePrimaryImage(form.images.filter(i => i.url)),
      };
      if (isEdit) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="pt-[88px] min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-[88px] min-h-screen dark:bg-dark-bg bg-light-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackToDashboardButton />
          <h1 className="font-display font-bold text-2xl dark:text-white text-gray-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
        </div>

        {error && <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 space-y-4">
            <h2 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Basic Info</h2>
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Product Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="input-dark" required />
            </div>
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Short Description</label>
              <input type="text" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input-dark" />
            </div>
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Full Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-dark min-h-[120px] resize-y" required />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Category *</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-dark" required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Finish *</label>
                <select value={form.finish} onChange={e => set('finish', e.target.value)} className="input-dark" required>
                  {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Brand *</label>
                <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className="input-dark" required />
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Brand Tier</label>
                <select value={form.brandTier} onChange={e => set('brandTier', e.target.value)} className="input-dark">
                  {BRAND_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Price ($) *</label>
                <input type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="input-dark" required />
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Sale Price ($)</label>
                <input type="number" step="0.01" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} className="input-dark" />
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.onSale} onChange={e => set('onSale', e.target.checked)} className="accent-brand-red w-4 h-4" />
                  <span className="text-sm dark:text-gray-300 text-gray-600">On Sale</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">SKU</label>
                <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="input-dark" />
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Lead Time</label>
                <input type="text" value={form.leadTime} onChange={e => set('leadTime', e.target.value)} className="input-dark" placeholder="e.g. 2-3 weeks" />
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Weight (lbs)</label>
                <input type="number" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} className="input-dark" />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="accent-brand-red w-4 h-4" />
                <span className="text-sm dark:text-gray-300 text-gray-600">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isBackordered} onChange={e => set('isBackordered', e.target.checked)} className="accent-brand-red w-4 h-4" />
                <span className="text-sm dark:text-gray-300 text-gray-600">Backordered</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Images</h2>
              <label className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer flex items-center gap-1.5">
                <Upload size={12} />
                {uploadingImages ? 'Uploading...' : 'Upload Images'}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImages} />
              </label>
            </div>
            <p className="text-xs dark:text-gray-500 text-gray-400">Upload up to 8 images, max 5MB each.</p>
            {form.images.length === 0 && (
              <div className="text-xs dark:text-gray-500 text-gray-400 border dark:border-dark-border border-light-border rounded-lg p-3">
                No images uploaded yet.
              </div>
            )}
            {form.images.map((img, i) => (
              <div key={i} className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-3">
                <div className="grid md:grid-cols-[96px_1fr] gap-3 items-start">
                  <div className="w-24 h-24 rounded-lg overflow-hidden dark:bg-dark-surface bg-gray-100 border dark:border-dark-border border-light-border">
                    {img.url ? <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="space-y-2">
                    <input type="text" value={img.alt} onChange={e => updateImage(i, 'alt', e.target.value)} placeholder="Alt text" className="input-dark !text-sm" />
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs dark:text-gray-300 text-gray-600 cursor-pointer">
                        <input type="radio" name="primary-image" checked={!!img.isPrimary} onChange={() => setPrimaryImage(i)} className="accent-brand-red" />
                        Primary
                      </label>
                      <select value={img.isBeforeAfter || ''} onChange={e => updateImage(i, 'isBeforeAfter', e.target.value || null)} className="input-dark !text-xs !py-1 !w-auto">
                        <option value="">Regular</option>
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </select>
                      <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-300 ml-auto"><X size={14} /></button>
                    </div>
                    <p className="text-[11px] dark:text-gray-500 text-gray-400 truncate">{img.url}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fitment */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Fitment</h2>
              <button type="button" onClick={addFitment} className="text-xs text-brand-red hover:underline flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {form.fitment.map((f, i) => (
              <div key={i} className="dark:bg-dark-surface-2 bg-gray-50 border dark:border-dark-border border-light-border rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input type="text" value={f.make} onChange={e => updateFitment(i, 'make', e.target.value)} placeholder="Make" className="input-dark !text-sm" />
                  <input type="text" value={f.model} onChange={e => updateFitment(i, 'model', e.target.value)} placeholder="Model" className="input-dark !text-sm" />
                  <input type="number" value={f.yearFrom} onChange={e => updateFitment(i, 'yearFrom', e.target.value)} placeholder="Year From" className="input-dark !text-sm" />
                  <input type="number" value={f.yearTo} onChange={e => updateFitment(i, 'yearTo', e.target.value)} placeholder="Year To" className="input-dark !text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer dark:text-gray-300 text-gray-600">
                      <input type="checkbox" checked={f.requiresModification} onChange={e => updateFitment(i, 'requiresModification', e.target.checked)} className="accent-brand-red" />
                      Requires Modification
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs dark:text-gray-400 text-gray-500">Confidence:</span>
                      <input type="number" min="0" max="100" value={f.fitmentConfidence} onChange={e => updateFitment(i, 'fitmentConfidence', parseInt(e.target.value))} className="input-dark !text-xs !py-1 w-16" />
                      <span className="text-xs dark:text-gray-400 text-gray-500">%</span>
                    </div>
                  </div>
                  {form.fitment.length > 1 && (
                    <button type="button" onClick={() => removeFitment(i)} className="text-red-400 text-xs">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Install Info */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 space-y-4">
            <h2 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Install Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Difficulty</label>
                <select value={form.installInfo.difficulty} onChange={e => setNested('installInfo', 'difficulty', e.target.value)} className="input-dark">
                  {DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Time Estimate</label>
                <input type="text" value={form.installInfo.timeEstimate} onChange={e => setNested('installInfo', 'timeEstimate', e.target.value)} placeholder="e.g. 2-3 hours" className="input-dark" />
              </div>
            </div>
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Required Tools</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={toolInput} onChange={e => setToolInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTool())} placeholder="Add tool..." className="input-dark flex-1 !text-sm" />
                <button type="button" onClick={addTool} className="btn-outline !py-2 !px-3 text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.installInfo.requiredTools?.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-300 text-gray-600 px-2 py-1 rounded">
                    {t} <button type="button" onClick={() => removeTool(t)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs dark:text-gray-400 text-gray-500 mb-1">Install Notes</label>
              <textarea value={form.installInfo.notes} onChange={e => setNested('installInfo', 'notes', e.target.value)} className="input-dark min-h-[80px]" />
            </div>
          </div>

          {/* Tags */}
          <div className="dark:bg-dark-surface bg-white border dark:border-dark-border border-light-border rounded-xl p-6 space-y-3">
            <h2 className="font-heading font-bold dark:text-white text-gray-900 uppercase tracking-wider text-sm">Tags</h2>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag..." className="input-dark flex-1 !text-sm" />
              <button type="button" onClick={addTag} className="btn-outline !py-2 !px-3 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-xs dark:bg-dark-surface-2 bg-gray-100 dark:text-gray-300 text-gray-600 px-2 py-1 rounded">
                  {t} <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-8">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <Link to="/admin/products" className="btn-ghost border dark:border-dark-border border-light-border rounded text-sm">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
