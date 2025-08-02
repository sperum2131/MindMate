// Get all the update buttons and form inputs
const allUpdateButtons = document.querySelectorAll('.form-item button');
const allFormInputs = document.querySelectorAll('.form-item input');

// Add event listeners to all update buttons
allUpdateButtons.forEach(function(buttonElement) {
    buttonElement.addEventListener('click', function() {
        const inputElement = buttonElement.previousElementSibling;
        
        if (buttonElement.textContent.includes('Update') === true) {
            const inputId = buttonElement.previousElementSibling.id;
            const firstLetter = inputId.charAt(0).toUpperCase();
            const restOfString = inputId.slice(1);
            buttonElement.textContent = 'Save ' + firstLetter + restOfString;
            inputElement.readOnly = false;
            inputElement.focus();
            inputElement.classList.remove('incorrect-input');
        } else {
            if (inputElement.value >= 1 && inputElement.value <= 10) {
                saveScore(inputElement.id, inputElement.value);
                inputElement.readOnly = true;
                const inputId = buttonElement.previousElementSibling.id;
                const firstLetter = inputId.charAt(0).toUpperCase();
                const restOfString = inputId.slice(1);
                buttonElement.textContent = 'Update ' + firstLetter + restOfString;
                inputElement.classList.remove('incorrect-input');
            } else {
                inputElement.classList.add('incorrect-input');
                inputElement.focus();
            }
        }
    });
});

// Add event listeners to all form inputs
allFormInputs.forEach(function(inputElement) {
    inputElement.addEventListener('input', function() {
        inputElement.classList.remove('incorrect-input');
    });
    
    inputElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const buttonElement = inputElement.nextElementSibling;
            if (buttonElement !== null && buttonElement.textContent.includes('Save') === true) {
                buttonElement.click(); 
                event.preventDefault();
            }
        }
    });
});

// Function to save a score for a specific metric
function saveScore(metricName, scoreValue) {
    const currentDate = new Date();
    const todayString = currentDate.toDateString();
    const scoreDataObject = {
        value: parseInt(scoreValue),
        date: todayString,
        timestamp: new Date().toISOString()
    };
    
    const localStorageKey = metricName + '_scores';
    const existingScoresString = localStorage.getItem(localStorageKey);
    let scoresArray = JSON.parse(existingScoresString || '[]');
    
    const todayIndex = scoresArray.findIndex(function(score) {
        return score.date === todayString;
    });
    
    if (todayIndex !== -1) {
        scoresArray[todayIndex] = scoreDataObject;
    } else {
        scoresArray.push(scoreDataObject);
    }
    
    if (scoresArray.length > 30) {
        scoresArray = scoresArray.slice(-30);
    }
    
    localStorage.setItem(localStorageKey, JSON.stringify(scoresArray));
    localStorage.setItem(metricName, scoreValue);
    
    console.log(metricName + ' scores:', scoresArray);
    
    if (progressChart !== null) {
        updateChart();
    }
}

// Function to load data from localStorage for a specific input
function loadFromLocalStorage(inputElement) {
    const storedValue = localStorage.getItem(inputElement.id);
    if (storedValue !== null) {
        inputElement.value = storedValue;
    }
}

// Function to reset daily scores
function resetDailyScores() {
    const currentDate = new Date();
    const todayString = currentDate.toDateString();
    const lastResetDate = localStorage.getItem('last_reset_date');
    
    if (lastResetDate !== todayString) {
        allFormInputs.forEach(function(inputElement) {
            inputElement.value = '';
        });
        localStorage.setItem('last_reset_date', todayString);
        console.log('Daily reset completed for:', todayString);
    }
}

// Function to reset monthly scores
function resetMonthlyScores() {
    const currentDate = new Date();
    const currentMonthNumber = currentDate.getMonth();
    const currentYearNumber = currentDate.getFullYear();
    const lastMonthResetString = localStorage.getItem('last_month_reset');
    
    const monthKeyString = currentYearNumber + '-' + currentMonthNumber;
    
    if (lastMonthResetString !== monthKeyString) {
        allFormInputs.forEach(function(inputElement) {
            localStorage.removeItem(inputElement.id + '_scores');
            console.log('Monthly reset: cleared ' + inputElement.id + '_scores');
        });
        localStorage.setItem('last_month_reset', monthKeyString);
        console.log('Monthly reset completed for:', monthKeyString);
    }
}

// Load data from localStorage for all inputs
allFormInputs.forEach(function(inputElement) {
    loadFromLocalStorage(inputElement);
    const scoresString = localStorage.getItem(inputElement.id + '_scores');
    const scoresArray = JSON.parse(scoresString || '[]');
    console.log(inputElement.id + ' scores:', scoresArray);
});

// Call reset functions
resetDailyScores();
resetMonthlyScores();

// Global variable for the chart
let progressChart = null;

