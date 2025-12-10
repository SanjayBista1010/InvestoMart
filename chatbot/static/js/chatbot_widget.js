// static/js/chatbot_widget.js (Fixed Version - Properly handles embedded HTML table)

// Function to format message content for better display (applies bold, italic, line breaks)
function formatMessageContent(text) {
    // Apply bold formatting: **text** -> <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Apply italic formatting: *text* -> <em>text</em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace newlines with <br> for line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}

// Function to format message content and handle embedded HTML table
function formatMessageContentWithTable(text) {
    // Define the marker used by the backend
    const tableMarker = "[[[PORTFOLIO_TABLE_HTML]]]";

    console.log("Checking for table marker in text...");
    console.log("Text length:", text.length);
    console.log("First 100 chars:", text.substring(0, 100));
    console.log("Last 200 chars:", text.substring(text.length - 200));

    // Find the marker
    const markerIndex = text.indexOf(tableMarker);

    if (markerIndex !== -1) {
        console.log("Table marker found at index:", markerIndex);
        
        // Split the text
        const mainText = text.substring(0, markerIndex).trim();
        const htmlTableString = text.substring(markerIndex + tableMarker.length).trim();

        console.log("Main text length:", mainText.length);
        console.log("HTML table length:", htmlTableString.length);
        console.log("HTML table preview:", htmlTableString.substring(0, 100));

        // Apply basic formatting to the main text part
        const formattedMainText = formatMessageContent(mainText);

        // Return an object containing both parts
        return {
            textPart: formattedMainText,
            htmlPart: htmlTableString
        };
    }

    console.log("No table marker found, formatting entire text");
    // If no marker is found, just format the whole text
    return {
        textPart: formatMessageContent(text),
        htmlPart: null
    };
}

function addMessage(text, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error("Could not find chatMessages element.");
        return;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    if (isUser) {
        // Use textContent for user messages to prevent XSS
        messageDiv.textContent = text;
    } else {
        // Apply formatting and check for embedded table
        const processedContent = formatMessageContentWithTable(text);

        if (processedContent.htmlPart) {
            console.log("Processing bot message with table");
            
            // Set the formatted text part first
            messageDiv.innerHTML = processedContent.textPart;

            // Create a container for the table
            const tableContainer = document.createElement('div');
            tableContainer.style.marginTop = '10px';
            tableContainer.innerHTML = processedContent.htmlPart;

            // Append the table container to the message div
            messageDiv.appendChild(tableContainer);
            console.log("Appended HTML table to message");
        } else {
            console.log("Processing bot message without table");
            // If no HTML part was found, just set the formatted text
            messageDiv.innerHTML = processedContent.textPart;
        }
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
    console.log("Message added to chat");
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) {
        console.error("Could not find chatInput element.");
        return;
    }

    const message = input.value.trim();
    if (!message) return;

    console.log("Sending message:", message);

    addMessage(message, true);
    input.value = '';
    showLoading(true);

    fetch('/chatbot/api/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ message }),
        credentials: 'same-origin'
    })
    .then(resp => resp.json())
    .then(data => {
        console.log("Received API response:", data);
        showLoading(false);

        if (data && typeof data.response === 'string') {
            console.log("Response text length:", data.response.length);
            addMessage(data.response, false);
        } else {
            console.error("API response is missing or malformed:", data);
            addMessage('Oops! Something went wrong getting the response.', false);
        }
    })
    .catch(err => {
        console.error("Error fetching response:", err);
        showLoading(false);
        addMessage('Oops! Something went wrong.', false);
    });
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = show ? 'block' : 'none';
}

function getCSRFToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return '';
}

function quickQuery(query) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = query;
        sendMessage();
    }
}

function toggleChatbot() {
    const widget = document.querySelector('.chatbot-widget');
    if (widget) {
        widget.classList.toggle('hidden');
    }
}

// Initialize chatbot on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chatbot widget JavaScript loaded.");
    const input = document.getElementById('chatInput');
    if (input) {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Add initial welcome message
    setTimeout(() => {
        const isAuthenticated = document.querySelector('.quick-actions button[onclick*="portfolio"]') !== null;
        const welcome = isAuthenticated 
            ? 'Hello! Ask me about your portfolio or gold prices.'
            : 'Hello! I am InvestoBot. Ask me about gold prices or investment options.';
        addMessage(welcome, false);
    }, 500);
});