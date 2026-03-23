import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1050,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px 28px',
        maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 28px', color: '#6b7280', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db',
              background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
