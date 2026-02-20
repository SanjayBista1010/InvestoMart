import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../Layout/DashboardLayout';
import Toast from '../Shared/Toast';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

const SettingsPage = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name.trim() === (user?.name || '')) {
            showToast('No changes detected.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.put('http://localhost:8000/api/auth/profile/', {
                name: formData.name
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update context and local storage
            login(response.data, token);
            showToast('Profile updated successfully!');
        } catch (err) {
            console.error("Profile update failed:", err);
            if (err.response?.status === 400 && err.response?.data?.error === 'Name change cooldown active') {
                showToast(`Cooldown active: You can change your name again in ${err.response.data.days_remaining} days.`, 'error');
            } else {
                showToast('Failed to update profile.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const isCooldownActive = user?.next_allowed_change && new Date(user.next_allowed_change) > new Date();
    const remainingDays = user?.next_allowed_change ? Math.ceil((new Date(user.next_allowed_change) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <DashboardLayout pageTitle="Settings">
            <div className="max-w-4xl">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50 mb-8">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                            <PersonOutlineIcon fontSize="large" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                            <p className="text-gray-500">Update your personal information and how others see you.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <PersonOutlineIcon fontSize="small" />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isCooldownActive}
                                        placeholder="Your full name"
                                        className={`w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium ${isCooldownActive ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700'}`}
                                    />
                                </div>
                                {isCooldownActive && (
                                    <p className="text-xs text-amber-600 font-medium ml-1">
                                        Cooldown active: Next change available in {remainingDays} days.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <EmailOutlinedIcon fontSize="small" />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-100 border-none outline-none font-medium text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 ml-1">Email cannot be changed currently.</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                            >
                                {loading ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Additional Settings Sections Placeholder */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50 opacity-60">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                            <SecurityOutlinedIcon fontSize="large" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Security & Privacy</h2>
                            <p className="text-gray-500">Manage your password and account security (Coming Soon).</p>
                        </div>
                    </div>
                </div>
            </div>

            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default SettingsPage;
