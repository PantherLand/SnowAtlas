import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resortAPI, weatherAPI } from '../services/api';
import WeatherDisplay from '../components/WeatherDisplay';
import withTimeout from '../utils/withTimeout';
import './ResortDetail.css';

const ResortDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [resort, setResort] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lang = i18n.language;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [resortResponse, weatherResponse] = await Promise.all([
          withTimeout(resortAPI.getById(id, { includeDistance: true })),
          withTimeout(weatherAPI.getByResort(id), 15000)
        ]);
        setResort(resortResponse.data || null);
        if (weatherResponse.data) {
          setWeatherData({
            ...weatherResponse.data.weather,
            snowConditions: weatherResponse.data.snowConditions
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const getResortName = () => {
    if (!resort) return '';
    return typeof resort.name === 'object' ? resort.name[lang] || resort.name.en : resort.name;
  };

  const getRegionName = () => {
    if (!resort) return '';
    return typeof resort.region === 'object' ? resort.region[lang] || resort.region.en : resort.region;
  };

  if (loading) {
    return (
      <div className="resort-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resort-detail-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Link to="/resorts" className="back-link">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  if (!resort) {
    return (
      <div className="resort-detail-page">
        <div className="error-container">
          <p className="error-message">{t('resort.notFound')}</p>
          <Link to="/resorts" className="back-link">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="resort-detail-page">
      <div className="detail-header">
        <div>
          <Link to="/resorts" className="back-link">← {t('common.back')}</Link>
          <h1 className="detail-title">{getResortName()}</h1>
          <p className="detail-subtitle">{getRegionName()}, {resort.country}</p>
        </div>
      </div>

      <div className="detail-meta">
        <div>
          <span>{t('resort.elevation')}</span>
          <strong>{resort.elevation.base}m - {resort.elevation.summit}m</strong>
        </div>
        <div>
          <span>{t('resort.distance')}</span>
          <strong>{resort.distance ?? '--'} {t('units.km')}</strong>
        </div>
        <div>
          <span>{t('resort.trails')}</span>
          <strong>{resort.trailCount ?? '--'}</strong>
        </div>
        <div>
          <span>{t('resort.longestRun')}</span>
          <strong>
            {resort.longestRunKm === null || resort.longestRunKm === undefined
              ? '--'
              : `${resort.longestRunKm} ${t('units.km')}`}
          </strong>
        </div>
      </div>

      {weatherData ? (
        <WeatherDisplay weatherData={weatherData} />
      ) : (
        <div className="weather-loading">{t('common.loading')}</div>
      )}
    </div>
  );
};

export default ResortDetail;
