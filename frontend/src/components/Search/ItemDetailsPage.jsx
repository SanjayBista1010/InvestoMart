import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchService from '../../services/SearchService';
import { useCart } from '../../context/CartContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PetsIcon from '@mui/icons-material/Pets';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScaleIcon from '@mui/icons-material/Scale';

const ItemDetailsPage = ({ type }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddToCart = () => {
        addToCart(item);
        setAddedToCart(true);
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = type === 'product'
                    ? await SearchService.getProductById(id)
                    : await SearchService.getLivestockById(id);
                setItem(data);
            } catch (err) {
                setError('Failed to load details. The item might have been removed.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id, type]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <LocalHospitalIcon sx={{ fontSize: 60 }} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isProduct = type === 'product';
    const displayImage = item.image_url || '';
    const animalStats = isProduct ? item.animal_details : item;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-[Poppins]">
            <div className="max-w-6xl mx-auto">
                {/* Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors mb-6 font-medium"
                >
                    <ArrowBackIcon fontSize="small" /> Back to Results
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

                    {/* Left: Image Gallery */}
                    <div className="w-full lg:w-1/2 bg-gray-100 relative min-h-[400px] flex items-center justify-center">
                        {displayImage ? (
                            <img
                                src={displayImage}
                                alt={item.title}
                                className="w-full h-full object-cover absolute inset-0"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isProduct ? 'bg-blue-50 text-blue-300' : 'bg-green-50 text-green-300'}`}>
                                {isProduct ? <Inventory2Icon sx={{ fontSize: 120 }} /> : <PetsIcon sx={{ fontSize: 120 }} />}
                            </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`uppercase font-bold text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-md ${isProduct ? 'bg-blue-600/90 text-white' : 'bg-green-600/90 text-white'}`}>
                                {type}
                            </span>
                            <span className="uppercase font-bold text-xs px-3 py-1.5 rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-md">
                                {item.status}
                            </span>
                        </div>
                    </div>

                    {/* Right: Details & Checkout */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
                        <div className="mb-2">
                            <span className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                {item.category} {item.breed && `• ${item.breed}`}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {item.title}
                        </h1>

                        <div className="text-3xl font-bold text-green-700 mb-6">
                            Rs. {Math.round(item.price).toLocaleString()}
                        </div>

                        <p className="text-gray-600 text-base leading-relaxed mb-8">
                            {item.description}
                        </p>

                        {/* Specifications Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {item.farm_id && (
                                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                                    <Inventory2Icon className="text-gray-400 mt-0.5" fontSize="small" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Farm Name</p>
                                        <p className="font-semibold text-gray-900 line-clamp-1" title={item.farm_id}>{item.farm_id}</p>
                                    </div>
                                </div>
                            )}

                            {item.location && (
                                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                                    <LocationOnIcon className="text-gray-400 mt-0.5" fontSize="small" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Location</p>
                                        <p className="font-semibold text-gray-900 line-clamp-1" title={item.location}>{item.location}</p>
                                    </div>
                                </div>
                            )}

                            {animalStats && animalStats.age_months !== undefined && (
                                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                                    <CalendarTodayIcon className="text-gray-400 mt-0.5" fontSize="small" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Age</p>
                                        <p className="font-semibold text-gray-900">{animalStats.age_months} Months</p>
                                    </div>
                                </div>
                            )}

                            {animalStats && animalStats.weight !== undefined && (
                                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                                    <ScaleIcon className="text-gray-400 mt-0.5" fontSize="small" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Weight</p>
                                        <p className="font-semibold text-gray-900">{animalStats.weight} {isProduct ? 'kg' : 'Units'}</p>
                                    </div>
                                </div>
                            )}

                            {animalStats && animalStats.health_status && (
                                <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 border border-gray-100">
                                    <LocalHospitalIcon className="text-green-500 mt-0.5" fontSize="small" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Health Status</p>
                                        <p className="font-semibold text-green-700 capitalize">{animalStats.health_status}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Area */}
                        <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
                            {item.available_quantity <= 0 ? (
                                <button 
                                    disabled
                                    className="flex-1 bg-gray-300 text-gray-500 text-lg font-bold py-4 rounded-xl cursor-not-allowed uppercase"
                                >
                                    Out of Stock
                                </button>
                            ) : addedToCart ? (
                                <div className="flex-1 flex gap-3">
                                    <button 
                                        onClick={() => navigate('/checkout')}
                                        className="flex-1 bg-green-700 text-white text-base font-bold py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
                                    >
                                        ✓ Go to Checkout
                                    </button>
                                    <button 
                                        onClick={() => navigate(-1)}
                                        className="flex-1 border-2 border-green-700 text-green-700 text-base font-bold py-4 rounded-xl hover:bg-green-50 transition-colors"
                                    >
                                        Keep Shopping
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-green-700 text-white text-lg font-bold py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCartIcon /> Add to Investment
                                </button>
                            )}
                        </div>

                        <div className="mt-4 text-center text-xs text-gray-400">
                            Secure transaction powered by InvestoMart Escrow
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;
