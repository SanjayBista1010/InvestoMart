import React, { useState, useEffect, useRef } from 'react';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicIcon from '@mui/icons-material/Mic';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

const InputArea = ({ onSend, onStop, disabled }) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Stop after one sentence/phrase for natural turn-taking
            recognition.interimResults = true; // Show results as you speak
            recognition.lang = 'en-US'; // Default to English

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setText(finalTranscript);
                    onSend(finalTranscript);
                    setText(''); // Clear after sending
                } else {
                    setText(interimTranscript);
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setText(''); // Clear active text when starting new dictation
        }
    };

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSend(text);
            setText('');
        }
    };

    const handleStop = () => {
        if (onStop) {
            onStop();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-8 pb-8 z-20">
            <div className={`bg-gray-100 rounded-full flex items-center px-6 py-3 shadow-inner border transition-all ${isListening ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-transparent focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500'}`}>

                {/* Microphone Button */}
                <button
                    onClick={toggleListening}
                    className={`mr-4 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-green-700'}`}
                    title={isListening ? "Stop Listening" : "Start Voice Input"}
                    disabled={disabled}
                >
                    {isListening ? <MicIcon /> : <MicNoneOutlinedIcon />}
                </button>

                <ImageOutlinedIcon className="text-gray-500 cursor-pointer hover:text-green-700 mr-4" />

                <input
                    type="text"
                    placeholder={isListening ? "Listening..." : (disabled ? "Generating response..." : "Type message...")}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 disabled:text-gray-400"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled} // Dictation should probably work even if bot is thinking? No, standard practice is input locked.
                />

                {disabled ? (
                    <button
                        onClick={handleStop}
                        className="ml-4 p-2 rounded-full transition-colors text-red-500 hover:bg-red-100 animate-pulse"
                        title="Stop Generating"
                    >
                        <StopCircleOutlinedIcon />
                    </button>
                ) : (
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className={`ml-4 p-2 rounded-full transition-colors ${text.trim() ? 'text-green-700 hover:bg-green-100' : 'text-gray-400'}`}
                    >
                        <SendOutlinedIcon className="transform -rotate-45" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default InputArea;
