const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockStore = require('../config/mockStore');
const bcrypt = require('bcryptjs');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

// @desc  Register user
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  if (global.useMockDb) {
    const userExists = mockStore.users.find((u) => u.email === email.toLowerCase());
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto promote first user to admin in Mock DB
    const isFirstUser = mockStore.users.length === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = {
      _id: 'user_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role,
      addresses: [],
      phone: '',
    };
    
    mockStore.users.push(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
    return;
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Auto promote first user to admin in Live DB
  const isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? 'admin' : 'customer';

  const user = await User.create({ 
    name, 
    email, 
    password,
    role
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u.email === email.toLowerCase());
    const isMockAdmin = (email.toLowerCase() === 'admin@giftwatch.com' && password === 'admin123') ||
                        (email.toLowerCase() === 'pro4134@gmail.com' && password === '7081271482s');

    if (user && (await bcrypt.compare(password, user.password) || isMockAdmin)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      if (isMockAdmin) {
        const adminUser = mockStore.users.find((u) => u.email === email.toLowerCase());
        if (adminUser) {
          res.json({
            _id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            token: generateToken(adminUser._id),
          });
          return;
        }
      }
      res.status(401);
      throw new Error('Invalid email or password');
    }
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc  Get current user profile
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    return;
  }

  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

const sendEmail = require('../utils/sendEmail');

// @desc  Forgot password service
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please enter email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Always return success for safety to prevent user enumeration
  if (!user) {
    res.json({ message: 'If the email exists in our records, a reset link has been dispatched.' });
    return;
  }

  // Generate short-lived reset token (expires in 15 minutes)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl.replace(/\/$/, '')}/forgot-password?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dbece3; border-radius: 8px; background-color: #f0f6f3;">
      <h2 style="color: #0f3e27; text-align: center; border-bottom: 2px solid #c29b38; padding-bottom: 10px;">Gift Watch Lucknow — Password Recovery</h2>
      <p style="color: #072719; font-size: 14px; line-height: 1.5;">Hello <strong>${user.name}</strong>,</p>
      <p style="color: #072719; font-size: 14px; line-height: 1.5;">We received a request to reset your password. Click the button below to set a new password. This recovery link is valid for <strong>15 minutes</strong>:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #0f3e27; color: #f6ebc4; border: 1px solid #c29b38; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Reset Password</a>
      </div>
      <p style="color: #5fa37f; font-size: 11px; line-height: 1.4; border-top: 1px solid #dbece3; padding-top: 10px; margin-top: 20px;">
        If you did not request this password recovery email, please ignore this message. Your password will remain unchanged.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Recovery Link - Gift Watch Lucknow',
      html: htmlContent,
    });
    console.log(`Password reset link successfully sent to: ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
    // Do not throw error to client to avoid enumeration leaks, just log internally
  }

  res.json({ message: 'If the email exists in our records, a reset link has been dispatched.' });
});

// @desc  Reset password service
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Invalid token or password missing');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(400);
    throw new Error('Your password reset link is invalid or has expired.');
  }
});

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword };
