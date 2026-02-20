import React from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const CameraCard = ({ name, timestamp, image }) => (
    <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-900 h-48 group cursor-pointer">
        {/* Placeholder Image/Video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700">
            {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover opacity-80" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <span className="text-4xl">📹</span>
                </div>
            )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                <FiberManualRecordIcon sx={{ fontSize: 8 }} className="animate-pulse" />
                <span>Live</span>
            </div>
            <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                🔒
            </div>
        </div>

        {/* More Options */}
        <div className="absolute top-3 right-3">
            <MoreHorizIcon className="text-white cursor-pointer hover:bg-white/20 rounded-full p-1" />
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-sm drop-shadow-lg">{name}</p>
            <p className="text-white/80 text-xs drop-shadow-md">{timestamp}</p>
        </div>
    </div>
);

const CameraGrid = () => {
    return (
        <div className="flex-1 pr-6">
            {/* Chicken Coop */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4">Chicken Coop Camera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CameraCard name="Coop Camera 1" timestamp="15-05-2024, 12:19:40 PM" />
                    <CameraCard name="Coop Camera 2" timestamp="15-05-2024, 12:19:40 PM" />
                </div>
            </div>

            {/* Goat Pen */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4">Goat Pen Camera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CameraCard name="Coop Camera 1" timestamp="15-05-2024, 12:19:40 PM" />
                    <CameraCard name="Coop Camera 2" timestamp="15-05-2024, 12:19:40 PM" />
                </div>
            </div>

            {/* Buffalo Shed */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4">Buffalo Shed Camera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CameraCard name="Coop Camera 1" timestamp="15-05-2024, 12:19:40 PM" />
                    <CameraCard name="Coop Camera 2" timestamp="15-05-2024, 12:19:40 PM" />
                </div>
            </div>
        </div>
    );
};

export default CameraGrid;
