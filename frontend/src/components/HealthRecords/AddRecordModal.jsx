import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const AddRecordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        animalType: '',
        vaccineName: '',
        vaccinationDate: '',
        nextDueDate: '',
        doseNumber: '1st',
        status: 'Completed',
        attachment: null,
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                    <CloseIcon fontSize="small" />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Add New Record</h2>

                {/* Form Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Animal Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Animal Type</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 appearance-none bg-white text-gray-600 focus:border-green-500 focus:outline-none cursor-pointer"
                                value={formData.animalType}
                                onChange={(e) => setFormData({ ...formData, animalType: e.target.value })}
                            >
                                <option value="">Select Your Animal Type</option>
                                <option value="goat">Goat</option>
                                <option value="chicken">Chicken</option>
                                <option value="buffalo">Buffalo</option>
                                <option value="cow">Cow</option>
                            </select>
                            <KeyboardArrowDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Vaccine Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vaccine Name:</label>
                        <input
                            type="text"
                            placeholder="E.g., PPR Vaccine"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:border-green-500 focus:outline-none"
                            value={formData.vaccineName}
                            onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                        />
                    </div>

                    {/* Date Of Vaccination */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Of Vaccination:</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:border-green-500 focus:outline-none"
                            value={formData.vaccinationDate}
                            onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                        />
                    </div>

                    {/* Next Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Next Due Date:</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:border-green-500 focus:outline-none"
                            value={formData.nextDueDate}
                            onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Dose Number */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Dose Number:</label>
                    <div className="flex gap-3">
                        {['1st', '2nd', '3rd', 'Booster'].map(dose => (
                            <button
                                key={dose}
                                onClick={() => setFormData({ ...formData, doseNumber: dose })}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${formData.doseNumber === dose
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {dose}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Status:</label>
                    <div className="flex gap-3">
                        {['Completed', 'Assigned'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFormData({ ...formData, status })}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${formData.status === status
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* File Upload */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Attachment (Report):</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
                        <CloudUploadOutlinedIcon className="text-gray-400 mx-auto mb-3" sx={{ fontSize: 48 }} />
                        <p className="text-sm text-gray-600 mb-1">
                            Drag your file(s) or <span className="text-green-600 font-medium">browse</span>
                        </p>
                        <p className="text-xs text-gray-400">Max 10 MB files are allowed</p>
                        <p className="text-xs text-gray-400 mt-2">Only support .jpg, .png and .pdf and .pdf and zip files</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-colors"
                    >
                        Add
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-2xl transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRecordModal;
