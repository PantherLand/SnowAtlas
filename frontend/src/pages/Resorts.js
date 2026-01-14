import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resortAPI, weatherAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import withTimeout from '../utils/withTimeout';
import './Resorts.css';

const Resorts = () => {
  const { t } = useTranslation();
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [weatherMap, setWeatherMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const observerRef = useRef(null);
  const loadingIdsRef = useRef(new Set());
  const cardRefs = useRef({});
  const loadMoreRef = useRef(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadResorts();
  }, []);

  const filterResorts = useCallback(() => {
    let filtered = [...resorts];

    // Filter by country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(resort => resort.countryCode === selectedCountry);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resort => {
        const nameEn = resort.name.en?.toLowerCase() || '';
        const nameZh = resort.name.zh?.toLowerCase() || '';
        const country = resort.country.toLowerCase();
        return nameEn.includes(term) || nameZh.includes(term) || country.includes(term);
      });
    }

    setFilteredResorts(filtered);
  }, [resorts, searchTerm, selectedCountry]);

  useEffect(() => {
    filterResorts();
  }, [filterResorts]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCountry]);

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
      { rootMargin: '160px', threshold: 0.2 }
    );

    Object.values(cardRefs.current).forEach((node) => {
      if (node) observerRef.current.observe(node);
    });

    return () => observerRef.current?.disconnect();
  }, [filteredResorts, loadWeatherForResort, page]);

  const visibleResorts = useMemo(() => {
    return filteredResorts.slice(0, page * pageSize);
  }, [filteredResorts, page]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (isLoadingMore) return;
          if (visibleResorts.length >= filteredResorts.length) return;
          setIsLoadingMore(true);
          setPage((prev) => prev + 1);
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredResorts.length, isLoadingMore, visibleResorts.length]);

  useEffect(() => {
    if (isLoadingMore) {
      const id = setTimeout(() => setIsLoadingMore(false), 200);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [page, isLoadingMore]);

  const loadResorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await withTimeout(resortAPI.getAll());
      setResorts(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading resorts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCountries = () => {
    const countries = resorts.map(resort => ({
      code: resort.countryCode,
      name: resort.country
    }));

    const unique = Array.from(
      new Map(countries.map(c => [c.code, c])).values()
    );

    return unique.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleWatchlistChange = () => {};

  const setCardRef = (resortId) => (node) => {
    if (node) {
      cardRefs.current[resortId] = node;
    }
  };

  if (loading) {
    return (
      <div className="resorts-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resorts-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadResorts} className="retry-btn">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resorts-page">
      <h1 className="page-title">{t('nav.resorts')}</h1>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="country-select"
          >
            <option value="all">{t('common.filter')} - {t('resorts.allCountries')}</option>
            {getUniqueCountries().map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-info">
        {t('resorts.count', { count: filteredResorts.length })}
      </div>

      <div className="resorts-grid">
        {filteredResorts.length === 0 ? (
          <p className="no-resorts">{t('resorts.empty')}</p>
        ) : (
          visibleResorts.map((resort) => (
            <div key={resort.id} ref={setCardRef(resort.id)} data-resort-id={resort.id}>
              <ResortCard
                resort={resort}
                onWatchlistChange={handleWatchlistChange}
                weatherData={weatherMap[resort.id]}
              />
            </div>
          ))
        )}
      </div>
      {visibleResorts.length < filteredResorts.length && (
        <div ref={loadMoreRef} className="loading-container">
          <div className="loading-spinner"></div>
          <p>{isLoadingMore ? t('common.loading') : t('common.scrollForMore')}</p>
        </div>
      )}
    </div>
  );
};

export default Resorts;
