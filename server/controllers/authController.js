const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      garage: user.garage,
      wishlist: user.wishlist,
      avatar: user.avatar,
      isAffiliate: user.isAffiliate,
      affiliateCode: user.affiliateCode,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, referredBy } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const userData = { firstName, lastName, email, password, phone };
    if (referredBy) {
      const affiliate = await User.findOne({ affiliateCode: referredBy, isAffiliate: true });
      if (affiliate) userData.referredBy = referredBy;
    }
    const user = await User.create(userData);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'No account found for this email. Please create an account.',
      });
    }

    if (!(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'wishlist',
      'name slug price salePrice onSale images brand finish stock isBackordered isFeatured leadTime rating reviewCount'
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, emailNotifications, smsNotifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, emailNotifications, smsNotifications },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
