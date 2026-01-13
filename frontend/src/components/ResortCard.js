import React from 'react';
import { useTranslation } from 'react-i18next';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../utils/watchlist';
import './ResortCard.css';

const ResortCard = ({ resort, onWatchlistChange, showWeather = false, weatherData = null }) => {
  const { t, i18n } = useTranslation();
  const inWatchlist = isInWatchlist(resort.id);
  const lang = i18n.language;

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(resort.id);
    } else {
      addToWatchlist(resort.id);
    }
    onWatchlistChange && onWatchlistChange();
  };

  const getResortName = () => {
    return typeof resort.name === 'object' ? resort.name[lang] || resort.name.en : resort.name;
  };

  const getRegionName = () => {
    return typeof resort.region === 'object' ? resort.region[lang] || resort.region.en : resort.region;
  };

  return (
    <div className="resort-card">
      <div className="resort-card-header">
        <div>
          <h3 className="resort-name">{getResortName()}</h3>
          <p className="resort-location">
            {getRegionName()}, {resort.country}
          </p>
        </div>
        <button
          className={`watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`}
          onClick={handleWatchlistToggle}
          title={inWatchlist ? t('resort.removeFromWatchlist') : t('resort.addToWatchlist')}
        >
          {inWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className="resort-details">
        <div className="detail-item">
          <span className="detail-label">{t('resort.elevation')}:</span>
          <span className="detail-value">
            {resort.elevation.base}m - {resort.elevation.summit}m
          </span>
        </div>

        {resort.distance !== null && resort.distance !== undefined && (
          <div className="detail-item">
            <span className="detail-label">{t('resort.distance')}:</span>
            <span className="detail-value">{resort.distance} {t('units.km')}</span>
          </div>
        )}
      </div>

      {showWeather && weatherData && (
        <div className="weather-summary">
          <div className="current-temp">
            {Math.round(weatherData.current.temp)}{t('units.celsius')}
          </div>
          <div className="weather-icon">
            {weatherData.current.weather.description}
          </div>
          {weatherData.snowConditions.totalSnowForecast > 0 && (
            <div className="snow-forecast">
              ❄️ {weatherData.snowConditions.totalSnowForecast}{t('units.cm')}
              <span className="forecast-label"> (7 {t('common.days')})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResortCard;
