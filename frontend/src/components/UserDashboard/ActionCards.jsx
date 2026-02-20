import React from 'react';
import { Link } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AgricultureIcon from '@mui/icons-material/Agriculture'; // Placeholder for specific icons

const ActionCard = ({ title, icon, colorClass, bgClass, iconBgClass }) => (
    <div className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-transform transform hover:scale-[1.02] ${bgClass} shadow-sm min-h-[140px]`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl shadow-md ${colorClass}`}>
            {icon}
        </div>
        <p className={`font-bold text-lg ${colorClass.replace('bg-', 'text-')}`}>
            {title}
        </p>
    </div>
);

const ActionCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/buy-stocks">
                <ActionCard
                    title="Buy Live Stocks"
                    icon={<AgricultureIcon fontSize="inherit" />} // Placeholder for the green goat icon
                    colorClass="bg-green-600"
                    bgClass="bg-gray-100" // The design has a greyish background for the card area? Or white? Image shows grey container.
                />
            </Link>
            <Link to="/sell-stocks">
                <ActionCard
                    title="Sell Live Stocks"
                    icon={<AgricultureIcon fontSize="inherit" />} // Placeholder for the red goat icon
                    colorClass="bg-red-500"
                    bgClass="bg-red-50"
                />
            </Link>
        </div>
    );
};

export default ActionCards;
