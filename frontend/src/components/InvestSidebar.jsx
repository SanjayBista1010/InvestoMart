import React, { useEffect, useRef } from 'react';
import AgricultureIcon from '@mui/icons-material/Agriculture';

export default function InvestSidebar({ isOpen, onClose }) {
  const sidebarRef = useRef(null);

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
          {/* Close Button (if needed explicitly, otherwise click outside works) */}
          {/* <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl">×</button> */}

          {/* Logo */}
          <div className="flex items-center gap-2 mb-10 text-green-700">
            <AgricultureIcon fontSize="large" />
            <span className="text-xl font-bold">GoatFarm</span>
          </div>

          {/* Title & Description */}
          <div className="mb-8">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              Welcome to Green Acres Goat Farm - <br />
              Invest in Our Farm
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our farm is committed to organic care and sustainable farming practices.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6 mt-4">
            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold text-gray-600">Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full px-6 py-4 border border-green-700 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-700 font-light"
              />
            </div>

            {/* OR Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-900 font-semibold tracking-widest">OR</span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="space-y-4">
              <button className="w-full py-3 bg-[#E8F3E9] text-green-800 rounded-full font-medium hover:bg-green-100 transition-colors border border-transparent hover:border-green-200">
                SSO
              </button>
              <button className="w-full py-3 bg-[#E8F3E9] text-green-800 rounded-full font-medium hover:bg-green-100 transition-colors border border-transparent hover:border-green-200">
                Google
              </button>
              <button className="w-full py-3 bg-[#E8F3E9] text-green-800 rounded-full font-medium hover:bg-green-100 transition-colors border border-transparent hover:border-green-200">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
