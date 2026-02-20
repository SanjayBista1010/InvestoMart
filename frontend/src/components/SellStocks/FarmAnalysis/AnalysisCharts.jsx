import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, YAxis, CartesianGrid } from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChartCard = ({ title, children, className }) => (
    <div className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <h4 className="text-gray-800 font-bold text-sm">{title}</h4>
            <MoreVertIcon fontSize="small" className="text-gray-400 cursor-pointer" />
        </div>
        <div className="flex-1 w-full h-full min-h-[200px]">
            {children}
        </div>
    </div>
);

// --- Data ---
const distributionData = [
    { name: 'Goat', value: 1000, color: '#facc15' },   // Yellow
    { name: 'Chicken', value: 600, color: '#3b82f6' }, // Blue
    { name: 'Buffalo', value: 150, color: '#f472b6' }, // Pink
];

const opexData = [
    { name: 'M', feed: 20, labor: 10, electricity: 5 },
    { name: 'T', feed: 25, labor: 12, electricity: 6 },
    { name: 'W', feed: 18, labor: 10, electricity: 5 },
    { name: 'T', feed: 30, labor: 15, electricity: 8 },
    { name: 'F', feed: 22, labor: 11, electricity: 6 },
    { name: 'S', feed: 28, labor: 14, electricity: 7 },
    { name: 'S', feed: 32, labor: 16, electricity: 8 },
];

const roiData = [
    { name: 'Apr', value: 30 },
    { name: 'Apr 15', value: 70 },
    { name: 'May', value: 45 },
    { name: 'May 15', value: 50 },
    { name: 'Jun', value: 60 },
    { name: 'Jun 15', value: 85 },
    { name: 'Jul', value: 55 },
];

const AnalysisCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Value Distribution (Donut) */}
            <ChartCard title="Value Distribution" className="lg:col-span-1">
                <div className="relative h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-xl font-bold text-gray-800">20%</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {distributionData.map(item => (
                        <div key={item.name} className="flex justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-500">{item.name}</span>
                            </div>
                            <span className="font-bold text-gray-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </ChartCard>

            {/* Monthly Opex (Stacked Bar) */}
            <ChartCard title="Monthly Opex" className="lg:col-span-1">
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={opexData} barSize={8}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="feed" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="labor" stackId="a" fill="#ec4899" />
                            <Bar dataKey="electricity" stackId="a" fill="#facc15" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {['Feeds', 'Labor', 'Electricity'].map((label, i) => (
                        <div key={label} className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-pink-500' : 'bg-yellow-400'}`}></div>
                            {label}
                        </div>
                    ))}
                </div>
            </ChartCard>

            {/* ROI Next 3 Months (Line) */}
            <ChartCard title="ROI next 3 months" className="lg:col-span-2">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={roiData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                            {/* Grid lines simplified */}
                            <CartesianGrid vertical={true} horizontal={false} stroke="#f3f4f6" />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center gap-4">
                    <p className="text-3xl font-bold text-gray-800">30%</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">
                        Your ROI is expected to be higher over the next three months.
                    </p>
                </div>
            </ChartCard>
        </div>
    );
};

export default AnalysisCharts;
