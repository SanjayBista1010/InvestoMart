import React, { useState, useEffect } from 'react';

const LegalDoc1 = () => {
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
        <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white pb-24">
            {/* Reading Progress Bar */}
            <div className="fixed top-16 left-0 w-full h-1.5 z-[60] bg-gray-50">
                <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            {/* Hero Section */}
            <header className="pt-32 pb-20 px-6 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-400 mb-6">InvestoMart Legal Framework</p>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Terms of <span className="text-gray-400">Service</span></h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl border-l-4 border-black pl-8 mt-12">
                        This document constitutes a legally binding agreement under the <strong>Electronic Transactions Act, 2063 (2006)</strong> of Nepal.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="space-y-20">
                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">1. Scope of Services</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>InvestoMart (the "Platform") provides a digital marketplace for livestock trading, investment, and market analysis in Nepal. By accessing our platform, you signify your acceptance of these Terms.</p>
                            <p>We facilitate the connection between registered livestock farmers and investors but do not act as a traditional broker. Our role is strictly limited to providing the technological infrastructure and verification protocols.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">2. Mandatory KYC & AML Compliance</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>In adherence to the <strong>Assets (Money) Laundering Prevention Act, 2064</strong> of Nepal, all users must complete "Know Your Customer" (KYC) verification.</p>
                            <ul className="list-disc pl-8 space-y-4 text-gray-700">
                                <li><strong>Identity Verification:</strong> Users must provide a valid Citizenship Certificate, Passport, or National Identity Card.</li>
                                <li><strong>Source of Funds:</strong> For high-value transactions, the Platform reserves the right to request proof of funds to ensure legal compliance.</li>
                                <li><strong>Account Restrictions:</strong> Failure to provide accurate information will result in immediate suspension of withdrawal and trading capabilities.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">3. Livestock Quality & Disclaimers</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>InvestoMart provides digital inspection reports based on information provided by farmers. While we strive for accuracy, users acknowledge that:</p>
                            <ul className="list-disc pl-8 space-y-4">
                                <li>Livestock is a biological asset; health statuses can change rapidly.</li>
                                <li>The Platform does not guarantee specific yields or market prices.</li>
                                <li>Visual data (images/videos) are for reference and may vary from the actual physical asset at the time of delivery.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">4. Payments & Capital Gains</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>All financial transactions are governed by the <strong>Nepal Rastra Bank (NRB)</strong> guidelines for digital payments.</p>
                            <p>Users are responsible for reporting and paying all applicable taxes, including Capital Gains Tax on livestock investments, as per the prevailing tax laws of the Government of Nepal.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight border-b-2 border-gray-100 pb-4">5. Dispute Resolution & Jurisdiction</h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium">
                            <p>Any disputes arising from the use of this Platform shall first be attempted to be resolved through mutual negotiation or mediation.</p>
                            <p>If unresolved, the dispute shall be subject to the exclusive jurisdiction of the <strong>District Court of Kathmandu, Nepal</strong>, and governed by the laws of Nepal.</p>
                        </div>
                    </section>
                </div>

                {/* Closing Tag */}
                <div className="mt-40 pt-16 border-t border-gray-100 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Agreement Acknowledgement</p>
                    <p className="text-gray-500 font-medium">By continuing to use this platform, you acknowledge you have read and understood these terms in full.</p>
                </div>
            </main>
        </div>
    );
};

export default LegalDoc1;
