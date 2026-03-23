import React, { useEffect } from 'react';

const TYPE_STYLES = {
  success: { background: '#f0fdf4', border: '#86efac', color: '#15803d', icon: '✓' },
  error: { background: '#fef2f2', border: '#fca5a5', color: '#dc2626', icon: '✕' },
  warning: { background: '#fffbeb', border: '#fcd34d', color: '#d97706', icon: '⚠' },
  info: { background: '#eff6ff', border: '#93c5fd', color: '#2563eb', icon: 'ℹ' },
};

const Toast = ({ message, type = 'success', onClose, duration = 3500 }) => {
  const style = TYPE_STYLES[type] || TYPE_STYLES.success;

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: '12px',
      background: style.background, border: `1.5px solid ${style.border}`,
      color: style.color, borderRadius: '12px', padding: '14px 20px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxWidth: '360px',
      animation: 'slideInRight 0.25s ease',
    }}>
      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{style.icon}</span>
      <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: style.color, fontSize: '1rem', padding: '0 0 0 8px', lineHeight: 1 }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
