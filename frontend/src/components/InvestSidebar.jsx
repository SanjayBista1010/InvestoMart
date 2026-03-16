import React, { useEffect, useRef, useState } from 'react';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import axios from 'axios';
import { useAuth } from '../features/auth/context/AuthContext';

export default function InvestSidebar({ isOpen, onClose }) {
  const sidebarRef = useRef(null);
  const { login } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLoginMode ? '/api/auth/login/' : '/api/auth/register/';
    const payload = isLoginMode
      ? { email, password }
      : { email, password, name };

    try {
      const response = await axios.post(`http://localhost:8000${endpoint}`, payload);
      login(response.data.user, response.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-6 py-4 border border-green-700 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-700 font-light';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300" />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-10 h-full overflow-y-auto flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10 text-green-700">
            <AgricultureIcon fontSize="large" />
            <span className="text-xl font-bold">GoatFarm</span>
          </div>

          {/* Title & Description */}
          <div className="mb-8">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {isLoginMode ? (
                <>Welcome Back — <br />Log In to Invest</>
              ) : (
                <>Join Green Acres <br />Goat Farm</>
              )}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our farm is committed to organic care and sustainable farming practices.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 flex flex-col flex-1">

            {/* Name field — register only */}
            {!isLoginMode && (
              <div className="relative">
                <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Email / Username */}
            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold text-gray-600">
                Username or Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username or you@example.com"
                className={inputClass}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold text-gray-600">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className={`${inputClass} pr-14`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-full">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-green-700 text-white rounded-full font-semibold text-base hover:bg-green-600 transition-colors mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : isLoginMode ? 'Log In' : 'Create Account'}
            </button>

            {/* OR Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400 font-semibold tracking-widest">OR</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-3 flex items-center justify-center gap-3 border border-gray-200 rounded-full font-medium text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                className="w-full py-3 flex items-center justify-center gap-3 bg-[#1877F2] rounded-full font-medium text-sm text-white hover:bg-[#166FE5] transition-colors"
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Toggle Login / Register */}
            <p className="text-center text-sm text-gray-500 mt-auto pt-4">
              {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
              <span
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="text-green-700 font-semibold cursor-pointer hover:underline"
              >
                {isLoginMode ? 'Sign Up' : 'Log In'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
