// DOM Elements
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const generateBtn = document.getElementById('generateBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const passwordLength = document.getElementById('passwordLength');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const historyContainer = document.getElementById('historyContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const favoritesContainer = document.getElementById('favoritesContainer');

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/';

// State
let passwordHistory = [];
let savedPasswords = [];
const HISTORY_KEY = 'passwordHistory';
const FAVORITES_KEY = 'savedPasswords';
const MAX_HISTORY = 20;

// Initialize
function init() {
    loadHistory();
    loadFavorites();
    generatePassword();
    setupEventListeners();
    displayHistory();
    displayFavorites();
}

// Setup event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generatePassword);
    regenerateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);
    passwordLength.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
        generatePassword();
    });
    clearHistoryBtn.addEventListener('click', clearHistory);
    uppercaseCheckbox.addEventListener('change', generatePassword);
    lowercaseCheckbox.addEventListener('change', generatePassword);
    numbersCheckbox.addEventListener('change', generatePassword);
    symbolsCheckbox.addEventListener('change', generatePassword);
}

// Get selected character sets
function getCharacterSet() {
    let charset = '';
    if (uppercaseCheckbox.checked) charset += UPPERCASE;
    if (lowercaseCheckbox.checked) charset += LOWERCASE;
    if (numbersCheckbox.checked) charset += NUMBERS;
    if (symbolsCheckbox.checked) charset += SYMBOLS;
    return charset;
}

// Generate random password
function generatePassword() {
    const charset = getCharacterSet();
    
    if (charset.length === 0) {
        alert('Please select at least one character type!');
        return;
    }

    const length = parseInt(passwordLength.value);
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    passwordOutput.value = password;
    updateStrength(password);
    addToHistory(password);
}

// Calculate password strength
function calculateStrength(password) {
    let strength = 0;
    const length = password.length;

    // Length scoring
    if (length >= 8) strength += 20;
    if (length >= 12) strength += 20;
    if (length >= 16) strength += 20;
    if (length >= 20) strength += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    return Math.min(strength, 100);
}

// Update strength indicator
function updateStrength(password) {
    const strength = calculateStrength(password);
    const bar = strengthBar.querySelector('.strength-bar-fill') || strengthBar;
    
    if (!strengthBar.querySelector('.strength-bar-fill')) {
        const fill = document.createElement('div');
        fill.className = 'strength-bar-fill';
        strengthBar.appendChild(fill);
    }

    const fill = strengthBar.querySelector('.strength-bar-fill');
    fill.style.width = strength + '%';

    let strengthLevel = 'Weak';
    let color = '#ff6b6b';

    if (strength >= 80) {
        strengthLevel = 'Very Strong';
        color = '#4caf50';
    } else if (strength >= 60) {
        strengthLevel = 'Strong';
        color = '#8bc34a';
    } else if (strength >= 40) {
        strengthLevel = 'Good';
        color = '#ffc107';
    } else if (strength >= 20) {
        strengthLevel = 'Fair';
        color = '#ff9800';
    }

    fill.style.backgroundColor = color;
    strengthText.textContent = `Strength: ${strengthLevel} (${strength}%)`;
}

// Copy to clipboard
function copyToClipboard() {
    const password = passwordOutput.value;
    
    if (!password) {
        alert('Generate a password first!');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        copyBtn.textContent = '✅ Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        alert('Failed to copy password');
    });
}

// Add to history
function addToHistory(password) {
    if (passwordHistory.includes(password)) return;
    
    passwordHistory.unshift(password);
    if (passwordHistory.length > MAX_HISTORY) {
        passwordHistory.pop();
    }
    saveHistory();
    displayHistory();
}

// Display history
function displayHistory() {
    if (passwordHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">No passwords generated yet</p>';
        return;
    }

    historyContainer.innerHTML = passwordHistory.map((pwd, index) => `
        <div class="history-item">
            <span class="password-text" title="${pwd}">${pwd}</span>
            <div class="action-buttons">
                <button class="copy-history-btn" onclick="copyPasswordFromHistory('${escapeQuotes(pwd)}')">📋 Copy</button>
                <button class="save-btn" onclick="saveFavorite('${escapeQuotes(pwd)}')">⭐ Save</button>
                <button class="remove-btn" onclick="removeFromHistory(${index})">✕</button>
            </div>
        </div>
    `).join('');
}

// Copy password from history
function copyPasswordFromHistory(password) {
    navigator.clipboard.writeText(password).then(() => {
        alert('Password copied to clipboard!');
    });
}

// Remove from history
function removeFromHistory(index) {
    passwordHistory.splice(index, 1);
    saveHistory();
    displayHistory();
}

// Clear all history
function clearHistory() {
    if (confirm('Are you sure you want to clear all password history?')) {
        passwordHistory = [];
        saveHistory();
        displayHistory();
    }
}

// Save favorite
function saveFavorite(password) {
    if (savedPasswords.includes(password)) {
        alert('This password is already saved!');
        return;
    }

    savedPasswords.push(password);
    saveFavorites();
    displayFavorites();
    alert('Password saved to favorites!');
}

// Display favorites
function displayFavorites() {
    if (savedPasswords.length === 0) {
        favoritesContainer.innerHTML = '<p class="empty-favorites">No saved passwords yet</p>';
        return;
    }

    favoritesContainer.innerHTML = savedPasswords.map((pwd, index) => `
        <div class="favorite-item">
            <span class="password-text" title="${pwd}">${pwd}</span>
            <div class="action-buttons">
                <button class="copy-history-btn" onclick="copyPasswordFromHistory('${escapeQuotes(pwd)}')">📋 Copy</button>
                <button class="remove-btn" onclick="removeFavorite(${index})">✕</button>
            </div>
        </div>
    `).join('');
}

// Remove favorite
function removeFavorite(index) {
    savedPasswords.splice(index, 1);
    saveFavorites();
    displayFavorites();
}

// Escape quotes for safe HTML
function escapeQuotes(str) {
    return str.replace(/'/g, "\\'")
               .replace(/"/g, '&quot;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
}

// Save/Load from localStorage
function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(passwordHistory));
}

function loadHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    passwordHistory = stored ? JSON.parse(stored) : [];
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedPasswords));
}

function loadFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    savedPasswords = stored ? JSON.parse(stored) : [];
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}