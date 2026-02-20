import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';

const InsightBanners = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {/* Best Time to Sell - Blue */}
            <div className="bg-blue-500 text-white p-6 rounded-3xl shadow-lg shadow-blue-200">
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">Best Time to Sell</h4>
                    <AutoAwesomeIcon fontSize="small" className="text-yellow-300" />
                </div>
                <p className="text-blue-50 text-xs leading-relaxed opacity-90">
                    The best time to sell and gain more profit from the stocks, we suggest to sell your products on Dashain.
                </p>
            </div>

            {/* Risk Alerts - Red */}
            <div className="bg-red-400 text-white p-6 rounded-3xl shadow-lg shadow-red-200">
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">Risk Alerts</h4>
                    <AnnouncementOutlinedIcon fontSize="small" className="text-white" />
                </div>
                <p className="text-white text-xs leading-relaxed opacity-90">
                    High feed costs may affect profit margins
                </p>
            </div>
        </div>
    );
};

export default InsightBanners;
