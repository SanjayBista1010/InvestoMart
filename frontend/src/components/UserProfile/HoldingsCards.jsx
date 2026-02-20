import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const dataGoat = [
    { value: 400 }, { value: 300 }, { value: 350 }, { value: 200 }, { value: 280 }, { value: 350 }, { value: 400 }
];
const dataChicken = [
    { value: 200 }, { value: 400 }, { value: 150 }, { value: 300 }, { value: 250 }, { value: 450 }, { value: 300 }
];
const dataBuffalo = [
    { value: 300 }, { value: 250 }, { value: 350 }, { value: 280 }, { value: 400 }, { value: 320 }, { value: 380 }
];

const HoldingCard = ({ type, count, value, data, icon, headerColor }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between min-w-[300px]">
        <div className="flex flex-col justify-between h-full w-1/2">
            <div className="flex items-center gap-3 mb-6">
                {/* Header Pill */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${headerColor} border border-white shadow-sm`}>
                    <span className="text-xl">{icon}</span>
                    <span className="text-xs font-bold text-gray-700">{type}</span>
                </div>
            </div>
            <div>
                <p className="text-xs text-gray-400">Portfolio</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
            </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full w-1/2">
            <span className="text-3xl font-bold text-gray-800 mb-2">{count}</span>
            <div className="w-full h-12">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={type === 'Goats' ? '#fbbf24' : type === 'Chickens' ? '#3b82f6' : '#f472b6'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={type === 'Goats' ? '#fbbf24' : type === 'Chickens' ? '#3b82f6' : '#f472b6'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={type === 'Goats' ? '#fbbf24' : type === 'Chickens' ? '#3b82f6' : '#f472b6'}
                            fillOpacity={1}
                            fill={`url(#gradient-${type})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

const HoldingsCards = () => {
    return (
        <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Current Holdings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <HoldingCard
                    type="Goats"
                    count="120"
                    value="NPR 1.8M"
                    data={dataGoat}
                    icon="🐐"
                    headerColor="bg-orange-100"
                />
                <HoldingCard
                    type="Chickens"
                    count="600"
                    value="NPR 240k"
                    data={dataChicken}
                    icon="🐔"
                    headerColor="bg-blue-100"
                />
                <HoldingCard
                    type="Buffalos"
                    count="49"
                    value="NPR 2.94M"
                    data={dataBuffalo}
                    icon="🐃"
                    headerColor="bg-pink-100"
                />
            </div>
        </div>
    );
};

export default HoldingsCards;
