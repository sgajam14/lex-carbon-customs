const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: { orderId: orderId || 'pending' },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Payment could not be initiated. Please try again.' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentIntentId = paymentIntentId;
        order.status = 'Confirmed';
        await order.save();
      }
      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook error:', err.message);
    return res.status(400).send('Webhook signature verification failed.');
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const { id: paymentIntentId, metadata } = event.data.object;
      if (metadata.orderId && metadata.orderId !== 'pending') {
        await Order.findByIdAndUpdate(metadata.orderId, {
          paymentStatus: 'Paid',
          paymentIntentId,
          status: 'Confirmed',
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const { metadata } = event.data.object;
      if (metadata.orderId && metadata.orderId !== 'pending') {
        await Order.findByIdAndUpdate(metadata.orderId, { paymentStatus: 'Failed' });
      }
      break;
    }
    case 'charge.refunded': {
      const { payment_intent } = event.data.object;
      await Order.findOneAndUpdate({ paymentIntentId: payment_intent }, { paymentStatus: 'Refunded', status: 'Refunded' });
      break;
    }
  }
  res.json({ received: true });
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.paymentIntentId) return res.status(400).json({ success: false, message: 'No payment to refund' });

    const refund = await stripe.refunds.create({ payment_intent: order.paymentIntentId });
    order.paymentStatus = 'Refunded';
    order.status = 'Refunded';
    await order.save();

    res.json({ success: true, refund });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
