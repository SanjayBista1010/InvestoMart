import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const KYCFormPage = () => {
    const { token, user, checkAuth } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        citizenship_no: '',
        pan_no: '',
        temp_address: '',
        perm_address: ''
    });

    // File States
    const [files, setFiles] = useState({
        citizenshipFront: null,
        citizenshipBack: null,
        pan: null
    });

    const [uploading, setUploading] = useState(false);

    if (user?.kyc_status === 'verified') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
                    <CheckCircleOutlineIcon className="text-green-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verified</h2>
                    <p className="text-gray-500 mb-6">Your identity has been fully verified. You have unrestricted access to trade on InvestoMart.</p>
                    <button onClick={() => navigate('/buy')} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
                        Start Trading
                    </button>
                </div>
            </div>
        );
    }

    if (user?.kyc_status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
                    <span className="text-5xl mb-4 block">⏳</span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Pending</h2>
                    <p className="text-gray-500 mb-6">Your KYC documents have been submitted and are currently in the queue for Admin approval. We will notify you once verified.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        if (e.target.files[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        }
    };

    const uploadImageToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await axios.post('http://localhost:8000/api/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.data.url) throw new Error('Failed to get Cloudinary URL');
        return res.data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validation
        if (!files.citizenshipFront || !files.citizenshipBack || !files.pan) {
            setError('Please upload all required documents.');
            return;
        }

        setLoading(true);
        setUploading(true);

        try {
            // 1. Upload Images
            const frontUrl = await uploadImageToCloudinary(files.citizenshipFront);
            const backUrl = await uploadImageToCloudinary(files.citizenshipBack);
            const panUrl = await uploadImageToCloudinary(files.pan);

            // 2. Submit Payload to Django
            const payload = {
                ...formData,
                citizenship_front_url: frontUrl,
                citizenship_back_url: backUrl,
                pan_url: panUrl
            };

            await axios.post('http://localhost:8000/api/kyc/submit/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 3. Refresh Auth Context
            await checkAuth();

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to submit KYC.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Identity Verification (KYC)</h1>
                    <p className="mt-2 text-gray-500">Government regulations require us to verify your identity before you can invest or sell on InvestoMart.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <form onSubmit={handleSubmit} className="p-8">

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Personal Docs */}
                        <div className={step === 1 ? 'block' : 'hidden'}>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Government ID Details</h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Citizenship Number</label>
                                    <input
                                        type="text" name="citizenship_no" required
                                        value={formData.citizenship_no} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="e.g. 27-01-79-12345"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">PAN Number</label>
                                    <input
                                        type="text" name="pan_no" required
                                        value={formData.pan_no} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="e.g. 123456789"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!formData.citizenship_no || !formData.pan_no}
                                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Address */}
                        <div className={step === 2 ? 'block' : 'hidden'}>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Address Details</h3>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Permanent Address (As in Citizenship)</label>
                                    <input
                                        type="text" name="perm_address" required
                                        value={formData.perm_address} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g. Pokhara-15, Kaski"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Temporary Address (Current)</label>
                                    <input
                                        type="text" name="temp_address" required
                                        value={formData.temp_address} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g. Baneshwor, Kathmandu"
                                    />
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button type="button" onClick={() => setStep(1)} className="text-gray-500 font-medium px-4 hover:bg-gray-50 rounded-lg">Back</button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.perm_address || !formData.temp_address}
                                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Document Uploads */}
                        <div className={step === 3 ? 'block' : 'hidden'}>
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Documents</h3>
                            <p className="text-sm text-gray-500 mb-6">Please upload clear, legible photos of your documents.</p>

                            <div className="space-y-6">
                                {/* Citizenship Front */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Citizenship (Front)</label>
                                    <label className="flex items-center justify-center w-full min-h-[120px] px-4 py-6 bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <FileUploadIcon className="mb-2" />
                                            <span className="text-sm font-medium">{files.citizenshipFront ? files.citizenshipFront.name : 'Click to select file'}</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'citizenshipFront')} />
                                    </label>
                                </div>

                                {/* Citizenship Back */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Citizenship (Back)</label>
                                    <label className="flex items-center justify-center w-full min-h-[120px] px-4 py-6 bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <FileUploadIcon className="mb-2" />
                                            <span className="text-sm font-medium">{files.citizenshipBack ? files.citizenshipBack.name : 'Click to select file'}</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'citizenshipBack')} />
                                    </label>
                                </div>

                                {/* PAN Card */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">PAN Card</label>
                                    <label className="flex items-center justify-center w-full min-h-[120px] px-4 py-6 bg-gray-50 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors">
                                        <div className="flex flex-col items-center">
                                            <FileUploadIcon className="mb-2" />
                                            <span className="text-sm font-medium">{files.pan ? files.pan.name : 'Click to select file'}</span>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                                    </label>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <button type="button" disabled={loading} onClick={() => setStep(2)} className="text-gray-500 font-medium px-4 hover:bg-gray-50 rounded-lg py-2">Back</button>
                                    <button
                                        type="submit"
                                        disabled={loading || !files.citizenshipFront || !files.citizenshipBack || !files.pan}
                                        className="bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-700 shadow-md shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                                    >
                                        {uploading ? 'Processing Documents...' : loading ? 'Submitting...' : 'Submit KYC'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center gap-3 mt-8">
                    {[1, 2, 3].map(st => (
                        <div key={st} className={`h-2.5 rounded-full transition-all duration-300 ${step === st ? 'w-10 bg-green-600' : 'w-2.5 bg-gray-300'}`} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default KYCFormPage;
