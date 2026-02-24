import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const PlatformAnalytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if not superuser or admin
        if (user !== null && !user?.is_superuser && user?.username !== 'admin') {
            navigate('/userdashboard');
            return;
        }

        const fetchAnalytics = async () => {
            const authToken = token || localStorage.getItem('token');
            if (!authToken) {
                setError("Not authenticated. Please log in as admin.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8000/api/analytics/platform/', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (response.data && response.data.success) {
                    setMetrics(response.data.data);
                } else {
                    setError("Failed to fetch analytics data.");
                }
            } catch (err) {
                console.error("Failed to load platform analytics:", err);
                setError(err.response?.data?.error || "Failed to load analytics or missing authorization.");
            } finally {
                setLoading(false);
            }
        };

        if (token && user !== null) fetchAnalytics();
    }, [token, user, navigate]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Platform Analytics">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !metrics) {
        return (
            <DashboardLayout pageTitle="Platform Analytics">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl font-medium">
                    {error || "Unknown error occurred"}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Platform Analytics Dashboard">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div>
                    <h2 className="text-2xl font-bold font-serif text-gray-800">E-Commerce Overview</h2>
                    <p className="text-gray-500 font-medium">Global platform performance across all products and livestock.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Total Revenue (30d)</p>
                        <p className="text-4xl font-black text-green-700">Rs. {metrics.total_revenue?.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Total Orders (30d)</p>
                        <p className="text-4xl font-black text-gray-800">{metrics.total_orders}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Active Listings</p>
                        <p className="text-4xl font-black text-blue-600">{metrics.active_listings}</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                    {/* Revenue Area Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">💰 Revenue Trends (Last 30 Days)</h3>
                        <p className="text-xs text-gray-500 mb-4">Daily total transaction revenue across the platform.</p>
                        <div className="h-72 w-full">
                            {metrics.daily_revenue && metrics.daily_revenue.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics.daily_revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `Rs.${value}`} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`Rs. ${value}`, 'Revenue']}
                                            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-xl">
                                    <p className="text-sm">No transaction data available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Commodities Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">📦 Top Selling Products</h3>
                        <p className="text-xs text-gray-500 mb-4">Products with the highest quantity sold.</p>
                        <div className="h-64 w-full">
                            {metrics.top_commodities && metrics.top_commodities.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics.top_commodities} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="sales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} name="Units Sold" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-xl">
                                    <p className="text-sm">No products sold recently.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Popular Livestock Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">🐄 Most Viewed Livestock</h3>
                        <p className="text-xs text-gray-500 mb-4">Animals generating the most interest (clicks/views).</p>
                        <div className="h-64 w-full">
                            {metrics.popular_livestock && metrics.popular_livestock.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics.popular_livestock} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="views" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} name="Total Views" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-xl">
                                    <p className="text-sm">No views tracked yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default PlatformAnalytics;
