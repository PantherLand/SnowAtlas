import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import UpdateNotification from './components/UpdateNotification';
import Home from './pages/Home';
import Resorts from './pages/Resorts';
import Watchlist from './pages/Watchlist';
import ResortDetail from './pages/ResortDetail';
import './App.css';

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="app">
        <UpdateNotification />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resorts" element={<Resorts />} />
            <Route path="/resorts/:id" element={<ResortDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>&copy; 2026 SnowAtlas - {t('app.subtitle')}</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
