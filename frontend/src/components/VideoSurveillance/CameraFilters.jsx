import React, { useState } from 'react';

const filters = [
    { id: 'all', label: 'All', color: 'bg-green-600 text-white' },
    { id: 'chicken', label: 'Chicken Coop Camera', color: 'bg-gray-100 text-gray-700' },
    { id: 'goat', label: 'Goat Pen Camera', color: 'bg-gray-100 text-gray-700' },
    { id: 'buffalo', label: 'Buffalo Shed Camera', color: 'bg-gray-100 text-gray-700' },
];

const CameraFilters = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    return (
        <div className="flex gap-3 mb-8 flex-wrap">
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md ${activeFilter === filter.id
                            ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default CameraFilters;
