import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBar from '../Search/SearchBar';

const Header = () => {
    const location = useLocation();
    const { language, toggleLanguage, t } = useLanguage();
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { name: t('home'), path: '/' },
        { name: t('invest'), path: '/buy-stocks' },
        { name: t('sell'), path: '/sell-stocks' },
        { name: t('dashboard'), path: '/userdashboard' },
        { name: t('aiAssistant'), path: '/chatbot' },
    ];

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    {/* Logo - Far Left */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <AgricultureIcon className="text-green-700 text-3xl" />
                        <span className="text-xl font-serif font-bold text-green-800">
                            {t('greenAcres')}
                        </span>
                    </Link>

                    {/* Navigation, Search, and Profile Group - Far Right */}
                    <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
                        {/* Desktop Navigation */}
                        <nav className="hidden xl:flex items-center gap-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm font-bold transition-colors hover:text-green-700 whitespace-nowrap ${location.pathname === item.path
                                        ? 'text-green-700'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Search Bar */}
                        <div className="hidden sm:flex flex-1 max-w-[300px]">
                            <SearchBar />
                        </div>

                        {/* Cart Icon */}
                        <Link
                            to="/checkout"
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 transition-all group"
                            title="Shopping Cart"
                        >
                            <ShoppingCartIcon className="text-gray-600 group-hover:text-green-700 transition-colors" style={{ fontSize: 20 }} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Date, Language, Profile Container */}
                        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                            {/* Real-time Clock */}
                            <div className="hidden lg:block text-xs font-medium text-gray-500 tabular-nums whitespace-nowrap">
                                {currentTime.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>

                            {/* Language Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-2 py-1.5 rounded-lg border border-gray-100 transition-colors"
                                >
                                    <img
                                        src={language === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/np.png'}
                                        alt={language === 'en' ? 'English' : 'Nepali'}
                                        className="w-5 h-3.5 object-cover rounded shadow-sm"
                                    />
                                    <span className="text-xs font-bold text-gray-700">
                                        {language === 'en' ? 'EN' : 'NP'}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl py-1 border border-gray-100 z-50 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={() => {
                                                toggleLanguage('en');
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${language === 'en' ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                                        >
                                            <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                                            <span className="text-sm font-medium">English</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                toggleLanguage('np');
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${language === 'np' ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                                        >
                                            <img src="https://flagcdn.com/w40/np.png" alt="Nepali" className="w-5 h-3.5 object-cover rounded shadow-sm" />
                                            <span className="text-sm font-medium">नेपाली</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User Profile */}
                            <div className="relative">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center focus:outline-none"
                                        >
                                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200 hover:ring-2 hover:ring-green-500 transition-all">
                                                {user.username ? user.username[0].toUpperCase() : 'U'}
                                            </div>
                                        </button>

                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-1 border border-gray-100 z-50 animate-in fade-in zoom-in duration-200">
                                                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{user.name || user.username}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>

                                                <div className="p-1">
                                                    <Link
                                                        to="/userdashboard"
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                                                    >
                                                        {t('dashboard')}
                                                    </Link>
                                                    {(user.is_superuser || user.username === 'admin') && (
                                                        <>
                                                            <Link
                                                                to="/admin-dashboard"
                                                                onClick={() => setIsProfileOpen(false)}
                                                                className="block px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-1"
                                                            >
                                                                🔥 AI Analytics Admin
                                                            </Link>
                                                            <Link
                                                                to="/platform-analytics"
                                                                onClick={() => setIsProfileOpen(false)}
                                                                className="block px-3 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors mt-1"
                                                            >
                                                                📈 Platform Analytics
                                                            </Link>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            logout();
                                                            setIsProfileOpen(false);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border-t border-gray-100 mt-1"
                                                    >
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 hover:shadow-lg"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
