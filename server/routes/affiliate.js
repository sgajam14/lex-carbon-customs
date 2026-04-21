const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyDashboard, activateAffiliate, trackClick } = require('../controllers/affiliateController');

router.get('/me', protect, getMyDashboard);
router.post('/activate', protect, activateAffiliate);
router.post('/click/:code', trackClick); // public — called when ref link is clicked

module.exports = router;
