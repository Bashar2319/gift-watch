import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Compass, Phone } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-primary-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <img 
                src="/logo.jpg" 
                alt="Gift Watch Logo" 
                className="h-10 w-10 rounded-full border-2 border-gold-500 object-cover shadow-sm"
              />
              <span className="text-xl font-extrabold tracking-widest text-primary-800 font-sans">
                GIFT <span className="text-gold-500 font-bold">WATCH</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link 
              to="/shop" 
              className={`flex items-center text-sm font-semibold transition-colors duration-200 ${
                isActive('/shop') 
                  ? 'text-primary-800 border-b-2 border-gold-500 py-1' 
                  : 'text-neutral-600 hover:text-gold-500'
              }`}
            >
              <Compass className="mr-1.5 h-4 w-4 text-gold-500" />
              Shop Watches
            </Link>
            <Link 
              to="/contact" 
              className={`flex items-center text-sm font-semibold transition-colors duration-200 ${
                isActive('/contact') 
                  ? 'text-primary-800 border-b-2 border-gold-500 py-1' 
                  : 'text-neutral-600 hover:text-gold-500'
              }`}
            >
              <Phone className="mr-1.5 h-4 w-4 text-gold-500" />
              Contact Us
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center text-sm font-semibold transition-colors duration-200 ${
                  isActive('/admin') 
                    ? 'text-primary-800 border-b-2 border-gold-500 py-1' 
                    : 'text-neutral-600 hover:text-gold-500'
                }`}
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4 text-gold-500" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* User & Cart controls */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/cart" className={`relative p-2 transition-colors duration-200 ${isActive('/cart') ? 'text-primary-800' : 'text-neutral-600 hover:text-gold-500'}`}>
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-[10px] font-bold text-white shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative flex items-center space-x-4">
                <Link to="/dashboard" className={`flex items-center text-sm font-semibold transition-colors duration-200 ${isActive('/dashboard') ? 'text-primary-800' : 'text-neutral-600 hover:text-gold-500'}`}>
                  <User className="mr-1 h-4 w-4 text-gold-500" />
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-primary-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-gold-100 border border-gold-500/30 shadow-sm hover:bg-primary-900 hover:text-white transition-all duration-200"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu and cart button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link to="/cart" className={`relative p-2 ${isActive('/cart') ? 'text-primary-800' : 'text-neutral-600'}`}>
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-800 text-[10px] font-bold text-white shadow-sm border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-primary-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-primary-100 bg-white px-4 py-4 md:hidden animate-fadeIn">
          <div className="space-y-4">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-semibold ${
                isActive('/shop') ? 'text-primary-800 border-l-4 border-gold-500 pl-2' : 'text-neutral-700 hover:text-gold-600'
              }`}
            >
              Shop Watches
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-semibold ${
                isActive('/contact') ? 'text-primary-800 border-l-4 border-gold-500 pl-2' : 'text-neutral-700 hover:text-gold-600'
              }`}
            >
              Contact Us
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold ${
                  isActive('/admin') ? 'text-primary-800 border-l-4 border-gold-500 pl-2' : 'text-neutral-700 hover:text-gold-600'
                }`}
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
                  className={`block text-base font-semibold ${
                    isActive('/dashboard') ? 'text-primary-800 border-l-4 border-gold-500 pl-2' : 'text-neutral-700 hover:text-gold-600'
                  }`}
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center text-base font-semibold text-red-600 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-full bg-primary-800 py-3 text-center text-sm font-bold uppercase tracking-wider text-gold-100 border border-gold-500/30 hover:bg-primary-900"
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
