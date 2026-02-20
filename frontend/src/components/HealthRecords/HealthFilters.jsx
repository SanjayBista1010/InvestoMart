import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

const HealthFilters = () => {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                <span className="font-medium">Sort by: Date Range</span>
                <KeyboardArrowDownIcon fontSize="small" />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                <span className="font-medium">Status</span>
                <KeyboardArrowDownIcon fontSize="small" />
            </div>

            <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                <FilterAltOutlinedIcon fontSize="small" />
                <span>Filter</span>
            </button>
        </div>
    );
};

export default HealthFilters;
