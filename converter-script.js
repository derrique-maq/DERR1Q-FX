// DOM Elements
const converterBtns = document.querySelectorAll('.converter-btn');
const converters = document.querySelectorAll('.converter');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyContainer = document.getElementById('historyContainer');

// Temperature elements
const tempInput = document.getElementById('tempInput');
const tempOutput = document.getElementById('tempOutput');
const tempFromUnit = document.getElementById('tempFromUnit');
const tempToUnit = document.getElementById('tempToUnit');

// Distance elements
const distInput = document.getElementById('distInput');
const distOutput = document.getElementById('distOutput');
const distFromUnit = document.getElementById('distFromUnit');
const distToUnit = document.getElementById('distToUnit');

// Weight elements
const weightInput = document.getElementById('weightInput');
const weightOutput = document.getElementById('weightOutput');
const weightFromUnit = document.getElementById('weightFromUnit');
const weightToUnit = document.getElementById('weightToUnit');

// Volume elements
const volInput = document.getElementById('volInput');
const volOutput = document.getElementById('volOutput');
const volFromUnit = document.getElementById('volFromUnit');
const volToUnit = document.getElementById('volToUnit');

// State
let conversionHistory = [];
const HISTORY_KEY = 'conversionHistory';
const MAX_HISTORY = 50;

// Initialize
function init() {
    loadHistory();
    setupEventListeners();
    displayHistory();
    
    // Initial conversion
    convertTemperature();
}

// Setup event listeners
function setupEventListeners() {
    // Converter type buttons
    converterBtns.forEach(btn => {
        btn.addEventListener('click', () => switchConverter(btn.dataset.type));
    });

    // Temperature
    tempInput.addEventListener('input', convertTemperature);
    tempFromUnit.addEventListener('change', convertTemperature);
    tempToUnit.addEventListener('change', convertTemperature);

    // Distance
    distInput.addEventListener('input', convertDistance);
    distFromUnit.addEventListener('change', convertDistance);
    distToUnit.addEventListener('change', convertDistance);

    // Weight
    weightInput.addEventListener('input', convertWeight);
    weightFromUnit.addEventListener('change', convertWeight);
    weightToUnit.addEventListener('change', convertWeight);

    // Volume
    volInput.addEventListener('input', convertVolume);
    volFromUnit.addEventListener('change', convertVolume);
    volToUnit.addEventListener('change', convertVolume);

    // History
    clearHistoryBtn.addEventListener('click', clearHistory);
}

// Switch converter type
function switchConverter(type) {
    converterBtns.forEach(btn => btn.classList.remove('active'));
    converters.forEach(conv => conv.classList.remove('active'));

    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    document.getElementById(`${type}-converter`).classList.add('active');
}

// Temperature conversion
function convertTemperature() {
    const value = parseFloat(tempInput.value) || 0;
    const from = tempFromUnit.value;
    const to = tempToUnit.value;

    let result = convertTempValue(value, from, to);
    tempOutput.value = formatResult(result);

    addToHistory(`${value}°${from.charAt(0).toUpperCase()} → ${formatResult(result)}°${to.charAt(0).toUpperCase()}`);
}

// Convert temperature value
function convertTempValue(value, from, to) {
    if (from === to) return value;

    let celsius;
    
    // Convert to Celsius first
    if (from === 'celsius') {
        celsius = value;
    } else if (from === 'fahrenheit') {
        celsius = (value - 32) * 5 / 9;
    } else if (from === 'kelvin') {
        celsius = value - 273.15;
    }

    // Convert from Celsius to target
    if (to === 'celsius') {
        return celsius;
    } else if (to === 'fahrenheit') {
        return (celsius * 9 / 5) + 32;
    } else if (to === 'kelvin') {
        return celsius + 273.15;
    }
}

// Distance conversion
function convertDistance() {
    const value = parseFloat(distInput.value) || 0;
    const from = distFromUnit.value;
    const to = distToUnit.value;

    let result = convertDistValue(value, from, to);
    distOutput.value = formatResult(result);

    addToHistory(`${value} ${from} → ${formatResult(result)} ${to}`);
}

