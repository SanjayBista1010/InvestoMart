import React from 'react';
import DashboardHero from './DashboardHero';
import StatsCards from './StatsCards';
import ActionCards from './ActionCards';
import AnalyticsSection from './AnalyticsSection';
import NotificationsSection from './NotificationsSection';
import DashboardLayout from '../Layout/DashboardLayout';

const UserDashboard = () => {
    return (
        <DashboardLayout pageTitle="Overview">
            <DashboardHero />

            {/* Stats and Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatsCards />
                <ActionCards />
            </div>

            <AnalyticsSection />
            <NotificationsSection />
        </DashboardLayout>
    );
};

export default UserDashboard;
