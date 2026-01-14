const axios = require('axios');

// Open-Meteo free API (no API key required)
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather forecast and historical data for a ski resort using Open-Meteo
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data with past 7 days + next 7 days
 */
async function getWeatherData(lat, lon) {
  try {
    const response = await axios.get(OPEN_METEO_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        daily: [
          'weathercode',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'snowfall_sum',
          'snow_depth_max',
          'precipitation_probability_max',
          'wind_speed_10m_max'
        ].join(','),
        timezone: 'auto',
        past_days: 7,
        forecast_days: 7
      }
    });

    const data = response.data;
    const daily = buildDailySeries(data.daily || {});

    const weatherData = {
      current: buildCurrent(data.current_weather),
      historical: daily.past,
      forecast: daily.future
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data from Open-Meteo:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    throw new Error('Failed to fetch weather data');
  }
}

function buildCurrent(currentWeather) {
  if (!currentWeather) {
    return {
      temp: null,
      feels_like: null,
      humidity: null,
      wind_speed: null,
      weather: null,
      snow_1h: null,
      timestamp: null
    };
  }

  return {
    temp: currentWeather.temperature ?? null,
    feels_like: null,
    humidity: null,
    wind_speed: currentWeather.windspeed ?? null,
    weather: currentWeather.weathercode === undefined ? null : getWeatherDescription(currentWeather.weathercode),
    snow_1h: null,
    timestamp: currentWeather.time ? Math.floor(new Date(currentWeather.time).getTime() / 1000) : null
  };
}

function buildDailySeries(daily) {
  const time = daily.time || [];
  if (!time.length) {
    return { past: [], future: [] };
  }

  const series = time.map((date, index) => {
    const tempMin = daily.temperature_2m_min?.[index] ?? null;
    const tempMax = daily.temperature_2m_max?.[index] ?? null;
    const snow = daily.snowfall_sum?.[index] ?? 0;
    const weatherCode = daily.weathercode?.[index] ?? null;

    return {
      date: Math.floor(new Date(date).getTime() / 1000),
      temp: {
        min: tempMin,
        max: tempMax,
        day: tempMin !== null && tempMax !== null ? (tempMin + tempMax) / 2 : null
      },
      weather: weatherCode === null ? null : getWeatherDescription(weatherCode),
      snow,
      snowDepth: daily.snow_depth_max?.[index] ?? null,
      humidity: null,
      wind_speed: daily.wind_speed_10m_max?.[index] ?? null,
      pop: daily.precipitation_probability_max?.[index] !== undefined
        ? daily.precipitation_probability_max[index] / 100
        : 0,
      precipitation: daily.precipitation_sum?.[index] ?? null
    };
  });

  return {
    past: series.slice(0, 7),
    future: series.slice(-7)
  };
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
 * Calculate snow conditions based on weather data
 * @param {Object} weatherData - Weather data from API
 * @returns {Object} Snow conditions summary
 */
function calculateSnowConditions(weatherData, resort = null) {
  const history = weatherData.historical;
  const forecast = weatherData.forecast;
  const base = Array.isArray(history) && history.length > 0 ? history : forecast;
  const future = Array.isArray(forecast) ? forecast : [];

  if (!base || base.length === 0) {
    return {
      totalSnowForecast: 0,
      snowyDays: 0,
      avgTemp: null,
      quality: 'unknown',
      lastUpdate: new Date().toISOString()
    };
  }

  // Calculate total expected snowfall
  const totalSnowForecast = base.reduce((sum, day) => sum + (day.snow || 0), 0);
  const futureSnowTotal = future.reduce((sum, day) => sum + (day.snow || 0), 0);

  // Count snowy days
  const snowyDays = base.filter(day =>
    day.weather?.main === 'Snow' || (day.snow && day.snow > 0)
  ).length;

  // Calculate average temperature
  const temps = base.map(day => day.temp?.day).filter(value => value !== null && value !== undefined);
  const avgTemp = temps.length ? temps.reduce((sum, value) => sum + value, 0) / temps.length : null;

  const snowDepths = base.map(day => day.snowDepth).filter(value => value !== null && value !== undefined);
  const maxSnowDepth = snowDepths.length ? Math.max(...snowDepths) : null;
  const baseElevation = resort?.elevation?.base ?? resort?.elevationM ?? null;
  const summitElevation = resort?.elevation?.summit ?? null;
  const avgElevation = baseElevation !== null && summitElevation !== null
    ? (baseElevation + summitElevation) / 2
    : baseElevation;
  const adjustedTemp = avgTemp !== null && avgElevation !== null
    ? avgTemp - (avgElevation * 0.0065)
    : avgTemp;

  // Determine snow quality (temp + snowfall + elevation proxy)
  let quality = 'unknown';
  if (adjustedTemp !== null) {
    if (totalSnowForecast >= 50 && futureSnowTotal >= 10) {
      quality = 'ultra';
      return {
        totalSnowForecast: Math.round(totalSnowForecast * 10) / 10,
        snowyDays,
        avgTemp: Math.round(avgTemp * 10) / 10,
        adjustedTemp: adjustedTemp !== null ? Math.round(adjustedTemp * 10) / 10 : null,
        maxSnowDepth,
        quality,
        lastUpdate: new Date().toISOString()
      };
    }
    let score = 0;
    if (adjustedTemp <= -8) score += 2;
    else if (adjustedTemp <= -3) score += 1;
    else if (adjustedTemp <= 1) score += 0;
    else score -= 1;

    if (totalSnowForecast >= 20) score += 2;
    else if (totalSnowForecast >= 8) score += 1;
    else if (totalSnowForecast < 2) score -= 1;

    if (maxSnowDepth !== null) {
      if (maxSnowDepth >= 60) score += 2;
      else if (maxSnowDepth >= 30) score += 1;
      else if (maxSnowDepth < 10) score -= 1;
    }

    if (score >= 4) quality = 'ultra';
    else if (score >= 2) quality = 'powder';
    else if (score >= 0) quality = 'hard';
    else quality = 'icy';
  }

  return {
    totalSnowForecast: Math.round(totalSnowForecast * 10) / 10,
    snowyDays,
    avgTemp: Math.round(avgTemp * 10) / 10,
    adjustedTemp: adjustedTemp !== null ? Math.round(adjustedTemp * 10) / 10 : null,
    maxSnowDepth,
    quality,
    lastUpdate: new Date().toISOString()
  };
}

module.exports = {
  getWeatherData,
  calculateSnowConditions
};
