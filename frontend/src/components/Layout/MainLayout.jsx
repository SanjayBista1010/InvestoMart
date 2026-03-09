import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const location = useLocation();

    const isHomePage = location.pathname === '/';

    if (isHomePage) return <>{children}</>;

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
