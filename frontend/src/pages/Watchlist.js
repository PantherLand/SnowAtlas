import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getWatchlist } from '../utils/watchlist';
import { resortAPI, weatherAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import WeatherDisplay from '../components/WeatherDisplay';
import withTimeout from '../utils/withTimeout';
import './Watchlist.css';

const Watchlist = () => {
  const { t } = useTranslation();
  const [watchlist, setWatchlist] = useState([]);
  const [resorts, setResorts] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [selectedResort, setSelectedResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const watchlistIds = getWatchlist();
      setWatchlist(watchlistIds);

      if (watchlistIds.length === 0) {
        setLoading(false);
        return;
      }

      // Load all resorts
      const resortsResponse = await withTimeout(resortAPI.getAll({ includeDistance: true }));
      const allResorts = resortsResponse.data || [];

      // Filter resorts in watchlist
      const watchedResorts = allResorts.filter(resort =>
        watchlistIds.includes(resort.id)
      );
      setResorts(watchedResorts);

      // Load weather data for all watched resorts
      if (watchlistIds.length > 0) {
        const weatherResponse = await withTimeout(weatherAPI.getBatch(watchlistIds), 15000);
        const weatherMap = {};
        (weatherResponse.data || []).forEach(item => {
          if (item) {
            weatherMap[item.resortId] = {
              ...item.weather,
              snowConditions: item.snowConditions
            };
          }
        });
        setWeatherData(weatherMap);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistChange = () => {
    loadWatchlist();
  };

  const handleResortClick = (resort) => {
    setSelectedResort(selectedResort?.id === resort.id ? null : resort);
  };

  if (loading) {
    return (
      <div className="watchlist-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadWatchlist} className="retry-btn">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="watchlist-page">
        <h1 className="page-title">{t('watchlist.title')}</h1>
        <div className="empty-state">
          <div className="empty-icon">☆</div>
          <h3>{t('watchlist.empty')}</h3>
          <p>{t('watchlist.emptyHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1 className="page-title">{t('watchlist.title')}</h1>
        <button onClick={loadWatchlist} className="refresh-btn">
          🔄 {t('common.refresh')}
        </button>
      </div>

      <div className="watchlist-grid">
        {resorts.map((resort) => (
          <div key={resort.id} className="watchlist-item">
            <div onClick={() => handleResortClick(resort)} style={{ cursor: 'pointer' }}>
              <ResortCard
                resort={resort}
                onWatchlistChange={handleWatchlistChange}
                showWeather={true}
                weatherData={weatherData[resort.id]}
                enableNavigation={false}
              />
            </div>
            {selectedResort?.id === resort.id && weatherData[resort.id] && (
              <WeatherDisplay weatherData={weatherData[resort.id]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
