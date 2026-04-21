const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

function generateCode(firstName) {
  const base = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

async function uniqueCode(firstName) {
  let code;
  let attempts = 0;
  do {
    code = generateCode(firstName);
    const exists = await User.findOne({ affiliateCode: code });
    if (!exists) break;
    attempts++;
  } while (attempts < 10);
  return code;
}

// GET /api/affiliate/me  — affiliate dashboard data
exports.getMyDashboard = async (req, res) => {
  try {
    if (!req.user.isAffiliate) {
      return res.status(403).json({ success: false, message: 'Not an affiliate' });
    }

    const code = req.user.affiliateCode;

    const recentOrders = await Order.find({ affiliateCode: code })
      .sort('-createdAt')
      .limit(10)
      .select('orderNumber total affiliateCommission createdAt status items');

    // Top products by count
    const topProductsAgg = await Order.aggregate([
      { $match: { affiliateCode: code, paymentStatus: 'Paid' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, count: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      affiliate: {
        code,
        commissionRate: req.user.affiliateCommissionRate,
        clicks: req.user.affiliateClicks,
        sales: req.user.affiliateSales,
        earnings: req.user.affiliateEarnings,
        referralLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/?ref=${code}`,
      },
      recentOrders,
      topProducts: topProductsAgg,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// POST /api/affiliate/activate  — process invite JWT and become affiliate
exports.activateAffiliate = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired invite link' });
    }

    if (payload.type !== 'affiliate-invite') {
      return res.status(400).json({ success: false, message: 'Invalid invite token' });
    }

    // Email in token must match the logged-in user
    if (payload.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'This invite was sent to a different email address' });
    }

    if (req.user.isAffiliate) {
      return res.json({ success: true, message: 'Already an affiliate', affiliateCode: req.user.affiliateCode });
    }

    const code = await uniqueCode(req.user.firstName);
    await User.findByIdAndUpdate(req.user._id, {
      isAffiliate: true,
      affiliateCode: code,
      affiliateCommissionRate: payload.commissionRate || 10,
    });

    res.json({ success: true, message: 'Affiliate account activated!', affiliateCode: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// POST /api/affiliate/click/:code  — increment click counter
exports.trackClick = async (req, res) => {
  try {
    const { code } = req.params;
    await User.findOneAndUpdate({ affiliateCode: code, isAffiliate: true }, { $inc: { affiliateClicks: 1 } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: true }); // fail silently — don't break the referral flow
  }
};
