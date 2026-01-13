const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const locationService = require('../services/locationService');

/**
 * GET /api/weather/:resortId - Get weather data for a specific resort
 */
router.get('/:resortId', async (req, res) => {
  try {
    const resort = locationService.getResortById(req.params.resortId);

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: 'Resort not found'
      });
    }

    const weatherData = await weatherService.getWeatherData(
      resort.coordinates.lat,
      resort.coordinates.lon
    );

    const snowConditions = weatherService.calculateSnowConditions(weatherData);

    res.json({
      success: true,
      data: {
        resort: {
          id: resort.id,
          name: resort.name,
          coordinates: resort.coordinates
        },
        weather: weatherData,
        snowConditions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message
    });
  }
});

/**
 * POST /api/weather/batch - Get weather data for multiple resorts
 */
router.post('/batch', async (req, res) => {
  try {
    const { resortIds } = req.body;

    if (!Array.isArray(resortIds) || resortIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'resortIds must be a non-empty array'
      });
    }

    // Limit batch requests to prevent abuse
    if (resortIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 resorts per batch request'
      });
    }

    const weatherDataPromises = resortIds.map(async (resortId) => {
      try {
        const resort = locationService.getResortById(resortId);
        if (!resort) return null;

        const weatherData = await weatherService.getWeatherData(
          resort.coordinates.lat,
          resort.coordinates.lon
        );

        const snowConditions = weatherService.calculateSnowConditions(weatherData);

        return {
          resortId: resort.id,
          name: resort.name,
          weather: weatherData,
          snowConditions
        };
      } catch (error) {
        console.error(`Error fetching weather for ${resortId}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(weatherDataPromises);
    const validResults = results.filter(result => result !== null);

    res.json({
      success: true,
      count: validResults.length,
      data: validResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch weather data',
      error: error.message
    });
  }
});

module.exports = router;
