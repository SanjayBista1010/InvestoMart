import React, { useState } from 'react';

const animals = [
    { id: 'G102', name: 'Goat #G102', icon: '🐐', bgColor: 'bg-orange-200', textColor: 'text-orange-800' },
    { id: 'C304', name: 'Chicken #C304', icon: '🐔', bgColor: 'bg-blue-200', textColor: 'text-blue-800' },
    { id: 'B210', name: 'Buffalo #B210', icon: '🐃', bgColor: 'bg-pink-200', textColor: 'text-pink-800' },
    { id: 'C305', name: 'Chicken #C305', icon: '🐔', bgColor: 'bg-blue-200', textColor: 'text-blue-800' },
];

const AnimalList = ({ onSelectAnimal }) => {
    const [selectedId, setSelectedId] = useState('G102');

    const handleSelect = (animal) => {
        setSelectedId(animal.id);
        if (onSelectAnimal) {
            onSelectAnimal(animal);
        }
    };

    return (
        <div className="w-64 bg-white rounded-3xl shadow-sm border border-gray-50 p-6">
            <h3 className="font-bold text-gray-800 mb-6">Animal List</h3>
            <div className="space-y-3">
                {animals.map(animal => (
                    <div
                        key={animal.id}
                        onClick={() => handleSelect(animal)}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedId === animal.id
                                ? `${animal.bgColor} ${animal.textColor} shadow-md`
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-2xl">{animal.icon}</span>
                        <span className="font-bold text-sm">{animal.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnimalList;
