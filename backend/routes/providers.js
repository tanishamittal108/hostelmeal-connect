const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Get all approved providers
router.get('/', async (req, res, next) => {
  try {
    const { city, rating, page = 1, limit = 10 } = req.query;
    const filter = { status: 'approved', isAvailable: true };
    if (rating) filter.avgRating = { $gte: parseFloat(rating) };

    const providers = await Provider.find(filter)
      .populate('user', 'name avatar phone')
      .sort({ avgRating: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Provider.countDocuments(filter);
    res.json({ success: true, data: providers, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// Get single provider
router.get('/:id', async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).populate('user', 'name avatar phone email');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, data: provider });
  } catch (err) { next(err); }
});

// Update provider profile
router.put('/profile', protect, authorize('provider'), async (req, res, next) => {
  try {
    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: provider });
  } catch (err) { next(err); }
});

// Upload kitchen photos
router.post('/kitchen-photos', protect, authorize('provider'), upload.array('kitchenPhoto', 5), async (req, res, next) => {
  try {
    const photos = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    const provider = await Provider.findOneAndUpdate(
      { user: req.user._id },
      { $push: { kitchenPhotos: { $each: photos } } },
      { new: true }
    );
    res.json({ success: true, data: provider });
  } catch (err) { next(err); }
});

// Upload license/FSSAI
router.post('/documents', protect, authorize('provider'), upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'fssai', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const updates = {};
    if (req.files.license) updates.licenseDocument = { url: req.files.license[0].path, publicId: req.files.license[0].filename };
    if (req.files.fssai) updates.fssaiDocument = { url: req.files.fssai[0].path, publicId: req.files.fssai[0].filename };
    const provider = await Provider.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    res.json({ success: true, message: 'Documents uploaded for verification', data: provider });
  } catch (err) { next(err); }
});

module.exports = router;
