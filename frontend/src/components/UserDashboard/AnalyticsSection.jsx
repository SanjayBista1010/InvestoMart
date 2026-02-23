import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsSection = ({ data }) => {
    // Local state for toggling the chart time range
    const [timeRange, setTimeRange] = useState('6months');

    // Dynamically populated chart from backend based on selected time range
    const chartDataVariants = data?.chart_data || {};
    const chartData = chartDataVariants[timeRange] || [];

    // Safely extract from dynamic data
    const animals = data?.animals || { goats: 0, chickens: 0, buffalos: 0 };
    const financials = data?.financials || { total_farm_value: 0, breakdown: { goats: 0, chickens: 0, buffalos: 0 } };
    const resources = data?.resources || { feed: { goats: 0, chickens: 0, buffalos: 0 }, water: { goats: 0, chickens: 0, buffalos: 0 } };

    const formatCurrency = (val) => new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(val);

    // Custom Tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
                    <p className="font-bold text-gray-800 text-sm mb-1">{label}</p>
                    <p className="text-green-700 font-bold text-sm">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Helper to render filter buttons
    const renderFilter = (value, label) => (
        <span
            onClick={() => setTimeRange(value)}
            className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${timeRange === value ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
        >
            {label}
        </span>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Portfolio History Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-lg text-gray-800">Portfolio Growth</h3>
                    <div className="flex gap-2">
                        {renderFilter('week', '7 Days')}
                        {renderFilter('month', '30 Days')}
                        {renderFilter('6months', '6 Months')}
                        {renderFilter('year', '1 Year')}
                    </div>
                </div>

                <div className="flex-grow bg-gray-50 rounded-xl relative overflow-hidden p-4 min-h-[250px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                    domain={['dataMin - (dataMin * 0.1)', 'dataMax + (dataMax * 0.1)']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#15803d" // Green-700
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#15803d', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                            Loading chart data...
                        </div>
                    )}
                </div>
            </div>

            {/* Farm Analysis */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <h3 className="font-serif font-bold text-lg text-gray-800 mb-6">Farm Analysis</h3>

                <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">1. Total Farm Value :</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Goats ({animals.goats} count)</span>
                            <span className="font-bold text-gray-800">{formatCurrency(financials.breakdown.goats)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Chickens ({animals.chickens} count)</span>
                            <span className="font-bold text-gray-800">{formatCurrency(financials.breakdown.chickens)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-pink-400"></span> Buffalos ({animals.buffalos} count)</span>
                            <span className="font-bold text-gray-800">{formatCurrency(financials.breakdown.buffalos)}</span>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center font-bold text-sm">
                            <span className="text-gray-800">Total Farm Value =</span>
                            <span className="text-gray-800">{formatCurrency(financials.total_farm_value)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">2. Resources & Consumption :</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">A. Daily Feed Consumption</p>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-600">🐐 Goats: <span className="font-bold">{resources.feed.goats.toFixed(1)} kg/day</span></p>
                                <p className="text-xs text-gray-600">🐔 Chickens: <span className="font-bold">{resources.feed.chickens.toFixed(1)} kg/day</span></p>
                                <p className="text-xs text-gray-600">🐃 Buffalos: <span className="font-bold">{resources.feed.buffalos.toFixed(1)} kg/day</span></p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">B. Water Usage</p>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-600">🐐 Goats: <span className="font-bold">{resources.water.goats.toFixed(1)} L/day</span></p>
                                <p className="text-xs text-gray-600">🐔 Chickens: <span className="font-bold">{resources.water.chickens.toFixed(1)} L/day</span></p>
                                <p className="text-xs text-gray-600">🐃 Buffalos: <span className="font-bold">{resources.water.buffalos.toFixed(1)} L/day</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSection;
