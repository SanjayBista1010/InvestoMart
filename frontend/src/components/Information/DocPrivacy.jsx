import React, { useState, useEffect } from 'react';

const LegalDoc2 = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(totalScroll > 0 ? (window.pageYOffset / totalScroll) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-blue-600 selection:text-white pb-24">
            {/* Reading Progress Bar */}
            <div className="fixed top-16 left-0 w-full h-1.5 z-[60] bg-gray-50">
                <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <header className="pt-32 pb-20 px-6 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-blue-600 mb-6">Data Sovereignty: Nepal</p>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Privacy <span className="text-gray-300">Policy</span></h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl border-l-4 border-blue-600 pl-8 mt-12">
                        We are committed to the <strong>Right to Privacy Act, 2075 (2018)</strong> and the Individual Privacy Protection mandates of Nepal.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="space-y-20">
                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">1. Information We Collect</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>InvestoMart collects only necessary data to facilitate agricultural trading and regulatory compliance:</p>
                            <ul className="list-disc pl-8 space-y-4">
                                <li><strong>Personal Identity:</strong> Full name, Citizenship/Passport details, and biometric facial data for KYC.</li>
                                <li><strong>Contact Data:</strong> Mobile number (Nepal-based), email address, and permanent residence as per the Citizenship Certificate.</li>
                                <li><strong>Financial Information:</strong> Bank account numbers, digital wallet IDs (eSewa/Khalti), and transaction history.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">2. Purpose of Collection</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>Data is used exclusively for:</p>
                            <ul className="list-disc pl-8 space-y-4">
                                <li>Authenticating livestock ownership and investment transfers.</li>
                                <li>Ensuring traceability of livestock to specific farmers for health assurance and quality control.</li>
                                <li>AI-driven market predictions and customized investment advice through our secure local infrastructure.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">3. Data Sharing & Disclosure</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>We do not sell, trade, or rent your personal identification information to third parties. Disclosure occurs only under:</p>
                            <ul className="list-disc pl-8 space-y-4 text-gray-700">
                                <li><strong>Regulatory Mandate:</strong> Requests from Nepal Rastra Bank, SEBON, or law enforcement agencies with a valid warrant.</li>
                                <li><strong>Service Delivery:</strong> Sharing bank details with payment relay gateways to facilitate your withdrawals.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">4. Security Measures</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>We implement enterprise-level <strong>AES-256 encryption</strong> for all sensitive data stored on our servers. Access to personal data is strictly limited to authorized InvestoMart compliance officers under non-disclosure agreements.</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LegalDoc2;
