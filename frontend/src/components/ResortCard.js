import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../utils/watchlist';
import './ResortCard.css';

const ResortCard = ({
  resort,
  onWatchlistChange,
  showWeather = false,
  weatherData = null,
  enableNavigation = true
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist(resort.id));
  const lang = i18n.language;

  useEffect(() => {
    setInWatchlist(isInWatchlist(resort.id));
  }, [resort.id]);

  const handleWatchlistToggle = (event) => {
    event.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(resort.id);
      setInWatchlist(false);
    } else {
      addToWatchlist(resort.id);
      setInWatchlist(true);
    }
    onWatchlistChange && onWatchlistChange();
  };

  const handleNavigate = () => {
    if (!enableNavigation) return;
    navigate(`/resorts/${resort.id}`);
  };

  const getResortName = () => {
    return typeof resort.name === 'object' ? resort.name[lang] || resort.name.en : resort.name;
  };

  const getRegionName = () => {
    return typeof resort.region === 'object' ? resort.region[lang] || resort.region.en : resort.region;
  };

  const snowyDays = weatherData?.snowConditions?.snowyDays ?? null;
  const isPowderHot = snowyDays !== null && snowyDays >= 4;
  const pastSnowMax = Array.isArray(weatherData?.historical)
    ? Math.max(0, ...weatherData.historical.map((day) => day.snow || 0))
    : 0;
  const futureSnowMax = Array.isArray(weatherData?.forecast)
    ? Math.max(0, ...weatherData.forecast.map((day) => day.snow || 0))
    : 0;
  const hasFreshPowder = pastSnowMax >= 10;
  const hasPowderForecast = futureSnowMax >= 10;

  const cardProps = enableNavigation ? { onClick: handleNavigate } : {};

  return (
    <div className={`resort-card ${enableNavigation ? 'clickable' : ''} ${isPowderHot ? 'powder-hot' : ''}`} {...cardProps}>
      <div className="resort-card-header">
        <div>
          <h3 className="resort-name">{getResortName()}</h3>
          <p className="resort-location">
            {getRegionName()}, {resort.country}
          </p>
        </div>
        {isPowderHot && (
          <span className="powder-badge" title={t('weather.powderAlert')}>
            ✨ 粉雪热区
          </span>
        )}
        <button
          className={`watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`}
          onClick={handleWatchlistToggle}
          title={inWatchlist ? t('resort.removeFromWatchlist') : t('resort.addToWatchlist')}
        >
          {inWatchlist ? '★' : '☆'}
        </button>
      </div>
      {(hasFreshPowder || hasPowderForecast) && (
        <div className="snow-alert">
          {hasFreshPowder && (
            <span className="snow-pill fresh">{t('weather.freshPowder')}</span>
          )}
          {hasPowderForecast && (
            <span className="snow-pill forecast">{t('weather.powderForecast')}</span>
          )}
        </div>
      )}

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
            {weatherData.current?.temp === null || weatherData.current?.temp === undefined
              ? '--'
              : `${Math.round(weatherData.current.temp)}${t('units.celsius')}`}
          </div>
          <div className="weather-icon">
            {weatherData.current?.weather?.description || '--'}
          </div>
          {weatherData.snowConditions && (
            <div className={`snow-forecast ${weatherData.snowConditions.totalSnowForecast === 0 ? 'snow-zero' : ''}`}>
              {weatherData.snowConditions.totalSnowForecast === 0 ? '😔' : '❄️'}{' '}
              {weatherData.snowConditions.totalSnowForecast ?? '--'}{t('units.cm')}
              <span className="forecast-label">
                {weatherData.snowConditions.totalSnowForecast === 0
                  ? ` ${t('weather.noSnow')}`
                  : ` (7 ${t('common.days')})`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResortCard;
