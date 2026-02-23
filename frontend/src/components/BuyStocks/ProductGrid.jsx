import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchService from '../../services/SearchService';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // Mapping from generic object to the visual design
    const bgColor = product.category === 'chicken' ? 'bg-blue-50' :
                    product.category === 'goat' ? 'bg-orange-50' :
                    product.category === 'buffalo' ? 'bg-pink-50' : 'bg-gray-50';
                    
    const fallbackImage = product.category === 'chicken' ? '🐔' :
                          product.category === 'goat' ? '🐐' :
                          product.category === 'buffalo' ? '🐃' : '📦';

    return (
        <div className={`rounded-xl p-4 flex flex-col md:flex-row gap-4 relative ${bgColor} border border-white shadow-sm hover:shadow-md transition-shadow group`}>
            <div 
                className="flex-1 cursor-pointer"
                onClick={() => navigate(product.url)}
            >
                <h3 className="font-bold text-gray-800 text-sm mb-1">
                    {product.type === 'livestock' ? 'Animal Type & Breed :' : 'Product Category :'}
                </h3>
                <p className="font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">{product.title}</p>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
                    <div>
                        <span className="text-gray-500 block">Age :</span>
                        <span className="font-semibold text-gray-800">{product.age}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Avg Weight :</span>
                        <span className="font-semibold text-gray-800">{product.weight}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Health Status :</span>
                        <span className="font-semibold text-green-600 flex items-center gap-1">
                            {product.health !== 'N/A' && '✅ '} {product.health}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Use Case :</span>
                        <span className="font-semibold text-gray-800">{product.use}</span>
                    </div>
                </div>

                <div className="mt-2 text-xs text-gray-500 line-clamp-1 mb-2">
                    {product.description}
                </div>

                <div className="mt-auto pt-2 border-t border-black/5">
                    <span className="text-gray-500 text-xs block">Price :</span>
                    <span className="font-bold text-gray-900 text-base">Rs. {Math.round(product.price).toLocaleString()}</span>
                </div>
            </div>

            <div className="flex flex-col justify-between items-center w-full md:w-40 gap-4">
                <div 
                    className="w-full h-32 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transform hover:scale-105 transition-transform bg-white/50 border border-white"
                    onClick={() => navigate(product.url)}
                >
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-6xl">{fallbackImage}</span>
                    )}
                </div>
                
                {product.available_quantity <= 0 ? (
                    <button 
                        disabled
                        className="w-full text-xs font-bold py-2.5 px-4 rounded-full bg-gray-300 text-gray-500 cursor-not-allowed uppercase"
                    >
                        Out of Stock
                    </button>
                ) : (
                    <button 
                        onClick={handleAddToCart}
                        className={`w-full text-xs font-bold py-2.5 px-4 rounded-full transition-all shadow-lg ${added ? 'bg-green-600 text-white shadow-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                    >
                        {added ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                )}
            </div>
        </div>
    );
};

const ProductGrid = ({ selectedCategory }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await SearchService.explore(selectedCategory);
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory]);

    return (
        <div className="bg-blue-50/50 p-6 rounded-3xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-xl font-serif">Current Listings:</h3>
                <span className="text-sm font-medium text-gray-500">{products.length} Items Found</span>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <span className="text-6xl mb-4">🔍</span>
                    <p className="font-medium">No livestock or products found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
