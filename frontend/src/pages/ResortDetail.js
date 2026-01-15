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
  const [showStickyHeader, setShowStickyHeader] = useState(false);
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

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show sticky header when scrolled past the main header
          const shouldShowSticky = currentScrollY > 200;
          setShowStickyHeader(shouldShowSticky);

          // When sticky header is visible, always hide global header
          // Only show global header when near the top (< 200px)
          if (shouldShowSticky) {
            // Sticky header is showing - always hide global header
            document.body.classList.add('hide-global-header');
          } else if (currentScrollY > 50) {
            // Between 50-200px - use scroll direction to decide
            if (currentScrollY > lastScrollY && (currentScrollY - lastScrollY) > 5) {
              // Scrolling down - hide header
              document.body.classList.add('hide-global-header');
            } else if (lastScrollY - currentScrollY > 5) {
              // Scrolling up - show header
              document.body.classList.remove('hide-global-header');
            }
          } else {
            // At top of page (< 50px) - always show global header
            document.body.classList.remove('hide-global-header');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.classList.remove('hide-global-header');
    };
  }, []);

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
      {/* Sticky header that shows when scrolling */}
      <div className={`sticky-resort-header ${showStickyHeader ? 'visible' : ''}`}>
        <div className="sticky-header-content">
          <Link to="/resorts" className="sticky-back-link">←</Link>
          <h2 className="sticky-resort-name">{getResortName()}</h2>
        </div>
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <Link to="/resorts" className="back-link">← {t('common.back')}</Link>
          <h1 className="detail-title">{getResortName()}</h1>
          <p className="detail-subtitle">{getRegionName()}, {resort.country}</p>
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

        <div className="detail-content">
          {weatherData ? (
            <WeatherDisplay weatherData={weatherData} />
          ) : (
            <div className="weather-loading">{t('common.loading')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResortDetail;
