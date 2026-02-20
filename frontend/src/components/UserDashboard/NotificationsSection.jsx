import React from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'; // Bell with waves?
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PetsIcon from '@mui/icons-material/Pets';

const NotificationItem = ({ icon, title, description, bgColor, iconColor }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex gap-4 hover:shadow-md transition-shadow mb-4 last:mb-0">
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${bgColor} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-sm text-gray-800 mb-1">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

const NotificationsSection = () => {
    return (
        <div className="mb-8">
            <h3 className="font-serif font-bold text-xl text-gray-800 mb-4">Notifications</h3>

            <div className="space-y-4">
                <NotificationItem
                    title="Stay Alert! Live stock prices are constantly updating in real-time."
                    description="Market trends can shift within seconds — make sure to track your favorite stocks, set alerts, and manage your portfolio wisely."
                    icon={<NotificationsActiveIcon fontSize="small" />}
                    bgColor="bg-pink-50"
                    iconColor="text-pink-500"
                />
                <NotificationItem
                    title="Goat Market Update 🐐"
                    description="Goat prices rose by NPR 500 today. Check live rates before selling or buying."
                    icon={<TrendingUpIcon fontSize="small" />}
                    bgColor="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <NotificationItem
                    title="Chicken Price Drop 🐔"
                    description="Local chicken stock fell by NPR 20/kg. Monitor the trend in real time."
                    icon={<TrendingDownIcon fontSize="small" />}
                    bgColor="bg-blue-50" // Design shows blue-ish for chicken too maybe?
                    iconColor="text-red-400"
                />
            </div>
        </div>
    );
};

export default NotificationsSection;
