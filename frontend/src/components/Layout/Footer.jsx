import React from 'react';
import { Link } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-green-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <AgricultureIcon className="text-green-400 text-3xl" />
                            <span className="text-xl font-serif font-bold text-white">
                                {t('greenAcres')}
                            </span>
                        </div>
                        <p className="text-green-100 text-sm leading-relaxed">
                            {t('organicCare')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-300">{t('quickLinks')}</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-green-100 hover:text-white transition-colors text-sm">{t('home')}</Link></li>
                            <li><Link to="/buy-stocks" className="text-green-100 hover:text-white transition-colors text-sm">{t('invest')}</Link></li>
                            <li><Link to="/sell-stocks" className="text-green-100 hover:text-white transition-colors text-sm">{t('sellLivestock')}</Link></li>
                            <li><Link to="/chatbot" className="text-green-100 hover:text-white transition-colors text-sm">{t('aiAssistant')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-300">{t('legal')}</h3>
                        <ul className="space-y-2">
                            <li><Link to="/terms" className="text-green-100 hover:text-white transition-colors text-sm">{t('terms')}</Link></li>
                            <li><Link to="/privacy" className="text-green-100 hover:text-white transition-colors text-sm">{t('privacy')}</Link></li>
                            <li><Link to="/cookies" className="text-green-100 hover:text-white transition-colors text-sm">{t('cookies')}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-300">{t('stayUpdated')}</h3>
                        <p className="text-green-100 text-sm mb-4">{t('subscribeText')}</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder={t('enterEmail')}
                                className="flex-1 px-3 py-2 rounded-lg bg-green-800 border border-green-700 text-white placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                {t('subscribe')}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-green-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-green-300 text-sm">
                        © {new Date().getFullYear()} {t('rightsReserved')}
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-green-300 hover:text-white transition-colors"><FacebookIcon fontSize="small" /></a>
                        <a href="#" className="text-green-300 hover:text-white transition-colors"><TwitterIcon fontSize="small" /></a>
                        <a href="#" className="text-green-300 hover:text-white transition-colors"><InstagramIcon fontSize="small" /></a>
                        <a href="#" className="text-green-300 hover:text-white transition-colors"><LinkedInIcon fontSize="small" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
