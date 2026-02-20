import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

// Mock Categories
const CATEGORIES = [
    { name: 'All', icon: '🐾', color: 'bg-green-100 border-green-500' },
    { name: 'Goat', icon: '🐐', color: 'bg-orange-100 border-transparent' },
    { name: 'Chicken', icon: '🐔', color: 'bg-blue-100 border-transparent' },
    { name: 'Buffalo', icon: '🐃', color: 'bg-pink-100 border-transparent' },
];

const FEATURED_PILLS = [
    { name: 'Local Chicken', image: '🐔', bgColor: 'bg-blue-600', textColor: 'text-white' }, // Active state sim
    { name: 'Boer Goat', image: '🐐', bgColor: 'bg-orange-50', textColor: 'text-gray-800' },
    { name: 'Murrah Buffalo', image: '🐃', bgColor: 'bg-pink-50', textColor: 'text-gray-800' },
];

const StockCategories = () => {
    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 font-serif">Buy Live Stocks</h2>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search by animal, price, weight..."
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 transition-colors text-sm outline-none"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
                    </div>

                    <div className="flex gap-2">
                        {CATEGORIES.map((cat) => (
                            <div key={cat.name} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer border-2 ${cat.color}`}>
                                {cat.icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Pills */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {FEATURED_PILLS.map((pill) => (
                    <div
                        key={pill.name}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full cursor-pointer shadow-sm min-w-max transition-transform hover:scale-105 ${pill.bgColor}`}
                    >
                        <span className="text-2xl">{pill.image}</span>
                        <span className={`font-bold ${pill.textColor}`}>{pill.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockCategories;
