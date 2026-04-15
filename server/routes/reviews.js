const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getReviews, createReview, markHelpful } = require('../controllers/reviewController');

router.get('/', getReviews);
router.post('/', protect, createReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
