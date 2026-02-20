import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import SearchBar from './SearchBar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PetsIcon from '@mui/icons-material/Pets';
import SearchIcon from '@mui/icons-material/Search';

const SearchPage = () => {
    const location = useLocation();
    const { results, isLoading, performSearch } = useSearch();
    const query = new URLSearchParams(location.search).get('q') || '';

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                        Search Results
                    </h1>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="flex-1">
                            <SearchBar />
                        </div>
                        <p className="text-gray-500 text-sm hidden sm:block">
                            Showing results for <span className="font-semibold text-green-700">"{query}"</span>
                        </p>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    </div>
                )}

                {/* Results List */}
                {!isLoading && results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.map((item) => (
                            <Link
                                key={`${item.type}-${item.id}`}
                                to={item.url}
                                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300 flex gap-6"
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'product' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {item.type === 'product' ? <Inventory2Icon fontSize="large" /> : <PetsIcon fontSize="large" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs font-medium text-gray-500">{item.category}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xl font-bold text-green-700">
                                            Rs. {item.price.toLocaleString()}
                                        </span>
                                        <div className="text-green-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <ArrowForwardIcon fontSize="small" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : !isLoading && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="text-gray-300" fontSize="large" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
                        <p className="text-gray-500">
                            We couldn't find anything matching "{query}". <br />
                            Try searching for goats, chickens, or specific products.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
