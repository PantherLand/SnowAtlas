const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');

/**
 * GET /api/resorts - Get all ski resorts
 */
router.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const resorts = await locationService.getAllResorts();
    const includeDistance = req.query.includeDistance === '1';
    const data = includeDistance ? locationService.attachDistance(resorts, ip) : resorts;
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resorts',
      error: error.message
    });
  }
});

/**
 * GET /api/resorts/nearby - Get nearest ski resorts based on IP
 */
router.get('/nearby', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const limit = parseInt(req.query.limit) || 5;

    const nearestResorts = await locationService.getNearestResorts(ip, limit);

    res.json({
      success: true,
      count: nearestResorts.length,
      data: nearestResorts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby resorts',
      error: error.message
    });
  }
});

/**
 * GET /api/resorts/recommended - Get same-country resorts sorted by distance
 */
router.get('/recommended', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const resorts = await locationService.getCountryResortsByDistance(ip);

    res.json({
      success: true,
      count: resorts.length,
      data: resorts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended resorts',
      error: error.message
    });
  }
});

/**
 * GET /api/resorts/:id - Get specific resort by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const resort = await locationService.getResortById(req.params.id);
    const includeDistance = req.query.includeDistance === '1';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!resort) {
      return res.status(404).json({
        success: false,
        message: 'Resort not found'
      });
    }

    const data = includeDistance ? locationService.attachDistance([resort], ip)[0] : resort;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resort',
      error: error.message
    });
  }
});

/**
 * GET /api/resorts/country/:countryCode - Get resorts by country
 */
router.get('/country/:countryCode', async (req, res) => {
  try {
    const resorts = await locationService.getResortsByCountry(req.params.countryCode.toUpperCase());

    res.json({
      success: true,
      count: resorts.length,
      data: resorts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resorts by country',
      error: error.message
    });
  }
});

module.exports = router;
