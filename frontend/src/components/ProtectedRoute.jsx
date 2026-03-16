import React, { useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

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
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default ProtectedRoute;
