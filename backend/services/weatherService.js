const axios = require('axios');

// Using Open-Meteo - Free weather API (no API key required!)
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather forecast and historical data for a ski resort using Open-Meteo
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data with current conditions and 7-day forecast
 */
async function getWeatherData(lat, lon) {
  try {
    // Get weather data from Open-Meteo (free, no API key needed)
    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,snowfall,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'auto',
        forecast_days: 7
      }
    });

    const data = response.data;

    // Process current weather
    const current = {
      temp: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      wind_speed: data.current.wind_speed_10m,
      weather: getWeatherDescription(data.current.weather_code),
      snow_1h: data.current.snowfall || 0,
      timestamp: Math.floor(new Date(data.current.time).getTime() / 1000)
    };

    // Process daily forecast
    const forecast = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      forecast.push({
        date: Math.floor(new Date(data.daily.time[i]).getTime() / 1000),
        temp: {
          min: data.daily.temperature_2m_min[i],
          max: data.daily.temperature_2m_max[i],
          day: (data.daily.temperature_2m_min[i] + data.daily.temperature_2m_max[i]) / 2
        },
        weather: getWeatherDescription(data.daily.weather_code[i]),
        snow: data.daily.snowfall_sum[i] || 0,
        humidity: data.current.relative_humidity_2m, // Daily humidity not available, use current
        wind_speed: data.daily.wind_speed_10m_max[i],
        pop: (data.daily.precipitation_probability_max[i] || 0) / 100 // Convert to 0-1 range
      });
    }

    const weatherData = {
      current,
      historical: [], // Historical data would require past dates
      forecast
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data from Open-Meteo:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }

    // Return mock data for demonstration when API is unavailable
    console.log('Returning mock weather data for demonstration');
    return getMockWeatherData(lat, lon);
  }
}

/**
 * Convert WMO weather code to description
 * Based on WMO Weather interpretation codes
 * @param {number} code - WMO weather code
 * @returns {Object} Weather description object
 */
function getWeatherDescription(code) {
  const weatherMap = {
    0: { main: 'Clear', description: 'clear sky', icon: '01d' },
    1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
    2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
    3: { main: 'Clouds', description: 'overcast', icon: '03d' },
    45: { main: 'Fog', description: 'fog', icon: '50d' },
    48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
    51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
    53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
    55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
    61: { main: 'Rain', description: 'slight rain', icon: '10d' },
    63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
    65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
    71: { main: 'Snow', description: 'slight snow', icon: '13d' },
    73: { main: 'Snow', description: 'moderate snow', icon: '13d' },
    75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
    77: { main: 'Snow', description: 'snow grains', icon: '13d' },
    80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
    81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
    82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
    85: { main: 'Snow', description: 'slight snow showers', icon: '13d' },
    86: { main: 'Snow', description: 'heavy snow showers', icon: '13d' },
    95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
    99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' }
  };

  return weatherMap[code] || { main: 'Unknown', description: 'unknown', icon: '01d' };
}

/**
 * Generate mock weather data for demonstration
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Mock weather data
 */
function getMockWeatherData(lat, lon) {
  const now = Math.floor(Date.now() / 1000);
  const baseTemp = lat > 45 ? -5 : (lat > 35 ? 0 : 5);

  const weatherConditions = ['Snow', 'Clouds', 'Clear', 'Snow'];
  const weatherDescriptions = ['light snow', 'partly cloudy', 'clear sky', 'moderate snow'];

  // Generate 7 days of forecast
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const conditionIndex = Math.floor(Math.random() * weatherConditions.length);
    const tempVariation = (Math.random() - 0.5) * 10;
    const dayTemp = baseTemp + tempVariation;

    forecast.push({
      date: now + (i * 86400),
      temp: {
        min: dayTemp - 5,
        max: dayTemp + 3,
        day: dayTemp
      },
      weather: {
        id: 600 + conditionIndex,
        main: weatherConditions[conditionIndex],
        description: weatherDescriptions[conditionIndex],
        icon: '13d'
      },
      snow: weatherConditions[conditionIndex] === 'Snow' ? Math.random() * 15 + 5 : 0,
      humidity: 70 + Math.floor(Math.random() * 20),
      wind_speed: 5 + Math.random() * 10,
      pop: weatherConditions[conditionIndex] === 'Snow' ? 0.7 + Math.random() * 0.3 : Math.random() * 0.5
    });
  }

  return {
    current: {
      temp: baseTemp,
      feels_like: baseTemp - 3,
      humidity: 75,
      wind_speed: 8,
      weather: {
        id: 601,
        main: 'Snow',
        description: 'snow',
        icon: '13d'
      },
      snow_1h: 2,
      timestamp: now
    },
    historical: [],
    forecast: forecast
  };
}

