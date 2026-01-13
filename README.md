# ❄️ SnowAtlas - Global Ski Resort Monitor

A Progressive Web App (PWA) for monitoring ski resorts worldwide with real-time weather and snow forecasts.

## 🌟 Features

- 🌍 **Global Coverage**: Monitor 20+ popular ski resorts worldwide
- 🌤️ **Weather Forecasts**: 7-day weather and snow forecasts
- 📊 **Snow Conditions**: Track snowfall, temperature, and snow quality
- 📍 **Location-Based**: Automatic recommendations based on your IP location
- ⭐ **Watchlist**: Save and monitor your favorite ski resorts
- 🌐 **Bilingual Support**: Full English and Chinese (中文) support
- 📱 **PWA**: Install on mobile devices for offline access
- 🍪 **Cookie-Based**: No login required - uses cookies for personalization

## 🚀 Tech Stack

### Frontend
- React 18
- React Router
- i18next (internationalization)
- Recharts (data visualization)
- Axios (API calls)
- date-fns (date formatting)
- PWA with Service Worker

### Backend
- Node.js
- Express
- OpenWeatherMap API
- geoip-lite (IP geolocation)

## 📋 Prerequisites

- Node.js 14+ and npm
- OpenWeatherMap API key (free tier available)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SnowAtlas
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and add your OpenWeatherMap API key
```

Get your free API key from [OpenWeatherMap](https://openweathermap.org/api):
1. Sign up for a free account
2. Navigate to API Keys section
3. Generate a new API key
4. Add it to `backend/.env`:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Configure API URL if needed (defaults to http://localhost:5000/api)
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## 📱 PWA Installation

1. Open the app in Chrome or Safari on mobile
2. Click "Add to Home Screen" when prompted
3. The app will install as a standalone application

## 🌐 API Endpoints

### Resorts
- `GET /api/resorts` - Get all ski resorts
- `GET /api/resorts/nearby?limit=5` - Get nearest resorts based on IP
- `GET /api/resorts/:id` - Get specific resort by ID
- `GET /api/resorts/country/:countryCode` - Get resorts by country

### Weather
- `GET /api/weather/:resortId` - Get weather data for a resort
- `POST /api/weather/batch` - Get weather for multiple resorts
  ```json
  {
    "resortIds": ["whistler-blackcomb", "niseko", "chamonix"]
  }
  ```

## 🗺️ Supported Ski Resorts

### North America
- Whistler Blackcomb (Canada)
- Vail Mountain Resort (USA)
- Aspen Snowmass (USA)
- Park City Mountain (USA)
- Jackson Hole (USA)
- Lake Louise (Canada)

### Europe
- Chamonix Mont-Blanc (France)
- Zermatt - Matterhorn (Switzerland)
- St. Anton am Arlberg (Austria)
- Val Thorens (France)
- Cortina d'Ampezzo (Italy)
- Verbier (Switzerland)
- Courchevel (France)
- Ischgl (Austria)

### Asia
- Niseko United (Japan)
- Hakuba Valley (Japan)
- Wanlong Ski Resort (China)
- Genting Resort Secret Garden (China)
- Yabuli Ski Resort (China)
- Beidahu Ski Resort (China)

## 🎨 Features Overview

### Home Page
- Displays ski resorts near you based on IP location
- Quick access to add resorts to watchlist
- Clean, responsive design

### All Resorts
- Browse all available ski resorts
- Search by name or country
- Filter by country
- Sort options

### Watchlist
- View all your monitored resorts
- Real-time weather updates
- Snow forecast summaries
- Click to expand detailed weather information

### Weather Display
- Current weather conditions
- 7-day forecast with snowfall predictions
- Snow quality indicators (powder, good, wet, slushy)
- Temperature, humidity, wind speed
- Probability of precipitation

## 🌍 Internationalization

The app supports two languages:
- English (en)
- Chinese (zh - 中文)

Switch languages using the language toggle in the header.

## 📝 Environment Variables

### Backend (.env)
```
OPENWEATHER_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔧 Development

### Adding New Ski Resorts

Edit `backend/data/skiResorts.json`:

```json
{
  "id": "unique-id",
  "name": {
    "en": "Resort Name",
    "zh": "度假村名称"
  },
  "country": "Country",
  "countryCode": "CC",
  "region": {
    "en": "Region",
    "zh": "地区"
  },
  "coordinates": {
    "lat": 0.0,
    "lon": 0.0
  },
  "elevation": {
    "base": 1000,
    "summit": 2000
  },
  "popularity": 8,
  "timezone": "Timezone"
}
```

### API Integration

The app uses OpenWeatherMap One Call API 3.0:
- Free tier: 1,000 calls/day
- 7-day forecast included
- Snow data in weather conditions
- Historical data requires paid plan (currently disabled in MVP)

## 🚧 Future Enhancements

- [ ] Historical weather data (past 7 days)
- [ ] Lift status integration
- [ ] Snow depth tracking
- [ ] User accounts and sync across devices
- [ ] Push notifications for snow alerts
- [ ] More detailed resort information
- [ ] Webcam feeds
- [ ] Social features (share conditions)

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❄️ for ski enthusiasts worldwide
