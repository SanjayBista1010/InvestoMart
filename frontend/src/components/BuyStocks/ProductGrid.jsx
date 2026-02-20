import React from 'react';

const products = [
    {
        id: 1,
        type: 'Local Chicken (Adult)',
        age: '6 Months',
        weight: '1.5 - 2.5 kg',
        health: 'Vaccinated',
        use: 'Meat / breeding',
        price: 'NPR 260/head',
        image: '🐔', // Placeholder
        bgColor: 'bg-blue-50',
    },
    {
        id: 2,
        type: 'Local Chicken Chicks',
        age: '1 - 4 weeks',
        weight: '50 - 200 g',
        health: 'Vaccinated',
        use: 'Poultry farm growth',
        price: 'NPR 85/chick',
        image: '🐣', // Placeholder
        bgColor: 'bg-yellow-50',
    },
    {
        id: 3,
        type: 'Ready-to-Sell Local Chicken',
        age: '5 - 6 months',
        weight: '2 - 3 kg',
        health: 'Vaccinated',
        use: 'Meat/wholesale',
        price: 'NPR 380/kg',
        image: '🐓', // Placeholder
        bgColor: 'bg-blue-50',
    }
];

const ProductCard = ({ product }) => (
    <div className={`rounded-xl p-4 flex flex-col md:flex-row gap-4 relative ${product.bgColor} border border-white shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-sm mb-1">Animal Type & Breed :</h3>
            <p className="font-bold text-gray-900 mb-4">{product.type}</p>

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
                        ✅ {product.health}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500 block">Use Case :</span>
                    <span className="font-semibold text-gray-800">{product.use}</span>
                </div>
            </div>

            <div className="mt-2">
                <span className="text-gray-500 text-xs block">Price per head :</span>
                <span className="font-bold text-gray-900 text-base">{product.price}</span>
            </div>
        </div>

        <div className="flex flex-col justify-between items-center w-full md:w-32">
            <div className="text-6xl mb-4 transform hover:scale-110 transition-transform cursor-pointer">
                {product.image}
            </div>
            <button className="bg-blue-600 text-white text-xs font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Add to Cart
            </button>
        </div>
    </div>
);

const ProductGrid = () => {
    return (
        <div className="bg-blue-50/50 p-6 rounded-3xl">
            <h3 className="font-bold text-gray-800 text-xl mb-6 font-serif">Subcategories:</h3>
            <div className="grid grid-cols-1 gap-6">
                {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;
