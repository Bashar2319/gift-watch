const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const mockStore = require('../config/mockStore');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
    return;
  }

  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      if (req.body.password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
    return;
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add shipping address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      _id: 'addr_' + Date.now(),
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    res.status(201).json(user.addresses);
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, phone, street, city, state, pincode, isDefault } = req.body;

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    fullName,
    phone,
    street,
    city,
    state,
    pincode,
    isDefault: isDefault || user.addresses.length === 0, // Make default if it's the first address
  };

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json(user.addresses);
});

// @desc    Update shipping address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;

  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const address = user.addresses.find((addr) => addr._id === addressId);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    res.json(user.addresses);
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { fullName, phone, street, city, state, pincode, isDefault } = req.body;

  const address = user.addresses.id(addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  address.fullName = fullName || address.fullName;
  address.phone = phone || address.phone;
  address.street = street || address.street;
  address.city = city || address.city;
  address.state = state || address.state;
  address.pincode = pincode || address.pincode;
  if (isDefault !== undefined) {
    address.isDefault = isDefault;
  }

  await user.save();
  res.json(user.addresses);
});

// @desc    Delete shipping address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const addressId = req.params.id;

  if (global.useMockDb) {
    const user = mockStore.users.find((u) => u._id === req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const originalLength = user.addresses.length;
    user.addresses = user.addresses.filter((addr) => addr._id !== addressId);

    if (user.addresses.length === originalLength) {
      res.status(404);
      throw new Error('Address not found');
    }

    if (user.addresses.length > 0 && !user.addresses.some((addr) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    res.json(user.addresses);
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const originalLength = user.addresses.length;
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

  if (user.addresses.length === originalLength) {
    res.status(404);
    throw new Error('Address not found');
  }

  // If we deleted the default address, make the first remaining address default
  if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
