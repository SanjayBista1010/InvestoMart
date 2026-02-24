import React from 'react';
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
        </div>
    );
};

export default DashboardHeader;
