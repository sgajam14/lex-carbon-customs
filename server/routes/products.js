const router = require('express').Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeatured, getCategories, toggleWishlist,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/meta', getCategories);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.put('/:id/wishlist', protect, toggleWishlist);

module.exports = router;
