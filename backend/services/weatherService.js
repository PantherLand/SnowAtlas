const axios = require('axios');

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const OPENWEATHER_HISTORY_URL = 'https://api.openweathermap.org/data/3.0/onecall/timemachine';
const API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Get weather forecast and historical data for a ski resort
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data with past 7 days and future 7 days
 */
async function getWeatherData(lat, lon) {
  try {
    // Get current and future forecast (8 days)
    const forecastResponse = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        exclude: 'minutely,hourly',
        lang: 'en'
      }
    });

    const forecast = forecastResponse.data;

    // Get historical data for past 7 days
    const historicalData = await getHistoricalWeather(lat, lon, 7);

    // Process and combine data
    const weatherData = {
      current: {
        temp: forecast.current.temp,
        feels_like: forecast.current.feels_like,
        humidity: forecast.current.humidity,
        wind_speed: forecast.current.wind_speed,
        weather: forecast.current.weather[0],
        snow_1h: forecast.current.snow?.['1h'] || 0,
        timestamp: forecast.current.dt
      },
      historical: historicalData,
      forecast: forecast.daily.slice(0, 7).map(day => ({
        date: day.dt,
        temp: {
          min: day.temp.min,
          max: day.temp.max,
          day: day.temp.day
        },
        weather: day.weather[0],
        snow: day.snow || 0,
        humidity: day.humidity,
        wind_speed: day.wind_speed,
        pop: day.pop // Probability of precipitation
      }))
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Failed to fetch weather data');
  }
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
