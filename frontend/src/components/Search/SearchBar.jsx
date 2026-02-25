import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { useSearch } from '../../context/SearchContext';
import SearchService from '../../services/SearchService';

const HISTORY_KEY = 'investomart_search_history';
const MAX_HISTORY = 5;

const SearchBar = () => {
    const { searchQuery, handleSearchChange, performSearch } = useSearch();
    const navigate = useNavigate();
    
    const [isFocused, setIsFocused] = useState(false);
    const [history, setHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const wrapperRef = useRef(null);

    // Load history on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse search history', e);
            }
        }
    }, []);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions when query changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchQuery || searchQuery.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            
            setIsSearching(true);
            try {
                const results = await SearchService.search(searchQuery.trim());
                // Only take top 5 suggestions to keep dropdown clean
                setSuggestions(results.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch suggestions', error);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const saveToHistory = (query) => {
        if (!query || query.trim().length === 0) return;
        
        const trimmedQuery = query.trim();
        const newHistory = [
            trimmedQuery,
            ...history.filter(h => h.toLowerCase() !== trimmedQuery.toLowerCase())
        ].slice(0, MAX_HISTORY);
        
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    const removeFromHistory = (e, queryToRemove) => {
        e.stopPropagation(); // Prevent triggering the search
        const newHistory = history.filter(h => h !== queryToRemove);
        setHistory(newHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            saveToHistory(searchQuery);
            performSearch();
            setIsFocused(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleHistoryClick = (query) => {
        handleSearchChange(query);
        saveToHistory(query);
        setIsFocused(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    const handleSuggestionClick = (suggestion) => {
        saveToHistory(suggestion.title || suggestion.name);
        setIsFocused(false);
        
        if (suggestion.type === 'product') {
            navigate(`/product/${suggestion.id || suggestion.product_id}`);
        } else if (suggestion.type === 'livestock') {
            navigate(`/livestock/${suggestion.id || suggestion.animal_id}`);
        }
    };

    // Determine what to show in the dropdown
    const showDropdown = isFocused && (history.length > 0 || searchQuery.trim().length >= 2);
    const showHistory = searchQuery.trim().length < 2 && history.length > 0;
    const showSuggestions = searchQuery.trim().length >= 2;

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center w-full"
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className={`h-5 w-5 transition-colors ${isFocused ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search livestock, products..."
                    className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm transition-all duration-200 shadow-sm"
                    autoComplete="off"
                />
                
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => {
                            handleSearchChange('');
                            setSuggestions([]);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <CloseIcon className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Dropdown Menu */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Search History Section */}
                    {showHistory && (
                        <div className="py-2">
                            <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                <span>Recent Searches</span>
                            </div>
                            <ul>
                                {history.map((item, idx) => (
                                    <li 
                                        key={idx}
                                        onClick={() => handleHistoryClick(item)}
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <HistoryIcon className="text-gray-400 group-hover:text-green-600 transition-colors" style={{ fontSize: 18 }} />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                        <button
                                            onClick={(e) => removeFromHistory(e, item)}
                                            className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remove from history"
                                        >
                                            <CloseIcon style={{ fontSize: 14 }} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Auto-complete Suggestions Section */}
                    {showSuggestions && (
                        <div className="py-2">
                            {isSearching ? (
                                <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                    Searching...
                                </div>
                            ) : suggestions.length > 0 ? (
                                <ul>
                                    {suggestions.map((suggestion, idx) => (
                                        <li 
                                            key={idx}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
                                        >
                                            {suggestion.type === 'product' ? (
                                                <StorefrontIcon className="text-blue-400 group-hover:text-blue-600" style={{ fontSize: 20 }} />
                                            ) : (
                                                <AgricultureIcon className="text-orange-400 group-hover:text-orange-600" style={{ fontSize: 20 }} />
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                    {suggestion.title || suggestion.name}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {suggestion.type} {suggestion.category ? `• ${suggestion.category}` : ''}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                            
                            {/* "Press Enter" hint */}
                            {suggestions.length > 0 && !isSearching && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Press <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono text-[10px] mx-1">Enter</kbd> to see all results</span>
                                    <SearchIcon style={{ fontSize: 14 }} className="text-green-600" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
