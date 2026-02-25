import React from 'react';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const PortfolioSummary = ({ value }) => {
    // Format currency 
    const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'NPR',
        maximumFractionDigits: 0
    }).format(value || 0);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 font-serif">My Portfolio</h2>

            <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <AssessmentOutlinedIcon />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Portfolio Value</p>
                    <p className="text-lg font-bold text-gray-800">{formattedValue}</p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