// Convert distance value (all to meters)
function convertDistValue(value, from, to) {
    if (from === to) return value;

    const toMeters = {
        'mm': 0.001,
        'cm': 0.01,
        'm': 1,
        'km': 1000,
        'in': 0.0254,
        'ft': 0.3048,
        'yd': 0.9144,
        'mi': 1609.34
    };

    const meters = value * toMeters[from];
    return meters / toMeters[to];
}

// Weight conversion
function convertWeight() {
    const value = parseFloat(weightInput.value) || 0;
    const from = weightFromUnit.value;
    const to = weightToUnit.value;

    let result = convertWeightValue(value, from, to);
    weightOutput.value = formatResult(result);

    addToHistory(`${value} ${from} → ${formatResult(result)} ${to}`);
}

// Convert weight value (all to grams)
function convertWeightValue(value, from, to) {
    if (from === to) return value;

    const toGrams = {
        'mg': 0.001,
        'g': 1,
        'kg': 1000,
        'oz': 28.3495,
        'lb': 453.592,
        'ton': 1000000
    };

    const grams = value * toGrams[from];
    return grams / toGrams[to];
}

// Volume conversion
function convertVolume() {
    const value = parseFloat(volInput.value) || 0;
    const from = volFromUnit.value;
    const to = volToUnit.value;

    let result = convertVolValue(value, from, to);
    volOutput.value = formatResult(result);

    addToHistory(`${value} ${from} → ${formatResult(result)} ${to}`);
}

// Convert volume value (all to milliliters)
function convertVolValue(value, from, to) {
    if (from === to) return value;

    const toMilliliters = {
        'ml': 1,
        'l': 1000,
        'floz': 29.5735,
        'cup': 236.588,
        'pint': 473.176,
        'gallon': 3785.41
    };

    const milliliters = value * toMilliliters[from];
    return milliliters / toMilliliters[to];
}

// Format result to 2-6 decimal places
function formatResult(value) {
    if (isNaN(value) || !isFinite(value)) return '0';
    
    // Remove very small numbers
    if (Math.abs(value) < 0.00001 && value !== 0) {
        return value.toExponential(2);
    }
    
    // Round to appropriate decimal places
    const rounded = Math.round(value * 1000000) / 1000000;
    return rounded.toString().replace(/\.?0+$/, '');
}

// Swap units
function swapUnits(type) {
    if (type === 'temp') {
        [tempFromUnit.value, tempToUnit.value] = [tempToUnit.value, tempFromUnit.value];
        [tempInput.value, tempOutput.value] = [tempOutput.value, tempInput.value];
        convertTemperature();
    } else if (type === 'dist') {
        [distFromUnit.value, distToUnit.value] = [distToUnit.value, distFromUnit.value];
        [distInput.value, distOutput.value] = [distOutput.value, distInput.value];
        convertDistance();
    } else if (type === 'weight') {
        [weightFromUnit.value, weightToUnit.value] = [weightToUnit.value, weightFromUnit.value];
        [weightInput.value, weightOutput.value] = [weightOutput.value, weightInput.value];
        convertWeight();
    } else if (type === 'vol') {
        [volFromUnit.value, volToUnit.value] = [volToUnit.value, volFromUnit.value];
        [volInput.value, volOutput.value] = [volOutput.value, volInput.value];
        convertVolume();
    }
}

// Add to history
function addToHistory(conversion) {
    if (conversionHistory.includes(conversion)) return;
    
    conversionHistory.unshift(conversion);
    if (conversionHistory.length > MAX_HISTORY) {
        conversionHistory.pop();
    }
    saveHistory();
    displayHistory();
}

// Display history
function displayHistory() {
    if (conversionHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-message">No conversions yet</p>';
        return;
    }

    historyContainer.innerHTML = conversionHistory.map((item, index) => `
        <div class="history-item">
            <span class="history-text">${item}</span>
            <button class="history-copy-btn" onclick="copyToClipboard('${escapeQuotes(item)}')">📋 Copy</button>
        </div>
    `).join('');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy');
    });
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all conversion history?')) {
        conversionHistory = [];
        saveHistory();
        displayHistory();
    }
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(conversionHistory));
}

function loadHistory() {
    const stored = localStorage.getItem(HISTORY_KEY);
    conversionHistory = stored ? JSON.parse(stored) : [];
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}