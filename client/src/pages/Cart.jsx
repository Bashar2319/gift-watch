import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-800 border border-primary-100">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary-900">Your Cart is Empty</h2>
          <p className="text-sm text-neutral-500">Looks like you haven't added any watches to your cart yet.</p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center rounded-full bg-primary-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-gold-100 border border-gold-500/20 hover:bg-primary-900 transition-colors shadow-md animate-bounce"
        >
          Explore collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase border-b border-neutral-100 pb-5">Shopping Cart</h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-start">
        
        {/* Cart Item List */}
        <section className="lg:col-span-8 border border-neutral-100 bg-white">
          <ul className="divide-y divide-neutral-100">
            {cartItems.map((item) => (
              <li key={item.product} className="flex p-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-neutral-100 bg-neutral-50 rounded">
                  <img
                    src={item.image || 'https://via.placeholder.com/150'}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="ml-6 flex flex-1 flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.brand}
                      </span>
                      <h4 className="text-sm font-medium text-neutral-900 hover:text-black">
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500">Unit Price: ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="text-sm font-bold text-black">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    {/* Qty controls */}
                    <div className="flex items-center border border-neutral-200">
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity - 1)}
                        className="px-2.5 py-0.5 text-neutral-500 hover:text-black"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product, item.quantity + 1)}
                        className="px-2.5 py-0.5 text-neutral-500 hover:text-black"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => removeFromCart(item.product)}
                      className="flex items-center text-xs font-semibold text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order Summary Card */}
        <section className="mt-8 lg:mt-0 lg:col-span-4 border border-primary-100 bg-primary-950/5 p-6 rounded">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-900 border-b border-primary-100 pb-3">Order Summary</h2>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-550">Subtotal</span>
              <span className="font-bold text-primary-900">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-550">Shipping</span>
              <span className="font-semibold text-primary-800">Free</span>
            </div>

            <div className="border-t border-primary-100 pt-4 flex items-center justify-between text-base font-bold text-primary-900">
              <span>Total Price</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center rounded-full bg-primary-800 py-4 text-xs font-bold uppercase tracking-wider text-white border border-gold-500/20 hover:bg-primary-900 transition-colors shadow-md"
            >
              Checkout Order <ArrowRight className="ml-2 h-4 w-4 text-gold-300" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-primary-800 hover:text-gold-500 transition-colors underline">
              Continue Shopping
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Cart;
