let chatHistory = [];
let userProfile = null;
let isOnboarding = false;
let isListening = false;
let isSpeaking = false;
let silenceTimer = null;
let webSearchEnabled = false;

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const voiceButton = document.getElementById('voiceButton');
const webSearchButton = document.getElementById('webSearchButton');

let recognition = null;
let synthesis = window.speechSynthesis;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
}

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
    voiceButton.style.display = 'flex';
    webSearchButton.style.display = 'flex';
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', clearChat);
    
    voiceButton.addEventListener('click', toggleVoiceMode);
    webSearchButton.addEventListener('click', toggleWebSearch);
}

function toggleVoiceMode() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }
    
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    if (isSpeaking) {
        synthesis.cancel();
        isSpeaking = false;
        voiceButton.classList.remove('speaking');
    }
    
    isListening = true;
    voiceButton.classList.add('listening');
    voiceButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
    `;
    
    recognition.start();
}

function stopListening() {
    isListening = false;
    voiceButton.classList.remove('listening');
    voiceButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    
    recognition.stop();
}

function speakText(text) {
    if (synthesis.speaking) {
        synthesis.cancel();
    }
    
    isSpeaking = true;
    voiceButton.classList.add('speaking');
    voiceButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
        isSpeaking = false;
        voiceButton.classList.remove('speaking');
        voiceButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    };
    
    synthesis.speak(utterance);
}

if (recognition) {
    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        const fullTranscript = finalTranscript + interimTranscript;
        chatInput.value = fullTranscript;
        
        if (silenceTimer) {
            clearTimeout(silenceTimer);
        }
        
        silenceTimer = setTimeout(() => {
            if (fullTranscript.trim()) {
                stopListening();
                sendMessage();
            }
        }, 2000);
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
    };
    
    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        }
    };
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
    
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>');
    
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
    const notes = localStorage.getItem('notes') || '';
    
    const currentMood = localStorage.getItem('mood');
    const currentSleep = localStorage.getItem('sleep');
    const currentStress = localStorage.getItem('stress');
    
    let userDataContext = '';
    
    if (currentMood || currentSleep || currentStress) {
        userDataContext = `
User's Current Day Values:
- Mood: ${currentMood ? currentMood + '/10' : 'Not tracked today'}
- Sleep: ${currentSleep ? currentSleep + '/10' : 'Not tracked today'}
- Stress: ${currentStress ? currentStress + '/10' : 'Not tracked today'}`;
    }
    
    if (notes.trim()) {
        userDataContext += `

User's Journal Notes:
"${notes.trim()}"`;
    }
    
    let systemPrompt = `You are a compassionate mental health AI assistant for MindMate. You help users with mood, sleep, and stress management. 

User Profile: ${userProfile ? userProfile.primaryConcern : 'Not specified'}

CURRENT USER DATA (Real-time from tracking app):
${userDataContext}

Context: You have access to the last 5 messages for context. Be supportive, empathetic, and provide practical advice. Focus on mental health, wellness, and coping strategies.

Guidelines:
- Be warm and supportive
- Provide actionable advice
- Ask follow-up questions when helpful
- Keep responses concise but helpful
- Focus on mood, sleep, and stress management
- Reference the user's current tracking data when relevant to provide personalized insights
- If the user mentions their current values, help them understand what it might mean
- If they have journal notes, incorporate that context into your advice
- IMPORTANT: The "CURRENT USER DATA" above shows the user's actual tracked values for today, not conversation history`;

    if (webSearchEnabled) {
        systemPrompt += `

WEB SEARCH ENABLED: When the user asks for current information, resources, or specific details, you should:
- Search the web for relevant, up-to-date information
- Provide specific sources and links when possible
- Include recent research, studies, or news related to mental health
- Cite reputable sources like medical journals, health organizations, or mental health websites
- Format links as [Source Name](URL) in your response
- Focus on evidence-based information and current best practices`;
    }

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
            max_tokens: 800,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function getCurrentWeekScores(metric) {
    const scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weekScores = scores.filter(score => {
        const scoreDate = new Date(score.date);
        return scoreDate >= startOfWeek && scoreDate <= endOfWeek;
    });
    
    return weekScores;
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

function toggleWebSearch() {
    webSearchEnabled = !webSearchEnabled;
    webSearchButton.classList.toggle('active');
    
    if (webSearchEnabled) {
        webSearchButton.title = 'Web Search Enabled';
        webSearchButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="11" cy="11" r="3" fill="currentColor"/>
            </svg>
        `;
    } else {
        webSearchButton.title = 'Enable Web Search';
        webSearchButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initializeChat);
