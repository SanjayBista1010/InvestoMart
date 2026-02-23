import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Layout/DashboardLayout';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PRICE_PER_1K_TOKENS = 0.03; // Reference: Approx. cloud inference cost (OpenAI GPT-3.5 equiv.)

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exchangeRate, setExchangeRate] = useState(null); // USD to NPR
    const [rateLoading, setRateLoading] = useState(true);
    const { token, user } = useAuth();
    const navigate = useNavigate();

    // Fetch exchange rate USD → NPR
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const nprRate = res.data?.rates?.NPR;
                setExchangeRate(nprRate || 136.5); // fallback to approximate rate
            } catch {
                setExchangeRate(136.5); // fallback Nepal central bank approx
            } finally {
                setRateLoading(false);
            }
        };
        fetchRate();
    }, []);

    useEffect(() => {
        // If user data is loaded and they are NOT admin, redirect
        if (user !== null && !user?.is_superuser && user?.username !== 'admin') {
            navigate('/userdashboard');
            return;
        }

        const fetchMetrics = async () => {
            const authToken = token || localStorage.getItem('token');
            if (!authToken) {
                setError("Not authenticated. Please log in as admin.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8000/api/chatbot/metrics/', {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                if (response.data && response.data.metrics) {
                    setMetrics(response.data.metrics);
                } else {
                    setError("Invalid data received from server.");
                }
            } catch (err) {
                console.error("Failed to load chatbot metrics:", err);
                setError(err.response?.data?.error || "Failed to load performance metrics or missing authorization.");
            } finally {
                setLoading(false);
            }
        };

        if (token && user !== null) fetchMetrics();
    }, [token, user, navigate]);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Admin Control">
                <div className="flex h-64 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !metrics) {
        return (
            <DashboardLayout pageTitle="Admin Control">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl font-medium">
                    {error || "Unknown error occurred"}
                </div>
            </DashboardLayout>
        );
    }

    // Prepare chart data format
    const formatDailyCount = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(d => {
            if (!d.date) return { name: 'Unknown', messages: d.messages || 0 };

            const parts = d.date.split('-');
            if (parts.length < 3) return { name: d.date, messages: d.messages || 0 };

            const [_, month, day] = parts;
            const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthIndex = parseInt(month, 10) - 1;
            const monthName = (monthIndex >= 0 && monthIndex < 12) ? shortMonths[monthIndex] : 'Unknown';

            return {
                name: `${monthName} ${day}`,
                messages: d.messages || 0
            };
        });
    };

    const dailyChartData = formatDailyCount(metrics.daily_counts || []);

    // Prepare intent breakdown for bar chart
    const intentData = Object.keys(metrics.intent_breakdown || {}).map(key => ({
        name: key.toUpperCase(),
        count: metrics.intent_breakdown[key]
    }));

    return (
        <DashboardLayout pageTitle="Admin Panel - AI Assistant Analytics">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Total AI Sessions</p>
                        <h4 className="text-2xl font-bold text-gray-800">{metrics.total_sessions}</h4>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-2xl">
                        👥
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Total Messages</p>
                        <h4 className="text-2xl font-bold text-gray-800">{metrics.total_messages}</h4>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-2xl">
                        💬
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Avg Latency</p>
                        <h4 className="text-2xl font-bold text-gray-800">{metrics.avg_wall_clock_ms}ms</h4>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-2xl">
                        ⚡
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium text-sm">Error Rate</p>
                        <h4 className="text-2xl font-bold text-red-600">{metrics.error_rate_pct}%</h4>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl">
                        ⚠️
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Traffic Line Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">AI Traffic (30 Days)</h3>
                    <p className="text-xs text-gray-400 mb-4">{dailyChartData.length} days of data tracked</p>
                    <div className="h-64 bg-gray-50 rounded-xl relative overflow-hidden p-4">
                        {dailyChartData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <span className="text-4xl mb-3">📭</span>
                                <p className="text-sm font-medium">No chatbot activity yet</p>
                                <p className="text-xs mt-1">Data will appear once users start chatting</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Line
                                        type="monotone"
                                        dataKey="messages"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Intent Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <h3 className="font-serif font-bold text-lg text-gray-800 mb-2">User Intent Breakdown</h3>
                    <p className="text-xs text-gray-400 mb-4">{intentData.length} intent categories detected</p>
                    <div className="h-64 bg-gray-50 rounded-xl relative overflow-hidden p-4">
                        {intentData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <span className="text-4xl mb-3">🔍</span>
                                <p className="text-sm font-medium">No intent data available yet</p>
                                <p className="text-xs mt-1">Intent classification will appear once conversations happen</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={intentData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 'bold' }} width={100} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Tokens vs Latency Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 mb-8">
                <h3 className="font-serif font-bold text-lg text-gray-800 mb-1">⚡ Response Tokens vs Time Taken</h3>
                <p className="text-xs text-gray-400 mb-5">
                    How response size (output tokens &amp; characters) affects average latency (ms). Bars = messages count in range. Line = avg response time.
                </p>
                {(() => {
                    const tokensLatencyData = metrics.tokens_vs_latency || [];
                    if (tokensLatencyData.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-xl">
                                <span className="text-4xl mb-3">⚡</span>
                                <p className="text-sm font-medium">No performance correlation data yet</p>
                                <p className="text-xs mt-1">Available after chatbot conversations are recorded</p>
                            </div>
                        );
                    }
                    return (
                        <div className="h-72 bg-gray-50 rounded-xl p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={tokensLatencyData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="bucket"
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Output Token Range', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#9ca3af' }}
                                    />
                                    <YAxis
                                        yAxisId="count"
                                        orientation="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        label={{ value: 'Messages', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9ca3af', dx: 15 }}
                                    />
                                    <YAxis
                                        yAxisId="latency"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#f59e0b' }}
                                        tickFormatter={v => `${v}ms`}
                                        label={{ value: 'Avg Latency (ms)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#f59e0b', dx: -5 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                                        formatter={(val, name) => {
                                            if (name === 'avg_latency_ms') return [`${val.toLocaleString()} ms`, 'Avg Latency'];
                                            if (name === 'count') return [val, 'Messages'];
                                            if (name === 'avg_chars') return [Math.round(val), 'Avg Characters'];
                                            return [val, name];
                                        }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        formatter={name => name === 'avg_latency_ms' ? 'Avg Latency (ms)' : name === 'count' ? 'Messages in Range' : 'Avg Characters'}
                                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                    />
                                    <Bar yAxisId="count" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} opacity={0.85} />
                                    <Line
                                        yAxisId="latency"
                                        type="monotone"
                                        dataKey="avg_latency_ms"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    );
                })()}
            </div>

            {/* AI Usage Cost Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-50 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-6">
                    <div>
                        <h4 className="font-serif font-bold text-lg text-gray-800 mb-1">💰 Total Estimated Cost</h4>
                        <p className="text-sm text-gray-500">
                            Based on approximate cloud inference pricing for&nbsp;
                            <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{metrics.total_tokens?.toLocaleString() || 0}</span>&nbsp;total tokens processed.
                        </p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-center">
                            <p className="text-xs text-blue-500 font-medium mb-0.5">USD</p>
                            <p className="text-xl font-bold text-blue-700">${metrics.total_cost_usd?.toFixed(4)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-center">
                            <p className="text-xs text-green-500 font-medium mb-0.5">NPR</p>
                            <p className="text-xl font-bold text-green-700">
                                {rateLoading ? '...' : `Rs. ${((metrics.total_cost_usd || 0) * exchangeRate).toFixed(2)}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Daily Cost Bar Chart */}
                {dailyChartData.length > 0 && (() => {
                    const avgCostPerMsg = metrics.total_messages > 0
                        ? (metrics.total_cost_usd || 0) / metrics.total_messages
                        : 0;
                    const dailyCostData = dailyChartData.map(d => ({
                        name: d.name,
                        usd: parseFloat((d.messages * avgCostPerMsg).toFixed(6)),
                        npr: parseFloat((d.messages * avgCostPerMsg * (exchangeRate || 136.5)).toFixed(4)),
                    }));
                    return (
                        <div className="mb-6">
                            <h5 className="text-sm font-bold text-gray-700 mb-3">Daily Cost Trend (USD)</h5>
                            <div className="h-40 bg-gray-50 rounded-xl p-3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dailyCostData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(4)}`} />
                                        <Tooltip formatter={(val, name) => [
                                            name === 'usd' ? `$${val.toFixed(6)}` : `Rs. ${val.toFixed(4)}`,
                                            name === 'usd' ? 'Cost (USD)' : 'Cost (NPR)'
                                        ]} contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} />
                                        <Area type="monotone" dataKey="usd" stroke="#f59e0b" strokeWidth={2} fill="url(#costGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })()}

                {/* Cost Methodology Table */}
                <div className="border-t border-gray-100 pt-5">
                    <h5 className="text-sm font-bold text-gray-700 mb-3">📊 How the Cost is Calculated</h5>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                    <th className="pb-2 font-semibold">Metric</th>
                                    <th className="pb-2 font-semibold text-right">Value</th>
                                    <th className="pb-2 font-semibold text-right">Formula</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 divide-y divide-gray-50">
                                <tr>
                                    <td className="py-2">Model</td>
                                    <td className="text-right font-mono text-xs bg-gray-50 rounded px-1">qwen3:8b (local Ollama)</td>
                                    <td className="text-right text-gray-400 text-xs">self-hosted</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Reference pricing</td>
                                    <td className="text-right font-mono text-xs">$0.03 / 1,000 tokens</td>
                                    <td className="text-right text-gray-400 text-xs">OpenAI GPT-3.5 equiv.</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Total Tokens Used</td>
                                    <td className="text-right font-bold">{(metrics.total_tokens || 0).toLocaleString()}</td>
                                    <td className="text-right text-gray-400 text-xs">input + output tokens</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Avg Tokens / Response</td>
                                    <td className="text-right font-bold">{Math.round(metrics.avg_output_tokens || 0)}</td>
                                    <td className="text-right text-gray-400 text-xs">output tokens avg</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Cost (USD)</td>
                                    <td className="text-right font-bold text-blue-700">${metrics.total_cost_usd?.toFixed(6)}</td>
                                    <td className="text-right text-gray-400 text-xs">(tokens ÷ 1000) × $0.03</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Exchange Rate (live)</td>
                                    <td className="text-right font-bold">
                                        {rateLoading ? 'Loading...' : `1 USD = Rs. ${exchangeRate?.toFixed(2)}`}
                                    </td>
                                    <td className="text-right text-gray-400 text-xs">via exchangerate-api.com</td>
                                </tr>
                                <tr className="bg-yellow-50 rounded">
                                    <td className="py-2 font-bold text-yellow-800">Total Cost (NPR)</td>
                                    <td className="text-right font-bold text-green-700">
                                        {rateLoading ? '...' : `Rs. ${((metrics.total_cost_usd || 0) * exchangeRate).toFixed(2)}`}
                                    </td>
                                    <td className="text-right text-gray-400 text-xs">USD × live rate</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 italic">
                        * This is a reference cost comparison. Since qwen3:8b runs locally on Ollama, actual server cost depends on your hardware electricity and compute.
                        Currency rates fluctuate and are fetched live at dashboard load time.
                    </p>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default AdminDashboard;
