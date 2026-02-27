import React, { useState, useEffect } from 'react';
import ListingForm from './ListingForm';
import ActiveListingsTable from './ActiveListingsTable';
import EarningsSummary from './EarningsSummary';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';
import ConfirmModal from '../Shared/ConfirmModal';
import Toast from '../Shared/Toast';
import DashboardLayout from '../Layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import KYCGuardModal from '../KYC/KYCGuardModal';

const SellStocksPage = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    // UI Feedback State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [notification, setNotification] = useState(null); // { message, type }

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const fetchListings = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:8000/api/products/my/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setListings(response.data);
        } catch (err) {
            console.error("Failed to fetch listings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditListing = (product) => {
        setEditingProduct(product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearEdit = () => {
        setEditingProduct(null);
    };

    const handleDeleteClick = (productId) => {
        setProductToDelete(productId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8000/api/products/delete/${productToDelete}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showToast('Listing deleted successfully!');
            fetchListings();
        } catch (err) {
            console.error("Failed to delete listing:", err);
            showToast('Failed to delete listing.', 'error');
        } finally {
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return (
        <DashboardLayout pageTitle="Sell Live Stocks">
            {user?.kyc_status !== 'verified' && !user?.is_superuser && <KYCGuardModal actionLabel="list stocks for sale" />}

            <div className="relative">
                {/* Floating top right icon - adjusted for layout container */}
                <div className="absolute -top-20 right-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 shadow-sm">
                    <TrendingUpIcon />
                </div>

                {/* Content Stack */}
                <ListingForm
                    onSuccess={fetchListings}
                    editingProduct={editingProduct}
                    onClearEdit={handleClearEdit}
                    showToast={showToast}
                />
                <ActiveListingsTable
                    listings={listings}
                    loading={loading}
                    onEdit={handleEditListing}
                    onDelete={handleDeleteClick}
                />
                <EarningsSummary />
            </div>

            {/* Modals & Toasts */}
            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Listing?"
                message="Are you sure you want to delete this product? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />

            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default SellStocksPage;
