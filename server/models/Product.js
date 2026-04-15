const mongoose = require('mongoose');

const fitmentSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  yearFrom: { type: Number, required: true },
  yearTo: { type: Number, required: true },
  trims: [String],
  requiresModification: { type: Boolean, default: false },
  modificationNotes: { type: String },
  fitmentConfidence: { type: Number, min: 0, max: 100, default: 100 }, // percentage
  alsoFits: [String], // e.g., "All GT trims"
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false },
  isBeforeAfter: { type: String, enum: ['before', 'after', null], default: null },
});

const installInfoSchema = new mongoose.Schema({
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'], default: 'Intermediate' },
  timeEstimate: { type: String }, // e.g., "2-3 hours"
  requiredTools: [String],
  notes: { type: String },
  videoUrl: { type: String },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  onSale: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ['Hood', 'Trunk Lid', 'Spoiler', 'Diffuser', 'Side Skirts', 'Front Bumper', 'Rear Bumper',
      'Fenders', 'Mirrors', 'Hood Vents', 'Canards', 'Interior Trim', 'Roof Panel', 'Other'],
    required: true,
  },
  brand: { type: String, required: true },
  brandTier: { type: String, enum: ['Budget', 'Mid-Range', 'Premium', 'OEM-Style'], default: 'Mid-Range' },
  finish: { type: String, enum: ['Dry Carbon', 'Wet Carbon', 'Forged Carbon', 'Carbon Kevlar', 'Pre-Preg', 'Other'], required: true },
  sku: { type: String, unique: true },
  stock: { type: Number, default: 0, min: 0 },
  isBackordered: { type: Boolean, default: false },
  backorderETA: { type: Date },
  leadTime: { type: String }, // e.g., "2-3 weeks"
  weight: { type: Number }, // in lbs
  images: [imageSchema],
  fitment: [fitmentSchema],
  installInfo: installInfoSchema,
  isFeatured: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  tags: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  bundleCompatible: { type: Boolean, default: true },
  stripeProductId: { type: String },
  stripePriceId: { type: String },
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual: effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.onSale && this.salePrice ? this.salePrice : this.price;
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
