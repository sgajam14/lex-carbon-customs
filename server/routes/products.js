const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeatured, getCategories, toggleWishlist, uploadProductImages,
  getBestSellers, trackView, getLiveViews,
} = require('../controllers/productController');

const productUploadDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(productUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image uploads are allowed'));
  },
});

const uploadProductImagesMiddleware = (req, res, next) => {
  upload.array('images', 8)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must be 5MB or less' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(400).json({ success: false, message: err.message || 'Image upload failed' });
  });
};

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/meta', getCategories);
router.get('/bestsellers', getBestSellers);
router.get('/live-views', getLiveViews);
router.post('/:id/view', trackView);
router.get('/:id', getProduct);
router.post('/upload-images', protect, admin, uploadProductImagesMiddleware, uploadProductImages);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/wishlist', protect, toggleWishlist);

module.exports = router;
