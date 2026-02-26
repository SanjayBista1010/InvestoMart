import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminApprovalPanel = () => {
    const { user } = useAuth();
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // all, kyc, product

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/admin/approvals/pending/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setApprovals(res.data.approvals);
            } else {
                setError(res.data.error || 'Failed to fetch approvals');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Network error fetching approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, type, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8000/api/admin/approvals/', {
                id,
                type,
                action
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Optimistically remove from list
                setApprovals(prev => prev.filter(item => item.id !== id));
            } else {
                alert(res.data.error || 'Action failed');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Network error');
        }
    };

    const filteredApprovals = approvals.filter(item =>
        activeTab === 'all' || item.type === activeTab
    );

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading approval queue...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Approval Queue</h1>
                <p className="text-gray-500 mt-2">Manage pending KYC applications and new product listings.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-100 pb-4">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    All ({approvals.length})
                </button>
                <button
                    onClick={() => setActiveTab('kyc')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'kyc' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    KYC ({approvals.filter(a => a.type === 'kyc').length})
                </button>
                <button
                    onClick={() => setActiveTab('product')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'product' ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                    Listings ({approvals.filter(a => a.type === 'product').length})
                </button>
            </div>

            {/* List */}
            {filteredApprovals.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <CheckCircleIcon className="text-gray-300 text-6xl mb-4" />
                    <h3 className="text-xl font-bold text-gray-800">Queue is empty</h3>
                    <p className="text-gray-500 mt-2">All caught up! No pending items to review.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredApprovals.map(item => (
                        <div key={item.id} className="bg-white border text-left border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${item.type === 'kyc' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                        }`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.subtitle}</p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => handleAction(item.id, item.type, 'reject')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    <CancelIcon style={{ fontSize: 18 }} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction(item.id, item.type, 'approve')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                                >
                                    <CheckCircleIcon style={{ fontSize: 18 }} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApprovalPanel;
