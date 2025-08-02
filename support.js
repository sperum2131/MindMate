// Chat history and user profile variables
let chatHistoryArray = [];
let userProfileObject = null;
let isOnboardingActive = false;
let isListeningToVoice = false;
let isSpeakingText = false;
let silenceTimerVariable = null;
let webSearchEnabledFlag = false;

// Get all the DOM elements we need
const chatMessagesElement = document.getElementById('chatMessages');
const chatInputElement = document.getElementById('chatInput');
const sendButtonElement = document.getElementById('sendButton');
const voiceButtonElement = document.getElementById('voiceButton');
const webSearchButtonElement = document.getElementById('webSearchButton');

// Speech recognition and synthesis variables
let recognitionObject = null;
let synthesisObject = window.speechSynthesis;

// Check if speech recognition is available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionObject = new SpeechRecognitionClass();
    recognitionObject.continuous = true;
    recognitionObject.interimResults = true;
    recognitionObject.lang = 'en-US';
}

// Function to initialize the chat
function initializeChat() {
    const savedProfileString = localStorage.getItem('mindmate_user_profile');
    const savedHistoryString = localStorage.getItem('mindmate_chat_history');
    
    if (savedProfileString !== null) {
        userProfileObject = JSON.parse(savedProfileString);
        if (savedHistoryString !== null) {
            chatHistoryArray = JSON.parse(savedHistoryString);
            displayChatHistory();
        } else {
            startRegularChat();
        }
    } else {
        startOnboarding();
    }
}

// Function to start the onboarding process
function startOnboarding() {
    isOnboardingActive = true;
    chatMessagesElement.innerHTML = `
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
    document.getElementById('onboardingInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleOnboardingSubmit();
        }
    });
}

// Function to handle onboarding submission
function handleOnboardingSubmit() {
    const inputElement = document.getElementById('onboardingInput');
    const userConcernString = inputElement.value.trim();
    
    if (userConcernString === '') {
        return;
    }
    
    userProfileObject = {
        primaryConcern: userConcernString,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('mindmate_user_profile', JSON.stringify(userProfileObject));
    
    addMessage('user', userConcernString);
    
    const assistantResponseString = `Thank you for sharing that with me. I understand you're dealing with ${userConcernString.toLowerCase()}. I'm here to help you with your mental health and wellness journey. 

I can help you with:
• Managing stress and anxiety
• Improving sleep quality
• Boosting mood and motivation
• Developing healthy coping strategies
• Understanding your patterns and triggers

What would you like to work on today?`;
    
    setTimeout(function() {
        addMessage('assistant', assistantResponseString);
        isOnboardingActive = false;
        startRegularChat();
    }, 1000);
}

// Function to start regular chat mode
function startRegularChat() {
    chatInputElement.style.display = 'block';
    sendButtonElement.style.display = 'flex';
    voiceButtonElement.style.display = 'flex';
    webSearchButtonElement.style.display = 'flex';
    
    chatInputElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && event.shiftKey === false) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    sendButtonElement.addEventListener('click', sendMessage);
    
    const deleteButtonElement = document.getElementById('deleteButton');
    deleteButtonElement.addEventListener('click', clearChat);
    
    voiceButtonElement.addEventListener('click', toggleVoiceMode);
    webSearchButtonElement.addEventListener('click', toggleWebSearch);
}

// Function to toggle voice mode
function toggleVoiceMode() {
    if (recognitionObject === null) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
    }
    
    if (isListeningToVoice === true) {
        stopListening();
    } else {
        startListening();
    }
}

// Function to start listening
function startListening() {
    if (isSpeakingText === true) {
        synthesisObject.cancel();
        isSpeakingText = false;
        voiceButtonElement.classList.remove('speaking');
    }
    
    isListeningToVoice = true;
    voiceButtonElement.classList.add('listening');
    voiceButtonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>
    `;
    
    recognitionObject.start();
}

// Function to stop listening
function stopListening() {
    isListeningToVoice = false;
    voiceButtonElement.classList.remove('listening');
    voiceButtonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    if (silenceTimerVariable !== null) {
        clearTimeout(silenceTimerVariable);
        silenceTimerVariable = null;
    }
    
    recognitionObject.stop();
}

// Function to speak text
function speakText(textToSpeak) {
    if (synthesisObject.speaking === true) {
        synthesisObject.cancel();
    }
    
    isSpeakingText = true;
    voiceButtonElement.classList.add('speaking');
    voiceButtonElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    const utteranceObject = new SpeechSynthesisUtterance(textToSpeak);
    utteranceObject.rate = 0.9;
    utteranceObject.pitch = 1;
    utteranceObject.volume = 0.8;
    
    utteranceObject.onend = function() {
        isSpeakingText = false;
        voiceButtonElement.classList.remove('speaking');
        voiceButtonElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    };
    
    synthesisObject.speak(utteranceObject);
}

