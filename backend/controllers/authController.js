const crypto = require('crypto');
const User = require('../models/User');
const Provider = require('../models/Provider');
const { DeliveryPartner } = require('../models/index');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

// Helper: send token response
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('token', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    data: { user, token, refreshToken },
  });
};

// @POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, referralCode } = req.body;

    if (!['student', 'provider', 'delivery'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Handle referral
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
    }

    const user = await User.create({
      name, email, phone, password, role,
      referredBy: referrer?._id,
    });

    // Handle referral bonus
    if (referrer) {
      referrer.walletBalance += 50;
      referrer.loyaltyPoints += 100;
      referrer.referralCount += 1;
      await referrer.save({ validateBeforeSave: false });
    }

    // Create role-specific profile
    if (role === 'provider') {
      await Provider.create({ user: user._id, businessName: name });
    }
    if (role === 'delivery') {
      await DeliveryPartner.create({ user: user._id });
    }

    // Send verification email
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your HostelMeal Connect account',
        html: `
          <h2>Welcome to HostelMeal Connect! 🍛</h2>
          <p>Hi ${user.name}, please verify your email:</p>
          <a href="${verificationUrl}" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a>
          <p>Link expires in 24 hours.</p>
        `,
      });
    } catch (emailErr) {
      logger.error('Email send failed:', emailErr.message);
    }

    await sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Account banned. Contact support.' });
    }

    user.lastLogin = new Date();
    await sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};

// @POST /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    user.walletBalance += 25; // Welcome bonus
    user.loyaltyPoints += 50;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully! ₹25 added to your wallet.' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - HostelMeal Connect',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
      `,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    await sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @PUT /api/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    await sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newToken = user.generateAuthToken();
    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    next(error);
  }
};
