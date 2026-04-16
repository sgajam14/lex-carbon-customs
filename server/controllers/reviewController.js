const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.getReviews = async (req, res) => {
  try {
    const { productId, page = 1, limit = 10 } = req.query;
    const query = { isApproved: true };
    if (productId) {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        query.product = productId;
      } else {
        const product = await Product.findOne({ slug: productId }).select('_id').lean();
        if (!product) {
          return res.json({ success: true, reviews: [], total: 0 });
        }
        query.product = product._id;
      }
    }
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));
    res.json({ success: true, reviews, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { product, rating, title, body, vehicle, images, orderId } = req.body;

    // Check verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, 'items.product': product });
      isVerifiedPurchase = !!order;
    }

    const review = await Review.create({
      product,
      user: req.user._id,
      order: orderId,
      rating,
      title,
      body,
      vehicle,
      images,
      isVerifiedPurchase,
    });

    // Update product rating
    const reviews = await Review.find({ product, isApproved: true });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product, { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const idx = review.helpful.indexOf(req.user._id);
    if (idx === -1) {
      review.helpful.push(req.user._id);
    } else {
      review.helpful.splice(idx, 1);
    }
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
