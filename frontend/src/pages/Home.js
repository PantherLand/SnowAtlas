import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { resortAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const [nearbyResorts, setNearbyResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadNearbyResorts();
  }, []);

  const loadNearbyResorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resortAPI.getNearby(6);
      setNearbyResorts(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading nearby resorts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistChange = () => {
    setRefreshKey(prev => prev + 1);
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
            <p className="no-resorts">{t('home.error')}</p>
          ) : (
            nearbyResorts.map((resort) => (
              <ResortCard
                key={resort.id}
                resort={resort}
                onWatchlistChange={handleWatchlistChange}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