// Set up speech recognition event handlers
if (recognitionObject !== null) {
    recognitionObject.onresult = function(event) {
        let finalTranscriptString = '';
        let interimTranscriptString = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptString = event.results[i][0].transcript;
            if (event.results[i].isFinal === true) {
                finalTranscriptString = finalTranscriptString + transcriptString;
            } else {
                interimTranscriptString = interimTranscriptString + transcriptString;
            }
        }
        
        const fullTranscriptString = finalTranscriptString + interimTranscriptString;
        chatInputElement.value = fullTranscriptString;
        
        if (silenceTimerVariable !== null) {
            clearTimeout(silenceTimerVariable);
        }
        
        silenceTimerVariable = setTimeout(function() {
            if (fullTranscriptString.trim() !== '') {
                stopListening();
                sendMessage();
            }
        }, 2000);
    };
    
    recognitionObject.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopListening();
    };
    
    recognitionObject.onend = function() {
        if (isListeningToVoice === true) {
            recognitionObject.start();
        }
    };
}

// Function to add a message to the chat
function addMessage(senderType, messageContent) {
    const messageDivElement = document.createElement('div');
    messageDivElement.className = 'message ' + senderType;
    
    const contentDivElement = document.createElement('div');
    contentDivElement.className = 'message-content';
    
    if (senderType === 'assistant') {
        contentDivElement.innerHTML = formatMessage(messageContent);
    } else {
        contentDivElement.textContent = messageContent;
    }
    
    messageDivElement.appendChild(contentDivElement);
    chatMessagesElement.appendChild(messageDivElement);
    
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    
    if (senderType === 'user') {
        chatHistoryArray.push({ role: 'user', content: messageContent });
    } else {
        chatHistoryArray.push({ role: 'assistant', content: messageContent });
    }
    
    localStorage.setItem('mindmate_chat_history', JSON.stringify(chatHistoryArray));
}

// Function to format message content
function formatMessage(contentString) {
    let formattedString = contentString;
    
    formattedString = formattedString.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formattedString = formattedString.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedString = formattedString.replace(/_(.*?)_/g, '<em>$1</em>');
    
    formattedString = formattedString.replace(/^•\s+(.*?)$/gm, '<li>$1</li>');
    formattedString = formattedString.replace(/^-\s+(.*?)$/gm, '<li>$1</li>');
    formattedString = formattedString.replace(/^\*\s+(.*?)$/gm, '<li>$1</li>');
    
    formattedString = formattedString.replace(/^(\d+)\.\s+(.*?)$/gm, '<li>$2</li>');
    
    formattedString = formattedString.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    formattedString = formattedString.replace(/<\/ul>\s*<ul>/g, '');
    
    formattedString = formattedString.replace(/\n/g, '<br>');
    
    formattedString = formattedString.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>');
    formattedString = formattedString.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>');
    formattedString = formattedString.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>');
    
    formattedString = formattedString.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>');
    
    return formattedString;
}

// Function to display chat history
function displayChatHistory() {
    chatHistoryArray.forEach(function(messageObject) {
        const messageDivElement = document.createElement('div');
        messageDivElement.className = 'message ' + messageObject.role;
        
        const contentDivElement = document.createElement('div');
        contentDivElement.className = 'message-content';
        
        if (messageObject.role === 'assistant') {
            contentDivElement.innerHTML = formatMessage(messageObject.content);
        } else {
            contentDivElement.textContent = messageObject.content;
        }
        
        messageDivElement.appendChild(contentDivElement);
        chatMessagesElement.appendChild(messageDivElement);
    });
    
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    startRegularChat();
}

