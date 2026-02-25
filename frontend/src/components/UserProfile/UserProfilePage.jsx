import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioSummary from './PortfolioSummary';
import HoldingsCards from './HoldingsCards';
import TransactionHistory from './TransactionHistory';
import DashboardLayout from '../Layout/DashboardLayout';
import CircularProgress from '@mui/material/CircularProgress';

const UserProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/profile/summary/', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setProfileData(response.data);
                } else {
                    setError('Failed to load profile data.');
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError('An error occurred while fetching your profile.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

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
