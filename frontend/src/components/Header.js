import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="app-logo">
          <span className="logo-icon">❄️</span>
          <span className="logo-text">{t('app.title')}</span>
        </Link>

        <nav className="main-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            {t('nav.home')}
          </Link>
          <Link to="/resorts" className={`nav-link ${isActive('/resorts')}`}>
            {t('nav.resorts')}
          </Link>
          <Link to="/watchlist" className={`nav-link ${isActive('/watchlist')}`}>
            {t('nav.watchlist')}
          </Link>
        </nav>

        <button className="lang-toggle" onClick={toggleLanguage}>
          {i18n.language === 'en' ? '中文' : 'EN'}
        </button>
      </div>
    </header>
  );
};

export default Header;
