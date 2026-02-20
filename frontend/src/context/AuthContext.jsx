import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Build: Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            // Optional: Verify token with backend here
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        if (token) {
            localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        setIsDrawerOpen(false);

        if (redirectPath) {
            navigate(redirectPath);
            setRedirectPath(null);
        } else {
            navigate('/userdashboard');
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:8000/api/auth/logout/');
        } catch (error) {
            console.error("Logout failed silently", error);
        }
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
            loading,
            setRedirectPath
        }}>
            {children}
        </AuthContext.Provider>
    );
};
