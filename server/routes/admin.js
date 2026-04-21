const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { admin, superAdmin } = require('../middleware/admin');
const {
  getDashboard, getAllOrders, getAllUsers, updateUserRole, updateInventory,
  getAffiliates, createAffiliateInvite, updateAffiliateRate,
} = require('../controllers/adminController');

router.use(protect, admin);

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.put('/users/:id/role', superAdmin, updateUserRole);
router.put('/inventory/:id', updateInventory);

// Affiliate management
router.get('/affiliates', getAffiliates);
router.post('/affiliates/invite', createAffiliateInvite);
router.put('/affiliates/:id/rate', updateAffiliateRate);

module.exports = router;
