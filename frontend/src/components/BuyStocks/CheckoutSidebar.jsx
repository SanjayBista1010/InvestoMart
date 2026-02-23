import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
    const icon = item.category === 'chicken' ? '🐔' :
                 item.category === 'goat' ? '🐐' :
                 item.category === 'buffalo' ? '🐃' : '📦';
                 
    const bgColor = item.category === 'chicken' ? 'bg-blue-50' :
                    item.category === 'goat' ? 'bg-orange-50' :
                    item.category === 'buffalo' ? 'bg-pink-50' : 'bg-gray-50';

    return (
        <div className={`p-3 rounded-xl mb-3 flex items-center justify-between group ${bgColor}`}>
            <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div>
                    <p className="font-bold text-sm text-gray-800 line-clamp-1" title={item.title}>{item.title}</p>
                    <p className="text-xs text-gray-500">{item.quantity} {item.type === 'product' ? 'units' : 'pcs'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-sm text-xs font-bold text-blue-600">
                    <RemoveCircleOutlineIcon 
                        onClick={() => updateQuantity(item.id, -1)} 
                        sx={{ fontSize: 16 }} 
                        className="cursor-pointer hover:text-blue-800" 
                    />
                    <span className="mx-2">{item.quantity}</span>
                    <AddCircleOutlineIcon 
                        onClick={() => updateQuantity(item.id, 1)} 
                        sx={{ fontSize: 16 }} 
                        className={`transition-colors ${item.quantity >= (item.available_quantity || 1) ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:text-blue-800'}`}
                    />
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <CloseIcon fontSize="small" />
                </button>
            </div>
        </div>
    );
};

const CheckoutSidebar = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const [selectedPayment, setSelectedPayment] = useState('esewa');

    const subtotal = getCartTotal();
    const platformFee = subtotal * 0.05;
    const total = subtotal + platformFee;

    // Handle Empty Cart
    if (cartItems.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl h-full flex flex-col justify-center items-center text-center">
                <ShoppingCartIcon sx={{ fontSize: 60 }} className="text-gray-200 mb-4" />
                <h3 className="font-serif font-bold text-xl text-gray-800 mb-2">Cart is empty</h3>
                <p className="text-gray-400 text-sm mb-6">Add livestock or products to start investing.</p>
                <button 
                    onClick={() => {}} // Could potentially close sidebar or focus catalog
                    className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-full cursor-not-allowed"
                >
                    PLACE ORDER
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl h-full flex flex-col">
            <h3 className="font-serif font-bold text-xl text-gray-800 mb-6">Checkout Cart</h3>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cartItems.map(item => (
                    <CartItem 
                        key={item.id} 
                        item={item} 
                        updateQuantity={updateQuantity} 
                        removeFromCart={removeFromCart} 
                    />
                ))}
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
                {cartItems.map(item => (
                    <div key={`price-${item.id}`} className="flex justify-between text-xs">
                        <div className="text-gray-600 max-w-[65%]">
                            <p className="truncate" title={item.title}>{item.title}</p>
                            <p className="text-[10px] text-gray-400">{item.quantity} x {Math.round(item.price).toLocaleString()}</p>
                        </div>
                        <p className="font-bold text-gray-800 shrink-0">NPR {Math.round(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                ))}
                
                <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                    <p className="text-gray-600">Platform Fee (5%)</p>
                    <p className="font-bold text-gray-800">NPR {Math.round(platformFee).toLocaleString()}</p>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-100 items-end">
                    <p className="font-bold text-gray-800">Total:</p>
                    <p className="font-bold text-xl text-green-700">NPR {Math.round(total).toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                    ℹ The total price does not include delivery charges.
                </p>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-800 mb-3">Payment Method</h4>
                <div className="flex gap-2">
                    {['esewa', 'ips', 'bank'].map(method => (
                        <div 
                            key={method}
                            onClick={() => setSelectedPayment(method)}
                            className={`flex-1 border px-3 py-2 rounded-lg cursor-pointer text-center text-sm transition-colors ${
                                selectedPayment === method 
                                ? 'border-green-500 bg-green-50 font-bold text-green-700' 
                                : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            {method === 'ips' ? 'IPS' : method.toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>

            {/* Delivery Options */}
            <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-800 mb-3">Delivery Options</h4>
                <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-4 bg-green-600 rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                        </div>
                        <span className="font-bold text-gray-700">Pick-up</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                        <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                        <span className="font-medium text-gray-500">Home Delivery</span>
                    </label>
                </div>
            </div>

            <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-700 text-white font-bold py-3 rounded-full hover:bg-green-800 transition-colors shadow-lg shadow-green-200"
            >
                PROCESS AT CHECKOUT
            </button>
        </div>
    );
};

export default CheckoutSidebar;
