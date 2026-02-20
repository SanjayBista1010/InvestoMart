import React, { useEffect } from 'react';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircleOutlineRoundedIcon className="text-green-500" />,
        error: <ErrorOutlineRoundedIcon className="text-red-500" />,
        info: <InfoOutlinedIcon className="text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-100',
        error: 'bg-red-50 border-red-100',
        info: 'bg-blue-50 border-blue-100',
    };

    return (
        <div className="fixed bottom-8 right-8 z-[110] animate-in slide-in-from-right-full fade-in duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-xl ${bgColors[type]} min-w-[300px]`}>
                <div className="bg-white p-1 rounded-full shadow-sm">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-light"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;
