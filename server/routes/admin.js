const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { admin, superAdmin } = require('../middleware/admin');
const { getDashboard, getAllOrders, getAllUsers, updateUserRole, updateInventory } = require('../controllers/adminController');

router.use(protect, admin); // all admin routes require auth + admin role

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.put('/users/:id/role', superAdmin, updateUserRole);
router.put('/inventory/:id', updateInventory);

module.exports = router;
