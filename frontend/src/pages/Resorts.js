import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resortAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import withTimeout from '../utils/withTimeout';
import './Resorts.css';

const Resorts = () => {
  const { t } = useTranslation();
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  // refreshKey removed - no usage

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
          filteredResorts.map((resort) => (
            <ResortCard
              key={resort.id}
              resort={resort}
              onWatchlistChange={handleWatchlistChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Resorts;
