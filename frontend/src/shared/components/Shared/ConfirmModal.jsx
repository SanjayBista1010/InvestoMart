import React from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            <WarningAmberRoundedIcon fontSize="large" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            <p className="text-gray-500 text-sm">{message}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-6 py-4 rounded-2xl text-white font-bold shadow-lg transition-all ${type === 'danger'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-100'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
