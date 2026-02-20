import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import PersonIcon from '@mui/icons-material/Person';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

const ChatMessage = ({ message, sender }) => {
    const isBot = sender === 'bot';
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Split message if it contains a table separator
    const parts = message.includes('|||TABLE|||') ? message.split('|||TABLE|||') : [message];
    const textContent = parts[0];
    const tableHtml = parts.length > 1 ? parts[1] : null;

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking]);

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Cancel any current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(textContent);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            // Optional: Select a specific voice if desired, 
            // but default is usually fine for a start.

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    return (
        <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[80%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start gap-3`}>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBot ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                    {isBot ? <AgricultureIcon /> : <PersonIcon />}
                </div>

                {/* Message Bubble */}
                <div className={`relative p-4 rounded-2xl shadow-sm ${isBot
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none group'
                    : 'bg-green-700 text-white rounded-tr-none'
                    }`}>
                    <div className="leading-relaxed chatbot-markdown">
                        {isBot ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 text-green-800" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 text-green-700" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-bold text-green-900" {...props} />,
                                    code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1 text-sm font-mono" {...props} />,
                                }}
                            >
                                {textContent}
                            </ReactMarkdown>
                        ) : (
                            <div className="whitespace-pre-wrap">{textContent}</div>
                        )}
                    </div>

                    {/* TTS Button for Bot */}
                    {isBot && (
                        <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={handleSpeak}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                            >
                                {isSpeaking ? <StopIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                            </button>
                        </div>
                    )}

                    {/* Render HTML Table if present */}
                    {tableHtml && (
                        <div
                            className="mt-4 overflow-x-auto bg-white rounded-lg border border-gray-200 p-2 text-gray-800"
                            dangerouslySetInnerHTML={{ __html: tableHtml }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
