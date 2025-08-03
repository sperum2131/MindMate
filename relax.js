let breathingInterval = null;
let timerInterval = null;
let isBreathing = false;
let timeLeft = 60;

const breathingCircle = document.getElementById('breathingCircle');
const breathingText = document.getElementById('breathingText');
const startBtn = document.getElementById('startBreathing');
const stopBtn = document.getElementById('stopBreathing');
const timer = document.getElementById('timer');
const affirmationText = document.getElementById('affirmationText');

// tell adi to come up w more quoptes in a bit
const affirmations = [
    "Hey, you're doing better than you think.",
    "It's okay, this won't last forever.",
    "You've got more strength in you than you realize.",
    "Tomorrow's a new shot at things.",
    "You totally deserve kindness, from others and yourself.",
    "Whatever you're feeling, it's real and it's okay.",
    "You can totally flip the script in your head.",
    "Seriously, you're not the only one going through this.",
    "You can do awesome stuff, even if it doesn't feel like it right now.",
    "It's 100% fine to not have it all together.",
    "Tiny steps forward still count as progress.",
    "Taking care of your mind is just as important as anything else.",
    "You deserve a little self-care, no guilt.",
    "You've bounced back before, you can do it again.",
    "This rough patch? It'll pass.",
    "There are people who care about you, even if you forget sometimes.",
    "You've gotten through hard things before.",
    "Your story is yours, and that's pretty cool.",
    "Honestly, just showing up is enough some days.",
    "Asking for help is strong, not weak.",
    "You're not just your tough moments.",
    "Every breath is a little reset button.",
    "There's more strength in you than you give yourself credit for.",
    "You're growing, even if it feels weird or slow.",
    "You matter, even on the days you doubt it.",
    "Breaks are allowed. Seriously.",
    "Healing is happening, even if you can't see it yet.",
    "You've made it through every bad day so far.",
    "You're getting closer to who you want to be, bit by bit.",
    "You are enough, even on your messiest days."
];

const breathingPhases = [
    { text: 'Breathe in...', class: 'inhale', duration: 4000 },
    { text: 'Breathe out...', class: 'exhale', duration: 4000 }
];

let currentPhase = 0;

let breathingActive = false;

function startBreathing() {
    if (isBreathing) return;
    
    isBreathing = true;
    breathingActive = true;
    console.log('breathing just  started');
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    
    timeLeft = 60;
    timer.textContent = `${timeLeft}s`;
    
    // messy timer stuff
    let countdown = setInterval(() => {
        timeLeft--;
        timer.textContent = `${timeLeft}s`;
        
        if (timeLeft <= 0) {
            stopBreathing();
        }
    }, 1000);
    
    // breathing animation stuff
    let breathTimer = setInterval(() => {
        const phase = breathingPhases[currentPhase];
        
        breathingText.textContent = phase.text;
        breathingCircle.className = `breathing-circle ${phase.class}`;
        
        currentPhase = (currentPhase + 1) % breathingPhases.length;
    }, 4000);
    
    const phase = breathingPhases[0];
    breathingText.textContent = phase.text;
    breathingCircle.className = `breathing-circle ${phase.class}`;
}

function stopBreathing() {
    if (!isBreathing) return;
    
    isBreathing = false;
    breathingActive = false;
    console.log('breathing stopped'); // debug
    
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    
    breathingText.textContent = 'Ready to begin';
    breathingCircle.className = 'breathing-circle';
    
    // clear the timers
    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    timeLeft = 60;
    timer.textContent = `${timeLeft}s`;
    currentPhase = 0;
}

// show random quote
const randomIndex = Math.floor(Math.random() * affirmations.length);
affirmationText.textContent = affirmations[randomIndex];

// bubble game stuff
let bubbleCount = 5;
let autoAddInterval = null;
let isAutoAdding = false;

let hoverCount = 0;
let autoShapesInterval = null;
let isAutoAddingShapes = false;

// setup bubble game
const bubbleArea = document.getElementById('bubbleArea');
const bubbles = document.querySelectorAll('.bubble');

bubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
        bubble.classList.add('popped');
        setTimeout(() => {
            bubble.remove();
            bubbleCount--;
            document.getElementById('bubbleCount').textContent = bubbleCount;
            
            const newBubble = document.createElement('div');
            newBubble.className = 'bubble';
            const left = Math.random() * 80 + 10; 
            const top = Math.random() * 80 + 10; 
            newBubble.style.left = `${left}%`;
            newBubble.style.top = `${top}%`;
            
            newBubble.addEventListener('click', () => {
                newBubble.classList.add('popped');
                setTimeout(() => {
                    newBubble.remove();
                    bubbleCount--;
                    document.getElementById('bubbleCount').textContent = bubbleCount;
                }, 300);
            });
            
            bubbleArea.appendChild(newBubble);
            bubbleCount++;
            document.getElementById('bubbleCount').textContent = bubbleCount;
        }, 300);
    });
});

document.getElementById('bubbleCount').textContent = bubbleCount;

// reset bubbles
const resetBubblesBtn = document.getElementById('resetBubbles');
if (resetBubblesBtn) {
    resetBubblesBtn.onclick = () => {
        bubbleArea.innerHTML = '';
        bubbleCount = 0;
        console.log('bubbles reset'); // debug
        
        for (let i = 0; i < 5; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            const left = Math.random() * 80 + 10; 
            const top = Math.random() * 80 + 10; 
            bubble.style.left = `${left}%`;
            bubble.style.top = `${top}%`;
            
            bubble.addEventListener('click', () => {
                bubble.classList.add('popped');
                setTimeout(() => {
                    bubble.remove();
                    bubbleCount--;
                    document.getElementById('bubbleCount').textContent = bubbleCount;
                }, 300);
            });
            
            bubbleArea.appendChild(bubble);
            bubbleCount++;
            document.getElementById('bubbleCount').textContent = bubbleCount;
        }
    };
}

