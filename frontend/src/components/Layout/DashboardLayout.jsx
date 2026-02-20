import React from 'react';
import DashboardSidebar from '../UserDashboard/DashboardSidebar';
import DashboardHeader from '../UserDashboard/DashboardHeader';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const DashboardLayout = ({ children, pageTitle, breadcrumbs = [] }) => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 ml-20 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full flex flex-col relative">
                    {/* Header with Breadcrumbs */}
                    <div className="flex items-center justify-between mb-8 pr-16">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Dashboard</span>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <KeyboardArrowRightIcon fontSize="small" />
                                    <span>{crumb}</span>
                                </React.Fragment>
                            ))}
                            {pageTitle && (
                                <>
                                    <KeyboardArrowRightIcon fontSize="small" />
                                    <span className="font-bold text-gray-800">{pageTitle}</span>
                                </>
                            )}
                        </div>
                        <DashboardHeader />
                    </div>

                    {/* Page Content */}
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
