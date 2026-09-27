const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { notifyAdmins } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');
const { sendOtpEmail, sendPasswordChangedEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate 6-digit numeric OTP code
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user & send OTP
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.isVerified) {
        res.status(400);
        throw new Error('User already exists with this email');
      } else {
        // Unverified user exists - update details & issue new OTP
        existingUser.name = name;
        existingUser.password = password; // Will be hashed via pre-save hook
        
        const rawOtp = generateOtpCode();
        existingUser.otpCode = await bcrypt.hash(rawOtp, 10);
        existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        existingUser.otpPurpose = 'signup';
        existingUser.otpAttempts = 0;
        existingUser.otpLockUntil = null;
        existingUser.otpResendCooldown = new Date(Date.now() + 60 * 1000);

        await existingUser.save();

        // Send OTP email
        await sendOtpEmail(existingUser.email, rawOtp, 'signup');

        return res.status(200).json({
          success: true,
          isVerified: false,
          email: existingUser.email,
          message: 'Account updated. A new 6-digit verification code was sent to your email.',
        });
      }
    }

    // Generate 6-digit OTP
    const rawOtp = generateOtpCode();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Create user with isVerified: false
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isVerified: false,
      otpCode: hashedOtp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      otpPurpose: 'signup',
      otpAttempts: 0,
      otpResendCooldown: new Date(Date.now() + 60 * 1000),
    });

    // Send OTP email
    await sendOtpEmail(user.email, rawOtp, 'signup');

    // Notify Admins & Log
    await notifyAdmins(`New registration pending verification: ${email}`, 'user');
    await logActivity(user, 'USER_SIGNUP_INITIATED', 'Signup OTP generated and sent');

    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      message: 'Account created! Please verify your email using the 6-digit OTP code sent to your inbox.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for Signup or Password Reset
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      res.status(400);
      throw new Error('Please provide email, 6-digit OTP, and purpose');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404);
      throw new Error('Account not found');
    }

    // Check lockout
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const remainingMins = Math.ceil((user.otpLockUntil - Date.now()) / 60000);
      res.status(429);
      throw new Error(`Too many failed attempts. Account locked for ${remainingMins} minute(s).`);
    }

    // Check OTP expiration
    if (!user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
      res.status(400);
      throw new Error('Verification code has expired. Please click "Resend OTP".');
    }

    // Check purpose match
    if (user.otpPurpose !== purpose) {
      res.status(400);
      throw new Error('Invalid verification request type');
    }

    // Verify OTP code
    const isMatch = await user.matchOtp(otp.toString().trim());
    if (!isMatch) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpLockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-min lock
      }
      await user.save();

      const remainingAttempts = Math.max(0, 5 - user.otpAttempts);
      res.status(400);
      throw new Error(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`);
    }

    // On Success: Clear OTP state
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpPurpose = null;
    user.otpAttempts = 0;
    user.otpLockUntil = null;
    user.otpResendCooldown = null;

    if (purpose === 'signup') {
      user.isVerified = true;
      await user.save();

      await logActivity(user, 'USER_VERIFIED', 'User email verified via OTP');

      // Issue JWT directly for seamless login
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Account verified successfully!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    if (purpose === 'password_reset') {
      // Issue short-lived reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully. Please enter your new password.',
        resetToken,
        email: user.email,
      });
    }

    res.status(400);
    throw new Error('Unsupported verification purpose');
  } catch (error) {
    next(error);
  }
};

// @desc    Resend 6-digit OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      res.status(400);
      throw new Error('Please provide email and purpose');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic success to prevent account enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a new verification code has been sent.',
      });
    }

    // Check resend rate-limiting cooldown
    if (user.otpResendCooldown && user.otpResendCooldown > Date.now()) {
      const remainingSecs = Math.ceil((user.otpResendCooldown - Date.now()) / 1000);
      res.status(429);
      throw new Error(`Please wait ${remainingSecs} seconds before requesting a new OTP.`);
    }

    // Generate new OTP
    const rawOtp = generateOtpCode();
    user.otpCode = await bcrypt.hash(rawOtp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose;
    user.otpAttempts = 0;
    user.otpLockUntil = null;
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000);

    await user.save();

    // Send OTP email
    await sendOtpEmail(user.email, rawOtp, purpose);

    res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check verification status
    if (user.isVerified === false) {
      // Send fresh OTP automatically
      const rawOtp = generateOtpCode();
      user.otpCode = await bcrypt.hash(rawOtp, 10);
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      user.otpPurpose = 'signup';
      user.otpAttempts = 0;
      user.otpResendCooldown = new Date(Date.now() + 60 * 1000);
      await user.save();

      await sendOtpEmail(user.email, rawOtp, 'signup');

      res.status(403);
      return res.json({
        success: false,
        isVerified: false,
        email: user.email,
        message: 'Your account is not verified yet. We sent a new 6-digit OTP code to your email.',
      });
    }

    // Log Activity
    await logActivity(user, 'USER_LOGIN', 'User logged in');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic response for security
      return res.status(200).json({
        success: true,
        email,
        message: 'If that email exists in our system, a password reset OTP code has been sent.',
      });
    }

    // Generate & send OTP
    const rawOtp = generateOtpCode();
    user.otpCode = await bcrypt.hash(rawOtp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'password_reset';
    user.otpAttempts = 0;
    user.otpLockUntil = null;
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000);

    await user.save();

    await sendOtpEmail(user.email, rawOtp, 'password_reset');

    res.status(200).json({
      success: true,
      email: user.email,
      message: 'A 6-digit password reset verification code has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password with verified resetToken
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, password, confirmPassword, email } = req.body;

    const newPassword = password;
    const confirm = confirmPassword || newPassword;

    if ((!resetToken && !email) || !newPassword) {
      res.status(400);
      throw new Error('Please provide reset token and new password');
    }

    if (newPassword !== confirm) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    let user;
    if (resetToken) {
      user = await User.findOne({
        resetToken,
        resetTokenExpiresAt: { $gt: Date.now() },
      });
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired password reset session. Please request a new OTP.');
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    user.isVerified = true; // Also mark verified if resetted
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(user.email);
    await logActivity(user, 'PASSWORD_RESET', 'User password reset completed');

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity(req.user, 'LOGOUT', 'User logged out');
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
};
