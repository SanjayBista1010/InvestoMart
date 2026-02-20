import React, { useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddRecordModal from './AddRecordModal';

const vaccinations = [
    { name: 'PPR Vaccine', date: '12 Mar 25', status: 'COMPLETED', statusColor: 'bg-green-500' },
    { name: 'Foot & Mouth', date: '03 Jan 25', status: 'COMPLETED', statusColor: 'bg-green-500' },
    { name: 'Deworming', date: '15 Dec 24', status: 'DUE SOON', statusColor: 'bg-orange-400' },
];

const AnimalDetailsCard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <AddRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <div className="flex-1 bg-gradient-to-br from-orange-200 to-orange-100 rounded-3xl shadow-sm border border-orange-100 p-8">
                {/* Animal Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-6xl">🐐</div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Animal: Goat #G102</h2>
                            <p className="text-sm text-gray-600">Age: 2 yrs, Male</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Breed:</p>
                            <p className="text-sm font-bold text-gray-800">Boer Goat</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Weight:</p>
                            <p className="text-sm font-bold text-gray-800">45 kg</p>
                        </div>
                    </div>
                </div>

                {/* Vaccination History */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">Vaccination History</h3>
                    <div className="space-y-3">
                        {vaccinations.map((vac, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${vac.statusColor}`}></div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{vac.name}</p>
                                        <p className="text-xs text-gray-500">- {vac.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${vac.statusColor}`}>
                                        {vac.status}
                                    </span>
                                    <CheckCircleIcon fontSize="small" className="text-green-600" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Next Due */}
                    <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-xs text-orange-700">
                            <span className="font-bold">Next Due:</span> Deworming - <span className="font-bold">20 Mar 25</span>
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-colors shadow-lg shadow-green-200"
                    >
                        Add New Record
                    </button>
                    <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl transition-colors shadow-sm border border-gray-200">
                        Download Report PDF
                    </button>
                </div>
            </div>
        </>
    );
};

export default AnimalDetailsCard;
