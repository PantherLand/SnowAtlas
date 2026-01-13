import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { resortAPI } from '../services/api';
import ResortCard from '../components/ResortCard';
import './Resorts.css';

const Resorts = () => {
  const { t } = useTranslation();
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadResorts();
  }, []);

  useEffect(() => {
    filterResorts();
  }, [searchTerm, selectedCountry, resorts]);

  const loadResorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await resortAPI.getAll();
      setResorts(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading resorts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterResorts = () => {
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

  const handleWatchlistChange = () => {
    setRefreshKey(prev => prev + 1);
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
            <option value="all">{t('common.filter')} - All Countries</option>
            {getUniqueCountries().map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-info">
        {filteredResorts.length} {filteredResorts.length === 1 ? 'resort' : 'resorts'}
      </div>

      <div className="resorts-grid">
        {filteredResorts.length === 0 ? (
          <p className="no-resorts">No resorts found</p>
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
