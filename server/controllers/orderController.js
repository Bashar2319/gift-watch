const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mockStore = require('../config/mockStore');

// @desc  Create order (saved to DB, then customer redirects to WhatsApp)
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, totalPrice, notes } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  if (global.useMockDb) {
    // Validate stock for each product in mockStore
    for (const item of items) {
      const product = mockStore.products.find((p) => p._id === item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for: ${product.name}`);
      }
    }

    // Deduct stock in mockStore
    for (const item of items) {
      const product = mockStore.products.find((p) => p._id === item.product);
      product.stock -= item.quantity;
    }

    const order = {
      _id: 'ord_' + Date.now(),
      user: req.user,
      items: items.map((item, index) => ({
        _id: 'ord_item_' + index + '_' + Date.now(),
        ...item,
      })),
      shippingAddress,
      totalPrice,
      notes: notes || '',
      paymentMethod: 'WhatsApp',
      orderStatus: 'pending',
      paymentStatus: 'pending',
      whatsappSent: true,
      createdAt: new Date().toISOString(),
    };

    mockStore.orders.push(order);
    res.status(201).json(order);
    return;
  }

  // Validate stock for each product
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    totalPrice,
    notes: notes || '',
    paymentMethod: 'WhatsApp',
    orderStatus: 'pending',
    paymentStatus: 'pending',
  });

  // Deduct stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(201).json(order);
});

// @desc  Get logged-in user's orders
// @route GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const userOrders = mockStore.orders.filter(
      (ord) => ord.user._id.toString() === req.user._id.toString()
    );
    res.json(userOrders);
    return;
  }

  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc  Get order by ID
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const order = mockStore.orders.find((ord) => ord._id === req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    // Allow access if owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json(order);
    return;
  }

  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow access if admin or the order owner
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// ===================== ADMIN =====================

// @desc  Get all orders (admin)
// @route GET /api/orders
// @access Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    let filtered = [...mockStore.orders];
    if (req.query.status) {
      filtered = filtered.filter((o) => o.orderStatus === req.query.status);
    }
    if (req.query.paymentStatus) {
      filtered = filtered.filter((o) => o.paymentStatus === req.query.paymentStatus);
    }
    
    // Sort newest
    filtered.reverse();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    res.json({
      orders: paginated,
      page,
      pages: Math.ceil(filtered.length / limit),
      total: filtered.length,
    });
    return;
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filterQuery = {};
  if (req.query.status) filterQuery.orderStatus = req.query.status;
  if (req.query.paymentStatus) filterQuery.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filterQuery)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filterQuery),
  ]);

  res.json({ orders, page, pages: Math.ceil(total / limit), total });
});

// @desc  Update order status (admin)
// @route PUT /api/orders/:id/status
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, whatsappSent } = req.body;

  if (global.useMockDb) {
    const order = mockStore.orders.find((ord) => ord._id === req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (whatsappSent !== undefined) order.whatsappSent = whatsappSent;

    res.json(order);
    return;
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (whatsappSent !== undefined) order.whatsappSent = whatsappSent;

  const updated = await order.save();
  res.json(updated);
});

// @desc  Get admin dashboard stats
// @route GET /api/orders/stats
// @access Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const totalOrders = mockStore.orders.length;
    const totalProducts = mockStore.products.length;
    const pendingOrders = mockStore.orders.filter((o) => o.orderStatus === 'pending').length;
    const deliveredOrders = mockStore.orders.filter((o) => o.orderStatus === 'delivered').length;
    
    // Revenue is sum of totalPrice for paid orders
    const revenue = mockStore.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({ totalOrders, totalProducts, pendingOrders, deliveredOrders, revenue });
    return;
  }

  const [totalOrders, totalProducts, pendingOrders, deliveredOrders, revenueData] =
    await Promise.all([
      Order.countDocuments(),
      require('../models/Product').countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

  const revenue = revenueData[0]?.total || 0;

  res.json({ totalOrders, totalProducts, pendingOrders, deliveredOrders, revenue });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
