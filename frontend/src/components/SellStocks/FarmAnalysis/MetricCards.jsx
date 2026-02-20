import React from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GrainIcon from '@mui/icons-material/Grain';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const MetricCard = ({ title, children, className }) => (
    <div className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex flex-col ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <h4 className="text-gray-800 font-bold text-sm">{title}</h4>
            <MoreVertIcon fontSize="small" className="text-gray-400 cursor-pointer" />
        </div>
        {children}
    </div>
);

const Gauge = ({ percentage, color, label }) => {
    // Simple SVG Gauge
    const radius = 70;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    // We only want a semi-circle gauge (50% of circle) usually, but design shows partial arc.
    // Let's assume a simple circle for now or CSS half-circle.
    // Design has a specific look (blue/green arc).

    // Simplification: Using CSS conical gradient or SVG stroke dasharray
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center h-32">
            {/* Background Circle */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#f3f4f6"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
                {label && <p className="text-[10px] text-gray-500">{label}</p>}
            </div>
        </div>
    );
};


const MetricCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Value */}
            <MetricCard title="Total Value">
                <p className="text-3xl font-bold text-gray-900 mb-1">NPR 4.98M</p>
                <span className="inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                    ↑ +5%
                </span>
                <p className="text-xs text-gray-400 mt-2">last month</p>
            </MetricCard>

            {/* Resources & Costs */}
            <MetricCard title="Resources & Costs">
                <div className="space-y-3 mt-1">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <GrainIcon fontSize="small" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Feed</p>
                            <p className="font-bold text-gray-800">370kg/day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500">
                            <WaterDropIcon fontSize="small" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Water</p>
                            <p className="font-bold text-gray-800">1500L/day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                            <MonetizationOnIcon fontSize="small" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Cost</p>
                            <p className="font-bold text-gray-800">NPR 12k/d</p>
                        </div>
                    </div>
                </div>
            </MetricCard>

            {/* Avg Weight Gain */}
            <MetricCard title="Avg Weight Gain">
                <div className="flex items-center justify-center">
                    {/* Placeholder Gauge Mockup */}
                    <Gauge percentage={40} color="#3b82f6" />
                </div>
            </MetricCard>

            {/* Vaccination % */}
            <MetricCard title="Vaccination %">
                <div className="flex items-center justify-center">
                    <Gauge percentage={95} color="#22c55e" label="Animals Vaccinated" />
                </div>
            </MetricCard>
        </div>
    );
};

export default MetricCards;
