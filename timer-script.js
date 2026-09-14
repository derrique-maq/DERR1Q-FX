// DOM Elements
const timeDisplay = document.getElementById('timeDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const soundToggle = document.getElementById('soundToggle');
const notificationSound = document.getElementById('notificationSound');
const timersContainer = document.getElementById('timersContainer');
const historyContainer = document.getElementById('historyContainer');
const progressCircle = document.getElementById('progressCircle');

// State
let timeLeft = 0;
let totalTime = 0;
let timerInterval = null;
let isRunning = false;
let savedTimers = [];
let timerHistory = [];

const TIMERS_KEY = 'savedTimers';
const HISTORY_KEY = 'timerHistory';
const MAX_HISTORY = 30;

// Initialize
function init() {
    loadSavedTimers();
    loadHistory();
    displaySavedTimers();
    displayHistory();
    updateDisplay();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    hoursInput.addEventListener('change', updateDisplay);
    minutesInput.addEventListener('change', updateDisplay);
    secondsInput.addEventListener('change', updateDisplay);
    
    hoursInput.addEventListener('input', () => {
        if (hoursInput.value > 23) hoursInput.value = 23;
        if (hoursInput.value < 0) hoursInput.value = 0;
    });
    
    minutesInput.addEventListener('input', () => {
        if (minutesInput.value > 59) minutesInput.value = 59;
        if (minutesInput.value < 0) minutesInput.value = 0;
    });
    
    secondsInput.addEventListener('input', () => {
        if (secondsInput.value > 59) secondsInput.value = 59;
        if (secondsInput.value < 0) secondsInput.value = 0;
    });
}

// Update display
function updateDisplay() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    if (!isRunning) {
        timeLeft = hours * 3600 + minutes * 60 + seconds;
        totalTime = timeLeft;
    }

    displayTime();
}

// Display time in HH:MM:SS format
function displayTime() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    timeDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    updateProgressRing();
}

// Pad numbers with leading zero
function pad(num) {
    return num.toString().padStart(2, '0');
}

// Update progress ring
function updateProgressRing() {
    if (totalTime === 0) {
        progressCircle.style.strokeDashoffset = 141.3;
        return;
    }

    const progress = (timeLeft / totalTime) * 100;
    const offset = 141.3 * (1 - progress / 100);
    progressCircle.style.strokeDashoffset = offset;
}

// Start timer
function startTimer() {
    if (isRunning || timeLeft <= 0) return;

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    hoursInput.disabled = true;
    minutesInput.disabled = true;
    secondsInput.disabled = true;

    timerInterval = setInterval(() => {
        timeLeft--;
        displayTime();

        if (timeLeft <= 0) {
            endTimer();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerInterval);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Reset timer
function resetTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    }

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    hoursInput.disabled = false;
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    updateDisplay();
}

// End timer
function endTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 0;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    hoursInput.disabled = false;
    minutesInput.disabled = false;
    secondsInput.disabled = false;

    displayTime();

    // Play sound if enabled
    if (soundToggle.checked) {
        playNotificationSound();
    }

    // Show notification
    showNotification();

    // Add to history
    addToHistory();
}

// Play notification sound
function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Show notification
function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
            body: 'Your countdown timer has finished.',
            icon: '⏱️'
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Set preset time
function setPreset(seconds) {
    if (isRunning) return;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = secs;

    updateDisplay();
}

// Add to history
function addToHistory() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    const timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const entry = {
        time: timeStr,
        date: new Date().toLocaleTimeString()
    };

    timerHistory.unshift(entry);
    if (timerHistory.length > MAX_HISTORY) {
        timerHistory.pop();
    }

    saveHistory();
    displayHistory();
}

// Display history
function displayHistory() {
    if (timerHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">No timer history yet</p>';
        return;
    }

    historyContainer.innerHTML = timerHistory.map((item, index) => `
        <div class="history-item">
            <div>
                <div style="font-weight: 600; color: #333;">${item.time}</div>
                <div style="font-size: 12px; color: #999;">${item.date}</div>
            </div>
        </div>
    `).join('');
}

// Clear history
function clearHistory() {
    if (confirm('Clear all timer history?')) {
        timerHistory = [];
        saveHistory();
        displayHistory();
    }
}

// Add saved timer
function addSavedTimer() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please set a time first!');
        return;
    }

    const name = prompt('Name this timer:');
    if (!name) return;

    const timer = {
        id: Date.now(),
        name: name,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };

    savedTimers.push(timer);
    saveSavedTimers();
    displaySavedTimers();
    alert('Timer saved!');
}

// Load timer
function loadTimer(id) {
    const timer = savedTimers.find(t => t.id === id);
    if (!timer) return;

    hoursInput.value = timer.hours;
    minutesInput.value = timer.minutes;
    secondsInput.value = timer.seconds;

    updateDisplay();
}

// Delete timer
function deleteTimer(id) {
    savedTimers = savedTimers.filter(t => t.id !== id);
    saveSavedTimers();
    displaySavedTimers();
}

// Display saved timers
function displaySavedTimers() {
    if (savedTimers.length === 0) {
        timersContainer.innerHTML = '<p class="empty-message">No saved timers yet</p>';
        return;
    }

    timersContainer.innerHTML = savedTimers.map(timer => `
        <div class="timer-card">
            <div class="timer-info">
                <div class="timer-name">${timer.name}</div>
                <div class="timer-time">${pad(timer.hours)}:${pad(timer.minutes)}:${pad(timer.seconds)}</div>
            </div>
            <div class="timer-actions">
                <button class="timer-action-btn timer-load-btn" onclick="loadTimer(${timer.id})">Load</button>
                <button class="timer-action-btn timer-delete-btn" onclick="deleteTimer(${timer.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Save/Load from localStorage
function saveSavedTimers() {
    localStorage.setItem(TIMERS_KEY, JSON.stringify(savedTimers));
}

function loadSavedTimers() {
    const stored = localStorage.getItem(TIMERS_KEY);
    savedTimers = stored ? JSON.parse(stored) : [];
}

function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(timerHistory));
}

function loadHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    timerHistory = stored ? JSON.parse(stored) : [];
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}