import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, fromUnixTime, addDays, subDays } from 'date-fns';
import './WeatherDisplay.css';

const WeatherDisplay = ({ weatherData }) => {
  const { t } = useTranslation();

  if (!weatherData) {
    return <div className="weather-loading">{t('common.loading')}</div>;
  }

  const { current, forecast, snowConditions } = weatherData;

  const formatDate = (timestamp) => {
    return format(fromUnixTime(timestamp), 'MMM dd');
  };

  const formatDay = (timestamp) => {
    return format(fromUnixTime(timestamp), 'EEE');
  };

  return (
    <div className="weather-display">
      {/* Current Weather */}
      <div className="weather-section current-weather">
        <h3>{t('weather.current')}</h3>
        <div className="current-weather-content">
          <div className="current-temp-large">
            {Math.round(current.temp)}{t('units.celsius')}
          </div>
          <div className="current-details">
            <div className="weather-condition">{current.weather.description}</div>
            <div className="weather-stat">
              <span className="stat-label">{t('weather.humidity')}:</span>
              <span className="stat-value">{current.humidity}%</span>
            </div>
            <div className="weather-stat">
              <span className="stat-label">{t('weather.windSpeed')}:</span>
              <span className="stat-value">{Math.round(current.wind_speed)} {t('units.kmh')}</span>
            </div>
            {current.snow_1h > 0 && (
              <div className="weather-stat snow-stat">
                <span className="stat-label">❄️ {t('weather.snowfall')}:</span>
                <span className="stat-value">{current.snow_1h} {t('units.cm')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Snow Conditions Summary */}
      <div className="weather-section snow-conditions">
        <h3>{t('weather.snowQuality')}</h3>
        <div className="snow-stats">
          <div className="snow-stat-card">
            <div className="snow-stat-value">{snowConditions.totalSnowForecast} {t('units.cm')}</div>
            <div className="snow-stat-label">{t('weather.totalSnow')}</div>
          </div>
          <div className="snow-stat-card">
            <div className="snow-stat-value">{snowConditions.snowyDays}</div>
            <div className="snow-stat-label">{t('weather.snowyDays')}</div>
          </div>
          <div className="snow-stat-card">
            <div className="snow-stat-value">{t(`weather.quality.${snowConditions.quality}`)}</div>
            <div className="snow-stat-label">{t('weather.snowQuality')}</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="weather-section forecast">
        <h3>{t('weather.forecast')}</h3>
        <div className="forecast-grid">
          {forecast.map((day, index) => (
            <div key={day.date} className="forecast-day">
              <div className="forecast-date">
                {index === 0 ? t('time.today') : formatDay(day.date)}
              </div>
              <div className="forecast-icon">{day.weather.main === 'Snow' ? '❄️' : '☁️'}</div>
              <div className="forecast-temp">
                <span className="temp-max">{Math.round(day.temp.max)}°</span>
                <span className="temp-min">{Math.round(day.temp.min)}°</span>
              </div>
              {day.snow > 0 && (
                <div className="forecast-snow">
                  ❄️ {Math.round(day.snow)} {t('units.cm')}
                </div>
              )}
              {day.pop > 0 && (
                <div className="forecast-precipitation">
                  💧 {Math.round(day.pop * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
