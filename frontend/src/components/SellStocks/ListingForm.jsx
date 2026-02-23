import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListingForm = ({ onSuccess, editingProduct, onClearEdit, showToast }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        quantity: '',
        current_weight: '',
        base_price: '',
        farm_id: '',
        location: '',
    });
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!editingProduct;

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                category: editingProduct.category || '',
                quantity: editingProduct.quantity || '',
                current_weight: editingProduct.current_weight || '',
                base_price: editingProduct.base_price || '',
                farm_id: editingProduct.farm_id || '',
                location: editingProduct.location || '',
            });
            setImageUrl(editingProduct.image_url || '');
        } else {
            setFormData({
                category: '',
                quantity: '',
                current_weight: '',
                base_price: '',
                farm_id: '',
                location: '',
            });
            setImageUrl('');
            setImage(null);
        }
    }, [editingProduct]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImage(file);
        setUploading(true);
        setError('');

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/upload/', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImageUrl(response.data.url);
            if (showToast) showToast('Image uploaded successfully!');
        } catch (err) {
            console.error(err);
            setError('Failed to upload image');
            if (showToast) showToast('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.category || !formData.base_price) {
            setError('Please fill in required fields (Category, Price)');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to manage listings.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const payload = {
                ...formData,
                image_url: imageUrl,
                currency: 'NPR',
            };

            if (isEditMode) {
                await axios.put(`http://localhost:8000/api/products/update/${editingProduct.product_id}/`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (showToast) showToast('Listing updated successfully!');
                if (onClearEdit) onClearEdit();
            } else {
                await axios.post('http://localhost:8000/api/products/create/', payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (showToast) showToast('Listing created successfully!');
            }

            if (onSuccess) onSuccess();

            if (!isEditMode) {
                setFormData({ category: '', quantity: '', current_weight: '', base_price: '', farm_id: '', location: '' });
                setImage(null);
                setImageUrl('');
            }

        } catch (err) {
            console.error("Listing operation failed:", err);
            let errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Operation failed. Please try again.';

            if (err.response?.data?.details) {
                const details = err.response.data.details;
                const detailMessages = Object.entries(details).map(([key, val]) => `${key}: ${val}`).join(', ');
                errorMessage += ` (${detailMessages})`;
            }

            setError(errorMessage);
            if (showToast) showToast(errorMessage, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onClearEdit) onClearEdit();
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-50 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Edit Product Listing' : 'List Your Live Stock for Sell'}
            </h3>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Select Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    >
                        <option value="">Select an animal</option>
                        <option value="Goat">Goat</option>
                        <option value="Chicken">Chicken</option>
                        <option value="Cow">Cow</option>
                        <option value="Sheep">Sheep</option>
                        <option value="Buffalo">Buffalo</option>
                    </select>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Total Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="Enter quantity"
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                </div>

                {/* Weight */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Approx Weight (Optional)</label>
                    <input
                        type="text"
                        name="current_weight"
                        value={formData.current_weight}
                        onChange={handleChange}
                        placeholder="e.g. 25kg or 200kg total"
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                </div>

                {/* Asking Price */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Asking Price (NPR)</label>
                    <input
                        type="number"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleChange}
                        placeholder="Enter total asking price"
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                </div>

                {/* Farm Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Farm Name (Optional)</label>
                    <input
                        type="text"
                        name="farm_id"
                        value={formData.farm_id}
                        onChange={handleChange}
                        placeholder="e.g. Green Valley Farm"
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                </div>

                {/* Farm Location */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Farm Location (Optional)</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Chitwan, Nepal"
                        className="p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Product Image</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center w-full min-h-[120px] transition-all">
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            {uploading ? (
                                <span className="text-sm text-gray-500">Uploading to Cloudinary...</span>
                            ) : imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-lg shadow-sm" />
                            ) : (
                                <>
                                    <span className="text-gray-400">Click to upload or drag & drop</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || uploading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                >
                    {submitting ? 'PROCESSING...' : isEditMode ? 'UPDATE LISTING' : 'LIST FOR SELL'}
                </button>
                {isEditMode && (
                    <button
                        onClick={handleCancel}
                        className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                    >
                        CANCEL
                    </button>
                )}
            </div>
        </div>
    );
};

export default ListingForm;
