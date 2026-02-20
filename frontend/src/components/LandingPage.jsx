import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('LandingPage');

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/profile/', {
          withCredentials: true
        });
        setUser(response.data);
      } catch (err) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
      const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
        withCredentials: true
      });
      
      if (response.data.user) {
        setUser(response.data.user);
        setCurrentPage(2);
        setIsDrawerOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout/', {}, { withCredentials: true });
      setUser(null);
      setCurrentPage(1);
    } catch (err) {
      logger.error('Logout failed', err);
    }
  };

  // PAGE 1 - Full Screen Image with Translucent White Sidebar
  if (currentPage === 1) {
    return (
      <div className="relative h-screen overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/images/homepage.jpg" 
            alt="Goat Farm"
            className="w-full h-full object-cover"
          />
          {/* Light Overlay */}
          <div className="absolute inset-0 bg-white/20"></div>
        </div>

        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
            <span className="text-3xl">🐐</span>
          </div>
          <span className="text-white font-bold text-2xl drop-shadow-2xl tracking-tight">GoatFarm</span>
        </div>

        {/* Translucent White Sidebar - Right */}
        <div className="absolute top-0 right-0 h-full w-[500px] backdrop-blur-2xl bg-white/70 border-l border-white/30 shadow-2xl z-10">
          <div className="h-full flex items-center justify-center px-16 py-16 overflow-y-auto">
            <div className="w-full max-w-md">
              <div className="mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Welcome to Green Acres Goat Farm - Invest in Our Farm
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  Our farm is committed to organic care and sustainable farming practices.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter Email"
                    required
                    className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-300 shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 text-white py-4 rounded-full font-semibold hover:bg-green-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Register'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 backdrop-blur-2xl text-gray-500 font-medium">OR</span>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full border-2 border-green-600 bg-green-50/80 backdrop-blur-sm py-4 rounded-full hover:bg-green-100/80 text-green-700 font-semibold transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]">
                  SSO
                </button>
                <button className="w-full border-2 border-green-600 bg-green-50/80 backdrop-blur-sm py-4 rounded-full hover:bg-green-100/80 text-green-700 font-semibold transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]">
                  Google
                </button>
                <button className="w-full border-2 border-green-600 bg-green-50/80 backdrop-blur-sm py-4 rounded-full hover:bg-green-100/80 text-green-700 font-semibold transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]">
                  Facebook
                </button>
              </div>

              <button
                onClick={() => setCurrentPage(2)}
                className="mt-8 text-green-700 hover:text-green-800 text-sm font-medium flex items-center gap-2 group"
              >
                Skip to main page 
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 2 - Split Screen (Image Left 60%, Dark Panel Right 40%)
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left - Image (60%) */}
      <div className="w-3/5 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/30 z-10"></div>
        <img 
          src="/images/homepage2.jpg" 
          alt="Goat Farm"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-20 animate-fade-in">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
            <span className="text-3xl">🐐</span>
          </div>
          <span className="text-white font-bold text-2xl drop-shadow-2xl tracking-tight">GoatFarm</span>
        </div>
        
        {/* Stats Cards */}
        <div className="absolute bottom-8 left-8 z-20 flex gap-4">
          <div className="backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 shadow-2xl">
            <p className="text-white/90 text-sm font-medium">Active Investors</p>
            <p className="text-white text-2xl font-bold">1,234+</p>
          </div>
          <div className="backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 shadow-2xl">
            <p className="text-white/90 text-sm font-medium">Total Invested</p>
            <p className="text-white text-2xl font-bold">$2.5M</p>
          </div>
        </div>
      </div>

      {/* Right - Dark Panel (40%) */}
      <div className="w-2/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-center px-12 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        {/* User Menu - Top Right */}
        {user && (
          <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-gray-900 px-5 py-2 rounded-lg hover:bg-gray-100 font-medium text-sm shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Dashboard
            </button>
          </div>
        )}

        {/* Content */}
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 animate-slide-up">
            <div className="inline-block px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full mb-4">
              <span className="text-green-400 text-sm font-medium">🌟 Premium Investment Opportunity</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Welcome to Green Acres Goat Farm
            </h1>
            <p className="text-gray-300 text-base leading-relaxed">
              Our farm is committed to organic care and sustainable farming practices.
              <span className="block mt-2 text-green-400 font-medium">Join our community of investors today.</span>
            </p>
          </div>

          <div className="space-y-5">
            <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-5 py-3.5 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm hover:bg-gray-800/70"
              />
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              Register & Invest Now
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 font-medium">OR CONTINUE WITH</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm py-3.5 rounded-xl hover:bg-gray-700/50 text-white font-medium transition-all duration-300 hover:border-green-600 hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">🔐</span> SSO
            </button>
            <button className="w-full border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm py-3.5 rounded-xl hover:bg-gray-700/50 text-white font-medium transition-all duration-300 hover:border-red-500 hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">🔍</span> Google
            </button>
            <button className="w-full border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm py-3.5 rounded-xl hover:bg-gray-700/50 text-white font-medium transition-all duration-300 hover:border-blue-500 hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">�</span> Facebook
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(1)}
            className="mt-8 text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-2 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to first page
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Side Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[450px] bg-gradient-to-br from-white to-gray-50 shadow-2xl z-[70] transform transition-all duration-500 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-10 h-full overflow-y-auto relative">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
          
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-300 z-10"
          >
            ×
          </button>

          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🐐</span>
            </div>
            <span className="text-gray-800 font-bold text-2xl">GoatFarm</span>
          </div>

          <div className="mb-8 relative z-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-base">
              {isLogin ? 'Login to continue your investment journey' : 'Register to start investing in sustainable farming'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm relative z-10">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {!isLogin && (
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:shadow-md"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:shadow-md"
                placeholder="you@example.com"
              />
            </div>

            <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 bg-white hover:shadow-md"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? 'Login to Account' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8 z-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-white to-gray-50 text-gray-500 font-medium">OR CONTINUE WITH</span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <button className="w-full border-2 border-gray-200 bg-white py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 hover:border-green-300 hover:shadow-md transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">🔐</span> SSO
            </button>
            <button className="w-full border-2 border-gray-200 bg-white py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 hover:border-red-300 hover:shadow-md transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">🔍</span> Google
            </button>
            <button className="w-full border-2 border-gray-200 bg-white py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md transform hover:scale-[1.01] flex items-center justify-center gap-2">
              <span className="text-lg">�</span> Facebook
            </button>
          </div>

          <div className="mt-8 text-center relative z-10">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Register here" : 'Already have an account? Login here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
