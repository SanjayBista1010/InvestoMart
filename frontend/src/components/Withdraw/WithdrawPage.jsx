import React, { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WithdrawOption = ({ id, title, description, icon, color, selected, onSelect }) => (
    <div
        onClick={() => onSelect(id)}
        className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${selected
                ? 'border-green-600 bg-green-50/30'
                : 'border-gray-100 bg-white hover:border-green-200 hover:shadow-xl hover:shadow-green-50'
            }`}
    >
        <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${color}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-500 font-medium">{description}</p>
            </div>
        </div>

        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selected ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-300 group-hover:text-green-500'
            }`}>
            <ArrowForwardIosIcon fontSize="small" />
        </div>

        {selected && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                SELECTED
            </div>
        )}
    </div>
);

const WithdrawPage = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    const methods = [
        {
            id: 'esewa',
            title: 'eSewa Wallet',
            description: 'Instant transfer to your eSewa account',
            icon: <AccountBalanceWalletIcon fontSize="inherit" />,
            color: 'bg-[#60bb46] text-white'
        },
        {
            id: 'khalti',
            title: 'Khalti Wallet',
            description: 'Fast and secure payout to Khalti',
            icon: <PaymentIcon fontSize="inherit" />,
            color: 'bg-[#5c2d91] text-white'
        },
        {
            id: 'banking',
            title: 'Internet Banking',
            description: 'Direct transfer to all Nepalese banks',
            icon: <AccountBalanceIcon fontSize="inherit" />,
            color: 'bg-blue-600 text-white'
        }
    ];

    return (
        <DashboardLayout pageTitle="Withdraw Funds">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Choose Your Payout Method</h2>
                    <p className="text-gray-500 text-lg">Select how you'd like to receive your earnings from the platform.</p>
                </div>

                <div className="space-y-6">
                    {methods.map((method) => (
                        <WithdrawOption
                            key={method.id}
                            {...method}
                            selected={selectedMethod === method.id}
                            onSelect={setSelectedMethod}
                        />
                    ))}
                </div>

                <div className="mt-12 p-8 bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-green-400 font-bold tracking-widest text-xs mb-2 uppercase">Available Balance</p>
                            <h4 className="text-4xl font-black text-white">NPR 23,000.00</h4>
                        </div>

                        <button
                            disabled={!selectedMethod}
                            className={`px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${selectedMethod
                                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-500/20 active:scale-95'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                }`}
                        >
                            PROCEED WITHDRAWAL
                        </button>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm mt-8 font-medium">
                    Processing time may vary depending on the chosen method. Typically 2-24 hours.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default WithdrawPage;
