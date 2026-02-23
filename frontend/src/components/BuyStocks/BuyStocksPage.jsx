import React from 'react';
import DashboardSidebar from '../UserDashboard/DashboardSidebar'; // Reusing existing sidebar
import DashboardHeader from '../UserDashboard/DashboardHeader'; // Reusing header
import StockCategories from './StockCategories';
import ProductGrid from './ProductGrid';
import CheckoutSidebar from './CheckoutSidebar';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const BuyStocksPage = () => {
    const [selectedCategory, setSelectedCategory] = React.useState('All');

    return (
        <div className="flex min-h-screen bg-gray-50 font-[Poppins]">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content */}
            <div className="flex-1 ml-20 p-6 md:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    {/* Breadcrumb / minimal header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Dashboard</span>
                            <KeyboardArrowRightIcon fontSize="small" />
                            <span className="font-bold text-gray-800">Buy Live Stocks</span>
                        </div>
                        <DashboardHeader />
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Categories and Products (Span 2) */}
                        <div className="lg:col-span-2">
                            <StockCategories 
                                selectedCategory={selectedCategory} 
                                onSelectCategory={setSelectedCategory} 
                            />
                            <ProductGrid selectedCategory={selectedCategory} />
                        </div>

                        {/* Right Column: Checkout Cart (Span 1) */}
                        <div className="lg:col-span-1">
                            <CheckoutSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyStocksPage;