// Function to show typing indicator
function showTypingIndicator() {
    const typingDivElement = document.createElement('div');
    typingDivElement.className = 'typing-indicator';
    typingDivElement.id = 'typingIndicator';
    
    for (let i = 0; i < 3; i++) {
        const dotElement = document.createElement('div');
        dotElement.className = 'typing-dot';
        typingDivElement.appendChild(dotElement);
    }
    
    chatMessagesElement.appendChild(typingDivElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
}

// Function to hide typing indicator
function hideTypingIndicator() {
    const typingIndicatorElement = document.getElementById('typingIndicator');
    if (typingIndicatorElement !== null) {
        typingIndicatorElement.remove();
    }
}

// Function to send a message
async function sendMessage() {
    const messageString = chatInputElement.value.trim();
    if (messageString === '') {
        return;
    }
    
    addMessage('user', messageString);
    chatInputElement.value = '';
    
    showTypingIndicator();
    
    try {
        const responseString = await getAIResponse(messageString);
        hideTypingIndicator();
        addMessage('assistant', responseString);
    } catch (errorObject) {
        hideTypingIndicator();
        addMessage('assistant', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.');
        console.error('AI Response Error:', errorObject);
    }
}

// Function to get AI response
async function getAIResponse(userMessageString) {
    const recentMessagesArray = chatHistoryArray.slice(-10);
    const notesString = localStorage.getItem('notes') || '';
    
    const currentMoodValue = localStorage.getItem('mood');
    const currentSleepValue = localStorage.getItem('sleep');
    const currentStressValue = localStorage.getItem('stress');
    
    let userDataContextString = '';
    
    if (currentMoodValue !== null || currentSleepValue !== null || currentStressValue !== null) {
        userDataContextString = `
User's Current Day Values:
- Mood: ${currentMoodValue !== null ? currentMoodValue + '/10' : 'Not tracked today'}
- Sleep: ${currentSleepValue !== null ? currentSleepValue + '/10' : 'Not tracked today'}
- Stress: ${currentStressValue !== null ? currentStressValue + '/10' : 'Not tracked today'}`;
    }
    
    if (notesString.trim() !== '') {
        userDataContextString = userDataContextString + `

User's Journal Notes:
"${notesString.trim()}"`;
    }
    
    let systemPromptString = `You are a compassionate mental health AI assistant for MindMate. You help users with mood, sleep, and stress management. 

User Profile: ${userProfileObject !== null ? userProfileObject.primaryConcern : 'Not specified'}

CURRENT USER DATA (Real-time from tracking app):
${userDataContextString}

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

    if (webSearchEnabledFlag === true) {
        systemPromptString = systemPromptString + `

WEB SEARCH ENABLED: When the user asks for current information, resources, or specific details, you should:
- Search the web for relevant, up-to-date information
- Provide specific sources and links when possible
- Include recent research, studies, or news related to mental health
- Cite reputable sources like medical journals, health organizations, or mental health websites
- Format links as [Source Name](URL) in your response
- Focus on evidence-based information and current best practices`;
    }

    const messagesArray = [
        { role: 'system', content: systemPromptString },
        ...recentMessagesArray.map(function(messageObject) {
            return {
                role: messageObject.role,
                content: messageObject.content
            };
        }),
        { role: 'user', content: userMessageString }
    ];

    const responseObject = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + GROQ_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: messagesArray,
            max_tokens: 800,
            temperature: 0.7
        })
    });

    if (responseObject.ok === false) {
        throw new Error('HTTP error! status: ' + responseObject.status);
    }

    const dataObject = await responseObject.json();
    return dataObject.choices[0].message.content;
}

// Function to get current week scores
function getCurrentWeekScores(metricName) {
    const scoresString = localStorage.getItem(metricName + '_scores');
    const scoresArray = JSON.parse(scoresString || '[]');
    const currentDate = new Date();
    const startOfWeekDate = new Date(currentDate);
    startOfWeekDate.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeekDate.setHours(0, 0, 0, 0);
    
    const endOfWeekDate = new Date(startOfWeekDate);
    endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
    endOfWeekDate.setHours(23, 59, 59, 999);
    
    const weekScoresArray = scoresArray.filter(function(score) {
        const scoreDate = new Date(score.date);
        return scoreDate >= startOfWeekDate && scoreDate <= endOfWeekDate;
    });
    
    return weekScoresArray;
}

// Function to clear chat
function clearChat() {
    if (confirm('Are you sure you want to clear the chat and reset the conversation? This will remove all chat history and start fresh.') === true) {
        chatHistoryArray = [];
        localStorage.removeItem('mindmate_chat_history');
        
        localStorage.removeItem('mindmate_user_profile');
        userProfileObject = null;
        
        chatMessagesElement.innerHTML = '';
        
        startOnboarding();
    }
}

// Function to toggle web search
function toggleWebSearch() {
    webSearchEnabledFlag = !webSearchEnabledFlag;
    webSearchButtonElement.classList.toggle('active');
    
    if (webSearchEnabledFlag === true) {
        webSearchButtonElement.title = 'Web Search Enabled';
        webSearchButtonElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="11" cy="11" r="3" fill="currentColor"/>
            </svg>
        `;
    } else {
        webSearchButtonElement.title = 'Enable Web Search';
        webSearchButtonElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', initializeChat);
