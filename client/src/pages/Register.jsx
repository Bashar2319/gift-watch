import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const { user, register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="border border-neutral-100 bg-white p-8 rounded shadow-sm space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Create Account</h1>
          <p className="text-xs text-neutral-500">Sign up to buy timepieces and track your orders</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none"
                required
              />
              <User className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none"
                required
              />
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none"
                required
              />
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none"
                required
              />
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center rounded-full bg-primary-800 py-3 text-xs font-bold uppercase tracking-wider text-white border border-gold-500/20 hover:bg-primary-900 transition-colors disabled:opacity-50 shadow-sm animate-pulse"
          >
            {isSubmitting ? 'Registering...' : 'Register'} <ArrowRight className="ml-1.5 h-4 w-4 text-gold-300" />
          </button>
        </form>

        {/* Links */}
        <div className="border-t border-neutral-150 pt-4 text-center text-xs text-neutral-500 space-y-2">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-850 hover:text-gold-650 transition-colors hover:underline">
              Log In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
