import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Compass, Phone } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="text-xl font-bold tracking-widest text-black">
              GIFT WATCH
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/shop" className="flex items-center text-sm font-medium text-neutral-600 hover:text-black transition-colors">
              <Compass className="mr-1.5 h-4 w-4" />
              Shop Watches
            </Link>
            <Link to="/contact" className="flex items-center text-sm font-medium text-neutral-600 hover:text-black transition-colors">
              <Phone className="mr-1.5 h-4 w-4" />
              Contact Us
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* User & Cart controls */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-black transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                  <User className="mr-1 h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-all"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu and cart button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-black">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-black focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-neutral-100 bg-white px-4 py-4 md:hidden">
          <div className="space-y-4">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-neutral-700 hover:text-black"
            >
              Shop Watches
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-neutral-700 hover:text-black"
            >
              Contact Us
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-neutral-700 hover:text-black"
              >
                Admin Panel
              </Link>
            )}
            <hr className="border-neutral-100" />
            {user ? (
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-neutral-700 hover:text-black"
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center text-base font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-full bg-black py-2.5 text-center text-sm font-bold uppercase tracking-wider text-white"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
