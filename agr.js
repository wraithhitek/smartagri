const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);                                   
}
showSlide(currentSlide);
setInterval(nextSlide, 3000);

function getWeather(lat, lon) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability`;


    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error! status: ${response.status}');
        }
        return response.json();
    })  
        .then(data => {
            console.log("API Data:", data);
            updateWeatherInfo(data);
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            resetAdvancedFeatures();
            displayWeatherError("Error fetching weather data.");
        });                       
}

function updateWeatherInfo(data) {
    if (data && data.current_weather && data.hourly) {
        const { temperature, weathercode } = data.current_weather;
        const { relativehumidity_2m, precipitation_probability } = data.hourly;

        const humidity = relativehumidity_2m && relativehumidity_2m.length > 0 ? relativehumidity_2m[0] : 'N/A';
        const precipitation = precipitation_probability && precipitation_probability.length > 0 ? precipitation_probability[0] : 'N/A';
        const conditions = getWeatherCondition(weathercode);

        document.getElementById('temperature').innerText = `Temperature: ${temperature}°C`;
document.getElementById('precipitation').innerText = `Precipitation Probability: ${precipitation}%`;
document.getElementById('humidity').innerText = `Humidity: ${humidity}%`;
document.getElementById('forecast').innerText = `Conditions: ${conditions}`;
document.getElementById('weatherCode').innerText = `Weather Code: ${weathercode}`;

    } else {
        console.error("Invalid API response:", data);
        resetAdvancedFeatures();
        displayWeatherError("Invalid weather data.");
    }
}

function getWeatherCondition(weatherCode) {
    switch (weatherCode) {
        case 0: return "Clear sky";
        case 1: case 2: case 3: return "Mainly clear, partly cloudy, or overcast";
        case 45: case 48: return "Fog and depositing rime fog";
        case 51: case 53: case 55: return "Drizzle: Light, moderate, and dense intensity";
        case 56: case 57: return "Freezing Drizzle: Light and dense intensity";
        case 61: case 63: case 65: return "Rain: Slight, moderate and heavy intensity";
        case 66: case 67: return "Freezing Rain: Light and heavy intensity";
        case 71: case 73: case 75: return "Snow fall: Slight, moderate, and heavy intensity";
        case 77: return "Snow grains";
        case 80: case 81: case 82: return "Rain showers: Slight, moderate, and violent";
        case 85: case 86: return "Snow showers slight and heavy";
        case 95: return "Thunderstorm: Slight or moderate";
        case 96: case 99: return "Thunderstorm with slight and heavy hail";
        default: return "Unknown";
    }
}

function resetAdvancedFeatures() {
    document.getElementById('temperature').innerText = 'Loading...';
    document.getElementById('precipitation').innerText = 'Loading...';
    document.getElementById('humidity').innerText = 'Loading...';
    document.getElementById('forecast').innerText = 'Loading...';
    
}

function displayWeatherError(message) {
    document.getElementById('temperature').innerText = message;
    document.getElementById('precipitation').innerText = message;
    document.getElementById('humidity').innerText = message;
    document.getElementById('forecast').innerText = message;
    document.getElementById('weatherCode').innerText = message;
}

function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log("Geolocation Coordinates:", position.coords);
                const { latitude, longitude } = position.coords;
                getWeather(latitude, longitude);
            },
            error => {
                console.error('Error getting location:', error);
                resetAdvancedFeatures();
                displayWeatherError("Unable to get location.");
            }
        );
    }
}
window.onload = initWeather;