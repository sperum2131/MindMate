let chatHistory = [];
let userProfile = null;
let isOnboarding = false;
let isListening = false;
let isSpeaking = false;
let silenceTimer = null;
let webSearchEnabled = false;

// debug flag for testing
let debugMode = false;

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendButton');
const voiceBtn = document.getElementById('voiceButton');
const webSearchBtn = document.getElementById('webSearchButton');

let speechRec = null;
let speechSynth = window.speechSynthesis;

// setup speech stuff
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRec = new SpeechRecognition();
    speechRec.continuous = true;
    speechRec.interimResults = true;
    speechRec.lang = 'en-US';
}

function setup() {
    const savedProfile = localStorage.getItem('mindmate_user_profile');
    const savedHistory = localStorage.getItem('mindmate_chat_history');
    
    console.log('setup called'); // debug
    
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            showHistory();
        } else {
            beginChat();
        }
    } else {
        showWelcome();
    }
}

function showWelcome() {
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
    
    document.getElementById('onboardingButton').addEventListener('click', submitOnboarding);
    document.getElementById('onboardingInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitOnboarding();
        }
    });
}

function submitOnboarding() {
    const input = document.getElementById('onboardingInput');
    const concern = input.value.trim();
    
    if (!concern) return;
    
    userProfile = {
        primaryConcern: concern,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('mindmate_user_profile', JSON.stringify(userProfile));
    
    addMessage('user', concern);
    
    const response = `Thank you for sharing that with me. I understand you're dealing with ${concern.toLowerCase()}. I'm here to help you with your mental health and wellness journey. 

I can help you with:
• Managing stress and anxiety
• Improving sleep quality
• Boosting mood and motivation
• Developing healthy coping strategies
• Understanding your patterns and triggers

What would you like to work on today?`;
    
    setTimeout(() => {
        addMessage('assistant', response);
        isOnboarding = false;
        beginChat();
    }, 1000);
}

function beginChat() {
    chatInput.style.display = 'block';
    sendBtn.style.display = 'flex';
    voiceBtn.style.display = 'flex';
    webSearchBtn.style.display = 'flex';
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    const deleteBtn = document.getElementById('deleteButton');
    deleteBtn.addEventListener('click', clearChat);
    
    voiceBtn.addEventListener('click', toggleVoice);
    webSearchBtn.addEventListener('click', toggleWebSearch);
}

function toggleVoice() {
    if (!speechRec) {
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
    // stop speaking if it's happening
    if (isSpeaking) {
        speechSynth.cancel();
        isSpeaking = false;
        voiceBtn.classList.remove('speaking');
    }
    
    isListening = true;
    console.log('is now listening');
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`;
    
    speechRec.start();
}

function stopListening() {
    isListening = false;
    console.log('is now not listening');
    voiceBtn.classList.remove('listening');
    voiceBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    
    // clear the timer thing
    if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
    }
    
    speechRec.stop();
}

function speakText(text) {
    // stop any current speech
    if (speechSynth.speaking) {
        speechSynth.cancel();
    }
    
    isSpeaking = true;
    voiceBtn.classList.add('speaking');
    voiceBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2v20M2 10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
        isSpeaking = false;
        voiceBtn.classList.remove('speaking');
        voiceBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    };
    
    speechSynth.speak(utterance);
}

if (speechRec) {
    speechRec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // process the speech results
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
        
        // reset the sikence timer
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
    
    speechRec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopListening();
    };
    
    speechRec.onend = () => {
        if (isListening) {
            speechRec.start();
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
    
    // do bold stuff
    let parts = formatted.split('**');
    for (let i = 1; i < parts.length; i += 2) {
        if (parts[i]) {
            parts[i] = '<strong>' + parts[i] + '</strong>';
        }
    }
    formatted = parts.join('');
    
    // do italic stuff
    parts = formatted.split('*');
    for (let i = 1; i < parts.length; i += 2) {
        if (parts[i]) {
            parts[i] = '<em>' + parts[i] + '</em>';
        }
    }
    formatted = parts.join('');
    
    // do underscore italic
    parts = formatted.split('_');
    for (let i = 1; i < parts.length; i += 2) {
        if (parts[i]) {
            parts[i] = '<em>' + parts[i] + '</em>';
        }
    }
    formatted = parts.join('');
    
    // do bullet points
    let lines = formatted.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('• ')) {
            lines[i] = '<li>' + lines[i].substring(2) + '</li>';
        } else if (lines[i].startsWith('- ')) {
            lines[i] = '<li>' + lines[i].substring(2) + '</li>';
        } else if (lines[i].startsWith('* ')) {
            lines[i] = '<li>' + lines[i].substring(2) + '</li>';
        }
    }
    formatted = lines.join('\n');
    
    // do numbered lists
    lines = formatted.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (/^\d+\.\s/.test(lines[i])) {
            lines[i] = '<li>' + lines[i].replace(/^\d+\.\s/, '') + '</li>';
        }
    }
    formatted = lines.join('\n');
    
    // wrap lists in ul tags
    let inList = false;
    let result = '';
    lines = formatted.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('<li>')) {
            if (!inList) {
                result += '<ul>';
                inList = true;
            }
            result += lines[i];
        } else {
            if (inList) {
                result += '</ul>';
                inList = false;
            }
            result += lines[i];
        }
        if (i < lines.length - 1) result += '\n';
    }
    if (inList) {
        result += '</ul>';
    }
    formatted = result;
    
    // fix double ul tags
    formatted = formatted.replace(/<\/ul>\s*<ul>/g, '');
    
    // do line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    // do headers
    lines = formatted.split('<br>');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('### ')) {
            lines[i] = '<h3>' + lines[i].substring(4) + '</h3>';
        } else if (lines[i].startsWith('## ')) {
            lines[i] = '<h2>' + lines[i].substring(3) + '</h2>';
        } else if (lines[i].startsWith('# ')) {
            lines[i] = '<h1>' + lines[i].substring(2) + '</h1>';
        }
    }
    formatted = lines.join('<br>');
    
    // do links
    let linkStart = formatted.indexOf('[');
    while (linkStart !== -1) {
        let linkEnd = formatted.indexOf(']', linkStart);
        let urlStart = formatted.indexOf('(', linkEnd);
        let urlEnd = formatted.indexOf(')', urlStart);
        
        if (linkEnd !== -1 && urlStart !== -1 && urlEnd !== -1) {
            let linkText = formatted.substring(linkStart + 1, linkEnd);
            let url = formatted.substring(urlStart + 1, urlEnd);
            let replacement = '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">' + linkText + '</a>';
            formatted = formatted.substring(0, linkStart) + replacement + formatted.substring(urlEnd + 1);
        }
        
        linkStart = formatted.indexOf('[', linkStart + 1);
    }
    
    return formatted;
}

function showHistory() {
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
    beginChat();
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
    
    // get their current stuff
    if (currentMood || currentSleep || currentStress) {
        userDataContext = `
hey, here's what they're tracking today:
- mood: ${currentMood ? currentMood + '/10' : 'not tracked today'}
- sleep: ${currentSleep ? currentSleep + '/10' : 'not tracked today'} 
- stress: ${currentStress ? currentStress + '/10' : 'not tracked today'}`;
    }
    
    // also check if they wrote anything
    if (notes.trim()) {
        userDataContext += `

they also wrote this in their journal:
"${notes.trim()}"`;
    }
    
    let prompt = `hey, you're a mental health helper for MindMate. help with mood/sleep/stress stuff.

user's main issue: ${userProfile ? userProfile.primaryConcern : 'not sure'}

${userDataContext}

you can see the last few messages. be nice and helpful. give practical tips. focus on mental health stuff.

try to:
- be friendly
- give useful advice  
- ask questions when it makes sense
- keep it short but helpful
- talk about mood/sleep/stress
- use their tracking data if it's relevant
- if they mention their scores, help them understand
- if they have journal notes, use that info
- btw the stuff above is their real tracking data from today, not chat history`;

    if (webSearchEnabled) {
        prompt += `

now you can search the web now. if they ask for info or resources:
- look up current stuff
- give links when you can
- include recent research/news about mental health
- cite good sources like medical sites
- format links like [Source Name](URL)
- focus on evidence-based stuff`;
    }

    const messages = [
        { role: 'system', content: prompt },
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
        
        showWelcome();
    }
}

function toggleWebSearch() {
    if (webSearchEnabled === true) {
        webSearchEnabled = false;
    } else if (webSearchEnabled === false) {
        webSearchEnabled = true;
    } else {
        webSearchEnabled = true;
    }
    webSearchBtn.classList.toggle('active');
    
    if (webSearchEnabled) {
        webSearchBtn.title = 'Web Search Enabled';
        webSearchBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="11" cy="11" r="3" fill="currentColor"/>
        </svg>`;
    } else {
        webSearchBtn.title = 'Enable Web Search';
        webSearchBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
}

document.addEventListener('DOMContentLoaded', setup);

// possible ideas:
// motivate mode for AI? - kinda dumb i dont think any one would use