const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendShippingNotification } = require('../utils/email');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, shippingMethod, notes, guestEmail, guestName, financingProvider } = req.body;

    // Validate stock and get current prices
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      if (product.stock < item.qty && !product.isBackordered) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      subtotal += price * item.qty;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price,
        qty: item.qty,
        fitment: item.fitment,
      });
    }

    const shippingCost = shippingMethod === 'Overnight' ? 75 : shippingMethod === 'Expedited' ? 35 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const order = await Order.create({
      user: req.user?._id,
      guestEmail,
      guestName,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      subtotal,
      shippingCost,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      notes,
      financingProvider,
      statusHistory: [{ status: 'Pending', timestamp: new Date() }],
    });

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images slug')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const query = req.user
      ? { _id: req.params.id, user: req.user._id }
      : { orderNumber: req.params.id };
    const order = await Order.findOne(query).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    const order = await Order.findOne({ orderNumber }).select(
      'orderNumber status statusHistory trackingNumber trackingUrl carrier estimatedDelivery items shippingAddress'
    ).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only return delivered orders' });
    }
    order.returnRequest = { requested: true, reason, requestedAt: new Date(), status: 'Pending' };
    order.status = 'Return Requested';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier, trackingUrl, estimatedDelivery, note } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'email firstName');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (status === 'Delivered') order.deliveredAt = new Date();

    order.statusHistory.push({ status, timestamp: new Date(), note, updatedBy: req.user._id });
    await order.save();

    // Send email notifications
    if (status === 'Shipped' && order.user?.email) {
      await sendShippingNotification(order).catch(console.error);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
