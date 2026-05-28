import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.message || 'Password reset link sent!');
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error.message || 'Failed to request password reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="border border-neutral-100 bg-white p-8 rounded shadow-sm space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Reset Password</h1>
          <p className="text-xs text-neutral-500">
            {isSubmitted 
              ? "Check your inbox for reset instructions" 
              : "Enter your registered email address to receive a recovery link"
            }
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 border border-neutral-100 rounded text-center text-xs text-neutral-600">
              An email was sent to <span className="font-bold text-black">{email}</span>. Click the recovery link inside to complete your password update.
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center rounded-full bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center rounded-full bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending link...' : 'Send Reset Link'} <Send className="ml-1.5 h-4 w-4" />
            </button>
          </form>
        )}

        {/* Back Link */}
        {!isSubmitted && (
          <div className="border-t border-neutral-100 pt-4 text-center">
            <Link to="/login" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
