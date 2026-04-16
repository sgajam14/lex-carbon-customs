const Product = require('../models/Product');
const path = require('path');

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 24, sort = '-createdAt',
      category, brand, brandTier, finish, minPrice, maxPrice,
      search, make, model, year, featured, onSale,
    } = req.query;

    const query = { isArchived: false };

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (brandTier) query.brandTier = brandTier;
    if (finish) query.finish = finish;
    if (featured === 'true') query.isFeatured = true;
    if (onSale === 'true') query.onSale = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (make && model && year) {
      query.fitment = {
        $elemMatch: {
          make: new RegExp(make, 'i'),
          model: new RegExp(model, 'i'),
          yearFrom: { $lte: Number(year) },
          yearTo: { $gte: Number(year) },
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
      isArchived: false,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: 'Invalid product data. Please check your input.' });
  }
};

exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image' });
    }

    const images = req.files.map((file) => {
      const fileName = path.parse(file.originalname).name;
      const alt = fileName.replace(/[-_]+/g, ' ').trim();
      return {
        url: `/api/uploads/products/${file.filename}`,
        alt,
        isPrimary: false,
      };
    });

    res.status(201).json({ success: true, images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: 'Invalid product data. Please check your input.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product archived' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isArchived: false }).limit(8);
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isArchived: false });
    const brands = await Product.distinct('brand', { isArchived: false });
    res.json({ success: true, categories, brands });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;
    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};
