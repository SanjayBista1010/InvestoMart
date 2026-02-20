import React from 'react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const feedItems = [
    { id: 1, title: 'Chicken Coop Camera 1', location: 'Chicken Coop', date: 'Mon, 09', time: '04:30 PM' },
    { id: 2, title: 'Beef Wellington Deluxe', location: 'Steak Delight', date: 'Thu, 10', time: '11:30 PM' },
    { id: 3, title: 'Vegetarian Stir-Fry', location: 'Veggie Corner', date: 'Fri, 11', time: '09:45 AM' },
    { id: 4, title: 'Lamb Kebab Fiesta', location: 'Grill Station', date: 'Sat, 12', time: '01:30 PM' },
    { id: 5, title: 'Pork Belly Extravaganza', location: 'Butcher Box', date: 'Sun, 13', time: '06:15 PM' },
    { id: 6, title: 'Seafood Paella', location: 'Shore Delicacies', date: 'Mon, 14', time: '08:00 PM' },
];

const FeedSidebar = () => {
    return (
        <div className="w-80 bg-white rounded-3xl shadow-sm border border-gray-50 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">Feed</h3>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold hover:bg-green-700 transition-colors">
                        Wed<br />15
                    </button>
                    <FullscreenIcon fontSize="small" className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 mb-6 text-center text-xs">
                {['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((day, i) => (
                    <div key={day}>
                        <p className="text-gray-400 font-medium mb-1">{day}</p>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${i === 6 ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                            } cursor-pointer transition-colors`}>
                            {9 + i}
                        </div>
                    </div>
                ))}
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {feedItems.map(item => (
                    <div key={item.id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-700 to-gray-500 flex-shrink-0 overflow-hidden">
                            {/* Placeholder thumbnail */}
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                📹
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.location}</p>
                            <p className="text-xs text-gray-400">{item.date} · {item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedSidebar;
