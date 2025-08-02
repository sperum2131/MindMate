const updateButtons = document.querySelectorAll('.form-item button');
const formInputs = document.querySelectorAll('.form-item input');

updateButtons.forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        
        if (button.textContent.includes('Update')) {
            button.textContent = 'Save ' + button.previousElementSibling.id.charAt(0).toUpperCase() + button.previousElementSibling.id.slice(1);
            input.readOnly = false;
            input.focus();
            input.classList.remove('incorrect-input');
        } else {
            if (input.value >= 1 && input.value <= 10) {
                saveScore(input.id, input.value);
                input.readOnly = true;
                button.textContent = 'Update ' + button.previousElementSibling.id.charAt(0).toUpperCase() + button.previousElementSibling.id.slice(1);
                input.classList.remove('incorrect-input');
            } else {
                input.classList.add('incorrect-input');
                input.focus();
            }
        }
    });
});

formInputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('incorrect-input');
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const button = input.nextElementSibling;
            if (button && button.textContent.includes('Save')) {
                button.click(); 
                e.preventDefault();
            }
        }
    });
});

function saveScore(metric, value) {
    const today = new Date().toDateString();
    const scoreData = {
        value: parseInt(value),
        date: today,
        timestamp: new Date().toISOString()
    };
    
    let scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
    
    const todayIndex = scores.findIndex(score => score.date === today);
    
    if (todayIndex !== -1) {
        scores[todayIndex] = scoreData;
    } else {
        scores.push(scoreData);
    }
    
    if (scores.length > 30) {
        scores = scores.slice(-30);
    }
    
    localStorage.setItem(`${metric}_scores`, JSON.stringify(scores));
    localStorage.setItem(metric, value);
    
    console.log(`${metric} scores:`, scores);
    
    if (progressChart) {
        updateChart();
    }
}

function loadFromLocalStorage(input) {
    const value = localStorage.getItem(input.id);
    if (value) {
        input.value = value;
    }
}

function resetDailyScores() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('last_reset_date');
    
    if (lastReset !== today) {
        formInputs.forEach(input => {
            input.value = '';
        });
        localStorage.setItem('last_reset_date', today);
        console.log('Daily reset completed for:', today);
    }
}

function resetMonthlyScores() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastMonthReset = localStorage.getItem('last_month_reset');
    
    const monthKey = `${currentYear}-${currentMonth}`;
    
    if (lastMonthReset !== monthKey) {
        formInputs.forEach(input => {
            localStorage.removeItem(`${input.id}_scores`);
            console.log(`Monthly reset: cleared ${input.id}_scores`);
        });
        localStorage.setItem('last_month_reset', monthKey);
        console.log('Monthly reset completed for:', monthKey);
    }
}

formInputs.forEach(input => {
    loadFromLocalStorage(input);
    const scores = JSON.parse(localStorage.getItem(`${input.id}_scores`) || '[]');
    console.log(`${input.id} scores:`, scores);
});

resetDailyScores();
resetMonthlyScores();

let progressChart = null;

function createChart(metric) {
    const ctx = document.getElementById('progressChart');
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    const scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthScores = scores.filter(score => {
        const scoreDate = new Date(score.date);
        return scoreDate.getMonth() === currentMonth && scoreDate.getFullYear() === currentYear;
    });
    
    monthScores.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = monthScores.map(score => {
        const date = new Date(score.date);
        return date.getDate();
    });
    
    const data = monthScores.map(score => score.value);
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: metric.charAt(0).toUpperCase() + metric.slice(1),
                data: data,
                borderColor: getMetricColor(metric),
                backgroundColor: getMetricColor(metric) + '15',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: getMetricColor(metric),
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
                    text: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Progress - ${getMonthName(currentMonth)} ${currentYear}`,
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
                    borderColor: getMetricColor(metric),
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
                    hoverBackgroundColor: getMetricColor(metric),
                    hoverBorderColor: '#ffffff'
                }
            }
        }
    });
}

function getMetricColor(metric) {
    const colors = {
        mood: '#10b981',
        sleep: '#3b82f6',
        stress: '#ef4444'
    };
    return colors[metric] || '#6b7280';
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}

document.addEventListener('DOMContentLoaded', function() {
    createChart('mood');
    
    const metricButtons = document.querySelectorAll('.metric-btn');
    metricButtons.forEach(button => {
        button.addEventListener('click', function() {
            metricButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            createChart(this.dataset.metric);
        });
    });
});

function updateChart() {
    const activeButton = document.querySelector('.metric-btn.active');
    if (activeButton) {
        createChart(activeButton.dataset.metric);
    }
}

document.getElementById('notes').addEventListener('input', saveNotes);

function saveNotes() {
    const notes = document.getElementById('notes').value;
    localStorage.setItem('notes', notes);
}

function loadNotes() {
    const notes = localStorage.getItem('notes');
    if (notes) {
        document.getElementById('notes').value = notes;
    }
}

loadNotes();
