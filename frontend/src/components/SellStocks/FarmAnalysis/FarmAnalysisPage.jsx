import React from 'react';
import DashboardSidebar from '../../UserDashboard/DashboardSidebar';
import DashboardHeader from '../../UserDashboard/DashboardHeader';
import MetricCards from './MetricCards';
import AnalysisCharts from './AnalysisCharts';
import InsightBanners from './InsightBanners';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const FarmAnalysisPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 ml-20 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Dashboard</span>
                            <KeyboardArrowRightIcon fontSize="small" />
                            <span>Sell Live Stocks</span>
                            <KeyboardArrowRightIcon fontSize="small" />
                            <span className="font-bold text-gray-800">Farm Analysis</span>
                        </div>
                        <DashboardHeader />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">Farm Analysis</h2>

                    {/* Content Stack */}
                    <MetricCards />
                    <AnalysisCharts />
                    <InsightBanners />
                </div>
            </div>
        </div>
    );
};

export default FarmAnalysisPage;
