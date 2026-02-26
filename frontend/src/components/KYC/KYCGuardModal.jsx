import React from 'react';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';

const KYCGuardModal = ({ actionLabel = "Proceed" }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <SecurityIcon sx={{ fontSize: 40 }} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Verification Required</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    To maintain a secure trading environment, you must complete your KYC verification before you can <strong className="text-gray-700">{actionLabel}</strong> on InvestoMart.
                </p>

                <div className="space-y-3 relative z-10">
                    <button
                        onClick={() => navigate('/kyc')}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
                    >
                        Complete KYC Now
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KYCGuardModal;
