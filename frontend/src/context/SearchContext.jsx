import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchService from '../services/SearchService';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Clear results when navigating away from search page if query is empty
    useEffect(() => {
        if (location.pathname !== '/search' && !searchQuery) {
            setResults([]);
        }
    }, [location.pathname, searchQuery]);

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    const performSearch = async (query) => {
        const term = query || searchQuery;
        if (term.length < 2) return;

        setIsLoading(true);
        try {
            const data = await SearchService.search(term);
            setResults(data);

            // Navigate to results page if not already there
            if (location.pathname !== '/search') {
                navigate(`/search?q=${encodeURIComponent(term)}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setResults([]);
    };

    return (
        <SearchContext.Provider value={{
            searchQuery,
            results,
            isLoading,
            handleSearchChange,
            performSearch,
            clearSearch
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};
