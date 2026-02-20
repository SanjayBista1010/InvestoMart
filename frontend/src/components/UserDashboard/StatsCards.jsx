import React from 'react';

// Icons using Emoji or placeholders if explicit icons aren't available in MUI
// or mapped to closest equivalents
import AgricultureIcon from '@mui/icons-material/Agriculture'; // Placeholder for Goat/Buffalo/Chicken if needed
// For better icons, one might import svgs directly, but sticking to MUI/Text for speed.

const StatCard = ({ title, count, icon, bgColor, iconColor }) => (
    <div className="bg-white p-5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 hover:shadow-lg transition-all duration-300">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${bgColor} ${iconColor} shadow-sm`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{count}</p>
        </div>
    </div>
);

const StatsCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Total Goats"
                count="120"
                icon="🐐"
                bgColor="bg-orange-50"
                iconColor="text-orange-400"
            />
            <StatCard
                title="Total Chickens"
                count="600"
                icon="🐔"
                bgColor="bg-blue-50"
                iconColor="text-blue-400"
            />
            <StatCard
                title="Total Buffalos"
                count="49"
                icon="🐃"
                bgColor="bg-pink-50"
                iconColor="text-pink-400"
            />
        </div>
    );
};

export default StatsCards;
