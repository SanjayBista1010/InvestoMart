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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {results.map((item) => (
                            <Link
                                key={`${item.type}-${item.id}`}
                                to={item.url}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/3] w-full relative bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${item.type === 'product' ? 'bg-blue-50 text-blue-300' : 'bg-green-50 text-green-300'}`}>
                                            {item.type === 'product' ? <Inventory2Icon sx={{ fontSize: 60 }} /> : <PetsIcon sx={{ fontSize: 60 }} />}
                                        </div>
                                    )}
                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${item.type === 'product' ? 'bg-blue-600/90 text-white' : 'bg-green-600/90 text-white'}`}>
                                            {item.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">{item.category}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors mb-2 leading-tight">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                        {item.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-medium">Price</span>
                                            <span className="text-xl font-bold text-green-700">
                                                Rs. {Math.round(item.price).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-700 transition-colors">
                                            <ArrowForwardIcon fontSize="small" />
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
