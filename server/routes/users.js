const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  addToGarage, removeFromGarage, setPrimaryVehicle, addAddress, removeAddress,
} = require('../controllers/userController');

router.post('/garage', protect, addToGarage);
router.delete('/garage/:vehicleId', protect, removeFromGarage);
router.put('/garage/:vehicleId/primary', protect, setPrimaryVehicle);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:addressId', protect, removeAddress);

module.exports = router;
