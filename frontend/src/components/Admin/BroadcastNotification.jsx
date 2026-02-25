import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import CampaignIcon from '@mui/icons-material/Campaign';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const BroadcastNotification = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info');
    const [status, setStatus] = useState({ state: 'idle', msg: '' }); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            setStatus({ state: 'error', msg: 'Message cannot be empty.' });
            return;
        }

        // Confirm action
        if (!window.confirm("Are you sure you want to broadcast this message to ALL users?")) {
            return;
        }

        setStatus({ state: 'loading', msg: 'Broadcasting...' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8000/api/notifications/broadcast/', {
                message: message.trim(),
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setStatus({ state: 'success', msg: res.data.message });
                setMessage(''); // reset form

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setStatus({ state: 'idle', msg: '' });
                }, 5000);
            }
        } catch (error) {
            console.error('Broadcast failed', error);
            setStatus({ state: 'error', msg: error.response?.data?.error || 'Failed to send broadcast.' });
        }
    };

    if (!user || (!user.is_superuser && user.username !== 'admin')) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full mx-4">
                    <ErrorOutlineIcon className="text-red-500 mb-4" style={{ fontSize: 48 }} />
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-500">You don't have permission to access the broadcast tools.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                        <CampaignIcon style={{ fontSize: 32 }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-800">Broadcast Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Send a platform-wide notification to directly reach all registered users.</p>
                    </div>
                </div>

                {/* Form Logic */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Notification Type</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { value: 'info', label: 'General Info', color: 'blue' },
                                    { value: 'system_update', label: 'System Update', color: 'green' },
                                    { value: 'warning', label: 'Important Warning', color: 'red' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setType(option.value)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${type === option.value
                                                ? `bg-${option.color}-50 border-${option.color}-200 text-${option.color}-700 ring-2 ring-${option.color}-200`
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Compose Textarea */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Message Body</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                rows="5"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-y"
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <span className={`text-xs ${message.length > 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                    {message.length} / 500 characters
                                </span>
                            </div>
                        </div>

                        {/* Status Banners */}
                        {status.state === 'error' && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
                                <ErrorOutlineIcon fontSize="small" className="mt-0.5" />
                                <span className="text-sm">{status.msg}</span>
                            </div>
                        )}
                        {status.state === 'success' && (
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-start gap-3">
                                <InfoOutlinedIcon fontSize="small" className="mt-0.5" />
                                <span className="text-sm font-medium">{status.msg}</span>
                            </div>
                        )}

                        {/* Submission Button */}
                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={status.state === 'loading'}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${status.state === 'loading'
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md active:bg-green-800'
                                    }`}
                            >
                                {status.state === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <SendIcon fontSize="small" />
                                        <span>Send Broadcast</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotification;
