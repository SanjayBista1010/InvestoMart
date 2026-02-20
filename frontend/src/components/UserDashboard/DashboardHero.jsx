import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const DashboardHero = () => {
    const { t } = useLanguage();
    const { user } = useAuth();

    const firstName = user?.name ? user.name.split(' ')[0] : (user?.username || 'User');

    return (
        <div className="rounded-3xl overflow-hidden relative mb-8 h-48 md:h-64 shadow-sm group hover:shadow-md transition-shadow">
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-green-500 opacity-90"></div>

            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 drop-shadow-md">
                    {t('hi')}, {firstName}
                </h2>
                <p className="text-green-50 text-base md:text-lg font-medium drop-shadow-sm max-w-md">
                    {t('readyToInvest')}
                </p>

                {/* Illustration Placeholder - In a real scenario, this would be a specific transparent PNG of cows/goats */}
                <div className="absolute right-4 bottom-0 w-1/3 h-full flex items-end justify-center pointer-events-none">
                    {/* If you have the specific 'animals.png', use it here. For now, simulating with text/icon or empty space for the illustration */}
                    <div className="transform translate-y-2">
                        {/* This area is reserved for the 'Farm Animals' illustration from the design */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHero;
