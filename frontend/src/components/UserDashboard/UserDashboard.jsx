import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardHero from './DashboardHero';
import StatsCards from './StatsCards';
import ActionCards from './ActionCards';
import AnalyticsSection from './AnalyticsSection';
import NotificationsSection from './NotificationsSection';
import DashboardLayout from '../Layout/DashboardLayout';

const UserDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/dashboard/summary/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout pageTitle="Overview">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Overview">
            <DashboardHero />

            {/* Stats and Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatsCards data={dashboardData?.animals} />
                <ActionCards />
            </div>

            <AnalyticsSection data={dashboardData} />
            <NotificationsSection />
        </DashboardLayout>
    );
};

export default UserDashboard;
