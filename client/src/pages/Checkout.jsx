import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { MapPin, Phone, MessageSquare, ShoppingBag, PlusCircle, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { user, addAddress } = useContext(AuthContext);
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Selected address state
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Address form toggle & state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Set default selected address on load
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [user]);

  // Handle redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Add watches first!');
      navigate('/shop');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    // Validate inputs
    const { fullName, phone, street, city, state, pincode } = newAddress;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      toast.error('Please fill in all shipping fields');
      return;
    }

    try {
      const updatedAddresses = await addAddress(newAddress);
      // Auto select the newly added address
      const newlyAdded = updatedAddresses[updatedAddresses.length - 1];
      setSelectedAddressId(newlyAdded._id);
      
      // Reset form
      setNewAddress({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      setShowAddressForm(false);
      toast.success('Shipping address added!');
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address');
      return;
    }

    const shippingAddressObj = user.addresses.find((a) => a._id === selectedAddressId);
    if (!shippingAddressObj) {
      toast.error('Selected address is invalid');
      return;
    }

    setIsSubmitting(true);
    const orderData = {
      items: cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: shippingAddressObj.fullName,
        phone: shippingAddressObj.phone,
        street: shippingAddressObj.street,
        city: shippingAddressObj.city,
        state: shippingAddressObj.state,
        pincode: shippingAddressObj.pincode,
      },
      totalPrice: cartTotal,
      notes,
    };

    try {
      // 1. Save order to backend Database
      const { data: order } = await api.post('/orders', orderData);
      
      // 2. Prepare WhatsApp pre-filled text
      const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917081271482';
      const itemsListText = cartItems
        .map((item) => `🕐 ${item.brand} - ${item.name} x${item.quantity} (₹${item.price.toLocaleString('en-IN')})`)
        .join('\n');

      const messageText = `Hello Gift Watch! I'd like to place an order:

*Order ID:* #${order._id.substring(order._id.length - 6).toUpperCase()}
*Items:*
${itemsListText}

*Total Price:* ₹${cartTotal.toLocaleString('en-IN')} (Prepaid + Delivery charges)

*Shipping Address:*
Name: ${orderData.shippingAddress.fullName}
Phone: ${orderData.shippingAddress.phone}
Address: ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.pincode}

*Notes:* ${notes || 'None'}

We deliver to doorstep all over India! Best watches keep shopping from @giftwatch_lucknow.`;

      const encodedMessage = encodeURIComponent(messageText);
      const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

      // 3. Clear customer cart locally
      clearCart();

      // 4. Open WhatsApp deep link in new window
      window.open(waUrl, '_blank');

      toast.success('Order placed successfully! Redirecting to WhatsApp...');
      
      // 5. Route user to their orders list
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase border-b border-neutral-100 pb-5">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Shipping Form & Addresses */}
        <section className="lg:col-span-7 space-y-6">
          <div className="border border-neutral-100 bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3 flex items-center">
              <MapPin className="mr-2 h-4.5 w-4.5" /> Shipping Address
            </h2>

            {/* Existing Addresses List */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="mt-4 space-y-3">
                {user.addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start p-4 border rounded cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'border-black bg-neutral-50/50'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 h-4 w-4 border-neutral-300 text-black focus:ring-black"
                    />
                    <div className="ml-3 text-sm">
                      <span className="font-bold text-neutral-900 flex items-center gap-2">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </span>
                      <p className="mt-1 text-neutral-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="mt-1 text-xs text-neutral-400 flex items-center"><Phone className="mr-1 h-3.5 w-3.5" /> {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">No address saved. Please add a shipping address below.</p>
            )}

            {/* Add New Address Action Button */}
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="mt-5 flex items-center text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition-colors"
              >
                <PlusCircle className="mr-1.5 h-4.5 w-4.5" /> Add New Address
              </button>
            )}

            {/* Inline New Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddNewAddress} className="mt-6 border-t border-neutral-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">New Shipping Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Receiver Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={newAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleInputChange}
                    placeholder="House No, Apartment, Landmark, Street"
                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAddress.city}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={newAddress.state}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleInputChange}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 border-neutral-300 text-black focus:ring-black rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-xs font-medium text-neutral-600">
                    Set as default shipping address
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:border-black hover:text-black"
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
          </div>

          {/* Delivery Note */}
          <div className="border border-neutral-100 bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3 flex items-center">
              <MessageSquare className="mr-2 h-4.5 w-4.5" /> Order Notes (Optional)
            </h2>
            <textarea
              placeholder="E.g., Please delivery after 4:00 PM / Call before delivery."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-4 w-full border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none rounded"
            />
          </div>
        </section>

        {/* Order Summary & Payment Button */}
        <section className="lg:col-span-5 space-y-6">
          <div className="border border-neutral-100 bg-white p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-3 flex items-center">
              <ShoppingBag className="mr-2 h-4.5 w-4.5" /> Items Summary
            </h2>
            
            {/* Products inside Cart */}
            <ul className="mt-4 divide-y divide-neutral-100">
              {cartItems.map((item) => (
                <li key={item.product} className="flex py-3 justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt="" className="h-10 w-10 object-cover border border-neutral-100 rounded" />
                    <div>
                      <h4 className="font-medium text-neutral-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-neutral-400">Qty: {item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="font-bold text-black">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-neutral-100 pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Order Subtotal</span>
                <span className="font-medium text-black">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Shipping Delivery</span>
                <span className="font-medium text-green-700">Free</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between text-base font-bold text-black">
                <span>Grand Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="border border-neutral-100 bg-neutral-50 p-6 rounded text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">Ordering Process</h3>
            <p className="mt-2 text-xs text-neutral-500">
              Your order details will be stored in our database, and we'll redirect you to WhatsApp to instantly confirm the shipment with our team.
            </p>
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="mt-5 w-full flex items-center justify-center rounded-full bg-green-600 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-700 transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Processing Order...' : 'Order Via WhatsApp'}
            </button>
            <div className="mt-4">
              <Link to="/cart" className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black underline">
                Edit Cart Items
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Checkout;