/**
 * Process 3-hour forecast data into daily summaries
 * @param {Array} forecastList - List of 3-hour forecasts
 * @returns {Array} Daily forecast summaries
 */
function processDailyForecasts(forecastList) {
  const dailyData = {};

  // Group forecasts by day
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        date: item.dt,
        temps: [],
        humidity: [],
        wind_speed: [],
        weather: [],
        snow: 0,
        pop: 0
      };
    }

    dailyData[dayKey].temps.push(item.main.temp);
    dailyData[dayKey].humidity.push(item.main.humidity);
    dailyData[dayKey].wind_speed.push(item.wind.speed);
    dailyData[dayKey].weather.push(item.weather[0]);
    dailyData[dayKey].snow += (item.snow?.['3h'] || 0);
    dailyData[dayKey].pop = Math.max(dailyData[dayKey].pop, item.pop || 0);
  });

  // Convert to daily summaries (take first 7 days)
  return Object.keys(dailyData).slice(0, 7).map(dayKey => {
    const day = dailyData[dayKey];
    return {
      date: day.date,
      temp: {
        min: Math.min(...day.temps),
        max: Math.max(...day.temps),
        day: day.temps.reduce((a, b) => a + b, 0) / day.temps.length
      },
      weather: getMostCommonWeather(day.weather),
      snow: Math.round(day.snow * 10) / 10, // Convert to cm and round
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      wind_speed: Math.round(day.wind_speed.reduce((a, b) => a + b, 0) / day.wind_speed.length * 10) / 10,
      pop: day.pop
    };
  });
}

/**
 * Get most common weather condition from list
 * @param {Array} weatherList - List of weather objects
 * @returns {Object} Most common weather condition
 */
function getMostCommonWeather(weatherList) {
  const counts = {};
  let maxCount = 0;
  let mostCommon = weatherList[0];

  weatherList.forEach(w => {
    const key = w.main;
    counts[key] = (counts[key] || 0) + 1;
    if (counts[key] > maxCount) {
      maxCount = counts[key];
      mostCommon = w;
    }
  });

  return mostCommon;
}

/**
 * Get historical weather data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days in the past
 * @returns {Promise<Array>} Historical weather data
 */
async function getHistoricalWeather(lat, lon, days) {
  const historical = [];
  const now = Math.floor(Date.now() / 1000);
  const oneDaySeconds = 86400;

  try {
    // Note: Historical data requires paid plan for OpenWeatherMap
    // For MVP, we'll return empty array or mock data
    // To implement: uncomment below and ensure you have appropriate API plan

    /*
    for (let i = 1; i <= days; i++) {
      const timestamp = now - (i * oneDaySeconds);
      const response = await axios.get(OPENWEATHER_HISTORY_URL, {
        params: {
          lat,
          lon,
          dt: timestamp,
          appid: API_KEY,
          units: 'metric'
        }
      });

      const dayData = response.data.data[0];
      historical.unshift({
        date: timestamp,
        temp: {
          min: dayData.temp,
          max: dayData.temp,
          day: dayData.temp
        },
        weather: dayData.weather[0],
        snow: dayData.snow || 0,
        humidity: dayData.humidity,
        wind_speed: dayData.wind_speed
      });
    }
    */

    // MVP: Return empty historical data
    // In production, you can integrate historical API or use alternative services
    return historical;
  } catch (error) {
    console.error('Error fetching historical weather:', error.message);
    return [];
  }
}

/**
 * Calculate snow conditions based on weather data
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} Snow conditions summary
 */
function calculateSnowConditions(weatherData) {
  const forecast = weatherData.forecast;

  // Calculate total expected snowfall
  const totalSnowForecast = forecast.reduce((sum, day) => sum + (day.snow || 0), 0);

  // Count snowy days
  const snowyDays = forecast.filter(day =>
    day.weather.main === 'Snow' || (day.snow && day.snow > 0)
  ).length;

  // Calculate average temperature
  const avgTemp = forecast.reduce((sum, day) => sum + day.temp.day, 0) / forecast.length;

  // Determine snow quality
  let quality = 'unknown';
  if (avgTemp < -5) quality = 'powder';
  else if (avgTemp < 0) quality = 'good';
  else if (avgTemp < 5) quality = 'wet';
  else quality = 'slushy';

  return {
    totalSnowForecast: Math.round(totalSnowForecast * 10) / 10,
    snowyDays,
    avgTemp: Math.round(avgTemp * 10) / 10,
    quality,
    lastUpdate: new Date().toISOString()
  };
}

module.exports = {
  getWeatherData,
  calculateSnowConditions
};
