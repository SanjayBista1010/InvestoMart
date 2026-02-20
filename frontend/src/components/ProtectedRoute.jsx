import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const ProtectedRoute = ({ children }) => {
    const { user, openDrawer, loading, setRedirectPath } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            setRedirectPath(location.pathname);
        }
    }, [user, loading, setRedirectPath, location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600 font-medium">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <LockIcon className="text-green-600" style={{ fontSize: 40 }} />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Login Required
                    </h2>

                    <p className="text-gray-600 mb-8">
                        This page requires authentication. Please log in to access this feature.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
                        >
                            Login to Continue
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
