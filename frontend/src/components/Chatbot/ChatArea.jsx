import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SuggestionGrid from './SuggestionGrid';
import InputArea from './InputArea';
import ChatMessage from './ChatMessage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const ChatArea = ({ chat, onUpdateTitle, onUpdateMessages, onLoginClick, user }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null); // Ref to store the AbortController

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages, isLoading]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isLoading) {
            setTimer(0);
            interval = setInterval(() => {
                setTimer(prev => prev + 10); // Increment by 10ms
            }, 10);
        } else {
            setTimer(0);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/chatbot/health/');
                console.log("Backend Health Check:", response.data);
            } catch (err) {
                console.error("Backend Health Check Failed:", err.message);
            }
        };
        checkHealth();
    }, []);

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            // Optional: Add a message indicating generation was stopped
            if (chat) {
                const stoppedMsg = { text: "Generation stopped by user.", sender: 'bot' };
                onUpdateMessages(chat.id, [...chat.messages, stoppedMsg]);
            }
        }
    };

    const handleSend = async (messageText) => {
        if (!messageText.trim() || !chat) return;

        // 1. Add User Message
        const userMsg = { text: messageText, sender: 'user' };
        const updatedMessages = [...chat.messages, userMsg];
        onUpdateMessages(chat.id, updatedMessages);

        // 2. Auto-generate chat title from first message
        if (chat.messages.length === 0 && chat.title === 'New chat') {
            const truncatedTitle = messageText.length > 30
                ? messageText.substring(0, 30) + '...'
                : messageText;
            onUpdateTitle(chat.id, truncatedTitle);
        }

        setIsLoading(true);

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        try {
            // 3. Call API
            const token = localStorage.getItem('token');
            const backendUrl = '/api/chatbot/api/';
            const response = await axios.post(backendUrl, {
                message: messageText,
                session_id: chat.sessionId // Send sessionId if it exists
            }, {
                signal: abortControllerRef.current.signal,
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            // 4. Add Bot Response
            console.log("Chat API Response:", response.data);
            if (response.data && response.data.response) {
                const botMsg = { text: response.data.response, sender: 'bot' };
                // Pass new sessionId to parent if it changed
                console.log("Updating messages with session_id:", response.data.session_id);
                onUpdateMessages(chat.id, [...updatedMessages, botMsg], response.data.session_id);
            } else {
                const errorMsg = { text: "Sorry, I received an empty response.", sender: 'bot' };
                onUpdateMessages(chat.id, [...updatedMessages, errorMsg]);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
                // We handled the UI update in handleStop, so nothing else needed here
            } else {
                console.error("Chat API Error:", error);
                const backendUrl = `http://127.0.0.1:8000/api/chatbot/api/`;
                const errorText = error.response?.data?.response ||
                    `Connection Error: Failed to reach ${backendUrl}. ${error.message}`;
                const errorMsg = { text: errorText, sender: 'bot' };
                onUpdateMessages(chat.id, [...updatedMessages, errorMsg]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const hasInteracted = chat?.messages && chat.messages.length > 0;

    return (
        <div className="flex-1 flex flex-col h-screen relative bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
            {/* Header Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-green-800">Hi, {user.name}</span>
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                            {user.name[0]}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="border border-green-700 text-green-700 px-8 py-2 rounded text-sm font-semibold hover:bg-green-50 transition-colors uppercase tracking-wide bg-white"
                    >
                        Login
                    </button>
                )}
                <HelpOutlineIcon className="text-green-700 cursor-pointer hover:text-green-800" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full overflow-y-auto custom-scrollbar">

                {/* Initial Welcome View */}
                {!hasInteracted && (
                    <div className="flex-1 flex flex-col justify-center items-center px-4 min-h-[60vh]">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-serif font-bold text-green-800 mb-2">
                                Welcome to Green Acres Goat Farm
                            </h1>
                            <h2 className="text-3xl font-serif font-bold text-green-700">
                                - Invest in Our Farm
                            </h2>
                        </div>
                        <SuggestionGrid onSuggestionClick={handleSend} />
                    </div>
                )}

                {/* Active Chat View */}
                {hasInteracted && (
                    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
                        {chat.messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg.text} sender={msg.sender} />
                        ))}

                        {isLoading && (
                            <div className="flex justify-start w-full mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="animate-pulse text-green-700">...</span>
                                    </div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm text-gray-500 text-sm italic">
                                        Thinking... ({(timer / 1000).toFixed(2)}s)
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Fixed at bottom) */}
            <InputArea onSend={handleSend} onStop={handleStop} disabled={isLoading} />
        </div>
    );
};

export default ChatArea;
