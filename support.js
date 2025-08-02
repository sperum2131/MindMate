let chatHistory = [];
let userProfile = null;
let isOnboarding = false;

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

function initializeChat() {
    const savedProfile = localStorage.getItem('mindmate_user_profile');
    const savedHistory = localStorage.getItem('mindmate_chat_history');
    
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            displayChatHistory();
        } else {
            startRegularChat();
        }
    } else {
        startOnboarding();
    }
}

function startOnboarding() {
    isOnboarding = true;
    chatMessages.innerHTML = `
        <div class="onboarding-container">
            <h2 class="onboarding-title">Welcome to MindMate Support</h2>
            <p class="onboarding-description">
                I'm here to help you with your mental health and wellness journey. 
                To provide you with the best support, I'd like to understand a bit about your current situation.
            </p>
            <input type="text" id="onboardingInput" class="onboarding-input" 
                   placeholder="What are you currently struggling with? (e.g., stress, sleep, mood, anxiety)">
            <button id="onboardingButton" class="onboarding-button">Continue</button>
        </div>
    `;
    
    document.getElementById('onboardingButton').addEventListener('click', handleOnboardingSubmit);
    document.getElementById('onboardingInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleOnboardingSubmit();
        }
    });
}

function handleOnboardingSubmit() {
    const input = document.getElementById('onboardingInput');
    const userConcern = input.value.trim();
    
    if (!userConcern) return;
    
    userProfile = {
        primaryConcern: userConcern,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('mindmate_user_profile', JSON.stringify(userProfile));
    
    addMessage('user', userConcern);
    
    const assistantResponse = `Thank you for sharing that with me. I understand you're dealing with ${userConcern.toLowerCase()}. I'm here to help you with your mental health and wellness journey. 

I can help you with:
• Managing stress and anxiety
• Improving sleep quality
• Boosting mood and motivation
• Developing healthy coping strategies
• Understanding your patterns and triggers

What would you like to work on today?`;
    
    setTimeout(() => {
        addMessage('assistant', assistantResponse);
        isOnboarding = false;
        startRegularChat();
    }, 1000);
}

function startRegularChat() {
    chatInput.style.display = 'block';
    sendButton.style.display = 'flex';
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', clearChat);
}

function addMessage(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (sender === 'assistant') {
        contentDiv.innerHTML = formatMessage(content);
    } else {
        contentDiv.textContent = content;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (sender === 'user') {
        chatHistory.push({ role: 'user', content });
    } else {
        chatHistory.push({ role: 'assistant', content });
    }
    
    localStorage.setItem('mindmate_chat_history', JSON.stringify(chatHistory));
}

function formatMessage(content) {
    let formatted = content;
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    formatted = formatted.replace(/^•\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^-\s+(.*?)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^\*\s+(.*?)$/gm, '<li>$1</li>');
    
    formatted = formatted.replace(/^(\d+)\.\s+(.*?)$/gm, '<li>$2</li>');
    
    formatted = formatted.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    
    formatted = formatted.replace(/\n/g, '<br>');
    
    formatted = formatted.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>');
    
    return formatted;
}

function displayChatHistory() {
    chatHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (msg.role === 'assistant') {
            contentDiv.innerHTML = formatMessage(msg.content);
        } else {
            contentDiv.textContent = msg.content;
        }
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    startRegularChat();
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    chatInput.value = '';
    
    showTypingIndicator();
    
    try {
        const response = await getAIResponse(message);
        hideTypingIndicator();
        addMessage('assistant', response);
    } catch (error) {
        hideTypingIndicator();
        addMessage('assistant', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
        console.error('AI Response Error:', error);
    }
}

async function getAIResponse(userMessage) {
    const recentMessages = chatHistory.slice(-10);
    
    const systemPrompt = `You are a compassionate mental health AI assistant for MindMate. You help users with mood, sleep, and stress management. 

User Profile: ${userProfile ? userProfile.primaryConcern : 'Not specified'}

Context: You have access to the last 5 messages for context. Be supportive, empathetic, and provide practical advice. Focus on mental health, wellness, and coping strategies.

Guidelines:
- Be warm and supportive
- Provide actionable advice
- Ask follow-up questions when helpful
- Keep responses concise but helpful
- Focus on mood, sleep, and stress management`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat and reset the conversation? This will remove all chat history and start fresh.')) {
        chatHistory = [];
        localStorage.removeItem('mindmate_chat_history');
        
        localStorage.removeItem('mindmate_user_profile');
        userProfile = null;
        
        chatMessages.innerHTML = '';
        
        startOnboarding();
    }
}

document.addEventListener('DOMContentLoaded', initializeChat);
