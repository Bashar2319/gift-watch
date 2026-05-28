import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const { user, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error.message || 'Login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="border border-neutral-100 bg-white p-8 rounded shadow-sm space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Welcome Back</h1>
          <p className="text-xs text-neutral-500">Log in to view your orders and manage shipping profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:border-black focus:outline-none"
                required
              />
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center rounded-full bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Sign In'} <ArrowRight className="ml-1.5 h-4 w-4" />
          </button>
        </form>

        {/* Links */}
        <div className="border-t border-neutral-100 pt-4 text-center text-xs text-neutral-500 space-y-2">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline">
              Register Here
            </Link>
          </p>
          <p>
            Forgot your password?{' '}
            <Link to="/forgot-password" className="font-bold text-black hover:underline">
              Recover it here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