// Function to create the chart
function createChart(metricName) {
    const chartCanvas = document.getElementById('progressChart');
    
    if (progressChart !== null) {
        progressChart.destroy();
    }
    
    const localStorageKey = metricName + '_scores';
    const scoresString = localStorage.getItem(localStorageKey);
    const scoresArray = JSON.parse(scoresString || '[]');
    
    const currentDate = new Date();
    const currentMonthNumber = currentDate.getMonth();
    const currentYearNumber = currentDate.getFullYear();
    const monthScoresArray = scoresArray.filter(function(score) {
        const scoreDate = new Date(score.date);
        return scoreDate.getMonth() === currentMonthNumber && scoreDate.getFullYear() === currentYearNumber;
    });
    
    monthScoresArray.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    
    const labelsArray = monthScoresArray.map(function(score) {
        const dateObject = new Date(score.date);
        return dateObject.getDate();
    });
    
    const dataArray = monthScoresArray.map(function(score) {
        return score.value;
    });
    
    progressChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: labelsArray,
            datasets: [{
                label: metricName.charAt(0).toUpperCase() + metricName.slice(1),
                data: dataArray,
                borderColor: getMetricColor(metricName),
                backgroundColor: getMetricColor(metricName) + '15',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: getMetricColor(metricName),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointHoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: metricName.charAt(0).toUpperCase() + metricName.slice(1) + ' Progress - ' + getMonthName(currentMonthNumber) + ' ' + currentYearNumber,
                    font: {
                        family: 'Manrope, sans-serif',
                        size: 18,
                        weight: '700'
                    },
                    color: '#1f2937',
                    padding: {
                        top: 0,
                        bottom: 20
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: getMetricColor(metricName),
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: false,
                    titleFont: {
                        family: 'Manrope, sans-serif',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Manrope, sans-serif',
                        size: 13,
                        weight: '500'
                    },
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    min: 0,
                    ticks: {
                        stepSize: 2,
                        font: {
                            family: 'Manrope, sans-serif',
                            size: 12,
                            weight: '500'
                        },
                        color: '#6b7280',
                        padding: 8
                    },
                    grid: {
                        color: '#f3f4f6',
                        lineWidth: 1
                    },
                    border: {
                        color: '#e5e7eb',
                        width: 1
                    }
                },
                x: {
                    grid: {
                        color: '#f3f4f6',
                        lineWidth: 1
                    },
                    border: {
                        color: '#e5e7eb',
                        width: 1
                    },
                    ticks: {
                        font: {
                            family: 'Manrope, sans-serif',
                            size: 12,
                            weight: '500'
                        },
                        color: '#6b7280',
                        padding: 8
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverBackgroundColor: getMetricColor(metricName),
                    hoverBorderColor: '#ffffff'
                }
            }
        }
    });
    
    updateChartGradient(metricName);
}

// Function to get the color for a specific metric
function getMetricColor(metricName) {
    const colorObject = {
        mood: '#10b981',
        sleep: '#3b82f6',
        stress: '#ef4444'
    };
    return colorObject[metricName] || '#6b7280';
}

// Function to update the chart gradient
function updateChartGradient(metricName) {
    const chartWrapperElement = document.querySelector('.chart-wrapper');
    const gradientObject = {
        mood: 'linear-gradient(90deg, #0FBA81, #10b981, #059669)',
        sleep: 'linear-gradient(90deg, #1e40af, #3c82f6, #2563eb)',
        stress: 'linear-gradient(90deg, #ef4444, #f87171, #991b1b)'
    };
    
    if (chartWrapperElement !== null && gradientObject[metricName] !== undefined) {
        chartWrapperElement.style.setProperty('--chart-gradient', gradientObject[metricName]);
    }
}

// Function to get the month name
function getMonthName(monthNumber) {
    const monthsArray = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthsArray[monthNumber];
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    createChart('mood');
    updateWeekSummary();
    
    const metricButtonsArray = document.querySelectorAll('.metric-btn');
    metricButtonsArray.forEach(function(buttonElement) {
        buttonElement.addEventListener('click', function() {
            metricButtonsArray.forEach(function(btnElement) {
                btnElement.classList.remove('active');
            });
            this.classList.add('active');
            createChart(this.dataset.metric);
        });
    });
});

// Function to update the chart
function updateChart() {
    const activeButtonElement = document.querySelector('.metric-btn.active');
    if (activeButtonElement !== null) {
        createChart(activeButtonElement.dataset.metric);
    }
    updateWeekSummary();
}

// Add event listener for notes
document.getElementById('notes').addEventListener('input', saveNotes);

// Function to save notes
function saveNotes() {
    const notesTextarea = document.getElementById('notes');
    const notesValue = notesTextarea.value;
    localStorage.setItem('notes', notesValue);
}

// Function to load notes
function loadNotes() {
    const notesValue = localStorage.getItem('notes');
    if (notesValue !== null) {
        document.getElementById('notes').value = notesValue;
    }
}

// Load notes when page loads
loadNotes();

// Function to get current week scores
function getCurrentWeekScores(metricName) {
    const localStorageKey = metricName + '_scores';
    const scoresString = localStorage.getItem(localStorageKey);
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

// Function to calculate week average
function calculateWeekAverage(metricName) {
    const weekScoresArray = getCurrentWeekScores(metricName);
    
    if (weekScoresArray.length === 0) {
        return null;
    }
    
    const totalSum = weekScoresArray.reduce(function(sum, score) {
        return sum + score.value;
    }, 0);
    return Math.round((totalSum / weekScoresArray.length) * 10) / 10;
}

// Function to update week summary
function updateWeekSummary() {
    const metricsArray = ['mood', 'sleep', 'stress'];
    
    metricsArray.forEach(function(metricName) {
        const averageValue = calculateWeekAverage(metricName);
        const elementId = 'week-' + metricName + '-avg';
        const element = document.getElementById(elementId);
        
        if (averageValue !== null) {
            element.textContent = averageValue;
        } else {
            element.textContent = '-';
        }
    });
}


