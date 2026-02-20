import React from 'react';

const SuggestionGrid = ({ onSuggestionClick }) => {
    const suggestions = [
        "What are the best breeds of goats for dairy production?",
        "How can I improve the health and nutrition of my goats?",
        "What are some common health issues in goats and how can I prevent them?",
        "What are the best practices for goat housing and shelter?",
        "How do I start a goat farming business?",
        "What are the legal requirements for goat farming in my area?"
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full px-8">
            {suggestions.map((question, index) => (
                <div
                    key={index}
                    onClick={() => onSuggestionClick(question)}
                    className="bg-white bg-opacity-60 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 text-gray-700 hover:text-green-800 hover:bg-green-50 text-sm md:text-base"
                >
                    {question}
                </div>
            ))}
        </div>
    );
};

export default SuggestionGrid;
