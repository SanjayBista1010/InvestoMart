import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsSection = () => {
    // Mock data mimicking the chart curve
    const data = [
        { name: '0kg', value: 200 },
        { name: '100kg', value: 300 },
        { name: '200kg', value: 250 },
        { name: '300kg', value: 350 },
        { name: '400kg', value: 300 },
        { name: '500kg', value: 450 },
        { name: '600kg', value: 400 },
        { name: '700kg', value: 700 }, // Peak
        { name: '800kg', value: 600 },
        { name: '900kg', value: 800 },
        { name: '1000kg', value: 750 },
        { name: '1200kg', value: 850 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Price History Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-lg text-gray-800">Price History</h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-500 cursor-pointer">7 days</span>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-700 text-white cursor-pointer">30 days</span>
                    </div>
                </div>

                <div className="h-64 bg-gray-50 rounded-xl relative overflow-hidden p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
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

                    {/* Overlay tags mimicking the design */}
                    <div className="absolute top-1/2 left-1/4 bg-pink-400 text-white text-[10px] px-2 py-1 rounded">Rs. 400/kg</div>
                    <div className="absolute top-1/4 left-1/2 bg-yellow-400 text-white text-[10px] px-2 py-1 rounded">Rs. 800/kg</div>
                    <div className="absolute top-[10%] right-1/4 bg-blue-500 text-white text-[10px] px-2 py-1 rounded">Rs. 900/kg</div>
                </div>

                <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium px-2">
                    <span>0kg</span><span>100kg</span><span>200kg</span><span>300kg</span><span>400kg</span><span>500kg</span>
                    <span>700kg</span><span>800kg</span><span>900kg</span><span>1k kg</span>
                </div>
            </div>

            {/* Farm Analysis */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                <h3 className="font-serif font-bold text-lg text-gray-800 mb-6">Farm Analysis</h3>

                <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">1. Total Farm Value :</p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Goats (120 × NPR 15,000)</span>
                            <span className="font-bold text-gray-800">= NPR 1,800,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Chickens (600 × NPR 400)</span>
                            <span className="font-bold text-gray-800">= NPR 240,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-gray-600"><span className="w-2 h-2 rounded-full bg-pink-400"></span> Buffalos (49 × NPR 60,000)</span>
                            <span className="font-bold text-gray-800">= NPR 2,940,000</span>
                        </div>
                        <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between items-center font-bold text-sm">
                            <span className="text-gray-800">Total Farm Value =</span>
                            <span className="text-gray-800">NPR 4,980,000</span>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">2. Resources & Consumption :</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">A. Daily Feed Consumption</p>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-600">🐐 Goats: <span className="font-bold">50 kg/day</span></p>
                                <p className="text-xs text-gray-600">🐔 Chickens: <span className="font-bold">120 kg/day</span></p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">B. Water Usage</p>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-600">🐐 Goats: <span className="font-bold">300 L/day</span></p>
                                <p className="text-xs text-gray-600">🐔 Chickens: <span className="font-bold">500 L/day</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSection;
