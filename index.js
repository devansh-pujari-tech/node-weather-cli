#!/usr/bin/env node

const axios = require('axios');

// Parse command line arguments
const args = process.argv.slice(2);
const city = args[0] || 'New York';

async function getWeather(cityName) {
  try {
    console.log(`\nFetching weather data for ${cityName}...\n`);
    
    // Using Open-Meteo API (free, no API key required)
    // First, geocode the city name
    const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: cityName,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.error(`❌ City "${cityName}" not found. Please try another city name.`);
      process.exit(1);
    }

    const location = geoResponse.data.results[0];
    const { latitude, longitude, name, country, admin1 } = location;

    // Get weather data
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph'
      }
    });

    const current = weatherResponse.data.current;
    const locationString = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;

    // Display results
    console.log(`📍 Location: ${locationString}`);
    console.log(`🌡️  Temperature: ${current.temperature_2m}°F (Feels like: ${current.apparent_temperature}°F)`);
    console.log(`💧 Humidity: ${current.relative_humidity_2m}%`);
    console.log(`💨 Wind Speed: ${current.wind_speed_10m} mph`);
    console.log(`🌤️  Condition: ${getWeatherDescription(current.weather_code)}\n`);

  } catch (error) {
    console.error('❌ Error fetching weather data:', error.message);
    process.exit(1);
  }
}

function getWeatherDescription(code) {
  // WMO Weather interpretation codes
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return descriptions[code] || 'Unknown';
}

// Run the CLI
if (!process.argv.includes('--help') && !process.argv.includes('-h')) {
  getWeather(city);
} else {
  console.log(`
Usage: weather [city-name]

Examples:
  weather                    # Get weather for New York (default)
  weather London            # Get weather for London
  weather "Los Angeles"     # Use quotes for multi-word city names

  `);
}
