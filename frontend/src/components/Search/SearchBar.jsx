import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from '../../context/SearchContext';

const SearchBar = () => {
    const { searchQuery, handleSearchChange, performSearch } = useSearch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            performSearch();
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex items-center w-full max-w-md"
        >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search livestock, products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm transition-all duration-200"
            />
        </form>
    );
};

export default SearchBar;
