import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../features/auth/services/authService';

const AuthDrawer = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const reset = () => {
    setEmail(''); setPassword(''); setName(''); setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = isLogin
        ? await authService.login({ email, password })
        : await authService.register({ email, password, name });
      onLoginSuccess(data.user, data.token);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await authService.loginWithGoogle(credentialResponse.credential);
      onLoginSuccess(data.user, data.token);
      reset();
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="auth-drawer-backdrop"
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 999, backdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: '100%',
          maxWidth: '420px', background: '#fff', zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#14532d' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {isLogin ? 'Sign in to your account' : 'Join us today'}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#9ca3af', lineHeight: 1, padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '28px', flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" required={!isLogin} style={inputStyle}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email or Username</label>
              <input
                type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={isLoading}
              style={{
                background: isLoading ? '#86efac' : '#15803d', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 700,
                fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(21,128,61,0.25)',
              }}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Google Login */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap={false}
              width="340"
            />
          </div>

          {/* Toggle */}
          <p style={{ textAlign: 'center', marginTop: '28px', color: '#6b7280', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#15803d', fontWeight: 700, cursor: 'pointer', marginLeft: '6px', textDecoration: 'underline' }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  color: '#374151', marginBottom: '6px',
};

const inputStyle = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #d1d5db',
  borderRadius: '10px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s', color: '#111827', background: '#f9fafb',
};

export default AuthDrawer;
