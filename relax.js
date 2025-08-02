// Breathing exercise stuff
let breathingIntervalVariable = null;
let timerIntervalVariable = null;
let isBreathingExerciseActive = false;
let timeLeftInSeconds = 60;

// Get all the DOM elements we need
const breathingCircleElement = document.getElementById('breathingCircle');
const breathingTextElement = document.getElementById('breathingText');
const startBreathingButton = document.getElementById('startBreathing');
const stopBreathingButton = document.getElementById('stopBreathing');
const timerElement = document.getElementById('timer');
const affirmationTextElement = document.getElementById('affirmationText');

// List of positive affirmations for the user
const listOfPositiveAffirmations = [
    "You are enough.",
    "This feeling will pass.",
    "You are stronger than you think.",
    "Every day is a new beginning.",
    "You are worthy of love and respect.",
    "Your feelings are valid.",
    "You have the power to change your thoughts.",
    "You are not alone in this.",
    "You are capable of amazing things.",
    "It's okay to not be okay.",
    "You are making progress, even if it's small.",
    "Your mental health matters.",
    "You deserve to take care of yourself.",
    "You are resilient and brave.",
    "This too shall pass.",
    "You are loved and supported.",
    "You have overcome challenges before.",
    "Your journey is unique and valuable.",
    "You are doing your best.",
    "It's okay to ask for help.",
    "You are more than your struggles.",
    "Every breath is a fresh start.",
    "You have inner strength you haven't tapped yet.",
    "You are growing through what you're going through.",
    "Your presence matters in this world.",
    "You are allowed to take breaks.",
    "You are healing, even if you can't see it.",
    "You have survived 100% of your bad days.",
    "You are becoming the person you want to be.",
    "You are enough, just as you are."
];

// Function to show a random affirmation
function displayRandomAffirmation() {
    const randomNumber = Math.floor(Math.random() * listOfPositiveAffirmations.length);
    const selectedAffirmation = listOfPositiveAffirmations[randomNumber];
    affirmationTextElement.textContent = selectedAffirmation;
}

// Define the breathing phases with their properties
const breathingPhasesArray = [
    { text: 'Breathe in...', class: 'inhale', duration: 4000 },
    { text: 'Breathe out...', class: 'exhale', duration: 4000 }
];

let currentPhaseIndex = 0;

// Function to start the breathing exercise
function startBreathing() {
    if (isBreathingExerciseActive === true) {
        return;
    }
    
    isBreathingExerciseActive = true;
    startBreathingButton.style.display = 'none';
    stopBreathingButton.style.display = 'block';
    
    timeLeftInSeconds = 60;
    updateTimer();
    
    timerIntervalVariable = setInterval(function() {
        timeLeftInSeconds = timeLeftInSeconds - 1;
        updateTimer();
        
        if (timeLeftInSeconds <= 0) {
            stopBreathing();
        }
    }, 1000);
    
    breathingIntervalVariable = setInterval(function() {
        const currentPhase = breathingPhasesArray[currentPhaseIndex];
        
        breathingTextElement.textContent = currentPhase.text;
        breathingCircleElement.className = 'breathing-circle ' + currentPhase.class;
        
        currentPhaseIndex = (currentPhaseIndex + 1) % breathingPhasesArray.length;
    }, 4000);
    
    const firstPhase = breathingPhasesArray[0];
    breathingTextElement.textContent = firstPhase.text;
    breathingCircleElement.className = 'breathing-circle ' + firstPhase.class;
}

// Function to stop the breathing exercise
function stopBreathing() {
    if (isBreathingExerciseActive === false) {
        return;
    }
    
    isBreathingExerciseActive = false;
    startBreathingButton.style.display = 'block';
    stopBreathingButton.style.display = 'none';
    
    breathingTextElement.textContent = 'Ready to begin';
    breathingCircleElement.className = 'breathing-circle';
    
    if (breathingIntervalVariable !== null) {
        clearInterval(breathingIntervalVariable);
        breathingIntervalVariable = null;
    }
    
    if (timerIntervalVariable !== null) {
        clearInterval(timerIntervalVariable);
        timerIntervalVariable = null;
    }
    
    timeLeftInSeconds = 60;
    updateTimer();
    currentPhaseIndex = 0;
}

// Function to update the timer display
function updateTimer() {
    timerElement.textContent = timeLeftInSeconds + 's';
}

// Add event listeners for the breathing buttons
startBreathingButton.addEventListener('click', startBreathing);
stopBreathingButton.addEventListener('click', stopBreathing);

// Show a random affirmation when the page loads
document.addEventListener('DOMContentLoaded', displayRandomAffirmation);

// Bubble game variables
let numberOfBubbles = 5;
let autoAddBubbleInterval = null;
let isAutoAddingBubbles = false;

// Shapes game variables
let numberOfHovers = 0;
let autoAddShapesInterval = null;
let isAutoAddingShapes = false;

// Function to initialize the bubble game
function initBubbleGame() {
    const bubbleAreaElement = document.getElementById('bubbleArea');
    const allBubbleElements = document.querySelectorAll('.bubble');
    
    for (let i = 0; i < allBubbleElements.length; i++) {
        const currentBubble = allBubbleElements[i];
        currentBubble.addEventListener('click', function() {
            currentBubble.classList.add('popped');
            setTimeout(function() {
                currentBubble.remove();
                numberOfBubbles = numberOfBubbles - 1;
                updateBubbleCount();
                createNewBubble(bubbleAreaElement);
            }, 300);
        });
    }
    
    updateBubbleCount();
}

