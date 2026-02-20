import React, { useState } from 'react';
import InvestSidebar from './InvestSidebar';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t } = useLanguage();
    const { user } = useAuth();

    return (
        <div className="relative h-screen w-full overflow-hidden font-sans">
            {/* Background Image with Zoom Effect */}
            <div
                className="absolute inset-0 z-0"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-[20s] hover:scale-100 ease-in-out"
                    style={{ backgroundImage: "url('/images/homepage.jpg')" }}
                />
                {/* Modern Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
            </div>

            {/* Header / Logo (Absolute positioning relative to viewport) */}
            <div className="absolute top-8 left-8 z-20 flex items-center gap-3 text-white drop-shadow-md">
                <AgricultureIcon sx={{ fontSize: 40 }} className="text-green-400" />
                <span className="text-2xl font-bold tracking-wide font-serif">{t('greenAcres')}</span>
            </div>

            {/* Main Hero Content - Centered */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 md:px-0">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    {/* Badge / Pill */}
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-green-300 text-sm font-semibold tracking-wider uppercase mb-4">
                        Sustainable Farming Investment
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-xl">
                        {t('welcomeHeroTitle')} <br className="hidden md:block" />
                        <span className="text-green-400">{t('investHeroSubtitle')}</span>
                    </h1>

                    {/* Description - Optional, hardcoded for visual flair if not in translation yet, or just styling existing */}
                    <p className="text-lg md:text-2xl text-gray-200 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Join us in revolutionizing organic agriculture. Yield returns while supporting a sustainable future.
                    </p>

                    {/* CTA Button */}
                    {!user && (
                        <div className="pt-8">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]"
                            >
                                <span className="mr-2">{t('investButton')}</span>
                                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Side Drawer */}
            <InvestSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
};

export default HomePage;
