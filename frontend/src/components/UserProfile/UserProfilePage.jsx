import React from 'react';
import PortfolioSummary from './PortfolioSummary';
import HoldingsCards from './HoldingsCards';
import TransactionHistory from './TransactionHistory';
import DashboardLayout from '../Layout/DashboardLayout';

const UserProfilePage = () => {
    return (
        <DashboardLayout pageTitle="My Profile">
            <PortfolioSummary />
            <HoldingsCards />
            <TransactionHistory />
        </DashboardLayout>
    );
};

export default UserProfilePage;
