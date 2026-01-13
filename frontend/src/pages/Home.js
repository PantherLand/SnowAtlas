import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resortAPI, weatherAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import withTimeout from '../utils/withTimeout';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const [nearbyResorts, setNearbyResorts] = useState([]);
  const [weatherMap, setWeatherMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadingIdsRef = useRef(new Set());
  const cardRefs = useRef({});

  const loadNearbyResorts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await withTimeout(resortAPI.getRecommended());
      setNearbyResorts(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading nearby resorts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNearbyResorts();
  }, [loadNearbyResorts]);

  const loadWeatherForResort = useCallback(async (resortId) => {
    if (weatherMap[resortId] || loadingIdsRef.current.has(resortId)) return;
    loadingIdsRef.current.add(resortId);
    try {
      const response = await withTimeout(weatherAPI.getByResort(resortId), 15000);
      if (response?.data) {
        setWeatherMap((prev) => ({
          ...prev,
          [resortId]: {
            ...response.data.weather,
            snowConditions: response.data.snowConditions
          }
        }));
      }
    } catch (err) {
      console.error(`Error loading weather for ${resortId}:`, err);
    } finally {
      loadingIdsRef.current.delete(resortId);
    }
  }, [weatherMap]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const resortId = entry.target.getAttribute('data-resort-id');
            if (resortId) {
              loadWeatherForResort(resortId);
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '120px', threshold: 0.2 }
    );

    Object.values(cardRefs.current).forEach((node) => {
      if (node) observerRef.current.observe(node);
    });

    return () => observerRef.current?.disconnect();
  }, [nearbyResorts, loadWeatherForResort]);

  const setCardRef = (resortId) => (node) => {
    if (node) {
      cardRefs.current[resortId] = node;
    }
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-container">
          <p className="error-message">{t('home.error')}: {error}</p>
          <button onClick={loadNearbyResorts} className="retry-btn">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 className="hero-title">{t('app.title')}</h1>
        <p className="hero-subtitle">{t('app.subtitle')}</p>
      </section>

      <section className="resorts-section">
        <div className="section-header">
          <h2>{t('home.nearbyTitle')}</h2>
          <button onClick={loadNearbyResorts} className="refresh-btn">
            🔄 {t('common.refresh')}
          </button>
        </div>

        <div className="resorts-grid">
          {nearbyResorts.length === 0 ? (
            <p className="no-resorts">{t('home.empty')}</p>
          ) : (
            nearbyResorts.map((resort) => (
              <div key={resort.id} ref={setCardRef(resort.id)} data-resort-id={resort.id}>
                <ResortCard
                  resort={resort}
                  weatherData={weatherMap[resort.id]}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
