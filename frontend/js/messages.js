// ================= MESSAGES PAGE LOGIC =================

let conversations = [];
let activeConversation = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    loadConversations();
    renderConversations();
});

// Load conversations from localStorage
function loadConversations() {
    const stored = localStorage.getItem('conversations');
    if (stored) {
        conversations = JSON.parse(stored);
    }
}

// Save conversations to localStorage
function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

// Render conversations list
function renderConversations() {
    const container = document.getElementById('messagesContainer');
    
    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="margin-bottom: 8px;">No messages yet</h3>
                <p class="card-description">Start connecting with people from the Discover page!</p>
                <div class="card-actions" style="justify-content: center; margin-top: 16px;">
                    <button class="btn btn-primary" onclick="window.location.href='discover.html'">
                        Explore People
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    conversations.forEach(conv => {
        const time = formatTime(conv.lastMessageTime);
        html += `
            <div class="card conversation-card" onclick="openConversation(${conv.id})">
                <div class="conversation-avatar">
                    <img src="${conv.participantPhoto}" alt="${conv.participantName}">
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${conv.participantName}</span>
                        <span class="conversation-time">${time}</span>
                    </div>
                    <div class="conversation-preview">${conv.lastMessage || 'No messages yet'}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Format time
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

// Open conversation
function openConversation(id) {
    activeConversation = conversations.find(c => c.id === id);
    if (!activeConversation) return;
    
    renderChatView();
    document.getElementById('messagesContainer').style.display = 'none';
    document.getElementById('chatView').style.display = 'flex';
}

// Render chat view
function renderChatView() {
    if (!activeConversation) return;
    
    document.getElementById('chatParticipantName').textContent = activeConversation.participantName;
    document.getElementById('chatParticipantPhoto').src = activeConversation.participantPhoto;
    
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    if (activeConversation.messages && activeConversation.messages.length > 0) {
        activeConversation.messages.forEach(msg => {
            const isMe = msg.sender === 'me';
            messagesContainer.innerHTML += `
                <div class="message ${isMe ? 'sent' : 'received'}">
                    <div class="message-bubble">${msg.text}</div>
                    <div class="message-time">${formatTime(msg.time)}</div>
                </div>
            `;
        });
    } else {
        messagesContainer.innerHTML = `
            <div class="chat-empty">
                <p>Start your conversation with ${activeConversation.participantName}!</p>
            </div>
        `;
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !activeConversation) return;
    
    if (!activeConversation.messages) {
        activeConversation.messages = [];
    }
    
    const message = {
        id: Date.now(),
        text: text,
        sender: 'me',
        time: Date.now()
    };
    
    activeConversation.messages.push(message);
    activeConversation.lastMessage = text;
    activeConversation.lastMessageTime = Date.now();
    
    saveConversations();
    renderChatView();
    input.value = '';
    
    // Simulate reply after 1-2 seconds
    setTimeout(() => {
        simulateReply();
    }, 1000 + Math.random() * 1000);
}

// Simulate reply
function simulateReply() {
    if (!activeConversation) return;
    
    const replies = [
        "That sounds great!",
        "I'd love to join!",
        "Sure, let's do it!",
        "When were you thinking?",
        "That sounds fun!",
        "Nice! Let me know the details.",
        "Perfect! Count me in.",
        "Looking forward to it!"
    ];
    
    const replyMessage = {
        id: Date.now(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'them',
        time: Date.now()
    };
    
    if (!activeConversation.messages) {
        activeConversation.messages = [];
    }
    
    activeConversation.messages.push(replyMessage);
    activeConversation.lastMessage = replyMessage.text;
    activeConversation.lastMessageTime = Date.now();
    
    saveConversations();
    renderChatView();
}

// Back to conversations
function backToConversations() {
    activeConversation = null;
    document.getElementById('chatView').style.display = 'none';
    document.getElementById('messagesContainer').style.display = 'block';
    renderConversations();
}

// New message
function newMessage() {
    const name = prompt('Enter the name of the person you want to message:');
    if (!name) return;
    
    let conv = conversations.find(c => c.participantName.toLowerCase() === name.toLowerCase());
    
    if (!conv) {
        conv = {
            id: Date.now(),
            participantId: name,
            participantName: name,
            participantPhoto: `https://i.pravatar.cc/150?u=${name}`,
            messages: [],
            lastMessage: '',
            lastMessageTime: Date.now()
        };
        conversations.push(conv);
        saveConversations();
    }
    
    openConversation(conv.id);
}

// Search conversations
function searchConversations(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        renderConversations();
        return;
    }
    
    const filtered = conversations.filter(c => 
        c.participantName.toLowerCase().includes(searchTerm) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById('messagesContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <h3>No conversations found</h3>
            </div>
        `;
    } else {
        let html = '';
        filtered.forEach(conv => {
            const time = formatTime(conv.lastMessageTime);
            html += `
                <div class="card conversation-card" onclick="openConversation(${conv.id})">
                    <div class="conversation-avatar">
                        <img src="${conv.participantPhoto}" alt="${conv.participantName}">
                    </div>
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <span class="conversation-name">${conv.participantName}</span>
                            <span class="conversation-time">${time}</span>
                        </div>
                        <div class="conversation-preview">${conv.lastMessage || 'No messages yet'}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

// Send on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
