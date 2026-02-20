import React from 'react';

const alerts = [
    { id: 1, text: '5 Chickens due for NDV vaccine this week.', icon: '•' },
    { id: 2, text: '2 Goats overdue for PPR vaccine (by 10 days).', icon: '•' },
    { id: 3, text: '100% Buffalo stock up-to-date with vaccinations.', icon: '•' },
    { id: 4, text: '3 Cows scheduled for Brucellosis testing next month.', icon: '•' },
    { id: 5, text: '1 Sheep requiring foot-and-mouth disease vaccine.', icon: '•' },
    { id: 6, text: '50% of Horses received their annual deworming treatment.', icon: '•' },
    { id: 7, text: '4 Pigs need follow-up vaccinations for Porcine Epidemic Diarrhea.', icon: '•' },
];

const AlertsSidebar = () => {
    return (
        <div className="w-80 bg-white rounded-3xl shadow-sm border border-gray-50 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">Alerts & Insights:</h3>
                <button className="text-xs text-green-600 font-bold hover:underline">
                    Read All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3 hover:bg-green-100 transition-colors cursor-pointer"
                    >
                        <span className="text-green-600 font-bold text-xl leading-none mt-1">{alert.icon}</span>
                        <p className="text-xs text-gray-700 leading-relaxed flex-1">{alert.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsSidebar;
