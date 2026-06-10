// ===================== routes/users.js =====================
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');
  res.json({ success: true, data: user });
});

router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, phone, address, notificationPrefs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, notificationPrefs },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload an image' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url: req.file.path, publicId: req.file.filename } },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

module.exports = router;
