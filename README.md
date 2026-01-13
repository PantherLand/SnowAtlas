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
- Open-Meteo API (free, no API key required!)
- geoip-lite (IP geolocation)

## 📋 Prerequisites

- Node.js 14+ and npm
- No API keys required!

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
```

**No API key needed!** The app uses [Open-Meteo](https://open-meteo.com/), a free weather API that doesn't require registration or API keys.

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Configure API URL if needed (defaults to http://localhost:5001/api)
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
- Backend: http://localhost:5001

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
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
*Note: No API key required! Open-Meteo is completely free.*

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
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

### Weather API Integration

The app uses **Open-Meteo** - a free, open-source weather API:
- **Completely free** - No API key or registration required
- **No rate limits** - Reasonable usage is unlimited
- **7-day forecast** - Temperature, precipitation, snowfall
- **High-quality data** - Based on multiple weather models
- **WMO weather codes** - Standard international weather descriptions

API Documentation: https://open-meteo.com/en/docs

### Backend API Endpoints

The SnowAtlas backend provides a comprehensive REST API. For complete API documentation, see **[API.md](backend/API.md)**.

#### Quick Reference

**Resorts API**
- `GET /api/resorts` - Get all ski resorts
- `GET /api/resorts/nearby?limit=5` - Get nearby resorts (IP-based)
- `GET /api/resorts/:id` - Get specific resort details
- `GET /api/resorts/country/:countryCode` - Get resorts by country

**Weather API**
- `GET /api/weather/:resortId` - Get weather for a resort
- `POST /api/weather/batch` - Batch get weather for multiple resorts

**Health Check**
- `GET /health` - Server health status

📖 **[View Full API Documentation](backend/API.md)** - Includes detailed request/response formats, error codes, and usage examples.

### API Testing

SnowAtlas includes comprehensive API tests to ensure reliability and correctness.

#### Running Tests

**Install test dependencies** (first time only):
```bash
cd backend
npm install
```

**Run all tests with coverage**:
```bash
npm test
```

**Run tests in watch mode** (for development):
```bash
npm run test:watch
```

**Run only API tests**:
```bash
npm run test:api
```

#### Manual API Testing

**Using REST Client (VSCode)**:

1. Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension
2. Open `backend/api-tests.http`
3. Click "Send Request" above any test to execute it
4. View responses inline

**Using cURL**:
```bash
# Test health endpoint
curl http://localhost:5001/health

# Get all resorts
curl http://localhost:5001/api/resorts

# Get weather for Niseko
curl http://localhost:5001/api/weather/niseko

# Batch weather request
curl -X POST http://localhost:5001/api/weather/batch \
  -H "Content-Type: application/json" \
  -d '{"resortIds":["niseko","whistler-blackcomb"]}'
```

#### Test Files

- `backend/tests/api.test.js` - Automated Jest/Supertest tests
- `backend/api-tests.http` - Manual HTTP tests for REST Client

#### Test Coverage

The test suite covers:
- ✅ All API endpoints (resorts, weather, health)
- ✅ Error handling and validation
- ✅ Data integrity checks
- ✅ CORS configuration
- ✅ Performance benchmarks
- ✅ Integration test scenarios

Run `npm test` to see detailed coverage report.

## 🔄 CI/CD and Automation

SnowAtlas includes comprehensive CI/CD workflows powered by GitHub Actions to ensure code quality and reliability.

### Automated Workflows

#### 1. PR Checks Workflow

Runs automatically on every pull request to the main branch:

**Jobs:**
- **Backend Tests** - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Executes test suite with coverage
  - Uploads coverage reports to Codecov
  - Posts test results as PR comment

- **Frontend Build** - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Builds production bundle
  - Reports build size
  - Posts build results as PR comment

- **Code Quality Checks**
  - Validates backend dependencies
  - Validates frontend dependencies
  - Ensures clean installation

- **Auto Label** - Automatically labels PRs based on changed files
  - `backend` - Changes in backend/
  - `frontend` - Changes in frontend/
  - `tests` - Changes to test files
  - `documentation` - Changes to .md files
  - `ci/cd` - Changes to GitHub workflows

- **PR Summary** - Posts comprehensive status summary
  - Shows results of all checks
  - Provides at-a-glance PR status

**Configuration:** `.github/workflows/pr-checks.yml`

#### 2. CI Workflow

Runs on every push to any branch:

**Jobs:**
- **Backend Tests** - Full test suite execution
- **Frontend Build** - Build verification
- **Integration Tests** - API endpoint testing
- **Status Check** - Overall CI status summary

**Manual Trigger:** Can be triggered manually via GitHub Actions UI

**Configuration:** `.github/workflows/ci.yml`

### Pull Request Template

When creating a pull request, you'll see a structured template that includes:

- Description and related issue linking
- Type of change checklist
- Testing checklist (backend, frontend, integration)
- Internationalization checklist
- Code quality checklist
- Screenshots section for UI changes

**Location:** `.github/PULL_REQUEST_TEMPLATE.md`

### CI/CD Status Badges

Add these badges to your fork's README to display CI status:

```markdown
![CI Status](https://github.com/YOUR_USERNAME/SnowAtlas/workflows/CI/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/SnowAtlas/workflows/PR%20Checks/badge.svg)
```

### Setting Up CI/CD in Your Fork

1. **Fork the repository** to your GitHub account
2. **Enable GitHub Actions** in your fork's settings
3. **Push to any branch** - CI workflow runs automatically
4. **Create a pull request** - PR checks workflow runs automatically
5. **Review automated comments** - Test results and build info posted to PRs

### Local Pre-commit Checks

Before pushing code, run these checks locally:

```bash
# Backend tests
cd backend
npm test

# Frontend build
cd frontend
npm run build

# All checks
cd backend && npm test && cd ../frontend && npm run build
```

### Workflow Triggers

**CI Workflow** triggers on:
- Push to any branch
- Manual workflow dispatch

**PR Checks Workflow** triggers on:
- Pull request opened
- Pull request synchronized (new commits pushed)
- Pull request reopened

### Troubleshooting CI/CD

**Tests failing in CI but passing locally?**
- Ensure all dependencies are committed
- Check Node.js version compatibility (CI runs on 18.x and 20.x)
- Verify environment variables are not hardcoded

**Frontend build failing?**
- Check for build warnings in local build
- Ensure `CI=true` environment variable works locally
- Review package.json scripts

**Coverage reports not uploading?**
- Codecov integration requires repository setup
- Check GitHub Actions secrets configuration

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
