import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const EmailVerificationPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided in the URL.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await axios.post('http://localhost:8000/api/auth/verify-email/', { token });
                setStatus('success');
                setMessage(res.data.message || 'Your email has been successfully verified!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link might be expired or invalid.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-6"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                        <p className="text-gray-500">Please wait while we verify your account securely...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <CheckCircleOutlineIcon className="text-green-500 text-7xl mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                        <p className="text-gray-500 mb-8">{message}</p>

                        <div className="w-full space-y-3">
                            <button onClick={() => navigate('/kyc')} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">
                                Complete KYC Now
                            </button>
                            <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <ErrorOutlineIcon className="text-red-500 text-7xl mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-8">{message}</p>

                        <Link to="/login" className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-300 block">
                            Return to Login
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmailVerificationPage;
