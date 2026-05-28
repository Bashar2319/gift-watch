import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Tag,
  ShoppingBag,
  Sliders,
  TrendingUp,
  Package,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Stats States
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    revenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Products States
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Product Form Input
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    category: 'Analog',
    price: '',
    originalPrice: '',
    description: '',
    stock: '',
    isFeatured: 'false',
    isTrending: 'false',
    tags: '',
  });

  // Orders States
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync Overview Stats on mount or activeTab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'inventory') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get('/orders/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Fetch all products (limit high so admin sees list)
      const { data } = await api.get('/products?limit=100');
      setProducts(data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/orders?limit=100');
      setOrders(data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Product Form Changes
  const handleInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const { name, brand, price, description, stock } = productForm;
    if (!name || !brand || !price || !description || stock === '') {
      toast.error('Please enter all mandatory fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('category', productForm.category);
    formData.append('price', price);
    formData.append('originalPrice', productForm.originalPrice || 0);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('isFeatured', productForm.isFeatured);
    formData.append('isTrending', productForm.isTrending);
    formData.append('tags', productForm.tags);

    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    const toastId = toast.loading(editingProduct ? 'Updating watch...' : 'Adding watch...');
    try {
      if (editingProduct) {
        // Update product
        await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Watch details updated!', { id: toastId });
      } else {
        // Create product
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('New watch added successfully!', { id: toastId });
      }
      // Reset
      setProductForm({
        name: '',
        brand: '',
        category: 'Analog',
        price: '',
        originalPrice: '',
        description: '',
        stock: '',
        isFeatured: 'false',
        isTrending: 'false',
        tags: '',
      });
      setSelectedFiles([]);
      setEditingProduct(null);
      setShowProductForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Error processing request', { id: toastId });
    }
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      description: prod.description,
      stock: prod.stock,
      isFeatured: prod.isFeatured ? 'true' : 'false',
      isTrending: prod.isTrending ? 'true' : 'false',
      tags: prod.tags?.join(', ') || '',
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this watch? This deletes its images from Cloudinary.')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Watch deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteProductImage = async (prodId, imageUrl) => {
    if (window.confirm('Delete this image?')) {
      try {
        await api.delete(`/products/${prodId}/image`, { data: { imageUrl } });
        toast.success('Image removed!');
        // Update editing state images
        setEditingProduct((prev) => ({
          ...prev,
          images: prev.images.filter((img) => img !== imageUrl),
        }));
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  // Quick Stock Level updates (Inventory tab)
  const handleQuickStockUpdate = async (productId, currentStock, newStockValue) => {
    if (newStockValue === '' || isNaN(newStockValue) || Number(newStockValue) < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    try {
      const { data } = await api.put(`/products/${productId}`, {
        stock: Number(newStockValue),
      });
      
      // Update local products list stock value
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, stock: data.stock } : p))
      );
      toast.success('Stock updated!');
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  // Update order status controls
  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      await api.put(`/orders/${orderId}/status`, updates);
      toast.success('Order details updated!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="border-b border-neutral-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-500">Manage products, orders, and watch stock inventory</p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Tag },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                className={`flex items-center px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-black hover:text-black'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        
        {/* ===================== OVERVIEW STATS TAB ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loadingStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {Array(4).fill(null).map((_, i) => (
                  <div key={i} className="h-28 bg-neutral-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stats cards */}
                <div className="border border-neutral-100 bg-white p-6 shadow-sm rounded flex items-center space-x-4">
                  <div className="p-3 bg-neutral-100 text-black rounded-full"><ShoppingBag className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase">Total Orders</p>
                    <p className="text-2xl font-bold text-black mt-1">{stats.totalOrders}</p>
                  </div>
                </div>

                <div className="border border-neutral-100 bg-white p-6 shadow-sm rounded flex items-center space-x-4">
                  <div className="p-3 bg-neutral-100 text-black rounded-full"><Package className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase">Watches Catalog</p>
                    <p className="text-2xl font-bold text-black mt-1">{stats.totalProducts}</p>
                  </div>
                </div>

                <div className="border border-neutral-100 bg-white p-6 shadow-sm rounded flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><AlertCircle className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-amber-700/60 uppercase">Pending Orders</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{stats.pendingOrders}</p>
                  </div>
                </div>

                <div className="border border-neutral-100 bg-white p-6 shadow-sm rounded flex items-center space-x-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-full"><TrendingUp className="h-6 w-6" /></div>
                  <div>
                    <p className="text-xs font-bold text-green-700/60 uppercase">Sales Revenue</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">₹{stats.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>

              </div>
            )}

            {/* Quick Action Info panel */}
            <div className="border border-neutral-100 bg-neutral-50 p-6 rounded text-sm text-neutral-600 space-y-2">
              <h3 className="font-bold text-black">WhatsApp E-Commerce Management Guidelines</h3>
              <p>1. When customers place orders, they are redirected to WhatsApp. The order is automatically saved as <span className="font-bold">Pending</span>.</p>
              <p>2. View order details in the <span className="font-bold">Orders</span> tab, check their WhatsApp chat info, confirm address details, and update the status.</p>
              <p>3. Mark payments as <span className="font-bold">Paid</span> once they pay via cash/bank transfer. Only Paid orders contribute to the Sales Revenue counter above.</p>
            </div>
          </div>
        )}

        {/* ===================== PRODUCTS MANAGEMENT TAB ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Create Watch Header controls */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold uppercase tracking-wider text-black">
                {showProductForm ? (editingProduct ? 'Edit Watch' : 'Add New Watch') : 'Watch Catalog'}
              </h2>
              
              {!showProductForm && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      brand: '',
                      category: 'Analog',
                      price: '',
                      originalPrice: '',
                      description: '',
                      stock: '',
                      isFeatured: 'false',
                      isTrending: 'false',
                      tags: '',
                    });
                    setShowProductForm(true);
                  }}
                  className="inline-flex items-center bg-black text-white px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Watch
                </button>
              )}
            </div>

            {/* Form to Add/Edit Product */}
            {showProductForm && (
              <form onSubmit={handleSaveProduct} className="border border-neutral-100 bg-white p-6 shadow-sm rounded space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Left Column Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Watch Name</label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Edifice EFR-573"
                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Brand</label>
                        <input
                          type="text"
                          name="brand"
                          value={productForm.brand}
                          onChange={handleInputChange}
                          placeholder="e.g., Casio"
                          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Category</label>
                        <select
                          name="category"
                          value={productForm.category}
                          onChange={handleInputChange}
                          className="w-full border border-neutral-200 px-3 py-2.5 text-sm focus:border-black focus:outline-none bg-white"
                        >
                          {['Analog', 'Digital', 'Smart', 'Luxury', 'Sports', 'Casual'].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Selling Price (₹)</label>
                        <input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleInputChange}
                          placeholder="e.g., 4999"
                          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={productForm.originalPrice}
                          onChange={handleInputChange}
                          placeholder="Leave blank if no discount"
                          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Stock</label>
                        <input
                          type="number"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleInputChange}
                          placeholder="e.g., 10"
                          className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Featured</label>
                        <select
                          name="isFeatured"
                          value={productForm.isFeatured}
                          onChange={handleInputChange}
                          className="w-full border border-neutral-200 px-3 py-2.5 text-sm bg-white"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Trending</label>
                        <select
                          name="isTrending"
                          value={productForm.isTrending}
                          onChange={handleInputChange}
                          className="w-full border border-neutral-200 px-3 py-2.5 text-sm bg-white"
                        >
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={productForm.tags}
                        onChange={handleInputChange}
                        placeholder="e.g., automatic, leather, water-resistant"
                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column Fields (Desc & Image upload) */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Watch Description</label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Provide details about size, movement, materials, and water resistance..."
                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>

                    {/* Image files selection */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Upload Images (Max 5)</label>
                      <div className="mt-1 flex justify-center border-2 border-neutral-300 border-dashed px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-neutral-400" />
                          <div className="flex text-sm text-neutral-600">
                            <label className="relative cursor-pointer rounded-md bg-white font-medium text-black focus-within:outline-none hover:text-neutral-600">
                              <span>Select files</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-neutral-400">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 text-xs font-medium text-neutral-600">
                          Selected: {selectedFiles.map((f) => f.name).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Current editing images display with delete capability */}
                    {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold uppercase text-neutral-600 mb-1.5">Existing Images</label>
                        <div className="flex gap-2 overflow-x-auto py-1">
                          {editingProduct.images.map((img) => (
                            <div key={img} className="relative h-14 w-14 border rounded overflow-hidden flex-shrink-0">
                              <img src={img} alt="" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeleteProductImage(editingProduct._id, img)}
                                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="flex justify-end space-x-2 border-t border-neutral-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 border rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            )}

            {/* List products catalog in a table */}
            {!showProductForm && (
              <div className="overflow-x-auto border border-neutral-100 bg-white shadow-sm rounded">
                {loadingProducts ? (
                  <div className="p-8 text-center animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-100 w-full"></div>
                    <div className="h-8 bg-neutral-100 w-full"></div>
                  </div>
                ) : products.length > 0 ? (
                  <table className="min-w-full divide-y divide-neutral-100 text-left text-sm">
                    <thead className="bg-neutral-50 text-xs font-bold uppercase text-neutral-500">
                      <tr>
                        <th className="px-6 py-3">Watch</th>
                        <th className="px-6 py-3">Brand</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Price</th>
                        <th className="px-6 py-3">Stock</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <img
                              src={prod.images?.[0] || 'https://via.placeholder.com/50'}
                              alt=""
                              className="h-10 w-10 object-cover border border-neutral-100 rounded"
                            />
                            <span className="font-bold text-neutral-900">{prod.name}</span>
                          </td>
                          <td className="px-6 py-4 text-neutral-600">{prod.brand}</td>
                          <td className="px-6 py-4 text-neutral-600">{prod.category}</td>
                          <td className="px-6 py-4 font-semibold text-black">₹{prod.price.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              prod.stock === 0 ? 'bg-red-100 text-red-800' : prod.stock <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {prod.stock} Units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button
                              onClick={() => handleEditClick(prod)}
                              className="inline-flex items-center text-xs font-bold uppercase text-neutral-600 hover:text-black"
                            >
                              <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="inline-flex items-center text-xs font-bold uppercase text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-16 text-center text-neutral-500">
                    No watches in catalog. Click "Add Watch" to begin.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== ORDER MANAGEMENT TAB ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-black">All Orders placed</h2>

            <div className="overflow-x-auto border border-neutral-100 bg-white shadow-sm rounded">
              {loadingOrders ? (
                <div className="p-8 text-center animate-pulse space-y-4">
                  <div className="h-8 bg-neutral-100 w-full"></div>
                </div>
              ) : orders.length > 0 ? (
                <table className="min-w-full divide-y divide-neutral-100 text-left text-sm">
                  <thead className="bg-neutral-50 text-xs font-bold uppercase text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Order Status</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-4 uppercase font-bold text-neutral-800">
                          #{ord._id.substring(ord._id.length - 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-neutral-900 font-medium">{ord.user?.name || 'Guest User'}</div>
                          <div className="text-xs text-neutral-400">{ord.shippingAddress?.fullName} | {ord.shippingAddress?.phone}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-black">₹{ord.totalPrice.toLocaleString('en-IN')}</td>
                        
                        {/* Order status */}
                        <td className="px-6 py-4">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getOrderStatusColor(ord.orderStatus)}`}>
                            {ord.orderStatus}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            ord.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : ord.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>

                        {/* Status changers */}
                        <td className="px-6 py-4 text-right space-y-1">
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Order Status Select */}
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, { orderStatus: e.target.value })}
                              className="border border-neutral-200 text-xs px-2 py-1 rounded bg-white"
                            >
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            {/* Payment Status Changer */}
                            {ord.paymentStatus !== 'paid' ? (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord._id, { paymentStatus: 'paid' })}
                                className="inline-flex items-center text-[10px] font-bold text-green-600 uppercase hover:underline"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" /> Mark Paid
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord._id, { paymentStatus: 'pending' })}
                                className="inline-flex items-center text-[10px] font-bold text-neutral-400 uppercase hover:underline"
                              >
                                <RefreshCw className="mr-1 h-3 w-3" /> Mark Unpaid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-neutral-500">
                  No orders placed yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== INVENTORY MANAGEMENT TAB ===================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-black">Inventory Stock Control</h2>

            <div className="overflow-x-auto border border-neutral-100 bg-white shadow-sm rounded">
              {loadingProducts ? (
                <div className="p-8 text-center animate-pulse space-y-4">
                  <div className="h-8 bg-neutral-100 w-full"></div>
                </div>
              ) : products.length > 0 ? (
                <table className="min-w-full divide-y divide-neutral-100 text-left text-sm">
                  <thead className="bg-neutral-50 text-xs font-bold uppercase text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Watch</th>
                      <th className="px-6 py-3">Brand</th>
                      <th className="px-6 py-3">Current Stock</th>
                      <th className="px-6 py-3">Stock Status</th>
                      <th className="px-6 py-3 text-right">Quick Stock Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.map((prod) => {
                      const isLow = prod.stock <= 3;
                      const isOut = prod.stock === 0;
                      return (
                        <tr key={prod._id} className="hover:bg-neutral-50/50">
                          <td className="px-6 py-4 flex items-center space-x-3">
                            <img
                              src={prod.images?.[0] || 'https://via.placeholder.com/50'}
                              alt=""
                              className="h-10 w-10 object-cover border border-neutral-100 rounded"
                            />
                            <span className="font-bold text-neutral-900">{prod.name}</span>
                          </td>
                          <td className="px-6 py-4 text-neutral-600">{prod.brand}</td>
                          <td className="px-6 py-4 font-bold text-black">{prod.stock} Units</td>
                          
                          {/* Indicator */}
                          <td className="px-6 py-4">
                            {isOut ? (
                              <span className="bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Low Stock Alert
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Stable
                              </span>
                            )}
                          </td>

                          {/* Quick adjust form */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <input
                                type="number"
                                placeholder="New"
                                className="w-16 border border-neutral-200 px-2 py-1 text-xs text-center rounded focus:outline-none focus:border-black"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleQuickStockUpdate(prod._id, prod.stock, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const inputEl = e.currentTarget.previousSibling;
                                  handleQuickStockUpdate(prod._id, prod.stock, inputEl.value);
                                  inputEl.value = '';
                                }}
                                className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded"
                              >
                                Update
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-neutral-500">
                  No products in system.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
