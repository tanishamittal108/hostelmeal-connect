// ===================== routes/auth.js =====================
const express = require('express');
const router = express.Router();
const {
  register, login, logout, getMe,
  verifyEmail, forgotPassword, resetPassword,
  updatePassword, refreshToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
