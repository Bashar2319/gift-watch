const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const mockStore = require('../config/mockStore');

// @desc  Get all products (with filters, pagination, search)
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  if (global.useMockDb) {
    let filtered = [...mockStore.products];

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filtered = filtered.filter(
        (p) => searchRegex.test(p.name) || searchRegex.test(p.brand) || searchRegex.test(p.description)
      );
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      filtered = filtered.filter((p) => p.category === req.query.category);
    }

    // Brand filter
    if (req.query.brand) {
      const brandRegex = new RegExp(req.query.brand, 'i');
      filtered = filtered.filter((p) => brandRegex.test(p.brand));
    }

    // Price filter
    if (req.query.minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(req.query.minPrice));
    }
    if (req.query.maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(req.query.maxPrice));
    }

    // Sort options
    if (req.query.sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (req.query.sort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (req.query.sort === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // newest
      filtered.reverse();
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    res.json({
      products: paginated,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
    return;
  }

  const query = {};

  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filter
  if (req.query.category && req.query.category !== 'All') {
    query.category = req.query.category;
  }

  // Brand filter
  if (req.query.brand) {
    query.brand = { $regex: req.query.brand, $options: 'i' };
  }

  // Price filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Sort
  let sortOption = { createdAt: -1 };
  if (req.query.sort === 'price-asc') sortOption = { price: 1 };
  if (req.query.sort === 'price-desc') sortOption = { price: -1 };
  if (req.query.sort === 'name-asc') sortOption = { name: 1 };
  if (req.query.sort === 'name-desc') sortOption = { name: -1 };

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc  Get featured products
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const featured = mockStore.products.filter((p) => p.isFeatured).slice(0, 8);
    res.json(featured);
    return;
  }
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
});

// @desc  Get trending products
// @route GET /api/products/trending
// @access Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const trending = mockStore.products.filter((p) => p.isTrending).slice(0, 8);
    res.json(trending);
    return;
  }
  const products = await Product.find({ isTrending: true }).limit(8);
  res.json(products);
});

// @desc  Get single product by ID
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const product = mockStore.products.find((p) => p._id === req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc  Create product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, price, originalPrice, description, stock, isFeatured, isTrending, tags } =
    req.body;

  // Images uploaded via Cloudinary (multer middleware)
  const images = req.files ? req.files.map((f) => f.path) : [];

  if (global.useMockDb) {
    // If running in Mock DB standalone mode, allow dummy image URL fallback
    const mockImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600'];
    const product = {
      _id: 'prod_' + Date.now(),
      name,
      brand,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice) || 0,
      description,
      stock: Number(stock),
      images: mockImages,
      isFeatured: isFeatured === 'true',
      isTrending: isTrending === 'true',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      rating: 4.0,
      numReviews: 0,
    };
    mockStore.products.push(product);
    res.status(201).json(product);
    return;
  }

  const product = await Product.create({
    name,
    brand,
    category,
    price,
    originalPrice: originalPrice || 0,
    description,
    stock,
    images,
    isFeatured: isFeatured === 'true',
    isTrending: isTrending === 'true',
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
  });

  res.status(201).json(product);
});

// @desc  Update product
// @route PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, brand, category, price, originalPrice, description, stock, isFeatured, isTrending, tags } =
    req.body;

  if (global.useMockDb) {
    const prod = mockStore.products.find((p) => p._id === req.params.id);
    if (!prod) {
      res.status(404);
      throw new Error('Product not found');
    }

    prod.name = name || prod.name;
    prod.brand = brand || prod.brand;
    prod.category = category || prod.category;
    if (price !== undefined) prod.price = Number(price);
    if (originalPrice !== undefined) prod.originalPrice = Number(originalPrice);
    prod.description = description || prod.description;
    if (stock !== undefined) prod.stock = Number(stock);
    if (isFeatured !== undefined) prod.isFeatured = isFeatured === 'true';
    if (isTrending !== undefined) prod.isTrending = isTrending === 'true';
    if (tags) prod.tags = tags.split(',').map((t) => t.trim());

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      prod.images = [...prod.images, ...newImages];
    }

    res.json(prod);
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.name = name || product.name;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.price = price !== undefined ? price : product.price;
  product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
  product.description = description || product.description;
  product.stock = stock !== undefined ? stock : product.stock;
  product.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured;
  product.isTrending = isTrending !== undefined ? isTrending === 'true' : product.isTrending;
  if (tags) product.tags = tags.split(',').map((t) => t.trim());

  // Append new images if any
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => f.path);
    product.images = [...product.images, ...newImages];
  }

  const updated = await product.save();
  res.json(updated);
});

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  if (global.useMockDb) {
    const index = mockStore.products.findIndex((p) => p._id === req.params.id);
    if (index === -1) {
      res.status(404);
      throw new Error('Product not found');
    }
    mockStore.products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const imageUrl of product.images) {
    if (imageUrl.includes('cloudinary.com')) {
      const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.warn('Could not delete image from Cloudinary:', publicId);
      }
    }
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted successfully' });
});

// @desc  Delete a specific image from a product
// @route DELETE /api/products/:id/image
// @access Private/Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (global.useMockDb) {
    const prod = mockStore.products.find((p) => p._id === req.params.id);
    if (!prod) {
      res.status(404);
      throw new Error('Product not found');
    }
    prod.images = prod.images.filter((img) => img !== imageUrl);
    res.json({ message: 'Image deleted', images: prod.images });
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (imageUrl.includes('cloudinary.com')) {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('Could not delete image:', publicId);
    }
  }

  product.images = product.images.filter((img) => img !== imageUrl);
  await product.save();
  res.json({ message: 'Image deleted', images: product.images });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
