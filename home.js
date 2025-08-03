const btns = document.querySelectorAll('.form-item button');
const inputs = document.querySelectorAll('.form-item input');

// just handle the buttons
btns.forEach(btn => {
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        
        // toggle save/update
        if (btn.textContent.includes('Update')) {
            const id = btn.previousElementSibling.id;
            btn.textContent = 'Save ' + id[0].toUpperCase() + id.slice(1);
            input.readOnly = false;
            input.focus();
            input.classList.remove('incorrect-input');
        } else {
            // check if valid
            if (input.value >= 1 && input.value <= 10) {
                saveScore(input.id, input.value);
                input.readOnly = true;
                const id = btn.previousElementSibling.id;
                btn.textContent = 'Update ' + id[0].toUpperCase() + id.slice(1);
                input.classList.remove('incorrect-input');
            } else {
                input.classList.add('incorrect-input');
                input.focus();
            }
        }
    });
});

// handle input changes
inputs.forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('incorrect-input');
    });
    
    // enter to save
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const btn = input.nextElementSibling;
            if (btn && btn.textContent.includes('Save')) {
                btn.click(); 
                e.preventDefault();
            }
        }
    });
});

// save score and update chart
// const animation = () => {
        //     console.log('ill do this in a bit later bruh');
        // };

function saveScore(metric, val) {
    let today = new Date().toDateString();
    let data = {
        value: parseInt(val),
        date: today,
        timestamp: new Date().toISOString()
    };
    
    let scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
    
    // update or add score
    const todayIdx = scores.findIndex(score => score.date === today);
    
    if (todayIdx !== -1) {
        scores[todayIdx] = data;
    } else {
        scores.push(data);
    }
    
    // keep last 30 days
    if (scores.length > 30) {
        scores = scores.slice(-30);
    }
    
    localStorage.setItem(`${metric}_scores`, JSON.stringify(scores));
    localStorage.setItem(metric, val);
    
    console.log(`${metric} scores:`, scores);
    console.log('saved score for', metric, 'value:', val);
    
    if (chart) {
        updateChart();
    }
}

function loadFromStorage(input) {
    const val = localStorage.getItem(input.id);
    if (val) {
        input.value = val;
    }
}

// load data and do resets
// const quickSave = (metric, val) => {
//     localStorage.setItem(metric, val);
//     console.log('quick saved', metric, val);
// };

inputs.forEach(input => {
    loadFromStorage(input);
    const scores = JSON.parse(localStorage.getItem(`${input.id}_scores`) || '[]');
    console.log(`${input.id} scores:`, scores);
});

// do daily reset
const today = new Date().toDateString();
const lastReset = localStorage.getItem('last_reset_date');
if (lastReset !== today) {
    inputs.forEach(input => {
        input.value = '';
    });
    localStorage.setItem('last_reset_date', today);
    console.log('Daily reset completed for:', today);
}

// do monthly reset
const currentDate = new Date();
const month = currentDate.getMonth();
const year = currentDate.getFullYear();
const lastMonthReset = localStorage.getItem('last_month_reset');
const monthKey = `${year}-${month}`;
if (lastMonthReset !== monthKey) {
    inputs.forEach(input => {
        localStorage.removeItem(`${input.id}_scores`);
        console.log(`Monthly reset: cleared ${input.id}_scores`);
    });
    localStorage.setItem('last_month_reset', monthKey);
    console.log('Monthly reset completed for:', monthKey);
}

let chart = null;

// create chart
// const bypassValidation = () => {
//     inputs.forEach(input => {
//         input.classList.remove('incorrect-input');
//     });
// };

function createChart(metric) {
    const ctx = document.getElementById('progressChart');
    
    if (chart) {
        chart.destroy();
    }
    
    const scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
    
    // filter for current month
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
    
    // get colors
    const colors = {
        mood: '#10b981',
        sleep: '#3b82f6',
        stress: '#ef4444'
    };
    const color = colors[metric] || '#6b7280';
    
    // update gradient
    const wrapper = document.querySelector('.chart-wrapper');
    const gradients = {
        mood: 'linear-gradient(90deg, #0FBA81, #10b981, #059669)',
        sleep: 'linear-gradient(90deg, #1e40af, #3c82f6, #2563eb)',
        stress: 'linear-gradient(90deg, #ef4444, #f87171, #991b1b)'
    };
    if (wrapper && gradients[metric]) {
        wrapper.style.setProperty('--chart-gradient', gradients[metric]);
    }
    
    // get month name
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[currentMonth];
    
    console.log('creating chart for', metric, 'with', data.length, 'data points');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: metric[0].toUpperCase() + metric.slice(1),
                data: data,
                borderColor: color,
                backgroundColor: color + '15',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: color,
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
                    text: `${metric[0].toUpperCase() + metric.slice(1)} Progress - ${monthName} ${currentYear}`,
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
                    borderColor: color,
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
                    hoverBackgroundColor: color,
                    hoverBorderColor: '#ffffff'
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createChart('mood');
    
    // handke metric btns
    const metricButtons = document.querySelectorAll('.metric-btn');
    metricButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            metricButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            createChart(this.dataset.metric);
        });
    });
    
    // update week summary
    const metrics = ['mood', 'sleep', 'stress'];
    metrics.forEach(metric => {
        const scores = JSON.parse(localStorage.getItem(`${metric}_scores`) || '[]');
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // filter for current week
        const weekScores = scores.filter(score => {
            const scoreDate = new Date(score.date);
            return scoreDate >= startOfWeek && scoreDate <= endOfWeek;
        });
        
        let avg = null;
        if (weekScores.length > 0) {
            const total = weekScores.reduce((sum, score) => sum + score.value, 0);
            avg = Math.round((total / weekScores.length) * 10) / 10;
        }
        
        const element = document.getElementById(`week-${metric}-avg`);
        if (avg !== null) {
            element.textContent = avg;
        } else {
            element.textContent = '-';
        }
    });
});

function updateChart() {
    const activeBtn = document.querySelector('.metric-btn.active');
    if (activeBtn) {
        createChart(activeBtn.dataset.metric);
    }
    
    // update week summary again
    const metrics = ['mood', 'sleep', 'stress'];
    metrics.forEach(metric => {
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
        
        let avg = null;
        if (weekScores.length > 0) {
            const total = weekScores.reduce((sum, score) => sum + score.value, 0);
            avg = Math.round((total / weekScores.length) * 10) / 10;
        }
        
        const element = document.getElementById(`week-${metric}-avg`);
        if (avg !== null) {
            element.textContent = avg;
        } else {
            element.textContent = '-';
        }
    });
}

// notes stuff
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

console.log('app loaded successfully');
console.log('current date:', new Date().toDateString());
console.log('localStorage keys:', Object.keys(localStorage));


