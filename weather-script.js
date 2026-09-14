// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');
const favoritesList = document.getElementById('favoritesList');
const loadingSpinner = document.getElementById('loadingSpinner');

// State
let favorites = [];
const FAVORITES_KEY = 'weatherFavorites';

// Weather icons mapping
const weatherIcons = {
    'clear': '☀️',
    'partly_cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'drizzle': '🌦️',
    'rain': '🌧️',
    'snow': '❄️',
    'sleet': '🌨️',
    'thunderstorm': '⛈️',
    'mist': '🌫️',
    'fog': '🌫️'
};

// Weather condition descriptions
const weatherDescriptions = {
    0: 'Clear',
    1: 'Partly Cloudy',
    2: 'Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Drizzle',
    61: 'Rain',
    63: 'Rain',
    65: 'Rain',
    71: 'Snow',
    73: 'Snow',
    75: 'Snow',
    80: 'Showers',
    81: 'Showers',
    82: 'Showers',
    85: 'Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm'
};

// Initialize the app
function init() {
    loadFavorites();
    displayFavorites();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', searchWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchWeather();
    });
}

// Get weather icon based on weather code
function getWeatherIcon(code) {
    const codeStr = code.toString();
    
    if (codeStr === '0' || codeStr === '1') return weatherIcons.clear;
    if (codeStr === '2') return weatherIcons.partly_cloudy;
    if (codeStr === '3') return weatherIcons.overcast;
    if (codeStr.startsWith('4')) return weatherIcons.fog;
    if (codeStr.startsWith('5') || codeStr === '80' || codeStr === '81' || codeStr === '82') return weatherIcons.drizzle;
    if (codeStr.startsWith('6')) return weatherIcons.rain;
    if (codeStr.startsWith('7') || codeStr === '85' || codeStr === '86') return weatherIcons.snow;
    if (codeStr.startsWith('8') || codeStr.startsWith('9')) return weatherIcons.thunderstorm;
    
    return '🌤️';
}

// Get weather description
function getWeatherDescription(code) {
    return weatherDescriptions[code] || 'Unknown';
}

// Search weather by city
async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (!city) {
        alert('Please enter a city name!');
        return;
    }

    searchBtn.disabled = true;
    loadingSpinner.classList.add('active');

    try {
        // Geocode the city to get coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError('City not found. Please try another city.');
            loadingSpinner.classList.remove('active');
            searchBtn.disabled = false;
            return;
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, admin1 } = location;

        // Fetch weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=5`
        );
        const weatherData = await weatherResponse.json();

        displayCurrentWeather(weatherData, name, country, admin1);
        displayForecast(weatherData);
        
        cityInput.value = '';
    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
        console.error('Error fetching weather:', error);
    } finally {
        loadingSpinner.classList.remove('active');
        searchBtn.disabled = false;
    }
}

// Display current weather
function displayCurrentWeather(data, cityName, country, state) {
    const current = data.current;
    const icon = getWeatherIcon(current.weather_code);
    const description = getWeatherDescription(current.weather_code);
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);

    const locationDisplay = state ? `${cityName}, ${state}, ${country}` : `${cityName}, ${country}`;

    currentWeather.innerHTML = `
        <div class="weather-content">
            <div class="weather-main">
                <div class="weather-icon">${icon}</div>
                <div class="temperature">${temp}°C</div>
                <div class="weather-description">${description}</div>
                <div class="city-info">${locationDisplay}</div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${feelsLike}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${windSpeed} km/h</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Action</div>
                    <button class="detail-value" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 8px 16px; border-radius: 5px;" onclick="toggleFavorite('${cityName}', ${data.latitude}, ${data.longitude})">
                        ⭐ Add to Favorites
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Display 5-day forecast
function displayForecast(data) {
    const daily = data.daily;
    const forecastDays = 5;

    forecastContainer.innerHTML = '';

    for (let i = 0; i < forecastDays; i++) {
        const date = new Date(daily.time[i]);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const icon = getWeatherIcon(daily.weather_code[i]);
        const description = getWeatherDescription(daily.weather_code[i]);
        const precipitation = daily.precipitation_sum[i];
        const windSpeed = Math.round(daily.wind_speed_10m_max[i]);

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-description">${description}</div>
            <div class="forecast-details">
                💧 ${precipitation}mm | 💨 ${windSpeed}km/h
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    }
}

// Toggle favorite city
function toggleFavorite(cityName, lat, lon) {
    const existingFavorite = favorites.find(f => f.name === cityName);
    
    if (existingFavorite) {
        favorites = favorites.filter(f => f.name !== cityName);
    } else {
        favorites.push({ name: cityName, lat, lon });
    }

    saveFavorites();
    displayFavorites();
}

// Display favorites
function displayFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: #999; font-size: 12px;">No favorites yet</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map(fav => `
        <button class="favorite-btn" onclick="loadFavoriteWeather(${fav.lat}, ${fav.lon})">
            ${fav.name}
            <span class="remove-favorite" onclick="event.stopPropagation(); removeFavorite('${fav.name}')">✕</span>
        </button>
    `).join('');
}

// Load weather for favorite city
async function loadFavoriteWeather(lat, lon) {
    searchBtn.disabled = true;
    loadingSpinner.classList.add('active');

    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=5`
        );
        const weatherData = await weatherResponse.json();

        // Get city name from reverse geocoding
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&language=en&format=json`
        );
        const geoData = await geoResponse.json();
        const location = geoData.results[0];

        displayCurrentWeather(weatherData, location.name, location.country, location.admin1);
        displayForecast(weatherData);
    } catch (error) {
        showError('Failed to load favorite weather.');
        console.error('Error:', error);
    } finally {
        loadingSpinner.classList.remove('active');
        searchBtn.disabled = false;
    }
}

// Remove favorite
function removeFavorite(cityName) {
    favorites = favorites.filter(f => f.name !== cityName);
    saveFavorites();
    displayFavorites();
}

// Show error message
function showError(message) {
    currentWeather.innerHTML = `<div class="error-message">${message}</div>`;
    forecastContainer.innerHTML = '';
}

// Save favorites to local storage
function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Load favorites from local storage
function loadFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY);
    favorites = stored ? JSON.parse(stored) : [];
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}