import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();

    const [selectedPayment, setSelectedPayment] = useState('esewa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState('');

    const subtotal = getCartTotal();
    const platformFee = subtotal * 0.05;
    const total = subtotal + platformFee;

    const handlePayment = async () => {
        if (cartItems.length === 0) return;
        setIsProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/payments/process/',
                {
                    items: cartItems.map(i => ({ item_id: i.id, item_type: i.type, quantity: i.quantity, unit_price: i.price })),
                    amount: total,
                    payment_method: selectedPayment
                },
                { headers: { Authorization: `Token ${token}` } }
            );

            if (response.data.status === 'success') {
                setSuccessData(response.data);
                clearCart();
            }
        } catch (err) {
            setError('Payment failed to process. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Success screen
    if (successData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-[Poppins]">
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center max-w-md w-full">
                    <div className="text-green-500 mb-6 flex justify-center">
                        <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-500 mb-6 font-medium">Your investment order has been placed securely.</p>
                    <div className="bg-gray-50 p-4 rounded-xl mb-8 text-left border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                        <p className="font-mono font-bold text-gray-800">{successData.transaction_id}</p>
                    </div>
                    <button
                        onClick={() => navigate('/userdashboard')}
                        className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Empty cart
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-[Poppins]">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-sm w-full">
                    <ShoppingCartIcon sx={{ fontSize: 80 }} className="text-gray-200 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-400 mb-8">Add some livestock or products from the marketplace.</p>
                    <button
                        onClick={() => navigate('/buy-stocks')}
                        className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors"
                    >
                        Browse Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-[Poppins]">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors mb-6 font-medium"
                >
                    <KeyboardArrowLeftIcon /> Continue Shopping
                </button>

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Your Investment Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Cart Items + Payment */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* Cart Items List */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900 text-lg">{cartItems.length} Item{cartItems.length > 1 ? 's' : ''} in Cart</h2>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {cartItems.map(item => {
                                    const icon = item.category === 'chicken' ? '🐔' :
                                                 item.category === 'goat' ? '🐐' :
                                                 item.category === 'buffalo' ? '🐃' : '📦';
                                    return (
                                        <div key={item.id} className="p-5 flex items-center gap-4">
                                            {/* Thumbnail */}
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl">{icon}</span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 line-clamp-1 text-sm">{item.title}</p>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">{item.category}</p>
                                                <p className="text-green-700 font-bold mt-1">Rs. {Math.round(item.price).toLocaleString()}</p>
                                            </div>

                                            {/* Qty Controls */}
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5 border border-gray-100">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                    <RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />
                                                </button>
                                                <span className="font-bold text-gray-800 w-6 text-center text-sm">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, 1)} 
                                                    disabled={item.quantity >= (item.available_quantity || 1)}
                                                    className={`transition-colors ${item.quantity >= (item.available_quantity || 1) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-green-600'}`}
                                                >
                                                    <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                                                </button>
                                            </div>

                                            {/* Line Total */}
                                            <p className="font-bold text-gray-900 w-24 text-right text-sm shrink-0">
                                                Rs. {Math.round(item.price * item.quantity).toLocaleString()}
                                            </p>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-5">Payment Method</h2>
                            <div className="flex gap-4">
                                {['esewa', 'ips', 'card'].map(method => (
                                    <label key={method} className={`flex-1 flex justify-center items-center py-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPayment === method ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                                        <input type="radio" value={method} checked={selectedPayment === method} onChange={e => setSelectedPayment(e.target.value)} className="hidden" />
                                        <span className={`font-bold capitalize ${selectedPayment === method ? 'text-green-700' : 'text-gray-500'}`}>
                                            {method === 'ips' ? 'ConnectIPS' : method}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">{error}</div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-500 truncate max-w-[65%]">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
                                        <span className="font-semibold text-gray-800">Rs. {Math.round(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold text-gray-800">Rs. {Math.round(subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-xs">Platform Fee (5%)</span>
                                    <span className="font-bold text-gray-800">Rs. {Math.round(platformFee).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-2xl text-green-700">Rs. {Math.round(total).toLocaleString()}</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg ${isProcessing ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-green-700 text-white hover:bg-green-800 shadow-green-200'}`}
                            >
                                {isProcessing ? 'Processing...' : `Place Order • Rs. ${Math.round(total).toLocaleString()}`}
                            </button>

                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-semibold">
                                🛡️ Secure 256-bit Encryption
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
