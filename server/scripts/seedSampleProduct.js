require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lex-carbon-customs';

const sampleProduct = {
  name: 'Varis-Style Carbon Fiber Hood - BMW M3 / M4 (F80/F82)',
  slug: 'varis-style-carbon-fiber-hood-bmw-m3-m4-f80-f82',
  description: 'Track-inspired Varis-style vented hood built from dry carbon fiber for the BMW F8X platform. Designed to reduce front-end weight while improving heat extraction and high-speed stability. UV-resistant clear coat helps maintain gloss and weave quality in daily driving conditions.',
  shortDescription: 'Dry carbon vented hood for BMW F80 M3 and F82/F83 M4.',
  price: 1299,
  salePrice: 999,
  onSale: true,
  category: 'Hood',
  brand: 'APR Performance',
  brandTier: 'Premium',
  finish: 'Dry Carbon',
  sku: 'APR-BMW-F8X-CFH-001',
  stock: 8,
  isBackordered: false,
  leadTime: 'Ships in 2-3 business days',
  weight: 34,
  images: [
    {
      url: 'https://picsum.photos/seed/carbon-hood-main/1200/800',
      alt: 'BMW M3 carbon fiber hood front angle',
      isPrimary: true,
    },
    {
      url: 'https://picsum.photos/seed/carbon-hood-weave/1200/800',
      alt: 'Close-up carbon weave detail',
      isPrimary: false,
    },
    {
      url: 'https://picsum.photos/seed/carbon-hood-installed/1200/800',
      alt: 'Installed hood on BMW M4',
      isPrimary: false,
    },
  ],
  fitment: [
    {
      make: 'BMW',
      model: 'M3',
      yearFrom: 2015,
      yearTo: 2018,
      trims: ['Base', 'Competition', 'CS'],
      requiresModification: false,
      fitmentConfidence: 98,
      alsoFits: ['All F80 M3 trims'],
    },
    {
      make: 'BMW',
      model: 'M4',
      yearFrom: 2015,
      yearTo: 2020,
      trims: ['Base', 'Competition', 'CS', 'GTS'],
      requiresModification: false,
      fitmentConfidence: 98,
      alsoFits: ['All F82/F83 M4 trims'],
    },
  ],
  installInfo: {
    difficulty: 'Intermediate',
    timeEstimate: '2-4 hours',
    requiredTools: ['Trim clip removal tool', 'Socket set', 'Torque wrench', 'Second installer recommended'],
    notes: 'Test-fit before final latch alignment. Professional paint-protection film is recommended for long-term finish durability.',
  },
  isFeatured: true,
  tags: ['BMW', 'M3', 'M4', 'F80', 'F82', 'carbon hood', 'Varis style', 'dry carbon'],
  rating: 4.8,
  reviewCount: 32,
  bundleCompatible: true,
};

async function seedSampleProduct() {
  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB: ${MONGO_URI}`);

  const existing = await Product.findOne({ slug: sampleProduct.slug });

  if (existing) {
    Object.assign(existing, sampleProduct);
    await existing.save();
    console.log(`Updated sample product: ${existing.name}`);
  } else {
    const created = await Product.create(sampleProduct);
    console.log(`Created sample product: ${created.name}`);
  }
}

seedSampleProduct()
  .then(async () => {
    await mongoose.disconnect();
    console.log('Seed complete.');
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Disconnect failed:', disconnectError.message);
    }
    process.exit(1);
  });
