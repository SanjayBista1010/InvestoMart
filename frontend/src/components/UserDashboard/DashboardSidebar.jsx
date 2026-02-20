import React from 'react';
import { Link } from 'react-router-dom';
import GridViewIcon from '@mui/icons-material/GridView';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'; // Or similar for support
import SpeedIcon from '@mui/icons-material/Speed';
import PermMediaIcon from '@mui/icons-material/PermMedia'; // Media/Video
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AgricultureIcon from '@mui/icons-material/Agriculture'; // Logo placeholder

const SidebarItem = ({ icon, label, active }) => (
    <div className={`group relative p-3 rounded-xl cursor-pointer transition-colors mb-4 flex items-center justify-center ${active ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
        {icon}
        {label && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {label}
            </div>
        )}
    </div>
);

const DashboardSidebar = () => {
    return (
        <div className="w-20 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col items-center py-6 z-20">
            {/* Logo */}
            <div className="mb-10 text-green-700">
                <AgricultureIcon fontSize="large" />
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col w-full px-4 items-center">
                <Link to="/">
                    <SidebarItem icon={<GridViewIcon />} label="Dashboard" active />
                </Link>
                <Link to="/chatbot">
                    <SidebarItem icon={<HeadsetMicIcon />} label="Chatbot Support" />
                </Link>
                <Link to="/health-records">
                    <SidebarItem icon={<SpeedIcon />} label="Health Records" />
                </Link>
                <Link to="/surveillance">
                    <SidebarItem icon={<PermMediaIcon />} label="Surveillance" />
                </Link>
                <Link to="/profile">
                    <SidebarItem icon={<PersonOutlineIcon />} label="Profile" />
                </Link>
            </div>

            {/* Bottom Items */}
            <div className="pb-4 w-full px-4 items-center flex flex-col">
                <Link to="/settings">
                    <SidebarItem icon={<SettingsOutlinedIcon />} label="Settings" />
                </Link>
                <SidebarItem icon={<InfoOutlinedIcon />} label="Information" />
            </div>
        </div>
    );
};

export default DashboardSidebar;