// Function to create a new bubble
function createNewBubble(areaElement) {
    const newBubbleElement = document.createElement('div');
    newBubbleElement.className = 'bubble';
    
    const randomLeftPosition = Math.random() * 80 + 10; 
    const randomTopPosition = Math.random() * 80 + 10; 
    
    newBubbleElement.style.left = randomLeftPosition + '%';
    newBubbleElement.style.top = randomTopPosition + '%';
    
    newBubbleElement.addEventListener('click', function() {
        newBubbleElement.classList.add('popped');
        setTimeout(function() {
            newBubbleElement.remove();
            numberOfBubbles = numberOfBubbles - 1;
            updateBubbleCount();
            createNewBubble(areaElement);
        }, 300);
    });
    
    areaElement.appendChild(newBubbleElement);
    numberOfBubbles = numberOfBubbles + 1;
    updateBubbleCount();
}

// Function to update the bubble count display
function updateBubbleCount() {
    const bubbleCountDisplayElement = document.getElementById('bubbleCount');
    bubbleCountDisplayElement.textContent = numberOfBubbles;
}

// Function to reset all bubbles
function resetBubbles() {
    const bubbleAreaElement = document.getElementById('bubbleArea');
    bubbleAreaElement.innerHTML = '';
    numberOfBubbles = 0;
    
    for (let i = 0; i < 5; i++) {
        createNewBubble(bubbleAreaElement);
    }
}

// Function to add more bubbles
function addBubbles() {
    const bubbleAreaElement = document.getElementById('bubbleArea');
    
    for (let i = 0; i < 3; i++) {
        createNewBubble(bubbleAreaElement);
    }
}

// Function to toggle auto adding bubbles
function toggleAutoBubbles() {
    const autoButtonElement = document.getElementById('autoBtn');
    
    if (isAutoAddingBubbles === true) {
        clearInterval(autoAddBubbleInterval);
        autoAddBubbleInterval = null;
        isAutoAddingBubbles = false;
        autoButtonElement.textContent = 'Auto Add';
        autoButtonElement.classList.remove('active');
    } else {
        isAutoAddingBubbles = true;
        autoButtonElement.textContent = 'Stop Auto';
        autoButtonElement.classList.add('active');
        
        autoAddBubbleInterval = setInterval(function() {
            const bubbleAreaElement = document.getElementById('bubbleArea');
            createNewBubble(bubbleAreaElement);
        }, 2000); 
    }
}

// Function to initialize the shapes game
function initShapesGame() {
    const allShapeElements = document.querySelectorAll('.shape');
    
    for (let i = 0; i < allShapeElements.length; i++) {
        const currentShape = allShapeElements[i];
        currentShape.addEventListener('mouseenter', function() {
            numberOfHovers = numberOfHovers + 1;
            updateHoverCount();
        });
    }
    
    updateHoverCount();
}

// Function to reset all shapes
function resetShapes() {
    const shapesAreaElement = document.getElementById('shapesGameArea');
    shapesAreaElement.innerHTML = '';
    
    const arrayOfShapeTypes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
    
    for (let i = 0; i < arrayOfShapeTypes.length; i++) {
        const currentShapeType = arrayOfShapeTypes[i];
        const newShapeElement = document.createElement('div');
        newShapeElement.className = 'shape ' + currentShapeType;
        newShapeElement.dataset.shape = currentShapeType;
        
        newShapeElement.addEventListener('mouseenter', function() {
            numberOfHovers = numberOfHovers + 1;
            updateHoverCount();
        });
        
        shapesAreaElement.appendChild(newShapeElement);
    }
    
    numberOfHovers = 0;
    updateHoverCount();
}

// Function to add more shapes
function addShapes() {
    const shapesAreaElement = document.getElementById('shapesGameArea');
    const arrayOfShapeTypes = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
    
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * arrayOfShapeTypes.length);
        const randomShapeType = arrayOfShapeTypes[randomIndex];
        const newShapeElement = document.createElement('div');
        newShapeElement.className = 'shape ' + randomShapeType;
        newShapeElement.dataset.shape = randomShapeType;
        
        newShapeElement.addEventListener('mouseenter', function() {
            numberOfHovers = numberOfHovers + 1;
            updateHoverCount();
        });
        
        shapesAreaElement.appendChild(newShapeElement);
    }
}

// Function to toggle auto adding shapes
function toggleAutoShapes() {
    const autoShapesButtonElement = document.getElementById('autoShapesBtn');
    
    if (isAutoAddingShapes === true) {
        clearInterval(autoAddShapesInterval);
        autoAddShapesInterval = null;
        isAutoAddingShapes = false;
        autoShapesButtonElement.textContent = 'Auto Add';
        autoShapesButtonElement.classList.remove('active');
    } else {
        isAutoAddingShapes = true;
        autoShapesButtonElement.textContent = 'Stop Auto';
        autoShapesButtonElement.classList.add('active');
        
        autoAddShapesInterval = setInterval(function() {
            addShapes();
        }, 3000);
    }
}

// Function to update the hover count display
function updateHoverCount() {
    const hoverCountDisplayElement = document.getElementById('hoverCount');
    hoverCountDisplayElement.textContent = numberOfHovers;
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayRandomAffirmation();
    initBubbleGame();
    initShapesGame();
});
