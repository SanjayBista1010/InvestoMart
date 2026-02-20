import React, { useState, useEffect } from 'react';

const LegalDoc3 = () => {
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
        <div className="bg-white min-h-screen font-sans text-gray-900 selection:bg-amber-600 selection:text-white pb-24">
            {/* Reading Progress Bar */}
            <div className="fixed top-16 left-0 w-full h-1.5 z-[60] bg-gray-50">
                <div
                    className="h-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <header className="pt-32 pb-20 px-6 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-amber-600 mb-6">Transparency Report</p>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Cookie <span className="text-gray-300">Policy</span></h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl border-l-4 border-amber-600 pl-8 mt-12">
                        InvestoMart uses cookies and similar tracking technologies to track the activity on our Service and hold certain information to improve your experience.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="space-y-16">
                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight">Essential Cookies</h2>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
                            <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                These are necessary for the website to function. They include cookies that allow you to log in to secure areas of our website, use a shopping cart, or make use of e-billing services. Without these, the core trading engine cannot function.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight">Analytical & Performance Cookies</h2>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
                            <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                These allow us to recognize and count the number of visitors and to see how visitors move around our platform. This helps us to improve the way our platform works, for example, by ensuring that users are finding what they are looking for easily (market charts, livestock listings).
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black mb-8 tracking-tight">Security Cookies</h2>
                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 mb-6 font-bold text-amber-900/80">
                            <p className="text-lg leading-relaxed">
                                We utilize security cookies for authentication and anti-fraud measures. These help us prevent unauthorized access to your trading account and identify suspicious network activity in real-time.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black mb-6">Managing Cookies</h2>
                        <p className="text-lg text-gray-600 font-medium leading-relaxed">
                            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LegalDoc3;
