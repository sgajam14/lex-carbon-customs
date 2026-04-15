const router = require('express').Router();
const Bundle = require('../models/Bundle');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', async (req, res) => {
  try {
    const bundles = await Bundle.find({ isActive: true }).populate('items.product', 'name price images slug');
    res.json({ success: true, bundles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bundle = await Bundle.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] })
      .populate('items.product');
    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });
    res.json({ success: true, bundle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const bundle = await Bundle.create(req.body);
    res.status(201).json({ success: true, bundle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, bundle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Bundle.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Bundle deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
