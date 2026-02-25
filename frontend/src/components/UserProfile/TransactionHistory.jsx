import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const tabs = ['All', 'Savings', 'Income', 'Expenses'];

const TransactionHistory = ({ transactions }) => {
    const [activeTab, setActiveTab] = useState('All');

    // Filter transactions based on active tab
    const filteredTransactions = transactions?.filter(txn => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Savings') return false; // Savings not explicitly tracked in this model yet
        return txn.type === activeTab;
    }) || [];

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 mb-8">
            <h3 className="font-bold text-gray-800 mb-6">Transaction History</h3>

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-6 flex items-center justify-between">
                <div className="flex gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                            {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-green-600 rounded-t-full"></span>}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-gray-500 font-medium pb-4">
                    Status: <span className="text-gray-800">All ▼</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Item</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Qty</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                            <th className="py-4 px-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-sm text-gray-500 font-serif">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map(txn => (
                                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 text-sm font-bold text-gray-800">{txn.date}</td>
                                    <td className={`py-4 px-4 text-sm font-bold ${txn.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                                        {txn.type === 'Income' ? '+ ' : '- '}{txn.type}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${txn.iconBg}`}>
                                                {txn.icon}
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{txn.animal}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm font-bold text-gray-800">{txn.qty}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-gray-800">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(txn.price)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${txn.status === 'Pending' ? 'text-yellow-500 bg-yellow-50' : 'text-green-500 bg-green-50'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <MoreVertIcon fontSize="small" className="text-gray-400 cursor-pointer" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionHistory;
