import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Define routes where Header/Footer should NOT appear (e.g. Login page if it existed as a route)
    // For now, based on "except for login", we assume we show it everywhere else.
    // If 'children' passes specific prop or based on route, we can conditionally render.

    // Example: const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    // if (isAuthPage) return <>{children}</>;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
