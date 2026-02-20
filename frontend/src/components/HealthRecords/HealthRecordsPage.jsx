import React from 'react';
import DashboardSidebar from '../UserDashboard/DashboardSidebar';
import DashboardHeader from '../UserDashboard/DashboardHeader';
import HealthFilters from './HealthFilters';
import AnimalList from './AnimalList';
import AnimalDetailsCard from './AnimalDetailsCard';
import AlertsSidebar from './AlertsSidebar';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const HealthRecordsPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 ml-20 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Dashboard</span>
                            <KeyboardArrowRightIcon fontSize="small" />
                            <span className="font-bold text-gray-800">Livestock Health Records</span>
                        </div>
                        <DashboardHeader />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Livestock Health Records</h2>

                    {/* Filters */}
                    <HealthFilters />

                    {/* Main Layout: Animal List + Details + Alerts */}
                    <div className="flex gap-6 flex-1">
                        <AnimalList />
                        <AnimalDetailsCard />
                        <AlertsSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthRecordsPage;
