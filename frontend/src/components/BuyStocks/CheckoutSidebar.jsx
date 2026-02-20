import React from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

const CartItem = ({ name, qty, price, icon, bgColor, onRemove }) => (
    <div className={`p-3 rounded-xl mb-3 flex items-center justify-between group ${bgColor}`}>
        <div className="flex items-center gap-3">
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="font-bold text-sm text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{qty} pcs</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-sm text-xs font-bold text-blue-600">
                <RemoveCircleOutlineIcon sx={{ fontSize: 16 }} className="cursor-pointer hover:text-blue-800" />
                <span className="mx-2">{qty}</span>
                <AddCircleOutlineIcon sx={{ fontSize: 16 }} className="cursor-pointer hover:text-blue-800" />
            </div>
            <button onClick={onRemove} className="text-red-400 hover:text-red-600">
                <CloseIcon fontSize="small" />
            </button>
        </div>
    </div>
);

const CheckoutSidebar = () => {
    return (
        <div className="bg-white p-6 rounded-3xl h-full flex flex-col">
            <h3 className="font-serif font-bold text-xl text-gray-800 mb-6">Checkout Cart</h3>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto mb-6">
                <CartItem
                    name="Local Chicken (Adult)"
                    qty={230}
                    icon="🐔"
                    bgColor="bg-blue-50"
                />
                <CartItem
                    name="Local Chicken Chicks"
                    qty={450}
                    icon="🐣"
                    bgColor="bg-blue-50"
                />
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-xs">
                    <div className="text-gray-600">
                        <p>Local Chicken (Adult)</p>
                        <p className="text-[10px] text-gray-400">230 pcs x 260</p>
                    </div>
                    <p className="font-bold text-gray-800">NPR 59,800</p>
                </div>
                <div className="flex justify-between text-xs">
                    <div className="text-gray-600">
                        <p>Local Chicken Chicks</p>
                        <p className="text-[10px] text-gray-400">450 pcs x 85</p>
                    </div>
                    <p className="font-bold text-gray-800">NPR 38,250</p>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                    <p className="font-bold text-gray-800">Total:</p>
                    <p className="font-bold text-xl text-gray-900">NPR 98,050</p>
                </div>
                <p className="text-[10px] text-green-600 flex items-center gap-1">
                    ℹ The total price does not include delivery charges.
                </p>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-800 mb-3">Payment Method</h4>
                <div className="flex gap-2">
                    <div className="border border-green-500 bg-green-50 px-3 py-2 rounded-lg cursor-pointer">
                        <span className="font-bold text-green-700 text-sm">eSewa</span>
                    </div>
                    <div className="border border-gray-200 bg-white px-3 py-2 rounded-lg cursor-pointer text-gray-400 text-sm">
                        IPS
                    </div>
                    <div className="border border-gray-200 bg-white px-3 py-2 rounded-lg cursor-pointer text-gray-400 text-sm">
                        BANK
                    </div>
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
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                        </div>
                        <span className="font-medium text-gray-500">Home Delivery</span>
                    </label>
                </div>
            </div>

            <button className="w-full bg-green-700 text-white font-bold py-3 rounded-full hover:bg-green-800 transition-colors shadow-lg shadow-green-200">
                PLACE ORDER
            </button>
        </div>
    );
};

export default CheckoutSidebar;
