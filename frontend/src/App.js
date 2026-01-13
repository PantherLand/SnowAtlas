import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Resorts from './pages/Resorts';
import Watchlist from './pages/Watchlist';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resorts" element={<Resorts />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>&copy; 2026 SnowAtlas - Global Ski Resort Monitor</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
