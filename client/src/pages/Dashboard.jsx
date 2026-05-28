import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, User, MapPin, Plus, Trash2, ArrowUpRight, Phone, Calendar } from 'lucide-react';

const Dashboard = () => {
  const {
    user,
    updateProfile,
    addAddress,
    deleteAddress,
    fetchProfile,
  } = useContext(AuthContext);

  // States
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Sync profile details when user context changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
      });
    }
  }, [user]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchMyOrders = async () => {
        setLoadingOrders(true);
        try {
          const { data } = await api.get('/orders/my');
          setOrders(data);
        } catch (error) {
          toast.error(error.message || 'Failed to load orders');
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchMyOrders();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      toast.error('Name and Email are required');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        password: profileForm.password || undefined,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const { fullName, phone, street, city, state, pincode } = addressForm;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast.error('All fields are required');
      return;
    }

    try {
      await addAddress(addressForm);
      toast.success('Address added successfully!');
      setAddressForm({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      setShowAddressForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast.success('Address deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Failed to delete address');
      }
    }
  };

  const handleResendWhatsApp = (order) => {
    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';
    const itemsText = order.items
      .map((item) => `🕐 ${item.name} x${item.quantity} (₹${item.price.toLocaleString('en-IN')})`)
      .join('\n');

    const messageText = `Hello CHRONO! I'm following up on my order:

*Order ID:* #${order._id.substring(order._id.length - 6).toUpperCase()}
*Items:*
${itemsText}

*Total Price:* ₹${order.totalPrice.toLocaleString('en-IN')}

*Shipping Address:*
Name: ${order.shippingAddress.fullName}
Phone: ${order.shippingAddress.phone}
Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}

Please confirm my order details!`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');
  };

  const getStatusColor = (status) => {
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
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">My Account</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Welcome back, <span className="font-bold text-neutral-800">{user?.name}</span>
        </p>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-8">
        
        {/* Navigation Sidebar */}
        <nav className="lg:col-span-3 space-y-1 mb-8 lg:mb-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium border-l-2 transition-all ${
              activeTab === 'orders'
                ? 'border-black bg-neutral-50 text-black font-bold'
                : 'border-transparent text-neutral-500 hover:bg-neutral-50/50 hover:text-black'
            }`}
          >
            <ShoppingBag className="mr-3 h-5 w-5 text-neutral-400" />
            My Orders
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium border-l-2 transition-all ${
              activeTab === 'profile'
                ? 'border-black bg-neutral-50 text-black font-bold'
                : 'border-transparent text-neutral-500 hover:bg-neutral-50/50 hover:text-black'
            }`}
          >
            <User className="mr-3 h-5 w-5 text-neutral-400" />
            Profile Information
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium border-l-2 transition-all ${
              activeTab === 'addresses'
                ? 'border-black bg-neutral-50 text-black font-bold'
                : 'border-transparent text-neutral-500 hover:bg-neutral-50/50 hover:text-black'
            }`}
          >
            <MapPin className="mr-3 h-5 w-5 text-neutral-400" />
            Manage Addresses
          </button>
        </nav>

        {/* Tab Contents */}
        <main className="lg:col-span-9">
          
          {/* ===================== MY ORDERS TAB ===================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold uppercase tracking-wider text-black">Order History</h2>
              
              {loadingOrders ? (
                <div className="space-y-4">
                  {Array(2).fill(null).map((_, i) => (
                    <div key={i} className="animate-pulse border border-neutral-100 p-6 h-36 bg-neutral-50"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-neutral-100 bg-white p-6 shadow-sm rounded">
                      
                      {/* Order Header info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-neutral-500">ORDER ID</p>
                          <p className="text-sm font-bold text-black uppercase">
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div>
                            <p className="font-bold text-neutral-500 flex items-center"><Calendar className="mr-1 h-3.5 w-3.5" /> PLACED</p>
                            <p className="font-medium text-neutral-800">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-neutral-500">TOTAL</p>
                            <p className="font-bold text-black">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="font-bold text-neutral-500">STATUS</p>
                            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-0.5 rounded-full ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items list */}
                      <ul className="divide-y divide-neutral-100 my-4">
                        {order.items.map((item) => (
                          <li key={item._id} className="flex py-3 justify-between items-center text-sm">
                            <div className="flex items-center space-x-3">
                              <img src={item.image} alt="" className="h-10 w-10 object-cover border border-neutral-100 rounded" />
                              <div>
                                <h4 className="font-medium text-neutral-900">{item.name}</h4>
                                <p className="text-xs text-neutral-400">Qty: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* Footer: Resend whatsapp */}
                      <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                        <p className="text-xs text-neutral-400">
                          Payment: <span className="font-bold text-neutral-700 capitalize">{order.paymentStatus}</span>
                        </p>
                        {order.orderStatus === 'pending' && (
                          <button
                            onClick={() => handleResendWhatsApp(order)}
                            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-green-600 hover:text-green-700 transition-colors"
                          >
                            Resend WhatsApp confirmation <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-neutral-200 bg-neutral-50 rounded">
                  <p className="text-sm text-neutral-500">You haven't placed any orders yet.</p>
                  <a href="/shop" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-black underline">
                    Browse Watches
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ===================== PROFILE TAB ===================== */}
          {activeTab === 'profile' && (
            <div className="max-w-xl border border-neutral-100 bg-white p-6 shadow-sm rounded">
              <h2 className="text-lg font-bold uppercase tracking-wider text-black mb-6">Profile Settings</h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Change Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep existing password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingProfile ? 'Saving Settings...' : 'Update Settings'}
                </button>
              </form>
            </div>
          )}

          {/* ===================== ADDRESSES TAB ===================== */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold uppercase tracking-wider text-black">My Addresses</h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-600 transition-colors"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Address
                  </button>
                )}
              </div>

              {/* Add Address Form inline */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="border border-neutral-150 bg-neutral-50/50 p-6 space-y-4 rounded">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-2">Add New shipping destination</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Receiver Name</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Receiver Phone</label>
                      <input
                        type="text"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefaultAddress"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="h-4 w-4 border-neutral-300 text-black focus:ring-black rounded"
                    />
                    <label htmlFor="isDefaultAddress" className="ml-2 text-xs font-medium text-neutral-600">
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="border border-neutral-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses display */}
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="border border-neutral-200 bg-white p-6 rounded relative flex flex-col justify-between">
                      <div className="text-sm">
                        <span className="font-bold text-neutral-900 flex items-center gap-2">
                          {addr.fullName}
                          {addr.isDefault && (
                            <span className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Default</span>
                          )}
                        </span>
                        <p className="mt-2 text-neutral-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="mt-1 text-xs text-neutral-400 flex items-center"><Phone className="mr-1 h-3.5 w-3.5" /> {addr.phone}</p>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="flex items-center text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">You don't have any shipping addresses saved yet.</p>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
