import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Faux activity line-data to maintain the UI polish since historical tracing per asset isn't fully implemented in the backend yet.
const generateSparkline = (baseValue) => {
    return Array.from({ length: 7 }, () => ({
        value: Math.max(0, baseValue + (Math.random() - 0.5) * (baseValue * 0.3))
    }));
};

const getAssetStyle = (type) => {
    const t = type.toLowerCase();
    if (t.includes('goat')) return { icon: '🐐', color: 'bg-orange-100', stroke: '#fbbf24' };
    if (t.includes('chicken')) return { icon: '🐔', color: 'bg-blue-100', stroke: '#3b82f6' };
    if (t.includes('buffalo')) return { icon: '🐃', color: 'bg-pink-100', stroke: '#f472b6' };
    if (t.includes('cow')) return { icon: '🐄', color: 'bg-purple-100', stroke: '#a855f7' };
    if (t.includes('sheep')) return { icon: '🐑', color: 'bg-gray-200', stroke: '#6b7280' };
    return { icon: '📦', color: 'bg-green-100', stroke: '#10b981' }; 
};

const HoldingCard = ({ type, count, value }) => {
    const style = getAssetStyle(type);
    const sparklineData = generateSparkline(value);
    
    // Format currency
    const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0
    }).format(value);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between min-w-[300px]">
            <div className="flex flex-col justify-between h-full w-1/2">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.color} border border-white shadow-sm`}>
                        <span className="text-xl">{style.icon}</span>
                        <span className="text-xs font-bold text-gray-700">{type}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Portfolio</p>
                    <p className="text-lg font-bold text-gray-800">{formattedValue}</p>
                </div>
            </div>

            <div className="flex flex-col items-end justify-between h-full w-1/2">
                <span className="text-3xl font-bold text-gray-800 mb-2">{count}</span>
                <div className="w-full h-12">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <defs>
                                <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={style.stroke} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={style.stroke} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={style.stroke}
                                fillOpacity={1}
                                fill={`url(#grad-${type})`}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const HoldingsCards = ({ holdings }) => {
    if (!holdings || holdings.length === 0) {
        return (
            <div className="mb-8 p-8 bg-gray-50 border border-dashed border-gray-200 rounded-3xl text-center">
                <p className="text-gray-500 font-medium font-serif">You currently have no active holdings.</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Current Holdings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {holdings.map((h, idx) => (
                    <HoldingCard
                        key={idx}
                        type={h.type}
                        count={h.count}
                        value={h.value}
                    />
                ))}
            </div>
        </div>
    );
};

export default HoldingsCards;