// add more bubbles
const addBubblesBtn = document.getElementById('addBubbles');
if (addBubblesBtn) {
    addBubblesBtn.addEventListener('click', () => {
        for (let i = 0; i < 3; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            const left = Math.random() * 80 + 10; 
            const top = Math.random() * 80 + 10; 
            bubble.style.left = `${left}%`;
            bubble.style.top = `${top}%`;
            
            bubble.addEventListener('click', () => {
                bubble.classList.add('popped');
                setTimeout(() => {
                    bubble.remove();
                    bubbleCount--;
                    document.getElementById('bubbleCount').textContent = bubbleCount;
                }, 300);
            });
            
            bubbleArea.appendChild(bubble);
            bubbleCount++;
            document.getElementById('bubbleCount').textContent = bubbleCount;
        }
    });
}

// auto add bubbles
const autoBtn = document.getElementById('autoBtn');
if (autoBtn) {
    autoBtn.addEventListener('click', () => {
        if (isAutoAdding) {
            clearInterval(autoAddInterval);
            autoAddInterval = null;
            isAutoAdding = false;
            autoBtn.textContent = 'Auto Add';
            autoBtn.classList.remove('active');
        } else {
            isAutoAdding = true;
            autoBtn.textContent = 'Stop Auto';
            autoBtn.classList.add('active');
            
            autoAddInterval = setInterval(() => {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                const left = Math.random() * 80 + 10; 
                const top = Math.random() * 80 + 10; 
                bubble.style.left = `${left}%`;
                bubble.style.top = `${top}%`;
                
                bubble.addEventListener('click', () => {
                    bubble.classList.add('popped');
                    setTimeout(() => {
                        bubble.remove();
                        bubbleCount--;
                        document.getElementById('bubbleCount').textContent = bubbleCount;
                    }, 300);
                });
                
                bubbleArea.appendChild(bubble);
                bubbleCount++;
                document.getElementById('bubbleCount').textContent = bubbleCount;
            }, 2000);
        }
    });
}

// shapes game
const shapes = document.querySelectorAll('.shape');

shapes.forEach(shape => {
    shape.addEventListener('mouseenter', () => {
        hoverCount++;
        document.getElementById('hoverCount').textContent = hoverCount;
    });
});

document.getElementById('hoverCount').textContent = hoverCount;

function resetShapes() {
    const shapesArea = document.getElementById('shapesGameArea');
    shapesArea.innerHTML = '';
    
    const shapeTypes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
    
    shapeTypes.forEach(type => {
        const shape = document.createElement('div');
        shape.className = `shape ${type}`;
        shape.dataset.shape = type;
        
        shape.addEventListener('mouseenter', () => {
            hoverCount++;
            document.getElementById('hoverCount').textContent = hoverCount;
        });
        
        shapesArea.appendChild(shape);
    });
    
    hoverCount = 0;
    document.getElementById('hoverCount').textContent = hoverCount;
}

// reset shapes
const resetShapesBtn = document.getElementById('resetShapes');
if (resetShapesBtn) {
    resetShapesBtn.onclick = resetShapes;
}

// add shapes
const addShapesBtn = document.getElementById('addShapes');
if (addShapesBtn) {
    addShapesBtn.addEventListener('click', () => {
        const shapesArea = document.getElementById('shapesGameArea');
        const shapeTypes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
        
        for (let i = 0; i < 3; i++) {
            const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
            const shape = document.createElement('div');
            shape.className = `shape ${randomType}`;
            shape.dataset.shape = randomType;
            
            shape.addEventListener('mouseenter', () => {
                hoverCount++;
                document.getElementById('hoverCount').textContent = hoverCount;
            });
            
            shapesArea.appendChild(shape);
        }
    });
}

// auto add shapes
const autoShapesBtn = document.getElementById('autoShapesBtn');
if (autoShapesBtn) {
    autoShapesBtn.addEventListener('click', () => {
        if (isAutoAddingShapes) {
            clearInterval(autoShapesInterval);
            autoShapesInterval = null;
            isAutoAddingShapes = false;
            autoShapesBtn.textContent = 'Auto Add';
            autoShapesBtn.classList.remove('active');
        } else {
            isAutoAddingShapes = true;
            autoShapesBtn.textContent = 'Stop Auto';
            autoShapesBtn.classList.add('active');
            
            autoShapesInterval = setInterval(() => {
                const shapesArea = document.getElementById('shapesGameArea');
                const shapeTypes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
                
                for (let i = 0; i < 3; i++) {
                    const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
                    const shape = document.createElement('div');
                    shape.className = `shape ${randomType}`;
                    shape.dataset.shape = randomType;
                    
                    shape.addEventListener('mouseenter', () => {
                        hoverCount++;
                        document.getElementById('hoverCount').textContent = hoverCount;
                    });
                    
                    shapesArea.appendChild(shape);
                }
            }, 3000);
        }
    });
}

// bind events later, scattered around
startBtn.onclick = startBreathing;
stopBtn.onclick = stopBreathing;

// add ambient sound player aug 3rd maybe
