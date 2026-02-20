import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ChatbotPage = () => {
    const { user, openDrawer } = useAuth();
    const [chats, setChats] = useState([
        { id: 'initial', title: 'New chat', messages: [], sessionId: null }
    ]);
    const [activeChat, setActiveChat] = useState('initial');

    // Fetch sessions if user is logged in
    useEffect(() => {
        const fetchSessions = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('/api/chatbot/sessions/', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (response.data.sessions && response.data.sessions.length > 0) {
                    const formattedSessions = response.data.sessions.map(s => ({
                        id: s.session_id,
                        title: s.title,
                        messages: [], // Load on demand
                        sessionId: s.session_id,
                        isHydrated: false
                    }));

                    setChats(prev => {
                        const activeNewChats = prev.filter(c => c.id.startsWith('new_') && c.messages.length > 0);
                        return [...formattedSessions, ...activeNewChats];
                    });

                    if (activeChat === 'initial') {
                        setActiveChat(formattedSessions[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch chat sessions:", err);
            }
        };

        if (user) {
            fetchSessions();
        } else {
            setChats([{ id: 'initial', title: 'New chat', messages: [], sessionId: null }]);
            setActiveChat('initial');
        }
    }, [user]);

    const handleNewChat = () => {
        const newId = `new_${Date.now()}`;
        const newChat = { id: newId, title: 'New chat', messages: [], sessionId: null, isHydrated: true };
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newId);
    };

    const handleSelectChat = async (chatId) => {
        setActiveChat(chatId);

        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.sessionId && !chat.isHydrated) {
            const token = localStorage.getItem('token');
            try {
                console.log(`[Hydration] Loading messages for session: ${chat.sessionId}`);
                const response = await axios.get(`/api/chatbot/sessions/${chat.sessionId}/messages/`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                setChats(prev => prev.map(c =>
                    c.id === chatId ? { ...c, messages: response.data.messages, isHydrated: true } : c
                ));
            } catch (err) {
                console.error("Failed to load session messages:", err);
            }
        }
    };

    // Auto-hydrate messages when activeChat changes (e.g., on initial load)
    useEffect(() => {
        const active = chats.find(c => c.id === activeChat);
        if (active && active.sessionId && !active.isHydrated) {
            handleSelectChat(activeChat);
        }
    }, [activeChat, chats.length]); // Dependencies to catch changes

    const handleDeleteChat = (chatId) => {
        if (chats.length === 1 && chatId === 'initial') return;

        setChats(prev => {
            const filtered = prev.filter(chat => chat.id !== chatId);
            if (filtered.length === 0) {
                return [{ id: 'initial', title: 'New chat', messages: [], sessionId: null }];
            }
            return filtered;
        });

        if (chatId === activeChat) {
            const remaining = chats.filter(c => c.id !== chatId);
            setActiveChat(remaining[0]?.id || 'initial');
        }
    };

    const updateChatTitle = (chatId, newTitle) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
        ));
    };

    const updateChatMessages = (chatId, messages, sessionId = null) => {
        setChats(prev => prev.map(chat =>
            chat.id === chatId
                ? { ...chat, messages, sessionId: sessionId || chat.sessionId, isHydrated: true }
                : chat
        ));
    };

    const currentChat = chats.find(c => c.id === activeChat) || chats[0];

    return (
        <div className="flex h-screen bg-white overflow-hidden relative">
            <ChatSidebar
                chats={chats}
                activeChat={activeChat}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
            />
            <ChatArea
                chat={currentChat}
                onUpdateTitle={updateChatTitle}
                onUpdateMessages={updateChatMessages}
                onLoginClick={openDrawer}
                user={user}
            />
        </div>
    );
};

export default ChatbotPage;
