// DOM Elements
const jokeContent = document.getElementById('jokeContent');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const jokesGeneratedSpan = document.getElementById('jokesGenerated');
const categoryBtns = document.querySelectorAll('.category-btn');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const closeModalBtn = document.querySelector('.close-modal');
const loadingSpinner = document.getElementById('loadingSpinner');

// State
let currentJoke = '';
let selectedCategory = 'any';
let jokesCount = 0;
const STORAGE_KEY = 'jokeHistory';
const COUNT_KEY = 'jokesCount';

// API endpoints
const API_ENDPOINTS = {
    any: 'https://official-joke-api.appspot.com/random_joke',
    general: 'https://official-joke-api.appspot.com/jokes/general/random',
    programming: 'https://official-joke-api.appspot.com/jokes/programming/random',
    'knock-knock': 'https://official-joke-api.appspot.com/jokes/knock-knock/random'
};

// Initialize the app
function init() {
    loadJokesCount();
    setupEventListeners();
    displayJokesCount();
}

// Setup event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateJoke);
    copyBtn.addEventListener('click', copyJoke);
    historyBtn.addEventListener('click', openHistory);
    closeModalBtn.addEventListener('click', closeHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedCategory = e.target.dataset.category;
        });
    });

    // Close modal when clicking outside
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistory();
        }
    });
}

// Generate a joke
async function generateJoke() {
    generateBtn.disabled = true;
    jokeContent.classList.add('loading');
    jokeContent.textContent = 'Loading...';
    loadingSpinner.classList.add('active');

    try {
        const endpoint = API_ENDPOINTS[selectedCategory];
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();
        
        // Format the joke
        let joke = '';
        if (data.type === 'knock-knock') {
            joke = `${data.setup}\n${data.delivery}`;
        } else {
            joke = `${data.setup}\n${data.punchline}`;
        }

        currentJoke = joke;
        displayJoke(joke);
        saveJoke(joke);
        updateJokesCount();
    } catch (error) {
        jokeContent.classList.remove('loading');
        jokeContent.textContent = '😅 Oops! Failed to load a joke. Please try again!';
        console.error('Error fetching joke:', error);
    } finally {
        generateBtn.disabled = false;
        loadingSpinner.classList.remove('active');
    }
}

// Display joke
function displayJoke(joke) {
    jokeContent.classList.remove('loading');
    jokeContent.textContent = joke;
}

// Copy joke to clipboard
function copyJoke() {
    if (!currentJoke) {
        alert('No joke to copy! Generate a joke first.');
        return;
    }

    navigator.clipboard.writeText(currentJoke).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Failed to copy joke!');
    });
}

// Save joke to history
function saveJoke(joke) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // Add timestamp and joke to history
    const jokeEntry = {
        text: joke,
        timestamp: new Date().toLocaleString(),
        category: selectedCategory
    };

    history.unshift(jokeEntry);
    
    // Keep only last 50 jokes
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

// Update jokes count
function updateJokesCount() {
    jokesCount++;
    localStorage.setItem(COUNT_KEY, jokesCount);
    displayJokesCount();
}

// Display jokes count
function displayJokesCount() {
    jokesGeneratedSpan.textContent = `Jokes generated: ${jokesCount}`;
}

// Load jokes count from storage
function loadJokesCount() {
    const stored = localStorage.getItem(COUNT_KEY);
    jokesCount = stored ? parseInt(stored) : 0;
}

// Open history modal
function openHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No jokes in history yet!</li>';
        clearHistoryBtn.style.display = 'none';
    } else {
        historyList.innerHTML = history.map((joke, index) => `
            <li class="history-item">
                <strong>${index + 1}.</strong> ${escapeHtml(joke.text)}
                <br>
                <small style="color: #999;">📅 ${joke.timestamp} • 🏷️ ${capitalizeCategory(joke.category)}</small>
            </li>
        `).join('');
        clearHistoryBtn.style.display = 'block';
    }

    historyModal.classList.add('active');
}

// Close history modal
function closeHistory() {
    historyModal.classList.remove('active');
}

// Clear all history
function clearHistory() {
    if (confirm('Are you sure you want to delete all joke history?')) {
        localStorage.removeItem(STORAGE_KEY);
        openHistory(); // Refresh the modal to show empty state
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Capitalize category name
function capitalizeCategory(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}