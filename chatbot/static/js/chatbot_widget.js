// static/js/chatbot_widget.js

// Function to format message content for better display (applies bold, italic, line breaks)
function formatMessageContent(text) {
    // Apply bold formatting: **text** -> <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Apply italic formatting: *text* -> <em>text</em> (if needed)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace newlines within the block with <br> for line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}


// Helper function to build an HTML table from an array of markdown-like lines (kept for compatibility)
function buildTableFromLines(lines) {
    if (lines.length === 0) return '';

    let html = '<table><thead><tbody>'; // Start table, assume first row is header until proven otherwise
    let headerProcessed = false;

    for (let j = 0; j < lines.length; j++) {
        let line = lines[j].trim();
        if (!line) continue; // Skip empty lines within table block

        // Split line by '|', remove leading/trailing empty cells caused by '| text |'
        let cells = line.split('|').map(cell => cell.trim()).filter((cell, index, arr) => index > 0 && index < arr.length - 1);

        if (cells.length === 0) continue; // Skip lines that don't have actual cells after splitting

        // Check if this line looks like a separator row (contains only - : | and spaces)
        // e.g., | :--- | :---: | ---: |
        if (!headerProcessed && cells.every(cell => /^[\-: ]+$/.test(cell))) {
            // This is the separator line, implies previous line was header
            continue; // Skip the separator line itself
        }

        // Determine if this row should be a header row
        let isHeaderRow = !headerProcessed;
        if (isHeaderRow) {
            html += '<tr>';
            cells.forEach(cell => {
                // Apply formatting *inside* the header cell content (e.g., bold headers if marked)
                cell = formatMessageContent(cell);
                html += `<th>${cell}</th>`;
            });
            html += '</tr>';
            headerProcessed = true;
            html = html.replace('<tbody>', '<thead><tr>'); // Move first row to thead
            html = html.replace('</tr><tbody>', '</tr></thead><tbody>'); // Close thead, open tbody
        } else {
             // It's a data row
             if (!html.includes('<tbody>')) {
                 // If no tbody tag exists yet (meaning no header was found), start tbody and treat this as first data row
                 html += '<tbody><tr>';
             } else {
                 html += '<tr>'; // Add new data row
             }
             cells.forEach(cell => {
                 // Apply formatting *inside* the data cell content (e.g., bold values if marked)
                 cell = formatMessageContent(cell);
                 html += `<td>${cell}</td>`;
             });
             html += '</tr>';
        }
    }

    // Close the table tags properly
    if (html.includes('<tbody>')) {
        html += '</tbody></table>';
    } else {
        // If no tbody was added, it means only a header row was found, close appropriately
        html += '</tr></thead></table>';
    }

    return html;
}


function addMessage(text, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    if (isUser) {
        messageDiv.textContent = text;
    } else {
        // For bot messages, the 'text' is now the main response string
        // The table data (if any) will be handled separately in sendMessage's .then block
        messageDiv.innerHTML = formatMessageContent(text); // Apply basic formatting to the main text part
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    console.log("🔍 sendMessage: Sending message:", message); // Debug log

    addMessage(message, true); // Add the user's message first
    input.value = '';
    showLoading(true);

    fetch('/chatbot/api/', {
        method:'POST',
        headers: {
            'Content-Type':'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({ message }),
        credentials: 'same-origin'
    })
    .then(resp => resp.json())
    .then(data => {
        console.log("✅ sendMessage: Received API response:", data); // Debug log - check the response data
        showLoading(false);

        // Check if response exists and has the expected structure
        if (data && typeof data.response === 'string') {
            console.log("🔍 sendMessage: Calling addMessage with bot response text:", data.response); // Debug log
            addMessage(data.response, false); // Add the main bot response text

            // Check if the response includes structured portfolio table data
            if (data.portfolio_table_data) {
                console.log("📈 sendMessage: Found portfolio_table_data, building table..."); // Debug log
                const tableDiv = document.createElement('div'); // Create a container for the table
                tableDiv.className = 'portfolio-table-container'; // Add a class for potential styling

                const tableElement = buildTableFromStructuredData(data.portfolio_table_data);
                if (tableElement) {
                    tableDiv.appendChild(tableElement);
                    // Append the table container div to the chat messages area
                    const chatMessages = document.getElementById('chatMessages');
                    chatMessages.appendChild(tableDiv);
                    console.log("✅ sendMessage: Appended table element to chat messages."); // Debug log
                } else {
                    console.error("❌ sendMessage: buildTableFromStructuredData returned null/undefined.");
                }
            } else {
                console.log("💬 sendMessage: No portfolio_table_data found in response.");
            }
        } else {
            console.error("❌ sendMessage: API response is missing or malformed:", data);
            addMessage('Oops! Something went wrong getting the response.', false);
        }
    })
    .catch(err => {
        console.error("❌ sendMessage: Error fetching response:", err); // Debug log
        showLoading(false);
        addMessage('Oops! Something went wrong.', false);
    });
}

// --- NEW: Function to build HTML table from structured data object ---
function buildTableFromStructuredData(tableData) {
    console.log("🏗️ buildTableFromStructuredData: Building table from data:", tableData); // Debug log
    if (!tableData || !tableData.headers || !Array.isArray(tableData.rows)) {
        console.error("❌ buildTableFromStructuredData: Invalid table data structure received:", tableData);
        return null; // Return null if data is invalid
    }

    // Create the main table element
    const table = document.createElement('table');
    table.className = 'portfolio-table'; // Apply the CSS class for styling

    // Create thead and header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    tableData.headers.forEach(headerText => {
        const th = document.createElement('th');
        // Apply basic formatting inside header cells (e.g., bold markers like **Total**)
        // We need to parse the text for formatting markers here too
        const formattedHeader = formatMessageContent(headerText);
        th.innerHTML = formattedHeader; // Use innerHTML to render potential <strong> tags from formatMessageContent
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody and data rows
    const tbody = document.createElement('tbody');
    tableData.rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        // Check if this is the total row (e.g., based on the first cell content)
        if (row[0] && row[0].includes('TOTAL')) {
             tr.className = 'total-row'; // Apply specific class for styling the total row
        }
        row.forEach(cellText => {
            const td = document.createElement('td');
            // Apply basic formatting inside data cells (e.g., bold markers)
            const formattedCell = formatMessageContent(cellText);
            td.innerHTML = formattedCell; // Use innerHTML to render potential <strong> tags from formatMessageContent
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    console.log("✅ buildTableFromStructuredData: Successfully built table element:", table); // Debug log
    return table; // Return the constructed table element
}
// --- END NEW: Function to build HTML table from structured data object ---


function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if(loader) loader.style.display = show ? 'block' : 'none';
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
    if(input){ input.value = query; sendMessage(); }
}

// Toggle chatbot visibility (if you want this functionality)
function toggleChatbot() {
    const widget = document.querySelector('.chatbot-widget');
    if (widget) {
        widget.classList.toggle('hidden');
    }
}

// Initialize chatbot on page load (optional)
document.addEventListener('DOMContentLoaded', () => {
    // Example: Add a welcome message
    // setTimeout(() => {
    //     const welcome = {{ user.is_authenticated|yesno:"'Hello! Ask me about your portfolio or gold prices.','Hello! I'm InvestoBot. Ask me about gold prices or investment options.'" }};
    //     addMessage(welcome, false);
    // }, 500);
});

// Make functions available globally if needed elsewhere
// window.ChatbotWidget = {
//     addMessage: addMessage,
//     sendMessage: sendMessage,
//     quickQuery: quickQuery,
//     toggleChatbot: toggleChatbot
// };