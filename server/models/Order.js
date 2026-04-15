const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  fitment: {
    make: String,
    model: String,
    year: Number,
    trim: String,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  zip: String,
  country: { type: String, default: 'US' },
  phone: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail: { type: String }, // for guest checkout
  guestName: { type: String },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Return Requested'],
    default: 'Pending',
  },
  statusHistory: [statusHistorySchema],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  shippingMethod: { type: String, enum: ['Standard', 'Expedited', 'Overnight'], default: 'Standard' },
  carrier: { type: String }, // UPS, FedEx, USPS
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  paymentIntentId: { type: String },
  stripeChargeId: { type: String },
  notes: { type: String },
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: { type: String },
    requestedAt: { type: Date },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'] },
  },
  isBackordered: { type: Boolean, default: false },
  backorderETA: { type: Date },
  financingProvider: { type: String }, // Affirm, Klarna
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `LCC-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Track status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
