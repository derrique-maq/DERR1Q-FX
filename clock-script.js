// DOM Elements
const mainTime = document.getElementById('mainTime');
const mainDate = document.getElementById('mainDate');
const mainZone = document.getElementById('mainZone');
const timezoneSelect = document.getElementById('timezoneSelect');
const addBtn = document.getElementById('addBtn');
const clocksContainer = document.getElementById('clocksContainer');
const quickBtns = document.querySelectorAll('.quick-btn');
const clearBtn = document.getElementById('clearBtn');

// State
let selectedTimezones = [];
const STORAGE_KEY = 'selectedTimezones';

// All available time zones
const TIMEZONES = [
    // UTC
    'UTC',
    // Americas
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'America/Toronto',
    'America/Mexico_City',
    'America/Argentina/Buenos_Aires',
    'America/Sao_Paulo',
    // Europe
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Moscow',
    'Europe/Istanbul',
    // Africa
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
    // Middle East
    'Asia/Dubai',
    'Asia/Qatar',
    'Asia/Baghdad',
    'Asia/Tehran',
    // South Asia
    'Asia/Kolkata',
    'Asia/Karachi',
    'Asia/Bangladesh',
    // Southeast Asia
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Manila',
    'Asia/Jakarta',
    'Asia/Kuala_Lumpur',
    // East Asia
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Taipei',
    // Oceania
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Fiji'
];

// Initialize the app
function init() {
    loadTimezones();
    populateTimezoneSelect();
    updateMainClock();
    displayClocks();
    setupEventListeners();
    
    // Update every second
    setInterval(() => {
        updateMainClock();
        updateClocks();
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTimezone);
    timezoneSelect.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTimezone();
    });
    clearBtn.addEventListener('click', clearAllTimezones);
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const zone = btn.dataset.zone;
            if (!selectedTimezones.includes(zone)) {
                selectedTimezones.push(zone);
                saveTimezones();
                displayClocks();
                updateQuickBtns();
            }
        });
    });
}

// Populate timezone select dropdown
function populateTimezoneSelect() {
    TIMEZONES.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = formatTimezoneName(tz);
        timezoneSelect.appendChild(option);
    });
}

// Format timezone name for display
function formatTimezoneName(tz) {
    if (tz === 'UTC') return 'UTC';
    return tz.replace(/_/g, ' ').replace('/', ' - ');
}

// Get current time in a specific timezone
function getTimeInTimezone(timezone) {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(date);

    const time = `${parts[0].value}:${parts[2].value}:${parts[4].value}`;
    const dateStr = formatter.format(date);

    return { time, dateStr };
}

// Update main clock
function updateMainClock() {
    const { time, dateStr } = getTimeInTimezone('UTC');
    mainTime.textContent = time;
    mainDate.textContent = dateStr;
    mainZone.textContent = 'UTC (Coordinated Universal Time)';
}

// Add timezone
function addTimezone() {
    const selectedZone = timezoneSelect.value;
    
    if (!selectedZone) {
        alert('Please select a timezone');
        return;
    }

    if (selectedTimezones.includes(selectedZone)) {
        alert('This timezone is already added!');
        return;
    }

    selectedTimezones.push(selectedZone);
    saveTimezones();
    displayClocks();
    timezoneSelect.value = '';
    updateQuickBtns();
}

// Remove timezone
function removeTimezone(timezone) {
    selectedTimezones = selectedTimezones.filter(tz => tz !== timezone);
    saveTimezones();
    displayClocks();
    updateQuickBtns();
}

// Display clocks for all selected timezones
function displayClocks() {
    if (selectedTimezones.length === 0) {
        clocksContainer.innerHTML = `
            <div class="empty-state">
                <p>No time zones added yet. Select from popular zones or add a custom one!</p>
            </div>
        `;
        return;
    }

    clocksContainer.innerHTML = selectedTimezones.map(tz => {
        const { time, dateStr } = getTimeInTimezone(tz);
        const isUTC = tz === 'UTC';
        return `
            <div class="clock-card ${isUTC ? 'timezone-utc' : ''}">
                <button class="remove-btn" onclick="removeTimezone('${tz}')">×</button>
                <div class="clock-zone">${formatTimezoneName(tz)}</div>
                <div class="clock-time">${time}</div>
                <div class="clock-date">${dateStr}</div>
            </div>
        `;
    }).join('');
}

// Update clocks (called every second)
function updateClocks() {
    selectedTimezones.forEach(tz => {
        const { time, dateStr } = getTimeInTimezone(tz);
        const card = document.querySelector(`[data-timezone="${tz}"]`);
        if (!card) {
            // Find by text content as fallback
            const cards = document.querySelectorAll('.clock-card');
            cards.forEach(c => {
                if (c.querySelector('.clock-zone').textContent.includes(formatTimezoneName(tz))) {
                    c.querySelector('.clock-time').textContent = time;
                    c.querySelector('.clock-date').textContent = dateStr;
                }
            });
        }
    });
}

// Update quick buttons state
function updateQuickBtns() {
    quickBtns.forEach(btn => {
        const zone = btn.dataset.zone;
        if (selectedTimezones.includes(zone)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Clear all timezones
function clearAllTimezones() {
    if (confirm('Are you sure you want to clear all time zones?')) {
        selectedTimezones = [];
        saveTimezones();
        displayClocks();
        updateQuickBtns();
    }
}

// Save timezones to local storage
function saveTimezones() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTimezones));
}

// Load timezones from local storage
function loadTimezones() {
    const stored = localStorage.getItem(STORAGE_KEY);
    selectedTimezones = stored ? JSON.parse(stored) : [];
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}