import React from 'react';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currentDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const displayName = user?.name ? user.name.split(' ')[0] : (user?.username || 'User');

    return (
        <div className="flex justify-between items-center py-4 mb-2">
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    {displayName}'s Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-5">
                {/* Notification */}
                <div className="relative cursor-pointer text-gray-500 hover:text-green-700 transition-colors">
                    <NotificationsNoneIcon />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400 transform translate-x-1/4 -translate-y-1/4"></span>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
