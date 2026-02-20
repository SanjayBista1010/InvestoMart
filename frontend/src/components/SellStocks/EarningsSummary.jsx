import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SummaryCard = ({ title, amount, icon, iconBg, iconColor }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-5 flex-1 min-w-[200px]">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${iconBg} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-xs font-medium mb-1">{title}</p>
            <p className="text-xl font-bold text-gray-800">{amount}</p>
        </div>
    </div>
);

const EarningsSummary = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col lg:flex-row items-center gap-6">
            <SummaryCard
                title="Total Earnings"
                amount="NPR 23K"
                icon={<AccountBalanceWalletIcon fontSize="inherit" />}
                iconBg="bg-blue-100"
                iconColor="text-blue-500"
            />
            <SummaryCard
                title="Pending Sales"
                amount="NPR 12K"
                icon={<PendingActionsIcon fontSize="inherit" />}
                iconBg="bg-yellow-100"
                iconColor="text-yellow-600"
            />
            <SummaryCard
                title="Completed Transactions"
                amount="NPR 100K"
                icon={<CheckCircleOutlineIcon fontSize="inherit" />} // Wallet icon again in design? Or distinct?
                iconBg="bg-green-100"
                iconColor="text-green-600"
            />

            <button 
                onClick={() => navigate('/withdraw')}
                className="bg-green-700 text-white font-bold py-4 px-8 rounded-full hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
            >
                WITHDRAW
            </button>
        </div>
    );
};

export default EarningsSummary;
