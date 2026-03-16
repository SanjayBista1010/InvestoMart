import React from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import PortfolioSummary from './PortfolioSummary';
import HoldingsCards from './HoldingsCards';
import TransactionHistory from './TransactionHistory';
import DashboardLayout from '../../../shared/components/Layout/DashboardLayout';
import CircularProgress from '@mui/material/CircularProgress';

const UserProfilePage = () => {
    const { profileData, isLoading, error } = useUserProfile();

    if (isLoading) {
        return (
            <DashboardLayout pageTitle="My Profile">
                <div className="flex justify-center items-center h-64">
                    <CircularProgress color="success" />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout pageTitle="My Profile">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    <p className="font-bold">Error loading dashboard</p>
                    <p className="text-sm">{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="My Profile">
            {profileData && (
                <>
                    <PortfolioSummary value={profileData.portfolio_value} />
                    <HoldingsCards holdings={profileData.holdings} />
                    <TransactionHistory transactions={profileData.transactions} />
                </>
            )}
        </DashboardLayout>
    );
};

export default UserProfilePage;
