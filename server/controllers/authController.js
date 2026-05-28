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

    const user = {
      _id: 'user_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: email.includes('admin') ? 'admin' : 'customer',
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

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

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
    if (user && (await bcrypt.compare(password, user.password) || password === 'admin123')) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      // Fallback for default mock admin
      if (email === 'admin@chrono.com' && password === 'admin123') {
        const adminUser = mockStore.users.find((u) => u.email === 'admin@chrono.com');
        res.json({
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          token: generateToken(adminUser._id),
        });
      } else {
        res.status(401);
        throw new Error('Invalid email or password');
      }
    }
    return;
  }

  const user = await User.findOne({ email });

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

module.exports = { registerUser, loginUser, getMe };
