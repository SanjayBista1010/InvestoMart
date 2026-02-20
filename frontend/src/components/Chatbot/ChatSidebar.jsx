import React, { useState } from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const ChatSidebar = ({ chats, activeChat, onNewChat, onSelectChat, onDeleteChat }) => {
  const [hoveredChat, setHoveredChat] = useState(null);
  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col font-sans border-r border-gray-100">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-2">
        <AgricultureIcon className="text-green-700 text-3xl" fontSize="large" />
        <span className="text-xl font-bold text-green-700">GoatFarm</span>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
        >
          <AddIcon fontSize="small" />
          <span className="text-sm">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
            className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer transition-all ${activeChat === chat.id
              ? 'bg-green-100 border border-green-300'
              : 'hover:bg-green-50 border border-transparent'
              }`}
          >
            <div
              onClick={() => onSelectChat(chat.id)}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <ChatBubbleOutlineIcon
                className={activeChat === chat.id ? 'text-green-700' : 'text-green-600'}
                fontSize="small"
              />
              <span className={`text-sm font-medium truncate ${activeChat === chat.id ? 'text-green-800' : 'text-gray-700'
                }`}>
                {chat.title}
              </span>
            </div>

            {/* Delete Button - Show on hover if more than 1 chat */}
            {hoveredChat === chat.id && chats.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
                title="Delete chat"
              >
                <DeleteOutlineIcon fontSize="small" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-green-700 text-white m-4 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-green-800 transition-colors">
        <HeadsetMicIcon />
        <span className="font-semibold">TALK TO AN EXPERT</span>
      </div>
    </div>
  );
};

export default ChatSidebar;
